(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function debounce(fn, delay) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  function throttle(fn, limit) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function throttleRAF(fn) {
    var ticking = false;
    return function () {
      var ctx = this, args = arguments;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          fn.apply(ctx, args);
          ticking = false;
        });
      }
    };
  }

  /* ========== Scroll Reveal ========== */

  var STAGGER_BASE = 100;

  function initScrollReveal() {
    var elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    if (reducedMotion) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var staggerDelay = 0;

          for (var i = 1; i <= 6; i++) {
            if (el.classList.contains('stagger-' + i)) {
              staggerDelay = i * STAGGER_BASE;
              break;
            }
          }

          if (staggerDelay) {
            setTimeout(function () { el.classList.add('is-visible'); }, staggerDelay);
          } else {
            el.classList.add('is-visible');
          }

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ========== Sticky Header ========== */

  function initStickyHeader() {
    var header = document.querySelector('.header');
    if (!header) return;

    var lastScroll = 0;
    var scrollThreshold = 50;
    var ticking = false;

    function updateHeader() {
      var current = window.pageYOffset;

      if (current > scrollThreshold) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
        header.classList.remove('header--hidden');
        lastScroll = current;
        return;
      }

      var delta = current - lastScroll;

      if (delta > 5) {
        header.classList.add('header--hidden');
      } else if (delta < -5) {
        header.classList.remove('header--hidden');
      }

      lastScroll = current;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          updateHeader();
          ticking = false;
        });
      }
    }, { passive: true });
  }

  /* ========== Mobile Menu ========== */

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;

    var focusableSelector = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    var isOpen = false;

    function open() {
      isOpen = true;
      menu.classList.add('mobile-menu--open');
      toggle.classList.add('menu-toggle--active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      trapFocus();
    }

    function close() {
      isOpen = false;
      menu.classList.remove('mobile-menu--open');
      toggle.classList.remove('menu-toggle--active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }

    function trapFocus() {
      var focusable = menu.querySelectorAll(focusableSelector);
      if (!focusable.length) return;
      focusable[0].focus();

      menu.addEventListener('keydown', function handler(e) {
        if (!isOpen) { menu.removeEventListener('keydown', handler); return; }
        if (e.key !== 'Tab') return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }

    toggle.addEventListener('click', function () {
      isOpen ? close() : open();
    });

    var overlay = document.querySelector('.mobile-menu-overlay');
    if (overlay) {
      overlay.addEventListener('click', close);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  /* ========== Announcement Bar ========== */

  function initAnnouncementBar() {
    var bar = document.querySelector('.announcement-bar');
    if (!bar) return;

    if (sessionStorage.getItem('announcement-dismissed')) {
      bar.style.display = 'none';
      return;
    }

    var dismiss = bar.querySelector('.announcement-bar__close');
    if (!dismiss) return;

    dismiss.addEventListener('click', function () {
      bar.style.transition = 'max-height 0.4s ease, opacity 0.3s ease, margin 0.4s ease';
      bar.style.maxHeight = bar.offsetHeight + 'px';
      bar.offsetHeight; // force reflow
      bar.style.maxHeight = '0';
      bar.style.opacity = '0';
      bar.style.marginBottom = '0';
      bar.style.overflow = 'hidden';

      setTimeout(function () {
        bar.style.display = 'none';
        sessionStorage.setItem('announcement-dismissed', '1');
      }, 400);
    });
  }

  /* ========== FAQ Accordion ========== */

  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    function toggle(item) {
      var isActive = item.classList.contains('faq-item--active');
      var answer = item.querySelector('.faq-answer');
      if (!answer) return;

      items.forEach(function (other) {
        if (other !== item && other.classList.contains('faq-item--active')) {
          other.classList.remove('faq-item--active');
          var otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      if (isActive) {
        item.classList.remove('faq-item--active');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('faq-item--active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    }

    items.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      if (!question) return;

      question.setAttribute('tabindex', '0');
      question.setAttribute('role', 'button');
      question.setAttribute('aria-expanded', 'false');

      question.addEventListener('click', function () {
        toggle(item);
        question.setAttribute('aria-expanded', item.classList.contains('faq-item--active'));
      });

      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(item);
          question.setAttribute('aria-expanded', item.classList.contains('faq-item--active'));
        }
      });
    });
  }

  /* ========== Smooth Scroll ========== */

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;

        var target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        var header = document.querySelector('.header');
        var offset = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
        history.pushState(null, '', id);
      });
    });
  }

  /* ========== Product Page ========== */

  function initProductPage() {
    initVariantSelector();
    initQuantityControls();
    initImageGallery();
  }

  function initVariantSelector() {
    var selects = document.querySelectorAll('.product-variant-select');
    selects.forEach(function (select) {
      select.addEventListener('change', function () {
        var option = this.options[this.selectedIndex];
        var price = option.dataset.price;
        var available = option.dataset.available !== 'false';

        var priceEl = document.querySelector('.product-price');
        var btn = document.querySelector('.add-to-cart');

        if (priceEl && price) priceEl.textContent = price;
        if (btn) {
          btn.disabled = !available;
          btn.textContent = available ? 'Add to Cart' : 'Sold Out';
        }
      });
    });
  }

  function initQuantityControls() {
    document.querySelectorAll('.quantity-input').forEach(function (wrapper) {
      var input = wrapper.querySelector('input');
      var dec = wrapper.querySelector('.quantity-dec');
      var inc = wrapper.querySelector('.quantity-inc');
      if (!input) return;

      var min = parseInt(input.min) || 1;
      var max = parseInt(input.max) || 999;

      if (dec) dec.addEventListener('click', function () {
        var val = parseInt(input.value) || min;
        input.value = Math.max(min, val - 1);
        input.dispatchEvent(new Event('change'));
      });

      if (inc) inc.addEventListener('click', function () {
        var val = parseInt(input.value) || min;
        input.value = Math.min(max, val + 1);
        input.dispatchEvent(new Event('change'));
      });
    });
  }

  function initImageGallery() {
    var main = document.querySelector('.product-image-main');
    var thumbs = document.querySelectorAll('.product-thumbnail');
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = this.dataset.src || this.src;
        var alt = this.alt || '';

        if (main.src === src) return;

        main.style.opacity = '0';
        setTimeout(function () {
          main.src = src;
          main.alt = alt;
          main.onload = function () { main.style.opacity = '1'; };
        }, 200);

        thumbs.forEach(function (t) { t.classList.remove('product-thumbnail--active'); });
        this.classList.add('product-thumbnail--active');
      });
    });

    main.style.transition = 'opacity 0.2s ease';
  }

  /* ========== Pricing Toggle ========== */

  function initPricingToggle() {
    var toggle = document.querySelector('.pricing-toggle');
    if (!toggle) return;

    toggle.addEventListener('change', function () {
      var isAnnual = this.checked;
      document.querySelectorAll('[data-price-monthly]').forEach(function (el) {
        var target = isAnnual ? el.dataset.priceAnnual : el.dataset.priceMonthly;
        if (!target) return;
        animateValue(el, parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0, parseInt(target), 400);
      });
    });
  }

  function animateValue(el, start, end, duration) {
    if (reducedMotion) { el.textContent = '$' + end; return; }

    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = '$' + Math.floor(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ========== Counter Animation ========== */

  function initCounters() {
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    if (reducedMotion) {
      counters.forEach(function (el) {
        el.textContent = el.dataset.target || '0';
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  function runCounter(el) {
    var target = parseInt(el.dataset.target) || 0;
    var duration = parseInt(el.dataset.duration) || 2000;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ========== Newsletter Form ========== */

  function initNewsletterForm() {
    var forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var email = form.querySelector('input[type="email"]');
        var btn = form.querySelector('button[type="submit"]');
        var msg = form.querySelector('.newsletter-message');
        if (!email || !email.value) return;

        if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

        var body = new FormData();
        body.append('form_type', 'customer');
        body.append('utf8', '\u2713');
        body.append('customer[email]', email.value);
        body.append('customer[tags]', 'newsletter');

        fetch('/contact#contact_form', {
          method: 'POST',
          body: body,
          headers: { 'Accept': 'application/json' }
        }).then(function (res) {
          if (msg) {
            msg.textContent = res.ok ? 'Thanks for subscribing!' : 'Something went wrong. Try again.';
            msg.className = 'newsletter-message ' + (res.ok ? 'newsletter-message--success' : 'newsletter-message--error');
          }
          if (res.ok) email.value = '';
        }).catch(function () {
          if (msg) {
            msg.textContent = 'Network error. Please try again.';
            msg.className = 'newsletter-message newsletter-message--error';
          }
        }).finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
        });
      });
    });
  }

  /* ========== Lazy Loading ========== */

  function initLazyLoad() {
    var elements = document.querySelectorAll('[data-bg]');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
          el.removeAttribute('data-bg');
          observer.unobserve(el);
        }
      });
    }, { rootMargin: '200px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ========== Cursor Glow ========== */

  function initCursorGlow() {
    if (reducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var hero = document.querySelector('.hero');
    if (!hero) return;

    var glow = document.createElement('div');
    glow.className = 'hero__glow';
    glow.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity 0.3s;';
    hero.style.position = hero.style.position || 'relative';
    hero.style.overflow = 'hidden';
    hero.appendChild(glow);

    var update = throttleRAF(function (e) {
      var rect = hero.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      glow.style.background = 'radial-gradient(600px circle at ' + x + 'px ' + y + 'px, rgba(99,102,241,0.08), transparent 60%)';
    });

    hero.addEventListener('mouseenter', function () { glow.style.opacity = '1'; });
    hero.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
    hero.addEventListener('mousemove', update, { passive: true });
  }

  /* ========== Testimonials Carousel ========== */

  function initTestimonials() {
    var container = document.querySelector('.testimonials-carousel');
    if (!container) return;

    var slides = container.querySelectorAll('.testimonial-slide');
    var dots = container.querySelector('.testimonial-dots');
    if (slides.length < 2) return;

    var current = 0;
    var interval = null;
    var delay = 5000;
    var touchStartX = 0;
    var touchEndX = 0;

    if (dots) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === 0 ? ' testimonial-dot--active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', function () {
          stopAuto();
          goTo(i);
          startAuto();
        });
        dots.appendChild(dot);
      });
    }

    function goTo(index) {
      slides[current].classList.remove('testimonial-slide--active');
      if (dots && dots.children[current]) {
        dots.children[current].classList.remove('testimonial-dot--active');
      }

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('testimonial-slide--active');
      if (dots && dots.children[current]) {
        dots.children[current].classList.add('testimonial-dot--active');
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      stopAuto();
      interval = setInterval(next, delay);
    }

    function stopAuto() {
      if (interval) { clearInterval(interval); interval = null; }
    }

    slides[0].classList.add('testimonial-slide--active');
    startAuto();

    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);

    container.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAuto();
    }, { passive: true });

    container.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      startAuto();
    }, { passive: true });

    container.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { stopAuto(); next(); startAuto(); }
      if (e.key === 'ArrowLeft') { stopAuto(); prev(); startAuto(); }
    });
  }

  /* ========== Copy to Clipboard ========== */

  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.dataset.target
          ? document.querySelector(btn.dataset.target)
          : btn.previousElementSibling;

        if (!target) return;
        var text = target.textContent || target.value || '';

        navigator.clipboard.writeText(text.trim()).then(function () {
          var original = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copy-btn--success');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('copy-btn--success');
          }, 1500);
        });
      });
    });
  }

  /* ========== Back to Top ========== */

  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    var visible = false;

    window.addEventListener('scroll', throttle(function () {
      var shouldShow = window.pageYOffset > 600;
      if (shouldShow !== visible) {
        visible = shouldShow;
        btn.classList.toggle('back-to-top--visible', visible);
      }
    }, 200), { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ========== Resize Handlers ========== */

  function initResizeHandlers() {
    var recalcFAQ = debounce(function () {
      document.querySelectorAll('.faq-item--active .faq-answer').forEach(function (answer) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      });
    }, 150);

    window.addEventListener('resize', recalcFAQ, { passive: true });
  }

  /* ========== Init ========== */

  function init() {
    initScrollReveal();
    initStickyHeader();
    initMobileMenu();
    initAnnouncementBar();
    initFAQ();
    initSmoothScroll();
    initProductPage();
    initPricingToggle();
    initCounters();
    initNewsletterForm();
    initLazyLoad();
    initCursorGlow();
    initTestimonials();
    initCopyButtons();
    initBackToTop();
    initResizeHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
