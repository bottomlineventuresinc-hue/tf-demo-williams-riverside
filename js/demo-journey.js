/* Template Factory - Williams Hustle and Bustle Crew live demo journey.
   Client-side simulate only. No real AI, SMS, or backend. */
(function () {
  'use strict';

  var STRIPE_CLAIM = 'https://buy.stripe.com/cNieVdg1peCq9subRr1gs02';
  var STRIPE_HOSTING = 'https://buy.stripe.com/8x2fZhaH52TI0VY7Bb1gs03';
  var LIVE_URL = 'https://bottomlineventuresinc-hue.github.io/tf-demo-williams-riverside/';
  var LS_CHANGES = 'tf_williams_change_log_v1';
  var LS_PURCHASED = 'tf_williams_purchased_v1';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  function loadChanges() {
    try {
      var raw = localStorage.getItem(LS_CHANGES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveChange(entry) {
    var log = loadChanges();
    log.push(entry);
    try { localStorage.setItem(LS_CHANGES, JSON.stringify(log)); } catch (e) {}
  }

  var bar = $('#tf-bar');
  var barSub = $('#tf-bar-sub');
  var spin = $('#tf-spin');
  var spinTitle = $('#tf-spin-title');
  var spinLine = $('#tf-spin-line');
  var changeModal = $('#tf-change-modal');
  var changeForm = $('#tf-change-form');
  var changeMsg = $('#tf-change-msg');
  var changeErr = $('#tf-change-err');
  var journeyModal = $('#tf-journey-modal');
  var outreachModal = $('#tf-outreach-modal');
  var updatedChip = $('#tf-updated-chip');
  var heroH = $('#hero-h');
  var heroLede = $('.hero .lede');
  var serviceFirst = $('.services__list li span');

  var originals = {
    h1: heroH ? heroH.innerHTML : '',
    lede: heroLede ? heroLede.textContent : '',
    service: serviceFirst ? serviceFirst.textContent : ''
  };

  var demoEdits = [
    {
      id: 'lede',
      apply: function () {
        if (heroLede) {
          heroLede.textContent =
            'Plumbing, sprinkler and irrigation repair, and landscaping support. Across Riverside and the Inland Empire. Frederick looks at the job first and puts the price in writing.';
        }
      }
    },
    {
      id: 'h1',
      apply: function () {
        if (heroH) {
          heroH.innerHTML = 'Pipes and sprinklers,<br>priced <em>first.</em>';
        }
      }
    },
    {
      id: 'service',
      apply: function () {
        if (serviceFirst) {
          serviceFirst.textContent = 'Sprinkler and irrigation repair (written price)';
        }
      }
    }
  ];

  var changeCount = loadChanges().length;

  function setBarMode(mode) {
    /* mode: draft | updated */
    if (!barSub) return;
    if (mode === 'updated') {
      barSub.textContent = 'Draft for Frederick at Williams Hustle and Bustle Crew. Claim it, preview the rest of the journey, or request a change.';
    } else {
      barSub.textContent = 'Draft for Frederick at Williams Hustle and Bustle Crew. Claim it, preview the rest of the journey, or request a change.';
    }
  }

  function openModal(modal) {
    if (!modal) return;
    show(modal);
    document.body.style.overflow = 'hidden';
    var focusable = modal.querySelector('button, [href], input, textarea, select');
    if (focusable) setTimeout(function () { focusable.focus(); }, 30);
  }

  function closeModal(modal) {
    if (!modal) return;
    hide(modal);
    if ($all('.tf-modal:not([hidden])').length === 0 && spin && spin.hidden) {
      document.body.style.overflow = '';
    }
  }

  function runSpinner(title, line, ms, onDone) {
    if (spinTitle) spinTitle.textContent = title;
    if (spinLine) spinLine.textContent = line;
    show(spin);
    hide(bar);
    document.body.style.overflow = 'hidden';
    var wait = reduceMotion.matches ? 400 : ms;
    setTimeout(function () {
      hide(spin);
      document.body.style.overflow = '';
      if (onDone) onDone();
    }, wait);
  }

  function flashUpdatedChip() {
    if (!updatedChip) return;
    updatedChip.classList.add('is-on');
    updatedChip.setAttribute('aria-hidden', 'false');
  }

  function applyNextEdit() {
    var edit = demoEdits[changeCount % demoEdits.length];
    edit.apply();
    flashUpdatedChip();
    changeCount += 1;
    return edit.id;
  }

  /* ----- Change request ----- */
  function openChangeModal() {
    if (changeErr) changeErr.classList.remove('is-on');
    if (changeMsg) changeMsg.value = '';
    openModal(changeModal);
  }

  if (changeForm) {
    changeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = (changeMsg && changeMsg.value || '').trim();
      if (!msg) {
        if (changeErr) {
          changeErr.textContent = 'Please tell us what to change.';
          changeErr.classList.add('is-on');
        }
        if (changeMsg) changeMsg.focus();
        return;
      }
      closeModal(changeModal);
      var delay = 2500 + Math.floor(Math.random() * 1500);
      runSpinner(
        'Working on updates to your site…',
        'Updating the draft for Williams Hustle and Bustle Crew. Hang tight.',
        delay,
        function () {
          var editId = applyNextEdit();
          saveChange({
            at: new Date().toISOString(),
            message: msg,
            editId: editId
          });
          setBarMode('updated');
          show(bar);
        }
      );
    });
  }

  /* ----- Journey ----- */
  var journeyState = { hasSite: null, path: null, domainPick: null };

  function showJourneyStep(id) {
    $all('.tf-step', journeyModal).forEach(function (el) {
      el.hidden = el.getAttribute('data-step') !== id;
    });
  }

  function openJourney() {
    journeyState = { hasSite: null, path: null, domainPick: null };
    $all('.tf-path', journeyModal).forEach(function (el) { hide(el); });
    $all('.tf-domain', journeyModal).forEach(function (el) { el.classList.remove('is-picked'); });
    var form = $('#tf-onboard-form');
    if (form) form.reset();
    showJourneyStep('pay');
    openModal(journeyModal);
  }

  function markPurchased() {
    try { localStorage.setItem(LS_PURCHASED, '1'); } catch (e) {}
  }

  function startSimulatePurchase() {
    markPurchased();
    hide(bar);
    openJourney();
  }

  /* Path branching */
  function setHasSite(yes) {
    journeyState.hasSite = yes;
    $all('.tf-path', journeyModal).forEach(hide);
    if (yes) {
      journeyState.path = 'A';
      show($('#tf-path-a'));
    } else {
      show($('#tf-path-no-site'));
    }
  }

  function setDomainKnown(yes) {
    $all('.tf-path', journeyModal).forEach(hide);
    show($('#tf-path-no-site'));
    if (yes) {
      journeyState.path = 'B';
      show($('#tf-path-b'));
    } else {
      journeyState.path = 'C';
      show($('#tf-path-c'));
    }
  }

  function pickDomain(btn) {
    $all('.tf-domain', journeyModal).forEach(function (el) { el.classList.remove('is-picked'); });
    btn.classList.add('is-picked');
    journeyState.domainPick = btn.getAttribute('data-domain');
    var hidden = $('#tf-domain-picked');
    if (hidden) hidden.value = journeyState.domainPick || '';
  }

  function validateOnboard() {
    var email = ($('#tf-bill-email') || {}).value || '';
    var phone = ($('#tf-bill-phone') || {}).value || '';
    var utility = $('#tf-utility');
    var terms = $('#tf-terms');
    var err = $('#tf-onboard-err');
    function fail(t) {
      if (err) { err.textContent = t; err.classList.add('is-on'); }
      return false;
    }
    if (err) err.classList.remove('is-on');
    if (!email.trim() || email.indexOf('@') < 1) return fail('Add a billing email we can reach.');
    if (!phone.trim()) return fail('Add a phone for setup texts.');
    if (!utility || !utility.checked) return fail('Confirm the utility note (pay keeps the site live).');
    if (!terms || !terms.checked) return fail('Please acknowledge the terms to continue.');
    if (journeyState.hasSite === null) return fail('Tell us if you already have a website.');
    if (journeyState.path === 'A') {
      var url = (($('#tf-current-url') || {}).value || '').trim();
      var reg = (($('#tf-registrar-a') || {}).value || '').trim();
      if (!url) return fail('Add your current website URL.');
      if (!reg) return fail('Add your domain registrar (or best guess).');
    }
    if (journeyState.path === 'B') {
      var dom = (($('#tf-domain-b') || {}).value || '').trim();
      var regB = (($('#tf-registrar-b') || {}).value || '').trim();
      if (!dom) return fail('Add the domain you want to use.');
      if (!regB) return fail('Add your registrar.');
    }
    if (journeyState.path === 'C') {
      var i1 = (($('#tf-idea-1') || {}).value || '').trim();
      var i2 = (($('#tf-idea-2') || {}).value || '').trim();
      var i3 = (($('#tf-idea-3') || {}).value || '').trim();
      if (!i1 || !i2 || !i3) return fail('Give us three name ideas so we can shortlist domains.');
      if (!journeyState.domainPick) return fail('Pick one of the shortlisted domains.');
    }
    if (!journeyState.path) return fail('Choose whether you already have a domain.');
    return true;
  }

  function runDeploy() {
    showJourneyStep('deploy');
    var items = $all('#tf-deploy-list li');
    items.forEach(function (li) { li.classList.remove('is-done'); });
    var i = 0;
    function tick() {
      if (i < items.length) {
        items[i].classList.add('is-done');
        i += 1;
        setTimeout(tick, reduceMotion.matches ? 80 : 700);
      } else {
        setTimeout(function () { showJourneyStep('success'); }, reduceMotion.matches ? 200 : 600);
      }
    }
    setTimeout(tick, reduceMotion.matches ? 100 : 500);
  }

  /* ----- Outreach ----- */
  function openOutreach() { openModal(outreachModal); }

  /* ----- Wire UI ----- */
  document.body.classList.add('has-tf-bar');
  setBarMode(changeCount > 0 ? 'updated' : 'draft');
  if (changeCount > 0) {
    /* re-apply last edit cycle position visuals lightly */
    var last = loadChanges()[changeCount - 1];
    if (last && last.editId) {
      demoEdits.forEach(function (ed) {
        if (ed.id === last.editId) ed.apply();
      });
      flashUpdatedChip();
    }
  }
  show(bar);

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tf]');
    if (!t) {
      if (e.target.classList.contains('tf-modal')) {
        /* click backdrop closes change/outreach, not journey mid-flow unless close btn */
        var mid = e.target;
        if (mid === changeModal) closeModal(changeModal);
        if (mid === outreachModal) closeModal(outreachModal);
      }
      return;
    }
    var act = t.getAttribute('data-tf');
    if (act === 'claim' || act === 'hosting') {
      /* real <a href> handles navigation; allow default */
      return;
    }
    if (act === 'change') { openChangeModal(); return; }
    if (act === 'simulate') { startSimulatePurchase(); return; }
    if (act === 'journey') { startSimulatePurchase(); return; }
    if (act === 'outreach') { openOutreach(); return; }
    if (act === 'close-change') { closeModal(changeModal); return; }
    if (act === 'close-journey') { closeModal(journeyModal); show(bar); return; }
    if (act === 'close-outreach') { closeModal(outreachModal); return; }
    if (act === 'journey-next-onboard') { showJourneyStep('onboard'); return; }
    if (act === 'has-site-yes') { setHasSite(true); return; }
    if (act === 'has-site-no') { setHasSite(false); return; }
    if (act === 'domain-yes') { setDomainKnown(true); return; }
    if (act === 'domain-no') { setDomainKnown(false); return; }
    if (act === 'pick-domain') { pickDomain(t); return; }
    if (act === 'onboard-continue') {
      e.preventDefault();
      if (!validateOnboard()) return;
      runDeploy();
      return;
    }
    if (act === 'journey-done') {
      closeModal(journeyModal);
      show(bar);
      setBarMode('updated');
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (spin && !spin.hidden) return;
    if (changeModal && !changeModal.hidden) closeModal(changeModal);
    else if (outreachModal && !outreachModal.hidden) closeModal(outreachModal);
    else if (journeyModal && !journeyModal.hidden) {
      closeModal(journeyModal);
      show(bar);
    }
  });

  /* expose for debug */
  window.TFDemoWilliams = {
    reset: function () {
      try {
        localStorage.removeItem(LS_CHANGES);
        localStorage.removeItem(LS_PURCHASED);
      } catch (e) {}
      if (heroH) heroH.innerHTML = originals.h1;
      if (heroLede) heroLede.textContent = originals.lede;
      if (serviceFirst) serviceFirst.textContent = originals.service;
      if (updatedChip) updatedChip.classList.remove('is-on');
      changeCount = 0;
      setBarMode('draft');
      location.reload();
    }
  };
})();
