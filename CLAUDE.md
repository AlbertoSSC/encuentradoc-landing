# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Production build → dist/
npm run preview  # Preview the production build
```

No linting or test scripts are configured.

## Stack

- **Astro 4** — static site generator, no JS framework
- **Tailwind CSS 3** via `@astrojs/tailwind` integration
- **TypeScript** (tsconfig present, used in component props)
- Deployed to `https://encuentradoc.com`

## Architecture

Single-page landing site. One route: `src/pages/index.astro`, which composes all section components in order:

```
Layout (html shell, meta, OG tags, Google Fonts)
  Navbar
  main
    Hero → Features → HowItWorks → ForDoctors → FAQ → CTA
  Footer
```

Each section is a self-contained `.astro` file in `src/components/`. Data (feature cards, steps, FAQ items) lives as arrays at the top of each component's frontmatter — there is no external data source or CMS.

## Design Tokens

Custom Tailwind colors defined in [tailwind.config.mjs](tailwind.config.mjs):

- `brand-dark` / `brand-navy` / `brand-accent` / `brand-light` — primary brand palette
- `primary-{50–900}` — sky-blue scale (used for interactive states, icons)
- Font: **Inter** (loaded from Google Fonts)

## Content Language

All copy is in **Spanish** (Spain). Keep all user-facing text in Spanish.

## Section IDs (anchor links)

- `#funcionalidades` — Features
- `#como-funciona` — HowItWorks
- `#para-doctores` — ForDoctors (assumed)
- `#faq` — FAQ
