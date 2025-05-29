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

## ⚠️ MANDATORY: Project Token Configuration

**The `CHROMATIC_PROJECT_TOKEN` setup is a mandatory prerequisite for Chromatic integration to function.**

Without proper token configuration, the CI pipeline will fail and visual regression testing will not work. This token configuration is required because:

- Chromatic needs authentication to access your project
- CI workflows cannot proceed without valid credentials
- Missing tokens cause cryptic build failures that are difficult to debug

### Token Setup Steps

**REQUIRED:** Complete ALL steps below before considering Chromatic integration functional:

1. **Create Chromatic Account**

   - Go to [Chromatic](https://www.chromatic.com/) and sign up using your GitHub account

2. **Create Project**

   - Create a new project linked to the Time is Money repository
   - Copy the Project Token from the project's Manage screen

3. **Configure GitHub Secret**
   - Navigate to GitHub repository Settings → Secrets and variables → Actions
   - Create a new repository secret named `CHROMATIC_PROJECT_TOKEN`
   - Paste the copied token value and save

## ✅ Verification: Confirm Your Setup

**IMPORTANT:** Complete this verification checklist to ensure your Chromatic integration is fully functional:

### Step 1: Verify Secret Configuration

1. Navigate to your GitHub repository Settings → Secrets and variables → Actions
2. Confirm `CHROMATIC_PROJECT_TOKEN` is listed in the repository secrets (value will be masked)
3. If not present, complete the [Token Setup Steps](#token-setup-steps) above

### Step 2: Test CI Integration

1. Create a test branch: `git checkout -b test-chromatic-setup`
2. Make a small change to any Storybook story file
3. Commit and push the change: `git commit -am "test: verify chromatic integration" && git push origin test-chromatic-setup`
4. Create a pull request to trigger the CI workflow
5. Monitor the GitHub Actions workflow for the Chromatic step

### Step 3: Verify Successful Execution

✅ **Success Indicators:**

- The "Check for Chromatic Project Token" step passes
- The "Publish to Chromatic" step completes successfully
- You receive a Chromatic build link in the PR checks
- Clicking the Chromatic link shows your visual tests

❌ **Failure Indicators:**

- "CHROMATIC_PROJECT_TOKEN is not set" error in CI logs
- "Publish to Chromatic" step fails with authentication errors
- No Chromatic link appears in PR checks

### Step 4: Clean Up Test

After successful verification:

1. Delete the test branch: `git branch -d test-chromatic-setup`
2. Close the test pull request

**If verification fails, repeat the [Token Setup Steps](#token-setup-steps) and contact the repository administrator.**

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

If you encounter issues with Chromatic, follow this systematic approach:

### 1. Token-Related Issues (Most Common)

**Symptoms:**

- "CHROMATIC_PROJECT_TOKEN is not set" error in CI
- Authentication failures in Chromatic step
- CI pipeline stops at Chromatic integration

**Solution:**

1. Complete the [Verification checklist](#verification-confirm-your-setup) above
2. Ensure the secret name is exactly `CHROMATIC_PROJECT_TOKEN` (case-sensitive)
3. Verify you have the correct permissions to access repository secrets

### 2. Build Failures

**Symptoms:**

- Storybook fails to build in CI
- "Build failed" errors in Chromatic step

**Solution:**

1. Test local Storybook build: `pnpm build-storybook`
2. Check for TypeScript errors: `pnpm lint`
3. Verify all story files are valid

### 3. Timeout Issues

**Symptoms:**

- Chromatic step times out
- Long-running builds that never complete

**Solution:**

- Large Storybooks might need increased timeout
- Consider splitting complex stories into simpler variants
- Check Chromatic dashboard for build progress

### 4. First-Time Setup Issues

**NEW PROJECT?** If this is your first time setting up Chromatic for this repository:

1. **STOP** - Complete the [mandatory token configuration](#️-mandatory-project-token-configuration) first
2. Run through the [complete verification process](#verification-confirm-your-setup)
3. Only proceed with development after verification passes

### Need Help?

If issues persist after following the verification steps:

1. Check the [complete verification checklist](#verification-confirm-your-setup)
2. Review CI logs for specific error messages
3. Contact the repository administrator with verification results

## Additional Resources

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
