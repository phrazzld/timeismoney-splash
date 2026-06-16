/**
 * Tiny Canary browser observer for a static site.
 * Sends redacted browser errors through the app-owned serverless relay.
 */
(function() {
  'use strict';

  var RELAY_PATH = '/api/canary/api/v1/errors';
  var EXTENSION_PROTOCOLS = {
    'chrome-extension:': true,
    'moz-extension:': true,
    'safari-extension:': true,
  };

  function normalizeError(error) {
    if (error instanceof Error) {
      return {
        error_class: error.name || 'Error',
        message: error.message || 'Unknown error',
        stack_trace: error.stack,
      };
    }

    if (typeof error === 'string') {
      return {
        error_class: 'StringError',
        message: error,
      };
    }

    return {
      error_class: 'UnknownError',
      message: String(error),
    };
  }

  function send(payload) {
    try {
      fetch(RELAY_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function() {});
    } catch (_error) {
      // Error reporting must never affect the page.
    }
  }

  function captureException(error, context) {
    var payload = normalizeError(error);
    payload.severity = 'error';
    payload.context = context || {};
    send(payload);
  }

  function shouldCapture(filename) {
    if (!filename) return true;

    try {
      var url = new URL(filename, window.location.href);
      if (EXTENSION_PROTOCOLS[url.protocol]) return false;
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.origin === window.location.origin;
      }
      return true;
    } catch (_error) {
      return true;
    }
  }

  window.addEventListener('error', function(event) {
    if (!shouldCapture(event.filename)) return;

    captureException(event.error || event.message, {
      source: 'browser.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', function(event) {
    captureException(event.reason, {
      source: 'browser.unhandledrejection',
    });
  });

  window.Canary = {
    captureException: captureException,
    captureMessage: function(message, context) {
      send({
        error_class: 'Message',
        message: String(message),
        severity: 'info',
        context: context || {},
      });
    },
  };
})();
