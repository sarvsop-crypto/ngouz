/**
 * Notifications panel – toggle via topbar bell on all Pacta screens.
 * Requires: button id="notificationsBtn", panel id="notificationsPanel"
 */
(function () {
  'use strict';

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
    btn.setAttribute('aria-expanded', 'false');

    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
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
    e.stopPropagation();
  });

  document.addEventListener('click', function (e) {
    if (!isOpen()) return;
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    closeNotifications();
  });
})();
