# Storybook ESLint Configuration

## Overview

This document explains the ESLint configuration for Storybook files in this project.

## Configuration

The ESLint configuration in `eslint.config.mjs` has been set up to ignore Storybook files and stories. This decision was made because:

1. Storybook files have different requirements than regular application code.
2. Strict TypeScript type checking is less critical for Storybook configuration files and stories.
3. This approach allows for more flexibility in Storybook development while maintaining strict standards for application code.

## Ignored Patterns

The following patterns are ignored by ESLint:

- `.storybook/` - All files in the Storybook configuration directory
- `**/*.stories.ts` - All TypeScript story files
- `**/*.stories.tsx` - All TypeScript JSX story files

## Manual Linting

If you need to lint Storybook files manually, you can use the `--no-ignore` flag with ESLint:

```bash
npx eslint .storybook/ --ext .ts,.tsx,.js,.jsx --no-ignore
```

Or for specific story files:

```bash
npx eslint components/path/to/Component.stories.tsx --no-ignore
```

## Best Practices

Even though Storybook files are ignored by the linter, it's still a good practice to:

1. Maintain consistent coding standards across all files.
2. Ensure story files are well-structured and readable.
3. Follow TypeScript best practices where possible, even in story files.
