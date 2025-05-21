# Storybook Linting Guidelines

## ESLint Configuration for Storybook Files

In this project, Storybook files (`.storybook/**/*` and `**/*.stories.ts(x)`) are intentionally excluded from ESLint checking. This approach was chosen for the following reasons:

1. Story files primarily serve as documentation and examples, not core application code
2. They often use patterns that might not align with our strict application code standards
3. Their structure is heavily influenced by Storybook's API requirements

### Current Configuration

The following configuration choices have been made:

1. Story files are added to the ESLint ignore list in `eslint.config.mjs`
2. The `--no-warn-ignored` flag is added to lint commands to suppress warnings about ignored files
3. This approach allows story files to be modified without triggering ESLint warnings during pre-commit hooks

### Working with Story Files

When working with story files:

1. Focus on making them clear and functional examples of component usage
2. Follow general code style guidelines, but don't worry about strict TypeScript typing or other strict linting rules
3. If you want to manually lint your story files, use:
   ```bash
   npx eslint path/to/your/Component.stories.tsx --no-ignore
   ```

### Future Considerations

As the project evolves, we may consider:

1. Adding specific ESLint rules for story files that balance flexibility with code quality
2. Setting up a dedicated ESLint configuration for Storybook-related files
3. Integrating better with the Storybook ESLint plugin

## Related Configuration

The ESLint configuration for Storybook files is defined in:

- `eslint.config.mjs` - Global ignores section
- `package.json` - Lint scripts and lint-staged configuration
