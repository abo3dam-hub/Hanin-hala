/* Hanin & Hala — interactions */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------- language */
  var i18nEls = [].slice.call(document.querySelectorAll('[data-ar]'));
  i18nEls.forEach(function (el) { el.setAttribute('data-en', el.innerHTML); });
  [].slice.call(document.querySelectorAll('[data-ar-placeholder]')).forEach(function (el) {
    el.setAttribute('data-en-placeholder', el.getAttribute('placeholder') || '');
  });

  function applyLang(lang) {
    var ar = lang === 'ar';
    doc.lang = lang;
    doc.dir = ar ? 'rtl' : 'ltr';

    i18nEls.forEach(function (el) {
      var v = el.getAttribute(ar ? 'data-ar' : 'data-en');
      if (v !== null) el.innerHTML = v;
    });
    [].slice.call(document.querySelectorAll('[data-ar-placeholder]')).forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute(ar ? 'data-ar-placeholder' : 'data-en-placeholder') || '');
    });

    var btn = document.getElementById('lang');
    if (btn) btn.querySelector('.lang__on').textContent = ar ? 'English' : 'العربية';
    try { localStorage.setItem('hh-lang', lang); } catch (e) {}

    if (lb && lb.open) caption();
  }

  var saved = 'ar';
  try { saved = localStorage.getItem('hh-lang') || 'ar'; } catch (e) {}
  var prefersAr = (navigator.language || '').toLowerCase().indexOf('ar') === 0;
  if (!saved) saved = prefersAr ? 'ar' : 'en';
  if (saved === 'ar') applyLang('ar');

  var langBtn = document.getElementById('lang');
  if (langBtn) langBtn.addEventListener('click', function () {
    applyLang(doc.lang === 'ar' ? 'en' : 'ar');
  });

  /* ---------------------------------------------------- header state */
  var head = document.querySelector('.head');
  var onScroll = function () {
    if (head) head.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------------- mobile nav */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function setNav(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () {
    setNav(burger.getAttribute('aria-expanded') !== 'true');
  });
  if (nav) nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) setNav(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) setNav(false);
  });

  /* ---------------------------------------------------- reveal */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  revealEls.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d + 'ms');
  });

  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------- gallery filter */
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var tiles = [].slice.call(document.querySelectorAll('.tile'));

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
      var f = chip.getAttribute('data-filter');
      tiles.forEach(function (t) {
        var show = f === 'all' || t.getAttribute('data-cat') === f;
        t.classList.toggle('is-hidden', !show);
        if (show && !reduce) {
          t.classList.remove('is-in');
          void t.offsetWidth;
          t.classList.add('is-in');
        }
      });
    });
  });

  /* ---------------------------------------------------- lightbox */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbClose = document.getElementById('lbClose');
  var list = [];
  var at = 0;

  function visibleTiles() {
    return tiles.filter(function (t) { return !t.classList.contains('is-hidden'); });
  }
  function caption() {
    var t = list[at];
    if (!t || !lbCap) return;
    lbCap.textContent = (doc.lang === 'ar' ? t.getAttribute('data-cap-ar') : t.getAttribute('data-cap-en')) || '';
    lbCap.setAttribute('lang', doc.lang === 'ar' ? 'ar' : 'en');
  }
  function show(i) {
    if (!list.length) return;
    at = (i + list.length) % list.length;
    var t = list[at];
    var img = t.querySelector('img');
    if (lbImg) {
      lbImg.src = img.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt || '';
      lbImg.width = 1100; lbImg.height = 0;
    }
    caption();
  }
  function openLb(tile) {
    list = visibleTiles();
    at = Math.max(0, list.indexOf(tile));
    show(at);
    if (lb && lb.showModal) lb.showModal();
  }

  tiles.forEach(function (t) {
    t.addEventListener('click', function () { openLb(t); });
  });
  if (lbPrev) lbPrev.addEventListener('click', function () { show(at - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { show(at + 1); });
  if (lbClose) lbClose.addEventListener('click', function () { lb.close(); });
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb) lb.close();
    });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(doc.dir === 'rtl' ? at - 1 : at + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(doc.dir === 'rtl' ? at + 1 : at - 1); }
    });
  }

  /* ---------------------------------------------------- booking → WhatsApp */
  var form = document.getElementById('booking');
  var err = document.getElementById('formErr');

  function fmtDay(v) {
    if (!v) return '';
    try {
      var d = new Date(v + 'T12:00:00');
      return d.toLocaleDateString(doc.lang === 'ar' ? 'ar-SY' : 'en-GB', {
        weekday: 'short', day: 'numeric', month: 'short'
      });
    } catch (e) { return v; }
  }

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim();
    var service = form.elements.service.value;
    var day = form.elements.day.value;
    var time = form.elements.time.value;
    var note = form.elements.note.value.trim();
    var ar = doc.lang === 'ar';

    if (!name) {
      if (err) { err.hidden = false; err.textContent = ar ? 'من فضلك اكتبي اسمك.' : 'Please add your name.'; }
      form.elements.name.focus();
      return;
    }
    if (err) err.hidden = true;

    var lines = ar
      ? ['مرحباً حنين وحلا،', 'أرغب بحجز موعد.', '', 'الاسم: ' + name, 'الخدمة: ' + service]
      : ['Hello Hanin & Hala,', 'I’d like to book an appointment.', '', 'Name: ' + name, 'Service: ' + service];
    if (day) lines.push((ar ? 'اليوم المفضّل: ' : 'Preferred day: ') + fmtDay(day));
    if (time) lines.push((ar ? 'الوقت المفضّل: ' : 'Preferred time: ') + time);
    if (note) lines.push('', (ar ? 'ملاحظة: ' : 'Note: ') + note);

    var url = 'https://wa.me/963936628680?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  });

  /* ---------------------------------------------------- year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
