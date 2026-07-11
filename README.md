# Time is Money - Landing Page

Static landing page for the [Time is Money Chrome extension](https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl).

## Quick Start

Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000
```

Verify the Canary health and relay functions:

```bash
node scripts/verify-canary.js
```

Run the full local CI gate before shipping:

```bash
node scripts/ci.js
```

After a production deploy, verify live Canary ingest and readback:

```bash
CANARY_READ_API_KEY=... node scripts/smoke-canary-production.js
```

## Structure

```
├── index.html      # Single-page HTML
├── css/styles.css  # Vanilla CSS
├── js/app.js       # Vanilla JavaScript
├── js/canary.js    # Browser error observer
├── scripts/verify-canary.js # Local Canary route verification
├── scripts/ci.js # Local CI gate used by GitHub Actions
├── scripts/smoke-canary-production.js # Production Canary smoke/readback
├── api/health.js   # DigitalOcean sidecar health endpoint
├── api/canary/api/v1/errors.js # Browser error relay to Canary
├── fonts/          # Clash Display font
└── images/         # Extension icon
```

## Features

- Demo card carousel with auto-rotate
- Time thieves calculator with toggle
- Responsive design (mobile-first)
- Zero dependencies, zero build step
- Canary error reporting and production health checks via the DigitalOcean sidecar

## Deploy

Production runs on DigitalOcean App Platform: the static site and the Node
sidecar in `server.js` jointly provide the page, `/api/health`, and the
server-side Canary relay.

The DigitalOcean sidecar should define:

- `CANARY_API_KEY` - service-bound ingest key for `timeismoney-splash`
- `CANARY_ENDPOINT` - defaults to `https://canary.mistystep.io`
- `CANARY_SERVICE_NAME` - defaults to `timeismoney-splash`
- `NEXT_PUBLIC_SITE_URL` - canonical origin, `https://www.timeismoney.works`

Production and preview `/api/health` are liveness/config checks and return
`503` if Canary is not configured. Use `scripts/smoke-canary-production.js`
after deploy to prove end-to-end Canary ingest.
