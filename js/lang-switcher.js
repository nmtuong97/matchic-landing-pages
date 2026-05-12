/**
 * Matchic Language Switcher v2
 * 
 * Features:
 * - Dropdown menu with flags + native names
 * - Current language indicator
 * - Keyboard accessible (arrow keys, escape, enter)
 * - Click-outside to close
 * - Mobile: Bottom sheet instead of dropdown
 * - Auto-detect browser language
 * - Persist to localStorage
 */

(function() {
  'use strict';

  const LANGUAGES = [
    { code: 'en', flag: '🇺🇸', name: 'English', native: 'English' },
    { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', native: 'Tiếng Việt' }
  ];
//  { code: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語' },
//  { code: 'ko', flag: '🇰🇷', name: 'Korean', native: '한국어' }
    { code: 'en', flag: '🇺🇸', name: 'English', native: 'English' },
    { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語' },
    { code: 'ko', flag: '🇰🇷', name: 'Korean', native: '한국어' }
  ];

  const STORAGE_KEY = 'matchic-lang';
  const DEFAULT_LANG = 'en';

  let currentLang = DEFAULT_LANG;
  let isDropdownOpen = false;

  /* ===== LANGUAGE DETECTION ===== */
  function detectLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some(l => l.code === stored)) {
      return stored;
    }
    
    const browserLang = navigator.language || navigator.userLanguage;
    const baseLang = browserLang.split('-')[0];
    if (LANGUAGES.some(l => l.code === baseLang)) {
      return baseLang;
    }
    
    return DEFAULT_LANG;
  }

  /* ===== RENDER LANGUAGE SELECTOR ===== */
  function renderLanguageSelector() {
    const container = document.getElementById('language-selector');
    if (!container) return;

    const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

    container.innerHTML = `
      <div class="lang-dropdown" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-label="Select language">
        <button class="lang-trigger" type="button" aria-label="Current language: ${current.name}. Click to change language.">
          <span class="lang-flag" aria-hidden="true">${current.flag}</span>
          <span class="lang-code">${current.code.toUpperCase()}</span>
          <svg class="lang-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <ul class="lang-menu" role="listbox" aria-label="Languages" hidden>
          ${LANGUAGES.map(lang => `
            <li role="option" 
                class="lang-option ${lang.code === currentLang ? 'active' : ''}"
                data-lang="${lang.code}"
                aria-selected="${lang.code === currentLang}">
              <span class="lang-option-flag" aria-hidden="true">${lang.flag}</span>
              <span class="lang-option-native">${lang.native}</span>
              <span class="lang-option-name">${lang.name}</span>
              ${lang.code === currentLang ? `
                <svg class="lang-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    bindEvents();
  }

  /* ===== BIND EVENTS ===== */
  function bindEvents() {
    const trigger = document.querySelector('.lang-trigger');
    const menu = document.querySelector('.lang-menu');
    const options = document.querySelectorAll('.lang-option');

    if (!trigger || !menu) return;

    // Trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // Option click
    options.forEach(option => {
      option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        if (lang && lang !== currentLang) {
          switchLanguage(lang);
        }
        closeDropdown();
      });
    });

    // Keyboard navigation
    trigger.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isDropdownOpen) {
            openDropdown();
            // Focus first option
            setTimeout(() => {
              const firstOption = menu.querySelector('.lang-option');
              firstOption?.focus();
            }, 0);
          }
          break;
      }
    });

    menu.addEventListener('keydown', (e) => {
      const focused = document.activeElement;
      const allOptions = Array.from(options);
      const index = allOptions.indexOf(focused);

      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (index + 1) % allOptions.length;
          allOptions[nextIndex].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (index - 1 + allOptions.length) % allOptions.length;
          allOptions[prevIndex].focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          focused.click();
          break;
        case 'Escape':
          e.preventDefault();
          closeDropdown();
          trigger.focus();
          break;
        case 'Tab':
          closeDropdown();
          break;
      }
    });

    // Click outside
    document.addEventListener('click', (e) => {
      if (isDropdownOpen && !e.target.closest('.lang-dropdown')) {
        closeDropdown();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        closeDropdown();
        trigger.focus();
      }
    });
  }

  /* ===== DROPDOWN STATE ===== */
  function toggleDropdown() {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    const dropdown = document.querySelector('.lang-dropdown');
    const menu = document.querySelector('.lang-menu');
    if (!dropdown || !menu) return;

    isDropdownOpen = true;
    dropdown.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    
    // Focus current active option
    const activeOption = menu.querySelector('.lang-option.active');
    if (activeOption) {
      setTimeout(() => activeOption.focus(), 0);
    }

    // On mobile, convert to bottom sheet
    if (window.innerWidth <= 768) {
      menu.classList.add('lang-menu--mobile');
    }
  }

  function closeDropdown() {
    const dropdown = document.querySelector('.lang-dropdown');
    const menu = document.querySelector('.lang-menu');
    if (!dropdown || !menu) return;

    isDropdownOpen = false;
    dropdown.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    menu.classList.remove('lang-menu--mobile');
  }

  /* ===== LANGUAGE SWITCHING ===== */
  function switchLanguage(lang) {
    if (!LANGUAGES.some(l => l.code === lang)) return;
    
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update meta tags
    updateMetaTags(lang);
    
    // Update all i18n elements
    if (window.matchicI18n) {
      window.matchicI18n.setLanguage(lang);
    }
    
    // Re-render selector to update active state
    renderLanguageSelector();
    
    // Announce to screen readers
    announceLanguageChange(lang);
  }

  function updateMetaTags(lang) {
    const langData = LANGUAGES.find(l => l.code === lang);
    if (!langData) return;
    
    // Update og:locale if needed
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.content = langData.code === 'en' ? 'en_US' : 
                          langData.code === 'vi' ? 'vi_VN' :
                          langData.code === 'ja' ? 'ja_JP' : 'ko_KR';
    }
  }

  function announceLanguageChange(lang) {
    const langData = LANGUAGES.find(l => l.code === lang);
    if (!langData) return;
    
    // Create live region for announcement
    let liveRegion = document.getElementById('lang-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'lang-live-region';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = `Language changed to ${langData.name}`;
  }

  /* ===== INIT ===== */
  function init() {
    currentLang = detectLanguage();
    document.documentElement.lang = currentLang;
    
    renderLanguageSelector();
    
    // If i18n engine loaded, set initial language
    if (window.matchicI18n) {
      window.matchicI18n.setLanguage(currentLang);
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.matchicLang = {
    switch: switchLanguage,
    getCurrent: () => currentLang,
    getSupported: () => LANGUAGES.map(l => l.code),
    getLanguageData: (code) => LANGUAGES.find(l => l.code === code)
  };
})();
