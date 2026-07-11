const DEFAULT_SERVICE = 'timeismoney-splash';

function canaryStatus() {
  return {
    status: process.env.CANARY_API_KEY ? 'configured' : 'not_configured',
    service: process.env.CANARY_SERVICE_NAME || DEFAULT_SERVICE,
    endpoint: process.env.CANARY_ENDPOINT || 'https://canary.mistystep.io',
  };
}

function requiresCanaryConfig() {
  return (
    process.env.NODE_ENV === 'production'
  );
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ status: 'error', error: 'Method not allowed' });
    return;
  }

  const canary = canaryStatus();
  const configured = canary.status === 'configured';
  const healthy = configured || !requiresCanaryConfig();
  const body = {
    status: healthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    service: canary.service,
    checks: {
      liveness: 'ok',
      canary_config: configured ? 'configured' : 'not_configured',
    },
    dependencies: {
      canary: configured ? 'configured' : 'not_configured',
    },
    observability: {
      canary,
    },
  };

  if (!healthy) {
    body.error = 'Canary is not configured';
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(healthy ? 200 : 503);

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  res.json(body);
};
