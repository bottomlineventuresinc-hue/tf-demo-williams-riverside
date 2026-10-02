/* Williams Hustle and Bustle Crew site overlay: pricing bar and change request.
   Client-side only. No backend. */
(function () {
  'use strict';

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
            'Plumbing, sprinkler and irrigation repair, and landscaping support in Riverside. Frederick looks at the job first and puts the price in writing.';
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
      barSub.textContent = 'Questions or changes? Just reply to my text.';
    } else {
      barSub.textContent = 'Questions or changes? Just reply to my text.';
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
        /* click backdrop closes the change modal */
        var mid = e.target;
        if (mid === changeModal) closeModal(changeModal);
      }
      return;
    }
    var act = t.getAttribute('data-tf');
    if (act === 'hosting') {
      /* real <a href> handles navigation; allow default */
      return;
    }
    if (act === 'change') { openChangeModal(); return; }
    if (act === 'close-change') { closeModal(changeModal); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (spin && !spin.hidden) return;
    if (changeModal && !changeModal.hidden) closeModal(changeModal);
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
