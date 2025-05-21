# CI Failure Summary

## Overview

- **PR**: #2 "feat(design-tokens): implement Storybook and atom components"
- **Branch**: feat/design-tokens-storybook-atoms
- **Date**: 2025-05-21
- **Status**: Failed

## Failed Checks

1. **Chromatic** - Visual regression testing
2. **Vercel** - Preview deployment

## Chromatic Failure Details

### Previous Error (Fixed)

```
ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies

.
└─┬ eslint-plugin-storybook 0.8.0
  └─┬ @typescript-eslint/utils 5.62.0
    └── ✕ unmet peer eslint@"^6.0.0 || ^7.0.0 || ^8.0.0": found 9.27.0

hint: If you don't want pnpm to fail on peer dependency issues, add "strict-peer-dependencies=false" to an .npmrc file at the root of your project.
```

### Current Error

```
18:14:14.908 ✖ Missing project token

Sign in to https://www.chromatic.com/start and create a new project,
or find your project token on the Manage screen in an existing project.
Set your project token as the CHROMATIC_PROJECT_TOKEN environment variable
or pass the --project-token command line option.
```

### Root Cause

1. First issue (fixed): A peer dependency conflict between `eslint-plugin-storybook` and `eslint`. The `@typescript-eslint/utils` package has a peer dependency on eslint versions 6, 7, or 8, but the project is using eslint version 9.27.0.

2. Current issue: The Chromatic CI job is missing a project token. This is required for authentication and publishing to Chromatic's service.

### Additional Details

- We fixed the first issue by setting `strict-peer-dependencies=false` in the .npmrc file
- The Chromatic job is now failing because the CHROMATIC_PROJECT_TOKEN environment variable is not set in the GitHub Actions workflow

## Vercel Deployment Failure

### Error Message

No specific error message was available, but the Vercel deployment failed. This is likely due to the same dependency issues that are causing the Chromatic job to fail.

### Root Cause

The strict peer dependency requirements in pnpm are causing the build to fail during dependency installation.

## Affected Files

- `.npmrc` - Contains `strict-peer-dependencies=true`
- `package.json` - Contains dependency versions:
  - eslint: 9.27.0
  - eslint-plugin-storybook: 0.8.0

## Impact

The CI failures prevent:

1. Visual regression testing of components via Chromatic
2. Preview deployment of the PR for testing and review
