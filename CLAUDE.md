# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Time is Money landing page - A static HTML/CSS/JS marketing site for a Chrome extension that converts prices to hours of work. Zero build step, zero dependencies.

## Development

```bash
# Serve locally (any static server works)
python3 -m http.server 8000
# or
npx serve .

# Open in browser
open index.html
```

## Architecture

### Tech Stack
- **HTML**: Single `index.html` file
- **CSS**: Vanilla CSS with custom properties (`css/styles.css`)
- **JavaScript**: Vanilla JS, no framework (`js/app.js`)
- **Fonts**: Clash Display (local WOFF2), Geist (Google Fonts CDN)

### Project Structure
```
├── index.html          # Single-page HTML
├── css/
│   └── styles.css      # All styles (~400 lines)
├── js/
│   └── app.js          # All interactivity (~200 lines)
├── fonts/
│   └── ClashDisplay-Variable.woff2
├── images/
│   └── icon_640.png
└── favicon.ico
```

### Key Features
- **Demo Card Carousel**: Auto-rotates every 3.5s, pauses on hover, keyboard navigation (arrow keys)
- **Time Thieves Calculator**: Monthly/yearly toggle with animated counter
- **Chrome Install Buttons**: Loading state with spinner, opens Chrome Web Store

### Styling Approach
- CSS custom properties for colors, shadows, spacing
- Mobile-first responsive design (768px, 1024px breakpoints)
- No preprocessor, no build step

### External Integration
- Chrome Web Store: `https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en`
- Google Fonts CDN for Geist font

### File Sizes
- `index.html`: ~20KB
- `css/styles.css`: ~28KB
- `js/app.js`: ~12KB
- `fonts/`: ~32KB
- **Total**: ~100KB (vs 546MB with Next.js)
