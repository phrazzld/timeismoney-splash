This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

This project uses **pnpm** as the package manager. You must have pnpm installed to work with this project.

To install pnpm:

```bash
npm install -g pnpm
```

We enforce pnpm usage through multiple mechanisms:

- `packageManager` field in package.json (requires Node.js 16.13+)
- Preinstall script that blocks npm/yarn
- `.npmrc` configuration
- Engine strict mode

## Contributing

We welcome contributions to the Time Is Money marketing site. Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for code quality standards, workflow details, and guidelines for submitting pull requests.

## Getting Started

First, install dependencies using pnpm:

```bash
pnpm install
```

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

This project requires the following environment variables:

### `NEXT_PUBLIC_SITE_URL`

The base URL of the site, used for SEO metadata, sitemap generation, and canonical URLs.

- **Local Development**: Set in `.env.local` as `http://localhost:3000`
- **Production**: Set in Vercel environment variables as `https://timeismoney.works`
- **Preview Deployments**: Use the appropriate preview URL in Vercel

This variable is critical for proper SEO functionality. Without it:

- The site will use a fallback URL in development
- Production builds will log a warning
- SEO features may not work correctly

To configure for deployment:

1. Go to your Vercel project settings
2. Navigate to the Environment Variables section
3. Add `NEXT_PUBLIC_SITE_URL` with the appropriate URL for each environment:
   - Production: `https://timeismoney.works`
   - Preview: Leave as default or set to your custom preview domain

## Analytics

This project uses Plausible Analytics for privacy-friendly analytics tracking.

### Configuration

Set the following environment variable:

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

- **Local Development**: Analytics are disabled, events log to console
- **Production**: Analytics are enabled when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set

### Tracking Events

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a custom event
trackEvent('extension_install_click', {
  location: 'hero',
  variant: 'primary',
});
```

## Component Development

This project uses [Storybook](https://storybook.js.org/) for component development and documentation. View the Storybook to explore all UI components, their variations, and usage guidelines.

### Running Storybook

```bash
pnpm storybook
```

This will start Storybook at [http://localhost:6006](http://localhost:6006).

### Visual Regression Testing

We use [Chromatic](https://www.chromatic.com/) for visual regression testing to ensure UI consistency across changes.

- **View published Storybook**: [Time is Money Storybook](https://main--65ce8cf3d3d98d00123a02ef.chromatic.com/)
- **Status**: [![Chromatic Status](https://github.com/timecurrencyteam/timeismoney-splash/actions/workflows/chromatic.yml/badge.svg)](https://github.com/timecurrencyteam/timeismoney-splash/actions/workflows/chromatic.yml)

#### Local Chromatic Usage

To run Chromatic locally (requires a project token):

```bash
CHROMATIC_PROJECT_TOKEN=<your-token> pnpm chromatic
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
