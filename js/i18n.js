/**
 * Matchic — i18n System
 * Dynamic language switching with localStorage persistence
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'matchic-lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED_LANGS = ['en', 'vi'];

  let currentLang = DEFAULT_LANG;
  let translations = {};

  /**
   * Initialize i18n system
   */
  async function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const browserLang = navigator.language.split('-')[0];

    currentLang = SUPPORTED_LANGS.includes(stored)
      ? stored
      : SUPPORTED_LANGS.includes(browserLang)
        ? browserLang
        : DEFAULT_LANG;

    await loadTranslations(currentLang);
    applyTranslations();
    updateLangSwitcher();
    updateMetaTags();
    updateHtmlLang();
  }

  /**
   * Load translations from JSON file
   */
  async function loadTranslations(lang) {
    try {
      const res = await fetch(`locales/${lang}.json`);
      translations = await res.json();
    } catch (e) {
      console.warn(`Failed to load translations for ${lang}:`, e);
      translations = {};
    }
  }

  /**
   * Apply translations to all data-i18n elements
   */
  function applyTranslations() {
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const value = getNestedValue(translations, key);
      if (value !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.placeholder !== undefined) {
            el.placeholder = value;
          }
        } else if (el.tagName === 'META') {
          el.content = value;
        } else {
          el.textContent = value;
        }
      }
    });

    // Update document title
    if (translations.meta?.title) {
      document.title = translations.meta.title;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  function getNestedValue(obj, key) {
    return key.split('.').reduce((acc, k) => acc?.[k], obj);
  }

  /**
   * Switch language
   */
  async function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang) || lang === currentLang) return;

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    await loadTranslations(lang);
    applyTranslations();
    updateLangSwitcher();
    updateMetaTags();
    updateHtmlLang();

    // Dispatch custom event for other listeners
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  /**
   * Update language switcher active state
   */
  function updateLangSwitcher() {
    document.querySelectorAll('.lang-switcher button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  /**
   * Update HTML lang attribute and meta tags
   */
  function updateHtmlLang() {
    document.documentElement.lang = currentLang;
  }

  /**
   * Update meta tags (description, OG, Twitter)
   */
  function updateMetaTags() {
    if (!translations.meta) return;

    const metaMap = {
      'meta[name="description"]': 'meta.description',
      'meta[property="og:title"]': 'meta.ogTitle',
      'meta[property="og:description"]': 'meta.ogDescription',
      'meta[name="twitter:title"]': 'meta.twitterTitle',
      'meta[name="twitter:description"]': 'meta.twitterDescription',
    };

    Object.entries(metaMap).forEach(([selector, key]) => {
      const el = document.querySelector(selector);
      const value = getNestedValue(translations, key);
      if (el && value) {
        el.setAttribute('content', value);
      }
    });
  }

  /**
   * Get current language
   */
  function getCurrentLang() {
    return currentLang;
  }

  /**
   * Get translation by key
   */
  function t(key) {
    return getNestedValue(translations, key) || key;
  }

  // Expose API
  window.matchicI18n = {
    init,
    setLanguage,
    getCurrentLang,
    t,
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
