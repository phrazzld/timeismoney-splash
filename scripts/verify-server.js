#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function startApp(environment) {
  const probe = http.createServer();
  const port = await listen(probe);
  await close(probe);

  const child = spawn(process.execPath, ['server.js'], {
    cwd: new URL('..', `file://${__dirname}/`).pathname,
    env: {
      ...process.env,
      PORT: String(port),
      NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${port}`,
      ...environment,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`server exited ${child.exitCode}: ${stderr}`);
    }
    try {
      await fetch(`http://127.0.0.1:${port}/api/health`);
      return { child, port };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  child.kill('SIGTERM');
  throw new Error(`server did not become ready: ${stderr}`);
}

async function stopApp(child) {
  child.kill('SIGTERM');
  await new Promise((resolve) => child.once('exit', resolve));
}

async function main() {
  let received;
  const canary = http.createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      received = {
        authorization: request.headers.authorization,
        body: JSON.parse(body),
      };
      response.writeHead(202, { 'Content-Type': 'application/json' });
      response.end('{}');
    });
  });
  const canaryPort = await listen(canary);

  const { child, port } = await startApp({
    CANARY_API_KEY: 'integration-test-key',
    CANARY_ENDPOINT: `http://127.0.0.1:${canaryPort}`,
    CANARY_SERVICE_NAME: 'timeismoney-splash',
    NODE_ENV: 'production',
  });

  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).dependencies.canary, 'configured');

    const healthHead = await fetch(`http://127.0.0.1:${port}/api/health`, {
      method: 'HEAD',
    });
    assert.equal(healthHead.status, 200);
    assert.equal(await healthHead.text(), '');

    const healthPost = await fetch(`http://127.0.0.1:${port}/api/health`, {
      method: 'POST',
    });
    assert.equal(healthPost.status, 405);

    const relayGet = await fetch(
      `http://127.0.0.1:${port}/api/canary/api/v1/errors`
    );
    assert.equal(relayGet.status, 405);

    const rejected = await fetch(
      `http://127.0.0.1:${port}/api/canary/api/v1/errors`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.example',
        },
        body: JSON.stringify({ message: 'reject me' }),
      }
    );
    assert.equal(rejected.status, 403);

    const accepted = await fetch(
      `http://127.0.0.1:${port}/api/canary/api/v1/errors`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: `http://127.0.0.1:${port}`,
          Referer: `http://127.0.0.1:${port}/?token=secret`,
        },
        body: JSON.stringify({
          error_class: 'AdapterTest',
          message: 'user test@example.com failed with token=secret',
        }),
      }
    );
    assert.equal(accepted.status, 202);
    assert.equal(received.authorization, 'Bearer integration-test-key');
    assert.equal(received.body.service, 'timeismoney-splash');
    assert.equal(received.body.message.includes('test@example.com'), false);
    assert.equal(received.body.message.includes('token=secret'), false);

    const missing = await fetch(`http://127.0.0.1:${port}/missing`);
    assert.equal(missing.status, 404);
  } finally {
    await stopApp(child);
    await close(canary);
  }

  console.log('timeismoney DigitalOcean server adapter verification passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
