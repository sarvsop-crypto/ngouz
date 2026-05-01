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
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
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
    }
    if (!stack.length) {
      document.body.style.overflow = '';
    }
    if (entry.opener && document.contains(entry.opener)) {
      try { entry.opener.focus(); } catch (e) { /* swallow */ }
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

  window.AdminModal = { open: open, close: close };
})();
