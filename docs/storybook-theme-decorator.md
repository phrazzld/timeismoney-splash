# Storybook Theme Decorator

This document explains how the theme decorator for Storybook is implemented in the TimeIsMoney splash site.

## Overview

The theme decorator enables components in Storybook to respond to theme changes (light/dark mode) by applying the appropriate CSS classes to the document root element. This allows the use of Tailwind's dark mode variant (`dark:`) in component styles.

## Implementation

The theme system consists of three main parts:

1. **ThemeProvider Component**
2. **Storybook Preview Configuration**
3. **Theme Global Type**

### ThemeProvider Component

Located in `.storybook/ThemeProvider.tsx`, this component:

- Accepts a `theme` prop ('light' or 'dark')
- Uses React's `useEffect` to apply the appropriate CSS class to the document root element
- Stores the theme preference in localStorage (optional feature for persistence)

```tsx
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: initialTheme = 'light',
}): React.ReactNode => {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    localStorage.setItem('storybook-theme', theme);
  }, [theme]);

  return <>{children}</>;
};
```

### Storybook Preview Configuration

Located in `.storybook/preview.tsx`, this configuration:

- Defines a decorator that wraps all stories in the `ThemeProvider`
- Gets the current theme from Storybook's global context
- Passes the theme to the `ThemeProvider`

```tsx
decorators: [
  (Story: React.ComponentType, context: StoryContext): React.ReactNode => {
    const theme = context.globals.theme || 'light';

    return (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    );
  },
],
```

### Theme Global Type

Also in `.storybook/preview.tsx`, this configuration:

- Defines a global type for the theme
- Adds a theme toggle to the Storybook toolbar
- Provides icons and labels for the theme options

```tsx
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

## Usage

When writing components, you can use Tailwind's dark mode variant to style elements differently based on the theme:

```tsx
<div className="bg-white dark:bg-neutral-800 text-black dark:text-white">
  This text will be black on white in light mode, and white on dark gray in dark mode.
</div>
```

The theme can be toggled using the theme control in the Storybook toolbar.

## Testing

A `ThemeTest` component is provided to verify that theme switching works correctly. It includes various UI elements with both light and dark mode styles to demonstrate the theme system in action.

## Best Practices

1. Always design components with both light and dark themes in mind
2. Use Tailwind's dark mode variant (`dark:`) to define dark theme styles
3. Prefer using the design tokens and semantic color names rather than hard-coded colors
4. Test components in both light and dark modes to ensure they look good in both themes
