/**
 * Matchic — Animation System v2
 * Liquid Glass Motion (from Flutter)
 *
 * Features:
 * - Page load orchestration (hero entrance sequence)
 * - Scroll reveal with IntersectionObserver
 * - GSAP + ScrollTrigger (enhanced)
 * - Micro-interactions (ripple, hover, focus)
 * - Parallax depth layers
 * - Stagger animations
 * - Counter animation
 * - Keyboard navigation
 * - prefers-reduced-motion support
 * - Performance optimized
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Initialize all animations
   */
  function init() {
    // Handle reduced motion
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-scale-up').forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }

    // Page load animations
    initPageLoad();

    // Scroll reveal
    initScrollReveal();

    // GSAP enhancements (if available)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      initGSAPEnhancements();
    }

    // Micro-interactions
    initMicroInteractions();

    // Parallax
    initParallax();

    // Counters
    initCounters();

    // FAQ
    initFAQAccordion();

    // Waitlist form
    initWaitlistForm();
  }

  /* ============================================================
     PAGE LOAD — Hero Entrance Sequence
     ============================================================ */

  function initPageLoad() {
    // Add page-loaded class after a short delay
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  }

  /* ============================================================
     SCROLL REVEAL — IntersectionObserver
     ============================================================ */

  function initScrollReveal() {
    const revealSelectors = [
      '.reveal',
      '.reveal-up',
      '.reveal-down',
      '.reveal-left',
      '.reveal-right',
      '.reveal-scale',
      '.reveal-scale-up',
      '.stagger-children'
    ];

    const revealElements = document.querySelectorAll(revealSelectors.join(', '));

    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add revealed class
          entry.target.classList.add('revealed');

          // Handle stagger-children
          if (entry.target.classList.contains('stagger-children')) {
            const children = entry.target.children;
            Array.from(children).forEach((child, i) => {
              setTimeout(() => {
                child.classList.add('revealed');
              }, i * 80);
            });
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  /* ============================================================
     GSAP ENHANCEMENTS
     ============================================================ */

  function initGSAPEnhancements() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance timeline
    const heroTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay: 0.3
    });

    heroTl
      .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6, filter: 'blur(8px)' })
      .from('h1', { y: 30, opacity: 0, duration: 0.8, filter: 'blur(8px)' }, '-=0.3')
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-actions', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.hero-trust', { y: 15, opacity: 0, duration: 0.4 }, '-=0.2')
      .from('.hero-visual-wrapper', { y: 60, opacity: 0, scale: 0.95, duration: 1 }, '-=0.6');

    // Scroll-triggered sections
    gsap.utils.toArray('.feature-card, .step-card, .bento-card, .impact-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Stats counter
    gsap.utils.toArray('.stat-card').forEach(card => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      });
    });

    // Parallax layers
    gsap.utils.toArray('.parallax-layer').forEach(layer => {
      const speed = parseFloat(getComputedStyle(layer).getPropertyValue('--parallax-speed')) || 0.5;

      gsap.to(layer, {
        scrollTrigger: {
          trigger: layer.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: () => window.innerHeight * speed * 0.3,
        ease: 'none'
      });
    });

    // Fade in images
    gsap.utils.toArray('img').forEach(img => {
      if (img.complete) {
        gsap.from(img, {
          scrollTrigger: {
            trigger: img,
            start: 'top 90%'
          },
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out'
        });
      } else {
        img.addEventListener('load', () => {
          gsap.from(img, {
            scrollTrigger: {
              trigger: img,
              start: 'top 90%'
            },
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out'
          });
        });
      }
    });
  }

  /* ============================================================
     MICRO-INTERACTIONS
     ============================================================ */

  function initMicroInteractions() {
    // Ripple effect on buttons
    document.querySelectorAll('.btn, .chip, .feature-card').forEach(el => {
      el.addEventListener('click', createRipple);
    });

    // Magnetic hover effect
    document.querySelectorAll('.magnetic-hover').forEach(el => {
      el.addEventListener('mousemove', handleMagneticHover);
      el.addEventListener('mouseleave', resetMagneticHover);
    });

    // Focus ring enhancement
    document.querySelectorAll('button, a, input, textarea, select').forEach(el => {
      el.classList.add('focus-ring');
    });
  }

  function createRipple(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    `;

    button.style.overflow = 'hidden';
    button.style.position = 'relative';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  function handleMagneticHover(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.02)`;
  }

  function resetMagneticHover(e) {
    e.currentTarget.style.transform = '';
  }

  /* ============================================================
     PARALLAX
     ============================================================ */

  function initParallax() {
    if (prefersReducedMotion) return;

    const parallaxElements = document.querySelectorAll('.parallax-layer');
    if (!parallaxElements.length) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;

      parallaxElements.forEach(el => {
        const speed = parseFloat(getComputedStyle(el).getPropertyValue('--parallax-speed')) || 0.5;
        const y = scrollY * speed * 0.3;
        el.style.transform = `translateY(${y}px)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     COUNTERS
     ============================================================ */

  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target) || 0;
    const suffix = el.nextElementSibling?.textContent || '';
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */

  function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        faqItems.forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = '0';
        });

        // Open clicked
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });

      // Keyboard support
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }

  /* ============================================================
     WAITLIST FORM
     ============================================================ */

  function initWaitlistForm() {
    const form = document.querySelector('.waitlist-form');
    if (!form) return;

    form.addEventListener('submit', handleWaitlistSubmit);
  }

  function handleWaitlistSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const email = input.value.trim();

    // Reset states
    form.classList.remove('error', 'success');
    input.classList.remove('error');

    // Validate
    if (!email || !email.includes('@')) {
      showFormError(form, input, 'Please enter a valid email address.');
      return;
    }

    // Loading state
    button.disabled = true;
    button.innerHTML = '<span class="spin">⟳</span> Joining...';

    // Simulate API call
    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = '✓ Joined!';
      button.classList.add('btn-success');
      form.classList.add('success');
      input.value = '';

      // Reset after 3 seconds
      setTimeout(() => {
        button.innerHTML = 'Join the Waitlist';
        button.classList.remove('btn-success');
        form.classList.remove('success');
      }, 3000);
    }, 1500);
  }

  function showFormError(form, input, message) {
    input.classList.add('error');
    form.classList.add('error');

    // Shake animation
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 500);

    // Show error message
    let errorEl = form.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form-error';
      form.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.style.color = 'var(--color-error)';
    errorEl.style.fontSize = 'var(--text-sm)';
    errorEl.style.marginTop = 'var(--space-2)';
  }

  /* ============================================================
     KEYBOARD NAVIGATION
     ============================================================ */

  document.addEventListener('keydown', (e) => {
    // Escape to close modals/dropdowns
    if (e.key === 'Escape') {
      document.querySelectorAll('.dialog-overlay.active, .lang-menu:not([hidden])').forEach(el => {
        el.classList.remove('active');
        if (el.hasAttribute('hidden')) el.setAttribute('hidden', '');
      });
    }
  });

  /* ============================================================
     INITIALIZE
     ============================================================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
