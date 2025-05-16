# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the marketing site for the "Time is Money" Chrome extension - a tool that automatically converts prices online into hours of work, helping users make better-informed purchasing decisions. The site is built with Next.js, TypeScript, and Tailwind CSS following the App Router architecture.

## Common Commands

### Development

```bash
# Start the development server with Turbopack
npm run dev

# Build the project for production
npm run build

# Start the production server
npm run start

# Run ESLint to check for code issues
npm run lint
```

## Architecture & Design Principles

The project follows the Atomic Design methodology for component architecture:

1. **Atoms**: Basic UI primitives (buttons, inputs, typography, icons)
2. **Molecules**: Combinations of atoms (search bars, form groups, menu items)
3. **Organisms**: Complex UI sections (navigation, forms, cards)
4. **Templates**: Page-level layouts defining content structure
5. **Pages**: Concrete implementations with actual data

### Core Standards

- **Component Development**: Create components in isolation using Storybook before integrating
- **Styling**: Use Tailwind CSS for styling with shadcn/ui as the component foundation
- **State Management**: Keep state as close as possible to where it's used:
  - Component state: React's `useState`
  - Shared state: React Context API
  - Server state: TanStack Query (React Query)
  - Form state: React Hook Form
- **Testing**: Follow a multi-level approach:
  - Component tests with React Testing Library
  - Integration tests for composite components
  - E2E tests for critical user flows using Cypress or Playwright

### Key Technical Requirements

1. **TypeScript Strictness**: Maintain strict TypeScript configuration. No `any` types permitted.
2. **Accessibility**: WCAG 2.1 AA compliance is mandatory
3. **Responsive Design**: Mobile-first approach using Tailwind's breakpoint system
4. **Performance**: Meet Core Web Vitals metrics:
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

## Project Structure

```
/app             - Next.js App Router pages and layouts
/components      - UI components organized by atomic design
/lib             - Shared utility functions and hooks
/public          - Static assets
```

## Development Workflow

1. Use the existing design system with Tailwind and shadcn/ui
2. Create components following Atomic Design principles
3. Keep components focused and maintainable
4. Write tests for all components
5. Ensure all UI is responsive and accessible
6. Follow strict TypeScript typing
7. Use ESLint and formatting rules consistently

## Additional Notes

- This site is the splash/marketing page for the Time is Money Chrome extension
- Follows the development philosophy outlined in docs/DEVELOPMENT_PHILOSOPHY.md and its appendices
- Uses Next.js App Router for routing and layouts
- Implements systematic component architecture for maintainability
