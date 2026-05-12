/**
 * Matchic - Client-Side i18n & Theme Toggle
 * Supports: en (English), vi (Tiếng Việt)
 * Theme matches LiquidGlassTheme (dark/light)
 */

const i18n = {
  currentLang: 'en',
  translations: {},

  async load(lang) {
    try {
      const resp = await fetch(`locales/${lang}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.translations[lang] = await resp.json();
    } catch {
      // Fallback
    }
  },

  t(key, params = {}) {
    let text = this.translations[this.currentLang]?.[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  },

  setLang(lang) {
    if (!['en', 'vi'].includes(lang)) return;
    this.currentLang = lang;

    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang;

    try { localStorage.setItem('matchic_lang', lang); } catch {}

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = this.t(key);
      if (text !== key) el.textContent = text;
    });

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  },

  init() {
    const saved = (() => { try { return localStorage.getItem('matchic_lang'); } catch { return null; } })();
    this.setLang(saved || 'en');
  },
};

/**
 * Theme Toggle — matches LiquidGlassTheme dark/light
 */
const theme = {
  current: 'dark',

  setTheme(mode) {
    if (!['dark', 'light'].includes(mode)) return;
    this.current = mode;
    document.documentElement.setAttribute('data-theme', mode);

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = mode === 'dark'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });

    try { localStorage.setItem('matchic_theme', mode); } catch {}
  },

  toggle() {
    this.setTheme(this.current === 'dark' ? 'light' : 'dark');
  },

  init() {
    const saved = (() => { try { return localStorage.getItem('matchic_theme'); } catch { return null; } })();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(saved || (prefersDark ? 'dark' : 'light'));

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('matchic_theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
  theme.init();
});
