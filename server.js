#!/usr/bin/env node
'use strict';

const http = require('node:http');
const health = require('./api/health');
const relay = require('./api/canary/api/v1/errors');

const routes = new Map([
  ['/api/health', health],
  ['/api/canary/api/v1/errors', relay],
]);

function adaptResponse(response) {
  response.status = function status(code) {
    this.statusCode = code;
    return this;
  };
  response.json = function json(body) {
    if (!this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    this.end(JSON.stringify(body));
    return this;
  };
  return response;
}

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const handler = routes.get(pathname);
  if (!handler) {
    response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  try {
    await handler(request, adaptResponse(response));
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        service: process.env.CANARY_SERVICE_NAME || 'timeismoney-splash',
        operation: 'request',
        error: error instanceof Error ? error.message : 'unknown error',
      })
    );
    if (!response.headersSent) {
      response.writeHead(500, {
        'Content-Type': 'application/json; charset=utf-8',
      });
    }
    if (!response.writableEnded) {
      response.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

const port = Number(process.env.PORT || 8080);
server.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({ level: 'info', service: 'timeismoney-splash', port }));
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
