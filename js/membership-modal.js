/**
 * membership-modal.js — wires a11y / keyboard behavior onto the
 * CSS-`:target` membership modal on index.html.
 *
 * The modal is opened by anchor links with href="#membership-modal"
 * and closed by anchors that clear the hash. CSS handles the show/hide
 * via `.membership-overlay:target`. This script adds:
 *
 * - Focus moves into the modal when it opens (first focusable element).
 * - Tab/Shift+Tab cycle within the modal (focus trap, since
 *   aria-modal="true" is declared on the dialog).
 * - Escape closes the modal (sets hash to empty).
 * - Focus returns to the element that opened the modal on close.
 */
(function () {
  var MODAL_ID = 'membership-modal';
  var modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  var dialog = modal.querySelector('[role="dialog"]') || modal;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  var lastFocused = null;

  // Hero CTA + nav links use href="#membership-modal" to open the
  // dialog. They have aria-haspopup="dialog" + aria-controls but
  // historically lacked aria-expanded toggling — so screen readers
  // never announced "expanded" / "collapsed" on the trigger.
  function setTriggersExpanded(expanded) {
    document.querySelectorAll('[aria-controls="' + MODAL_ID + '"]').forEach(function (t) {
      t.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  function isOpen() {
    return location.hash === '#' + MODAL_ID;
  }

  function focusables() {
    return Array.prototype.slice.call(dialog.querySelectorAll(FOCUSABLE))
      .filter(function (el) { return el.offsetParent !== null; }); // visible only
  }

  function close() {
    // Setting hash to '' leaves a stray '#' in the URL; pushing a new
    // history entry without the hash is cleaner.
    if (history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    } else {
      location.hash = '';
    }
    onClose();
  }

  function onOpen() {
    lastFocused = document.activeElement;
    // Static markup has aria-hidden="true" — flip it so screen
    // readers acknowledge the now-visible dialog. Without this AT
    // saw the form fields whether the modal was open or closed.
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-modal-open');
    setTriggersExpanded(true);
    var f = focusables();
    if (f.length) {
      // Defer to let CSS transition begin so focus ring isn't on a
      // visually-hidden element on the same tick.
      setTimeout(function () { try { f[0].focus(); } catch (e) {} }, 50);
    }
  }

  function onClose() {
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-modal-open');
    setTriggersExpanded(false);
    try {
      var target = (lastFocused && document.contains(lastFocused)) ? lastFocused : null;
      if (target && typeof target.focus === 'function') {
        target.focus();
      } else {
        // Opener was detached — fall back to any modal trigger still in
        // the DOM (e.g., a hero CTA), then to <main>, so keyboard users
        // don't get stranded with focus on the now-hidden dialog.
        var trigger = document.querySelector('[aria-controls="' + MODAL_ID + '"]');
        if (trigger && typeof trigger.focus === 'function') {
          trigger.focus();
        } else {
          var mainEl = document.getElementById('main-content') || document.querySelector('main');
          if (mainEl) {
            if (!mainEl.hasAttribute('tabindex')) mainEl.setAttribute('tabindex', '-1');
            try { mainEl.focus({ preventScroll: true }); } catch (e2) { try { mainEl.focus(); } catch (_) {} }
          }
        }
      }
    } catch (e) { /* swallow */ }
    lastFocused = null;
  }

  function onHashChange() {
    if (isOpen()) onOpen();
    else if (lastFocused) onClose();
  }

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      var f = focusables();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('hashchange', onHashChange);

  // Intercept clicks on .membership-close (and any data-modal-dismiss
  // anchors) so close() runs replaceState instead of pushing a "#"
  // entry into history. Without this, pressing back after close
  // re-opened the modal and the URL kept a stray "#".
  modal.addEventListener('click', function (ev) {
    var closeEl = ev.target && ev.target.closest && ev.target.closest('.membership-close, [data-modal-dismiss]');
    if (!closeEl) return;
    ev.preventDefault();
    close();
  });

  // Initial state: pre-set aria-expanded="false" on all triggers so
  // assistive tech reads a complete state before the user interacts
  // (otherwise the attribute is missing and announcement is "haspopup
  // dialog" without expanded/collapsed context).
  setTriggersExpanded(isOpen());

  // If page is loaded directly with #membership-modal in the URL, fire
  // the open behavior so focus lands inside.
  if (isOpen()) {
    // Give the browser a tick to render the :target match.
    setTimeout(onOpen, 0);
  }
})();
