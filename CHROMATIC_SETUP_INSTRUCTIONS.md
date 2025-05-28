# Chromatic Setup Instructions

## Current Status

✅ Chromatic package installed
✅ GitHub Actions workflow configured
✅ Storybook builds successfully
❌ **MISSING**: CHROMATIC_PROJECT_TOKEN GitHub secret

## Required Manual Steps

### 1. Create Chromatic Account & Project

1. Visit https://www.chromatic.com/
2. Click "Sign in with GitHub"
3. Authorize Chromatic to access your GitHub account
4. Click "Add project" or "Create project"
5. Select the `phrazzld/timeismoney-splash` repository
6. Wait for project creation to complete

### 2. Copy the Project Token

1. Once the project is created, you'll see a project token
2. It will look like: `chpt_xxxxxxxxxxxx`
3. Copy this token (keep the browser tab open)

### 3. Add Token to GitHub Secrets

1. Go to: https://github.com/phrazzld/timeismoney-splash/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CHROMATIC_PROJECT_TOKEN`
4. Value: Paste the token from step 2
5. Click "Add secret"

### 4. Verify Setup

Run the verification script:

```bash
node scripts/verify-chromatic.mjs
```

### 5. Test CI Integration

The next push to any branch will automatically trigger Chromatic.

To manually test:

```bash
# Optional: Test locally first
export CHROMATIC_PROJECT_TOKEN=<your-token>
pnpm chromatic

# Trigger CI by pushing any change
git push
```

## Expected Result

- GitHub Actions workflow will run successfully
- Chromatic will capture screenshots of all stories
- Visual changes will be tracked in pull requests
- Storybook will be published to Chromatic

## Support

- Chromatic Docs: https://www.chromatic.com/docs/
- Existing setup guide: docs/chromatic-setup.md
