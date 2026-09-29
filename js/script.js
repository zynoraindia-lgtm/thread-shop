/* ==========================================================================
   Sri Masani Amman Textiles — Shared Script
   Mobile nav · sticky header state · active link · scroll reveal ·
   back-to-top · FAQ accordion · footer year ·
   enquiry form validation + WhatsApp handoff (contact.html)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  var navbar = document.querySelector('.navbar');

  /* ---------------- Mobile nav toggle ---------------- */
  var navToggle = document.querySelector('.nav-toggle');
  if (navToggle && navbar) {
    navToggle.addEventListener('click', function () {
      var isOpen = navbar.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        navbar.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        navbar.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navbar.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- Sticky header shadow ---------------- */
  var backToTop = document.querySelector('.back-to-top');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (navbar) navbar.classList.toggle('scrolled', y > 12);
    if (backToTop) backToTop.classList.toggle('show', y > 420);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Active nav link ---------------- */
  var currentPage = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[data-page]').forEach(function (link) {
    if (link.getAttribute('data-page') === currentPage) link.classList.add('active');
  });

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ---------------- Count-up numbers ---------------- */
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    if (el.dataset.counted) return;
    var m = (el.textContent || '').trim().match(/^(\D*?)(\d+)(\D*)$/);
    if (!m) return;
    var prefix = m[1], target = parseInt(m[2], 10), suffix = m[3];
    if (target < 10) return;                 // "2s" and "No.1" read better static
    el.dataset.counted = '1';

    /* start partway up so the figure is never shown as zero */
    var from = Math.round(target * 0.45);
    var duration = 1100, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(from + (target - from) * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.hero-stats strong, .stat-band strong');
  if (reduceMotion) {
    /* leave the final values in place */
  } else if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------------- Parallax drift on the hero image ---------------- */
  var heroFrame = document.querySelector('.hero-media .frame img');
  if (heroFrame && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        if (y < 900) heroFrame.style.transform = 'scale(1.06) translateY(' + (y * -0.045) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* =========================================================
     Contact page: enquiry form validation + WhatsApp handoff
     ========================================================= */
  var form = document.getElementById('enquiry-form');
  if (!form) return;

  var WHATSAPP_NUMBER = '919750725002'; // country code + number, no +
  var successBox = document.getElementById('form-success');

  var fields = {
    name: form.querySelector('#field-name'),
    mobile: form.querySelector('#field-mobile'),
    address: form.querySelector('#field-address'),
    threadType: form.querySelector('#field-thread-type'),
    shade: form.querySelector('#field-shade'),
    message: form.querySelector('#field-message')
  };

  function setError(field, message) {
    var row = field.closest('.form-row');
    if (!row) return;
    var errorEl = row.querySelector('.error-msg');
    if (message) {
      row.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    } else {
      row.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validate() {
    var valid = true;

    if (!fields.name.value.trim()) {
      setError(fields.name, 'Please enter your name.'); valid = false;
    } else { setError(fields.name, ''); }

    var mobileVal = fields.mobile.value.trim().replace(/\s+/g, '');
    if (!mobileVal) {
      setError(fields.mobile, 'Please enter your mobile number.'); valid = false;
    } else if (!/^[6-9]\d{9}$/.test(mobileVal)) {
      setError(fields.mobile, 'Enter a valid 10-digit mobile number.'); valid = false;
    } else { setError(fields.mobile, ''); }

    if (!fields.address.value.trim()) {
      setError(fields.address, 'Please enter your delivery address.'); valid = false;
    } else { setError(fields.address, ''); }

    if (!fields.threadType.value) {
      setError(fields.threadType, 'Please select the thread / yarn type you need.'); valid = false;
    } else { setError(fields.threadType, ''); }

    return valid;
  }

  function buildWhatsAppMessage() {
    var lines = [
      'New Enquiry — Sri Masani Amman Textiles',
      'Name: ' + fields.name.value.trim(),
      'Mobile: ' + fields.mobile.value.trim(),
      'Address: ' + fields.address.value.trim(),
      'Thread / Yarn type: ' + fields.threadType.value
    ];
    if (fields.shade && fields.shade.value) lines.push('Preferred shade: ' + fields.shade.value);
    if (fields.message.value.trim()) lines.push('Details: ' + fields.message.value.trim());
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    var enquirerName = fields.name.value.trim();
    var enquirerMobile = fields.mobile.value.trim();
    var waHref = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildWhatsAppMessage());

    successBox.classList.add('show');
    successBox.querySelector('.success-text').textContent =
      'Thank you, ' + enquirerName + '! Your enquiry has been recorded. ' +
      'Our team will contact you shortly on ' + enquirerMobile +
      '. You can also send it to us instantly on WhatsApp below.';

    var waBtn = document.getElementById('whatsapp-send');
    if (waBtn) {
      waBtn.href = waHref;
      waBtn.style.display = 'inline-flex';
    }

    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.reset();
  });

  /* Live-clear errors as the user types/selects */
  Object.keys(fields).forEach(function (key) {
    var el = fields[key];
    if (!el) return;
    var evt = (el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evt, function () {
      var row = el.closest('.form-row');
      if (row && row.classList.contains('has-error')) setError(el, '');
    });
  });
});
