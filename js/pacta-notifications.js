/**
 * Notifications panel – toggle via topbar bell on all Pacta screens.
 * Requires: button id="notificationsBtn", panel id="notificationsPanel"
 *
 * Cabinet pages build the panel via cabinet-chrome.js (defer), which
 * runs after the parser, so this script must wait for DOMContentLoaded
 * — running synchronously would find #notificationsPanel === null and
 * leave the topbar bell wired to nothing.
 */
(function () {
  'use strict';

  function init() {
    var panel = document.getElementById('notificationsPanel');
    var btn = document.getElementById('notificationsBtn');
    var lastFocused = null;

    if (!panel || !btn) {
      return;
    }

    btn.setAttribute('aria-controls', 'notificationsPanel');
    if (!btn.hasAttribute('aria-expanded')) {
      btn.setAttribute('aria-expanded', 'false');
    }
    // The panel is a role="dialog" — aria-haspopup="true" defaults to
    // "menu", which makes SR announce "menu opens" instead of "dialog
    // opens". Static markup uses "true"; correct it here for accuracy.
    btn.setAttribute('aria-haspopup', 'dialog');

    panel.setAttribute('aria-hidden', panel.classList.contains('is-open') ? 'false' : 'true');
    if (!panel.hasAttribute('tabindex')) {
      panel.setAttribute('tabindex', '-1');
    }

    function isOpen() {
      return panel.classList.contains('is-open');
    }

    function getFocusable() {
      var selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.prototype.slice.call(panel.querySelectorAll(selectors)).filter(function (el) {
        return !el.disabled && !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true';
      });
    }

    function openNotifications() {
      lastFocused = document.activeElement && document.activeElement.focus ? document.activeElement : btn;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      btn.setAttribute('aria-expanded', 'true');

      var focusable = getFocusable();
      if (focusable.length) {
        focusable[0].focus();
      } else {
        panel.focus();
      }
    }

    function closeNotifications() {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      btn.setAttribute('aria-expanded', 'false');

      if (lastFocused && lastFocused.focus && document.contains(lastFocused)) {
        lastFocused.focus();
      } else {
        // Last-focused trigger was removed from DOM (rare, but possible
        // if the topbar re-renders mid-panel). Fall back to the bell so
        // keyboard users land on a visible target rather than nowhere.
        try { btn.focus(); } catch (e) { /* swallow */ }
      }
      lastFocused = null;
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) closeNotifications();
      else openNotifications();
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeNotifications();
        return;
      }

      if (e.key !== 'Tab') return;

      var focusable = getFocusable();
      if (!focusable.length) return;

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

    panel.addEventListener('click', function (e) {
      var closeBtn = e.target && e.target.closest && e.target.closest('.notifications-panel__close');
      if (closeBtn) {
        e.preventDefault();
        closeNotifications();
        return;
      }
      e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      closeNotifications();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
