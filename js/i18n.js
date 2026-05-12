/**
 * Matchic i18n Engine v2
 * 
 * Features:
 * - Dot-notation key lookup: t('features.outfitGenerator.title')
 * - Fallback chain: vi → en → key name
 * - Lazy loading: Only load language when needed
 * - Namespace support: Organized by page/section
 * - Auto-detection: Detects browser language
 * - Persistence: Saves to localStorage
 * 
 * Usage:
 *   // In HTML: data-i18n="features.outfitGenerator.title"
 *   // In JS:   i18n.t('features.outfitGenerator.title')
 *   // With fallback: i18n.t('some.missing.key', 'Default Text')
 */

(function () {
  'use strict';

  const I18N_CONFIG = {
    defaultLang: 'en',
    supportedLangs: ['en', 'vi', 'ja', 'ko'],
    storageKey: 'matchic-lang',
    fallbackChain: true, // vi → en → key
    debug: false
  };

  let currentLang = I18N_CONFIG.defaultLang;
  let translations = {};
  let isReady = false;
  const listeners = [];

  /* ===== LANGUAGE DETECTION ===== */
  function detectLanguage() {
    // 1. Check localStorage
    const stored = localStorage.getItem(I18N_CONFIG.storageKey);
    if (stored && I18N_CONFIG.supportedLangs.includes(stored)) {
      return stored;
    }

    // 2. Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const baseLang = browserLang.split('-')[0];
    if (I18N_CONFIG.supportedLangs.includes(baseLang)) {
      return baseLang;
    }

    // 3. Default
    return I18N_CONFIG.defaultLang;
  }

  /* ===== LOAD TRANSLATIONS ===== */
  async function loadLanguage(lang) {
    if (translations[lang]) {
      return translations[lang];
    }

    try {
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}: ${response.status}`);
      }
      const data = await response.json();
      translations[lang] = data;
      return data;
    } catch (error) {
      console.warn(`i18n: Could not load ${lang}, using fallback`);
      return null;
    }
  }

  /* ===== DOT NOTATION GETTER ===== */
  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /* ===== TRANSLATE FUNCTION ===== */
  function translate(key, fallback = '') {
    if (!key) return fallback || '';

    // Try current language
    let value = getByPath(translations[currentLang], key);
    
    // Fallback to default language
    if (value === undefined && I18N_CONFIG.fallbackChain && currentLang !== I18N_CONFIG.defaultLang) {
      value = getByPath(translations[I18N_CONFIG.defaultLang], key);
    }
    
    // Last resort: return key name or fallback
    if (value === undefined) {
      if (I18N_CONFIG.debug) {
        console.warn(`i18n: Missing key "${key}" in ${currentLang}`);
      }
      return fallback || key;
    }
    
    return value;
  }

  /* ===== PLURALIZATION ===== */
  function pluralize(key, count, options = {}) {
    const rules = translate(`${key}._plural`);
    if (!rules) {
      return translate(key, '').replace('{{count}}', count);
    }
    
    // Simple plural rules
    let form = 'other';
    if (count === 0) form = 'zero';
    else if (count === 1) form = 'one';
    else if (count < 5) form = 'few';
    
    const template = rules[form] || rules['other'] || rules['one'];
    return template.replace('{{count}}', count);
  }

  /* ===== INTERPOLATION ===== */
  function interpolate(text, vars = {}) {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  /* ===== FORMAT NUMBER ===== */
  function formatNumber(num, lang = currentLang) {
    return new Intl.NumberFormat(lang).format(num);
  }

  /* ===== FORMAT DATE ===== */
  function formatDate(date, options = {}, lang = currentLang) {
    return new Intl.DateTimeFormat(lang, options).format(date);
  }

  /* ===== FORMAT RELATIVE TIME ===== */
  function formatRelativeTime(value, unit, lang = currentLang) {
    return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(value, unit);
  }

  /* ===== UPDATE DOM ===== */
  function updateDOM() {
    // Update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const fallback = el.textContent;
      const text = translate(key, fallback);
      
      // Handle interpolation
      const vars = {};
      Object.keys(el.dataset).forEach(k => {
        if (k.startsWith('i18n')) {
          const varName = k.replace('i18n', '').toLowerCase();
          vars[varName] = el.dataset[k];
        }
      });
      
      el.textContent = interpolate(text, vars);
    });

    // Update elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const fallback = el.placeholder;
      el.placeholder = translate(key, fallback);
    });

    // Update elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      const fallback = el.title;
      el.title = translate(key, fallback);
    });

    // Update meta tags
    document.querySelectorAll('meta[data-i18n-content]').forEach(el => {
      const key = el.dataset.i18nContent;
      el.content = translate(key, el.content);
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
  }

  /* ===== SET LANGUAGE ===== */
  async function setLanguage(lang) {
    if (!I18N_CONFIG.supportedLangs.includes(lang)) {
      console.warn(`i18n: Unsupported language "${lang}"`);
      return false;
    }

    // Load if not cached
    const loaded = await loadLanguage(lang);
    if (!loaded && lang !== I18N_CONFIG.defaultLang) {
      // Try default language
      await loadLanguage(I18N_CONFIG.defaultLang);
    }

    currentLang = lang;
    localStorage.setItem(I18N_CONFIG.storageKey, lang);
    
    // Update DOM
    updateDOM();
    
    // Notify listeners
    listeners.forEach(cb => cb(lang));
    
    return true;
  }

  /* ===== INIT ===== */
  async function init() {
    const lang = detectLanguage();
    
    // Preload default language
    await loadLanguage(I18N_CONFIG.defaultLang);
    
    // Load detected language
    if (lang !== I18N_CONFIG.defaultLang) {
      await loadLanguage(lang);
    }
    
    currentLang = lang;
    isReady = true;
    
    // Initial DOM update
    updateDOM();
    
    if (I18N_CONFIG.debug) {
      console.log(`i18n: Initialized with language "${lang}"`);
    }
  }

  /* ===== PUBLIC API ===== */
  window.matchicI18n = {
    // Core
    t: translate,
    setLanguage,
    getLanguage: () => currentLang,
    
    // Utilities
    pluralize,
    interpolate,
    formatNumber,
    formatDate,
    formatRelativeTime,
    
    // Advanced
    onChange: (cb) => listeners.push(cb),
    getSupportedLangs: () => [...I18N_CONFIG.supportedLangs],
    isReady: () => isReady,
    
    // Development
    getMissingKeys: () => {
      // Returns all keys used in DOM that are missing in current language
      const missing = [];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translate(key) === key) {
          missing.push(key);
        }
      });
      return [...new Set(missing)];
    },
    
    // Re-initialize (useful after dynamic content)
    refresh: updateDOM
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ===== USAGE EXAMPLES ===== */

// In HTML:
// <span data-i18n="features.outfitGenerator.title">AI Outfit Generator</span>
// <input data-i18n-placeholder="waitlist.emailPlaceholder" placeholder="Enter your email">

// In JS:
// i18n.t('features.outfitGenerator.title');
// i18n.t('some.missing.key', 'Default fallback');
// i18n.setLanguage('vi');
// i18n.pluralize('items', 5); // "5 items"
// i18n.interpolate('Hello {{name}}', { name: 'Tường' }); // "Hello Tường"

// Switch language:
// document.querySelectorAll('.lang-switcher button').forEach(btn => {
//   btn.addEventListener('click', () => {
//     window.matchicI18n.setLanguage(btn.dataset.lang);
//   });
// });
