# Storybook Addons Configuration

This document outlines the Storybook addons configuration used in the Time is Money project.

## Installed Addons

The following essential Storybook addons are installed and configured:

### Core Addons

- **@storybook/addon-essentials** - A collection of addons that includes:

  - Controls - For dynamically interacting with component props
  - Actions - For logging events and callbacks
  - Viewport - For testing responsive design
  - Backgrounds - For changing the background color
  - Docs - For automatic documentation generation
  - Measure - For measuring elements
  - Outline - For highlighting elements

- **@storybook/addon-interactions** - For testing component interactions
- **@storybook/addon-links** - For linking between stories
- **@storybook/addon-a11y** - For accessibility testing

### Theme Switching

A custom theme switching mechanism is implemented using:

1. **ThemeProvider Component** (`.storybook/ThemeProvider.tsx`)

   - Manages light/dark theme state
   - Applies theme classes to document root

2. **Preview Configuration** (`.storybook/preview.tsx`)
   - Sets up theme toolbar control
   - Wraps stories in ThemeProvider
   - Defines global theme types

## Configuration Details

### Addon Registration

Addons are registered in `.storybook/main.ts`:

```typescript
addons: [
  '@storybook/addon-links',
  '@storybook/addon-essentials',
  '@storybook/addon-interactions',
  '@storybook/addon-a11y',
],
```

### Theme Toggle Configuration

The theme toggle is implemented with global types in `.storybook/preview.tsx`:

```typescript
globalTypes: {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', icon: 'sun', title: 'Light' },
        { value: 'dark', icon: 'moon', title: 'Dark' },
      ],
      showName: true,
    },
  },
},
```

And a decorator that wraps stories with the ThemeProvider:

```typescript
decorators: [
  (Story, context) => {
    const theme = context.globals.theme || 'light';
    return (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    );
  },
],
```

## Usage

### Accessibility Testing

The a11y addon automatically checks components against WCAG guidelines. Issues appear in the "Accessibility" tab in the Storybook UI.

### Theme Testing

To test components in different themes:

1. Use the theme toggle in the Storybook toolbar
2. Switch between light and dark modes to verify proper styling

### Controls and Actions

1. The Controls panel allows interactive modification of component props
2. The Actions panel logs events like clicks, focusing, and other interactions

## Best Practices

1. **Accessibility First**: Use the a11y addon to ensure all components meet WCAG 2.1 AA standards
2. **Test Both Themes**: Always verify components in both light and dark themes
3. **Document Props**: Use JSDoc comments on props to provide descriptions in the Controls panel
4. **Test Interactions**: Use the interactions addon to test user flows
