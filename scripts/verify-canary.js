#!/usr/bin/env node

const assert = require('node:assert/strict');

function makeResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    ended: false,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

async function verifyHealthRoute() {
  const health = require('../api/health');

  delete process.env.CANARY_API_KEY;
  process.env.NODE_ENV = 'production';

  let response = makeResponse();
  health({ method: 'GET' }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.observability.canary.status, 'not_configured');

  process.env.CANARY_API_KEY = 'test-key';
  process.env.CANARY_SERVICE_NAME = 'timeismoney-splash';

  response = makeResponse();
  health({ method: 'GET' }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.dependencies.canary, 'configured');
}

async function verifyRelayRoute() {
  const relay = require('../api/canary/api/v1/errors');
  let forwarded;

  global.fetch = async (url, init) => {
    forwarded = { url, init, body: JSON.parse(init.body) };
    return new Response('{}', { status: 202 });
  };

  let response = makeResponse();
  await relay(
    {
      method: 'POST',
      url: '/api/canary/api/v1/errors?token=secret',
      headers: {
        origin: 'https://www.timeismoney.works',
        'content-length': '230',
        'user-agent': 'node-test',
        referer: 'https://www.timeismoney.works/?api_key=abc',
        'x-vercel-forwarded-for': '127.0.0.1',
      },
      body: {
        message:
          'user test@example.com failed with Bearer abc123 and token=secret',
        error_class: 'SmokeTest',
        stack_trace: 'fetch https://example.com/path?token=secret#frag',
        severity: 'info',
        context: {
          authorization: 'Bearer abc123',
          nested: {
            email: 'admin@example.com',
            dsn: 'sntryu_abc123456',
          },
        },
        fingerprint: ['timeismoney', 'token=secret'],
      },
    },
    response
  );

  assert.equal(response.statusCode, 202);
  assert.equal(forwarded.url, 'https://canary-obs.fly.dev/api/v1/errors');
  assert.equal(forwarded.body.service, 'timeismoney-splash');
  assert.equal(forwarded.body.message.includes('test@example.com'), false);
  assert.equal(forwarded.body.message.includes('Bearer abc123'), false);
  assert.equal(forwarded.body.stack_trace.includes('?token='), false);
  assert.equal(forwarded.body.context.authorization, '[redacted]');
  assert.equal(forwarded.body.context.nested.email, '[EMAIL_REDACTED]');
  assert.equal(forwarded.body.context.nested.dsn, '[redacted]');
  assert.equal(forwarded.body.fingerprint[1], 'token=[REDACTED]');

  response = makeResponse();
  await relay(
    {
      method: 'POST',
      headers: {
        origin: 'https://evil.example',
        'content-length': '24',
        'x-vercel-forwarded-for': '127.0.0.2',
      },
      body: { message: 'blocked' },
    },
    response
  );
  assert.equal(response.statusCode, 403);

  response = makeResponse();
  await relay(
    {
      method: 'POST',
      headers: {
        host: 'evil.example',
        origin: 'https://evil.example',
        'content-length': '32',
        'x-vercel-forwarded-for': '127.0.0.3',
      },
      body: { message: 'blocked host spoof' },
    },
    response
  );
  assert.equal(response.statusCode, 403);
}

async function main() {
  await verifyHealthRoute();
  await verifyRelayRoute();
  console.log('timeismoney canary verification passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
