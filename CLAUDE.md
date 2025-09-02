# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Time is Money landing page - A Next.js 15 marketing site for a Chrome extension that converts prices to hours of work. Built with TypeScript, Tailwind CSS v4, and shadcn/ui components.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.3 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Components**: Custom UI components using shadcn/ui patterns (Button, Card, Navbar, Footer)
- **Icons**: Lucide React for consistent iconography

### Project Structure
- `app/` - Next.js App Router pages and layouts
  - `page.tsx` - Main landing page with animated demo card showcasing price-to-time conversion
  - `layout.tsx` - Root layout with font configuration
- `components/ui/` - Reusable UI components following shadcn/ui patterns
  - Components use class-variance-authority (CVA) for variant management
  - Consistent use of `cn()` utility for className merging
- `lib/utils.ts` - Utility functions including the `cn()` helper for Tailwind class merging

### Key Features
- **Animated Demo Card**: Cycles through real product examples showing price-to-time conversions
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts
- **Theme System**: CSS variables-based theming with HSL color definitions
- **Component Variants**: Button and Card components support multiple style variants via CVA

### Styling Conventions
- Uses Tailwind CSS with custom theme extensions defined in `tailwind.config.ts`
- Color system based on CSS variables (--primary, --secondary, --muted, etc.)
- Consistent spacing and sizing using Tailwind's utility classes
- Shadow effects for depth and hover states for interactivity

### External Integration
- Chrome Web Store link: `https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en`
- All CTAs open extension page in new tab via `window.open()`

### Development Notes
- Client-side rendering enabled with `"use client"` directive
- React hooks for state management and effects
- TypeScript strict mode enforced
- ESLint configured with Next.js recommended rules