/* Copperline Builders — template behaviour.
   Written from scratch for this template. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* =====================================================
     1. BEFORE / AFTER DRAG SLIDERS — the spine
     Pointer drag (mouse + touch), keyboard on the handle.
     No jump on grab: dragging the handle keeps the grab
     offset; pressing elsewhere on the frame moves there.
     ===================================================== */
  function initBA(root) {
    var frame = root.querySelector('[data-ba-frame]');
    var handle = root.querySelector('.ba__handle');
    if (!frame || !handle) return;

    var pos = 50;          // percent of "before" shown
    var grabOffset = 0;    // px between pointer and divider at grab
    var rect = null;

    function render() {
      frame.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
      handle.setAttribute('aria-valuetext',
        Math.round(pos) + '% of the before photograph shown');
    }

    function setFromClientX(clientX) {
      if (!rect) rect = frame.getBoundingClientRect();
      var x = clientX - grabOffset - rect.left;
      pos = Math.min(100, Math.max(0, (x / rect.width) * 100));
      render();
    }

    frame.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      rect = frame.getBoundingClientRect();
      var dividerX = rect.left + rect.width * (pos / 100);
      // Grabbing the handle itself: preserve the offset so it never jumps.
      grabOffset = (e.target === handle || handle.contains(e.target))
        ? e.clientX - dividerX
        : 0;
      frame.classList.add('is-dragging');
      frame.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
      e.preventDefault();
    });

    frame.addEventListener('pointermove', function (e) {
      if (!frame.classList.contains('is-dragging')) return;
      setFromClientX(e.clientX);
    });

    function release(e) {
      if (!frame.classList.contains('is-dragging')) return;
      frame.classList.remove('is-dragging');
      if (e.pointerId !== undefined && frame.hasPointerCapture(e.pointerId)) {
        frame.releasePointerCapture(e.pointerId);
      }
      rect = null;
      handle.focus({ preventScroll: true });
    }
    frame.addEventListener('pointerup', release);
    frame.addEventListener('pointercancel', release);

    handle.addEventListener('keydown', function (e) {
      var step = null;
      switch (e.key) {
        case 'ArrowLeft': case 'ArrowDown': step = -2; break;
        case 'ArrowRight': case 'ArrowUp': step = 2; break;
        case 'PageDown': step = -10; break;
        case 'PageUp': step = 10; break;
        case 'Home': pos = 0; render(); e.preventDefault(); return;
        case 'End': pos = 100; render(); e.preventDefault(); return;
        default: return;
      }
      pos = Math.min(100, Math.max(0, pos + step));
      render();
      e.preventDefault();
    });

    render();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ba]'), initBA);

  /* =====================================================
     2. SCROLL REVEALS — IntersectionObserver, unobserved
     after firing. Reduced motion: CSS already shows all.
     ===================================================== */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) {
      el.classList.add('is-in');
    });
  }

  /* =====================================================
     3. COUNT-UPS — figures roll up when first seen.
     ===================================================== */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion.matches) {
      el.textContent = target.toLocaleString('en-US');
      return;
    }
    var dur = 900;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
  } else {
    Array.prototype.forEach.call(counters, function (el) {
      el.textContent =
        (parseInt(el.getAttribute('data-count'), 10) || 0).toLocaleString('en-US');
    });
  }

  /* =====================================================
     4. STICKY QUOTE BAR — appears once the hero is passed,
     stands down while the quote form itself is on screen.
     ===================================================== */
  var quotebar = document.querySelector('[data-quotebar]');
  var hero = document.querySelector('.hero');
  var quoteSection = document.getElementById('quote');
  if (quotebar && hero && 'IntersectionObserver' in window) {
    var pastHero = false;
    var formVisible = false;
    function updateBar() {
      quotebar.classList.toggle('is-shown', pastHero && !formVisible);
    }
    new IntersectionObserver(function (entries) {
      pastHero = !entries[0].isIntersecting;
      updateBar();
    }, { threshold: 0 }).observe(hero);
    if (quoteSection) {
      new IntersectionObserver(function (entries) {
        formVisible = entries[0].isIntersecting;
        updateBar();
      }, { threshold: 0.2 }).observe(quoteSection);
    }
  } else if (quotebar) {
    quotebar.classList.add('is-shown');
  }

  /* =====================================================
     5. CONTACT FORM — demo branch. Remove this block and
     the form posts to php/contact.php on a PHP host.
     ===================================================== */
  var form = document.querySelector('.quote__form');
  if (form) {
    var status = form.querySelector('.quote__status');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // DEMO: remove this listener when hosting with PHP.
      var name = form.querySelector('#f-name');
      var email = form.querySelector('#f-email');
      var message = form.querySelector('#f-message');
      var ok = true;
      [name, email, message].forEach(function (field) {
        if (!field.value.trim()) { ok = false; }
      });
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) ok = false;
      if (!ok) {
        status.textContent = 'Please complete name, a valid email, and the job description.';
        return;
      }
      status.textContent =
        'DEMO MODE: details noted. On a live server this posts to php/contact.php and we ring within one working day.';
      form.reset();
    });
  }
})();
