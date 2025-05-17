This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Contributing

We welcome contributions to the Time Is Money marketing site. Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for code quality standards, workflow details, and guidelines for submitting pull requests.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev --turbopack
# or
bun dev
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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
