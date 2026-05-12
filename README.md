# Matchic Landing Pages

Landing pages for the Matchic app — an AI-powered wardrobe management app.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Main landing page with features, privacy highlights, tech stack, and CTA |
| `privacy.html` | Privacy Policy — required for Google Play / App Store submission |
| `terms.html` | Terms of Service — required for store submission |
| `support.html` | Support & FAQ page with contact options |

## Requirements for Store Submission

These pages satisfy the mandatory policy links required by:

- **Google Play Store**: Privacy Policy + Terms of Service links in the store listing
- **Apple App Store**: Privacy Policy URL in App Store Connect

## Structure

```
├── index.html          # Landing page (home)
├── privacy.html        # Privacy Policy
├── terms.html          # Terms of Service  
├── support.html        # Support & FAQ
├── css/
│   └── style.css       # All styles (glass design system)
├── js/
│   └── i18n.js         # Client-side EN/VI internationalization
├── locales/
│   ├── en.json         # English translations
│   └── vi.json         # Vietnamese translations
├── assets/
│   ├── favicon.svg     # SVG favicon
│   └── og-image.svg    # Open Graph preview image
└── manifest.json       # PWA manifest
```

## Design

- Dark theme with purple/rose gradient accents (matching the Matchic "Enchanted Design System")
- Glass-morphism cards with backdrop blur
- Responsive layout (mobile-first)
- Bilingual (English + Vietnamese) via client-side i18n
- No build tools — pure HTML/CSS/JS, deployable to any static host

## Deploy

Any static web server works:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# Or deploy to Vercel / Netlify / GitHub Pages
```
