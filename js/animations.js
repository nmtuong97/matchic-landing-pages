/**
 * Matchic - Scroll animations with Intersection Observer + GSAP
 * - Scroll-triggered reveal animations (css class fallback + GSAP enhanced)
 * - Animated number counters
 * - Smooth scroll for anchor links
 * - Waitlist form handler
 */

document.addEventListener('DOMContentLoaded', () => {
  // ========================================================
  // 1. SCROLL REVEAL (Intersection Observer baseline)
  // ========================================================
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ========================================================
  // 2. GSAP SCROLL ANIMATIONS (enhanced)
  // ========================================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate bento cards on scroll
    gsap.utils.toArray('.bento-card').forEach((card, i) => {
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

    // Animate tech cards
    gsap.utils.toArray('.tech-card').forEach((card, i) => {
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

    // Animate impact cards
    gsap.utils.toArray('.impact-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power2.out'
      });
    });

    // Animate testimonial cards
    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.15,
        ease: 'power2.out'
      });
    });

    // Animate hero visual
    gsap.from('.hero-visual-col', {
      scrollTrigger: {
        trigger: '.hero-visual-col',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  } else {
    // GSAP not loaded — use CSS animation fallback
    document.querySelectorAll('.bento-card, .tech-card, .impact-card, .testimonial-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.6s ease';
    });
    
    // Add a MutationObserver as fallback
    const fallbackObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          fallbackObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.bento-card, .tech-card, .impact-card, .testimonial-card').forEach(el => {
      fallbackObserver.observe(el);
    });
  }

  // ========================================================
  // 3. ANIMATED COUNTERS
  // ========================================================
  const counters = document.querySelectorAll('.counter-number');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target) || 0;
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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

  // ========================================================
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Close mobile menu if open
        document.querySelector('.nav-links')?.classList.remove('open');
      }
    });
  });

  // ========================================================
  // 5. WAITLIST FORM HANDLER
  // ========================================================
  window.handleWaitlist = function(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button');
    
    // Visual feedback
    button.textContent = '✓ You\'re on the list!';
    button.style.background = '#4CAF50';
    button.disabled = true;
    
    // Reset after 3 seconds
    setTimeout(() => {
      button.textContent = 'Notify Me ✨';
      button.style.background = '';
      button.disabled = false;
      form.querySelector('input[type="email"]').value = '';
    }, 3000);
    
    // In production: send to backend
    console.log('Waitlist signup:', email);
    
    return false;
  };
});
