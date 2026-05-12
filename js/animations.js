/**
 * Matchic — Animation System
 * GSAP + ScrollTrigger + IntersectionObserver fallback
 * Respects prefers-reduced-motion
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Initialize all animations
   */
  function init() {
    if (prefersReducedMotion) {
      // Show all content immediately
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    initScrollReveal();
    initHeroAnimations();
    initMicroInteractions();
    initCounters();
    initFAQAccordion();
  }

  /**
   * Scroll reveal with IntersectionObserver (baseline)
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  /**
   * GSAP animations (enhanced)
   */
  function initHeroAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
      .from('h1', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-actions', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.hero-trust', { y: 15, opacity: 0, duration: 0.4 }, '-=0.2')
      .from('.phone-mockup', { y: 60, opacity: 0, duration: 1 }, '-=0.6');

    // Scroll-triggered sections
    gsap.utils.toArray('.bento-card, .feature-card, .impact-card').forEach((card, i) => {
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

    // AI cards
    gsap.utils.toArray('.ai-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.12,
        ease: 'power2.out'
      });
    });

    // Solution points
    gsap.utils.toArray('.solution-point').forEach((point, i) => {
      gsap.from(point, {
        scrollTrigger: {
          trigger: point,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        x: -30,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.15,
        ease: 'power2.out'
      });
    });
  }

  /**
   * Micro-interactions
   */
  function initMicroInteractions() {
    // Button ripple effect
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        if (prefersReducedMotion) return;

        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-effect 0.6s ease-out;
          pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Card tilt on hover (desktop only)
    if (!window.matchMedia('(pointer: coarse)').matches) {
      document.querySelectorAll('.glass-card, .feature-card, .bento-card').forEach(card => {
        card.addEventListener('mousemove', function (e) {
          if (prefersReducedMotion) return;
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;

          this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        });

        card.addEventListener('mouseleave', function () {
          this.style.transform = '';
        });
      });
    }
  }

  /**
   * Animated counters
   */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.target) || 0;
          animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * FAQ Accordion
   */
  function initFAQAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', function () {
        const item = this.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all others (optional - accordion behavior)
        // document.querySelectorAll('.faq-item.open').forEach(i => {
        //   if (i !== item) i.classList.remove('open');
        // });

        item.classList.toggle('open', !isOpen);
      });
    });
  }

  // Add ripple keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-effect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Waitlist form handler
 */
window.handleWaitlist = function(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const email = input.value.trim();

  // Clear previous states
  form.classList.remove('waitlist-error', 'waitlist-success');
  const existingMsg = form.querySelector('.waitlist-message');
  if (existingMsg) existingMsg.remove();

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showWaitlistMessage(form, 'Please enter a valid email address.', 'error');
    input.focus();
    return false;
  }

  // Loading state
  const originalText = button.textContent;
  button.disabled = true;
  button.innerHTML = '<span class="waitlist-spinner" aria-hidden="true"></span> Sending...';

  // Simulate API call (replace with real endpoint)
  setTimeout(() => {
    // Success
    button.innerHTML = '✓ Saved!';
    button.classList.add('waitlist-btn-success');
    showWaitlistMessage(form, "You're on the list! We'll email you when Matchic is ready.", 'success');
    input.value = '';

    // Reset after 4 seconds
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      button.classList.remove('waitlist-btn-success');
      const msg = form.querySelector('.waitlist-message');
      if (msg) {
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 300);
      }
    }, 4000);
  }, 1500);

  return false;
};

function showWaitlistMessage(form, text, type) {
  const msg = document.createElement('div');
  msg.className = 'waitlist-message waitlist-message--' + type;
  msg.textContent = text;
  msg.setAttribute('role', type === 'error' ? 'alert' : 'status');
  msg.setAttribute('aria-live', 'polite');
  form.appendChild(msg);
  // Trigger reflow for animation
  void msg.offsetWidth;
  msg.classList.add('waitlist-message--visible');
}
