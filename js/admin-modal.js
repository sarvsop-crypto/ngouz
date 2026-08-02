/**
 * admin-modal.js — a11y-aware open/close for admin CMS modal-overlay
 * dialogs. Used on admin-news / admin-events / admin-grants /
 * admin-documents in place of the inline openModal/closeModal helpers
 * that lacked focus management.
 *
 * Exposes window.AdminModal.{open,close}. Each modal must have
 * role="dialog" aria-modal="true" aria-hidden="true" on a top-level
 * element with the given id.
 *
 * Behavior on open:
 *  - Adds .is-open + flips aria-hidden to false
 *  - Locks body scroll
 *  - Captures the element that opened the modal so focus can be
 *    restored on close
 *  - Focuses the first focusable inside (or the dialog itself)
 *
 * Behavior on close:
 *  - Removes .is-open + flips aria-hidden to true
 *  - Unlocks body scroll
 *  - Restores focus to the opener
 *
 * While any modal is open: Escape closes the topmost; Tab/Shift+Tab
 * cycle focus inside the topmost dialog; clicks outside the panel
 * close the dialog.
 */
(function () {
  'use strict';
  if (window.AdminModal) return;

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var stack = []; // open modals: [{id, opener}]

  function getFocusable(panel) {
    return Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE))
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function topmost() { return stack[stack.length - 1] || null; }

  function open(id, opener) {
    var el = document.getElementById(id);
    if (!el) return;
    var entry = {
      id: id,
      opener: opener || (document.activeElement && document.activeElement.focus
        ? document.activeElement : null),
    };
    stack.push(entry);
    el.hidden = false;
    el.removeAttribute('inert');
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    // Body-only overflow:hidden left the page scrollable through the
    // modal on iOS Safari and any browser that scrolls <html> rather
    // than <body>. The .is-modal-open class on <html> (defined in
    // pacta-foundation.css) covers both elements; keep the inline
    // body style as a belt-and-braces fallback for pages that load
    // admin-modal without pacta-foundation.css.
    document.documentElement.classList.add('is-modal-open');
    document.body.style.overflow = 'hidden';
    // Flip aria-expanded on every trigger that opens this dialog so
    // screen readers announce the open state. Without this, SR users
    // hear nothing when the dialog appears.
    var triggers = document.querySelectorAll('[data-modal-open="' + id + '"]');
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'true'); });
    // Defer focus so any open animation has started.
    setTimeout(function () {
      var f = getFocusable(el);
      try { (f[0] || el).focus(); } catch (e) { /* swallow */ }
    }, 30);
  }

  function close(id) {
    var idx = -1;
    for (var i = stack.length - 1; i >= 0; i--) {
      if (stack[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;
    var entry = stack.splice(idx, 1)[0];
    var el = document.getElementById(id);
    if (el) {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('inert', '');
      el.hidden = true;
    }
    if (!stack.length) {
      document.documentElement.classList.remove('is-modal-open');
      document.body.style.overflow = '';
    }
    var triggers = document.querySelectorAll('[data-modal-open="' + id + '"]');
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    if (entry.opener && document.contains(entry.opener)) {
      try { entry.opener.focus(); } catch (e) { /* swallow */ }
    } else {
      // Opener was removed from the DOM (e.g., the table row that
      // launched the modal got re-rendered after a successful PATCH).
      // Without a fallback target, focus stays inside the now-hidden
      // dialog, leaving keyboard users stranded. Focus the main
      // landmark instead so Tab continues somewhere sensible.
      var mainEl = document.getElementById('main-content') || document.querySelector('main');
      if (mainEl) {
        if (!mainEl.hasAttribute('tabindex')) mainEl.setAttribute('tabindex', '-1');
        try { mainEl.focus({ preventScroll: true }); } catch (e) { try { mainEl.focus(); } catch (_) {} }
      }
    }
  }

  document.addEventListener('keydown', function (e) {
    var top = topmost();
    if (!top) return;
    var el = document.getElementById(top.id);
    if (!el) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close(top.id);
      return;
    }
    if (e.key !== 'Tab') return;
    var f = getFocusable(el);
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // Click outside the inner .modal panel closes the topmost dialog.
  document.addEventListener('click', function (e) {
    var top = topmost();
    if (!top) return;
    var el = document.getElementById(top.id);
    if (!el || !el.classList.contains('is-open')) return;
    if (e.target === el) close(top.id);
  });

  // Mark every [data-modal-open] trigger as a dialog opener so screen
  // readers announce them properly even before the dialog is opened.
  // Idempotent — only fills attributes the page didn't already set.
  function decorateTriggers() {
    document.querySelectorAll('.modal-overlay[aria-hidden="true"]').forEach(function (dialog) {
      if (!dialog.classList.contains('is-open')) {
        dialog.setAttribute('inert', '');
        dialog.hidden = true;
      }
    });
    document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
      var targetId = btn.getAttribute('data-modal-open');
      if (!btn.hasAttribute('aria-haspopup')) btn.setAttribute('aria-haspopup', 'dialog');
      if (targetId && !btn.hasAttribute('aria-controls')) btn.setAttribute('aria-controls', targetId);
      if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateTriggers);
  } else {
    decorateTriggers();
  }

  window.AdminModal = { open: open, close: close };
})();
