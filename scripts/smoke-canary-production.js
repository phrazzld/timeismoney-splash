#!/usr/bin/env node

const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const SITE_URL = process.env.SITE_URL || 'https://www.timeismoney.works';
const CANARY_ENDPOINT =
  process.env.CANARY_ENDPOINT || 'https://canary-obs.fly.dev';
const CANARY_SERVICE = process.env.CANARY_SERVICE_NAME || 'timeismoney-splash';
const READ_KEY =
  process.env.CANARY_READ_API_KEY ||
  process.env.CANARY_ADMIN_API_KEY ||
  process.env.CANARY_ADMIN_KEY ||
  process.env.CANARY_API_KEY;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  return { response, body };
}

function queryContainsMessage(body, message) {
  return Boolean(
    body &&
      Array.isArray(body.groups) &&
      body.groups.some((group) => group.sample_message === message)
  );
}

function letterNonce() {
  return Array.from(crypto.randomBytes(12), (byte) =>
    String.fromCharCode(97 + (byte % 26))
  ).join('');
}

async function main() {
  assert.ok(READ_KEY, 'set CANARY_READ_API_KEY or CANARY_API_KEY for readback');

  const site = SITE_URL.replace(/\/$/, '');
  const canary = CANARY_ENDPOINT.replace(/\/$/, '');
  const nonce = letterNonce();
  const message = `production canary smoke ${CANARY_SERVICE} ${nonce}`;

  const health = await requestJson(`${site}/api/health`);
  assert.equal(health.response.status, 200);
  assert.equal(health.body.observability.canary.status, 'configured');

  const relay = await requestJson(`${site}/api/canary/api/v1/errors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: site,
      Referer: `${site}/`,
    },
    body: JSON.stringify({
      message,
      error_class: 'SmokeTest',
      severity: 'info',
      context: {
        source: 'timeismoney-production-smoke',
        generatedAt: new Date().toISOString(),
      },
      fingerprint: [CANARY_SERVICE, 'production-smoke', nonce],
    }),
  });
  assert.equal(relay.response.status, 202);
  assert.equal(relay.body.status, 'accepted');

  const queryUrl = `${canary}/api/v1/query?service=${encodeURIComponent(
    CANARY_SERVICE
  )}&window=1h`;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const readback = await requestJson(queryUrl, {
      headers: {
        Authorization: `Bearer ${READ_KEY}`,
      },
    });
    assert.equal(readback.response.status, 200);
    if (queryContainsMessage(readback.body, message)) {
      console.log(
        JSON.stringify({
          status: 'passed',
          service: CANARY_SERVICE,
          site,
          canary,
          message,
          total_errors: readback.body.total_errors,
        })
      );
      return;
    }
    await sleep(1500);
  }

  throw new Error(`Canary readback did not include smoke message: ${message}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
