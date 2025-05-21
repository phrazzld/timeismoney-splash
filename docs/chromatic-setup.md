# Chromatic Setup Guide

This document explains how Chromatic is set up for visual regression testing in the Time is Money marketing site.

## What is Chromatic?

[Chromatic](https://www.chromatic.com/) is a visual testing tool that captures screenshots of Storybook stories and compares them against previous versions to detect visual changes. It's useful for:

- Preventing visual regressions
- Reviewing UI changes during code reviews
- Creating a visual history of components
- Publishing a hosted version of Storybook for documentation

## Initial Setup

1. **Install Chromatic**

   The Chromatic package is installed as a dev dependency:

   ```bash
   pnpm add -D chromatic
   ```

2. **Add Chromatic Script**

   A script has been added to package.json:

   ```json
   "chromatic": "chromatic --build-script-name=build-storybook"
   ```

3. **Configure GitHub Actions**

   A workflow file has been created at `.github/workflows/chromatic.yml` that:

   - Runs on push to the main branch and pull requests
   - Sets up Node.js and pnpm
   - Installs dependencies
   - Runs Chromatic with the project token from GitHub Secrets

## Usage

### Running Locally

To run Chromatic locally (requires a project token):

```bash
CHROMATIC_PROJECT_TOKEN=<your-token> pnpm chromatic
```

### GitHub Integration

On each pull request, Chromatic will:

1. Build the Storybook
2. Capture screenshots of all stories
3. Compare them against the baseline
4. Report visual changes in the PR

## Setting Up Project Token

To set up the Chromatic project token:

1. Go to [Chromatic](https://www.chromatic.com/) and sign up using your GitHub account
2. Create a new project linked to the Time is Money repository
3. Copy the Project Token
4. Add it to GitHub Repository Secrets as `CHROMATIC_PROJECT_TOKEN`

## Best Practices

1. **Review Visual Changes**

   Always review visual changes in the Chromatic UI before accepting them.

2. **Update Baselines**

   When intentional visual changes are made, accept them in Chromatic to update the baseline.

3. **Test All Variants**

   Ensure all component variants and states have corresponding stories to catch all potential regressions.

4. **Test Both Light and Dark Modes**

   Create stories that test both light and dark modes to ensure theme consistency.

## Troubleshooting

If you encounter issues with Chromatic:

- **Build Failures**: Check if Storybook builds locally with `pnpm build-storybook`
- **Token Issues**: Verify the project token is set correctly in GitHub Secrets
- **Timeout Issues**: Large Storybooks might time out; consider increasing the timeout or splitting the build

## Additional Resources

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
