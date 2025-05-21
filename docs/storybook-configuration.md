# Storybook Configuration

This document explains how the Storybook configuration is set up for this project, particularly focusing on how Tailwind CSS is integrated.

## Basic Configuration

The Storybook configuration is located in the `.storybook` directory, with these key files:

- `main.ts` - Defines the Storybook configuration including stories location and addons
- `preview.tsx` - Configures the preview iframe where stories are rendered
- `ThemeProvider.tsx` - Provides theme switching functionality

## Tailwind CSS Integration

Tailwind CSS is integrated into Storybook through the following setup:

1. **CSS Import**: The `preview.tsx` file imports `../app/globals.css`, which contains the Tailwind CSS directives.

2. **Theme Support**: The configuration includes support for both light and dark modes:
   - Using the `themes` parameter in the Storybook configuration
   - Using a custom ThemeProvider component that adds the appropriate class to the document

3. **PostCSS Configuration**: The project uses a shared PostCSS configuration (in `postcss.config.mjs`) which is automatically used by the Storybook NextJS framework.

## Testing Your Components

When creating new components with Tailwind styles:

1. Create your component file (e.g., `MyComponent.tsx`)
2. Create a corresponding story file (e.g., `MyComponent.stories.tsx`)
3. Use Tailwind classes in your component
4. In Storybook, test your component in both light and dark modes using the theme toggle

## Troubleshooting

If Tailwind styles are not applying correctly:

1. Ensure `app/globals.css` is properly imported in `.storybook/preview.tsx`
2. Check that your Tailwind classes are correctly specified
3. Verify that the PostCSS configuration includes Tailwind CSS
4. Restart the Storybook server if necessary