# Matchic Landing Page

The official landing page for **Matchic** — a privacy-first, AI-powered wardrobe assistant that runs entirely on your device.

🔗 **Live:** [nmtuong97.github.io/matchic-landing-pages](https://nmtuong97.github.io/matchic-landing-pages/)

## What is Matchic?

Matchic helps you:
- **Catalog** your wardrobe with AI auto-tagging
- **Discover** outfits from clothes you already own
- **Track** what you wear and make smarter buying decisions
- **Stay private** — everything stays on your phone, always

## Tech Stack

- **Vanilla HTML/CSS/JS** — no heavy frameworks
- **GSAP** + ScrollTrigger for scroll animations
- **CSS Custom Properties** for theming (dark/light mode)
- **JSON-based i18n** — English + Vietnamese
- **GitHub Pages** for hosting

## Design System

Based on Matchic app's Liquid Glass Flutter theme:

| Token | Value |
|-------|-------|
| Primary | `#2196F3` |
| Secondary | `#03DAC6` |
| Dark BG | `#0D1117` |
| Light BG | `#EFF6FF` |
| Font | Inter |
| Glass Blur | 24px |
| Card Radius | 20px |

## Development

```bash
# Serve locally
python3 -m http.server 8000

# Or with Node
npx serve .
```

## Project Structure

```
matchic-landing-pages/
├── index.html              # Main landing page
├── css/
│   ├── tokens.css          # Design tokens
│   ├── base.css            # Base styles + theme
│   ├── layout.css          # Layout + navigation
│   ├── components.css       # Buttons, cards, forms
│   ├── sections.css         # Section-specific styles
│   └── animations.css       # Keyframes + transitions
├── js/
│   ├── main.js             # Entry point
│   ├── i18n.js             # Internationalization
│   └── animations.js       # GSAP + scroll animations
├── locales/
│   ├── en.json             # English copy
│   └── vi.json             # Vietnamese copy
├── assets/
│   ├── favicon.svg
│   └── og-image.svg
├── STRATEGY.md             # Brand strategy document
└── README.md
```

## License

Landing page content is © 2026 Matchic. The Matchic app is open source under the [MIT License](https://github.com/nmtuong97/matchic/blob/main/LICENSE).
