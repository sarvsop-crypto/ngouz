/* pacta-app.js - shared interactions: modals, row menus, sidebar, export stubs */

(function injectLogoutModal() {
  var html =
    '<div class="modal-overlay" id="logoutModal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="logoutModalTitle">' +
      '<div class="modal u-modal-max-400">' +
        '<div class="modal__head">' +
          '<h2 class="modal__title" id="logoutModalTitle">Tizimdan chiqish</h2>' +
          '<button type="button" class="modal__close" data-modal-close aria-label="Yopish"><i class="ph ph-x" aria-hidden="true"></i></button>' +
        '</div>' +
        '<div class="modal__body">' +
          '<div class="u-logout-intro">' +
            '<div class="u-logout-icon-box"><i class="ph ph-sign-out" aria-hidden="true"></i></div>' +
            '<div>' +
              '<p class="u-logout-title">Haqiqatan ham chiqmoqchimisiz?</p>' +
              '<p class="u-logout-copy">Tizimdan chiqsangiz, qayta kirishingiz kerak bo\'ladi.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal__foot">' +
          '<button type="button" class="btn btn--secondary" data-modal-close>Bekor qilish</button>' +
          '<button type="button" class="btn btn--danger" id="logoutConfirmBtn"><i class="ph ph-sign-out" aria-hidden="true"></i> Ha, chiqish</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  function addModal() {
    if (!document.getElementById('logoutModal')) {
      document.body.insertAdjacentHTML('beforeend', html);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addModal);
  } else {
    addModal();
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  var activeModal = null;
  var lastFocusedElement = null;

  function getFocusableElements(root) {
    if (!root) return [];
    return Array.prototype.slice.call(
      root.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true';
    });
  }

  function lockModalFocus(overlay, event) {
    if (!overlay || event.key !== 'Tab') return;
    var focusables = getFocusableElements(overlay);
    if (!focusables.length) return;

    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Sync aria-expanded on every trigger that points at this overlay.
  // The aria-haspopup="dialog" + aria-controls pairing was set up in
  // the iter-104 init pass; the missing piece was aria-expanded
  // toggling on open/close so screen readers announce "expanded" /
  // "collapsed" on the trigger.
  function setTriggersExpanded(overlayId, expanded) {
    if (!overlayId) return;
    var sel = '[data-modal-open="' + overlayId + '"], [aria-controls="' + overlayId + '"]';
    document.querySelectorAll(sel).forEach(function (t) {
      t.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  function openModal(id, triggerEl) {
    var overlay = document.getElementById(id);
    if (!overlay) return;

    if (activeModal && activeModal !== overlay) {
      closeModal(activeModal);
    }

    lastFocusedElement = triggerEl || document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    // Body-only overflow:hidden left iOS Safari and any browser
    // where <html> is the scrolling element able to scroll the page
    // behind the modal. The .is-modal-open class on <html> covers
    // both elements via pacta-foundation.css.
    document.documentElement.classList.add('is-modal-open');
    document.body.style.overflow = 'hidden';
    activeModal = overlay;
    setTriggersExpanded(id, true);

    var focusables = getFocusableElements(overlay);
    if (focusables.length) focusables[0].focus();
  }

  function closeModal(target) {
    var overlay = typeof target === 'string' ? document.getElementById(target) : target;
    if (!overlay) return;

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    setTriggersExpanded(overlay.id, false);

    if (!document.querySelector('.modal-overlay.is-open')) {
      document.documentElement.classList.remove('is-modal-open');
      document.body.style.overflow = '';
      activeModal = null;
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function'
          && document.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
      } else {
        // Opener was removed from the DOM (e.g., a table row re-rendered
        // after a successful PATCH). Without a fallback, focus stays in
        // the now-hidden modal and keyboard users get stranded. Land on
        // the main landmark so Tab continues from somewhere sensible.
        var mainEl = document.getElementById('main-content') || document.querySelector('main');
        if (mainEl) {
          if (!mainEl.hasAttribute('tabindex')) mainEl.setAttribute('tabindex', '-1');
          try { mainEl.focus({ preventScroll: true }); } catch (e) { try { mainEl.focus(); } catch (_) {} }
        }
      }
      lastFocusedElement = null;
    }
  }

  // Event delegation — admin pages build [data-modal-open] / [data-
  // modal-close] buttons via innerHTML AFTER page load (admin-cms.js
  // populates table rows, etc.). Per-element listeners attached on
  // initial load missed those late-rendered buttons, so the modals
  // silently never opened. A single document-level click delegate
  // catches both initial and late-bound buttons.
  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest && e.target.closest('[data-modal-open]');
    if (openBtn) {
      openModal(openBtn.getAttribute('data-modal-open'), openBtn);
      return;
    }
    var closeBtn = e.target.closest && e.target.closest('[data-modal-close]');
    if (closeBtn) {
      // Two patterns supported:
      //   <button data-modal-close>          → closest .modal-overlay
      //   <button data-modal-close="theId">  → look up by id (used
      //     by .modal-without-.modal-overlay markup, e.g. cabinet
      //     uploadReportModal where the close button never had a
      //     .modal-overlay ancestor and the original code silently
      //     no-op'd on click).
      var explicitId = closeBtn.getAttribute('data-modal-close');
      var overlay = explicitId
        ? document.getElementById(explicitId)
        : closeBtn.closest('.modal-overlay');
      if (overlay) closeModal(overlay);
    }
  });

  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.setAttribute('aria-hidden', overlay.classList.contains('is-open') ? 'false' : 'true');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Tag every modal-trigger with the right ARIA so screen readers
  // announce them as dialog openers, not generic buttons. Idempotent
  // — only sets attributes that are missing.
  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    var targetId = btn.getAttribute('data-modal-open');
    if (!btn.hasAttribute('aria-haspopup')) btn.setAttribute('aria-haspopup', 'dialog');
    if (targetId && !btn.hasAttribute('aria-controls')) btn.setAttribute('aria-controls', targetId);
    if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', function (e) {
    if (activeModal) {
      lockModalFocus(activeModal, e);
    }
    if (e.key === 'Escape') {
      if (activeModal) {
        closeModal(activeModal);
      }
      if (openMenu) {
        closeCurrentMenu(true);
      }
    }
  });

  var openMenu = null;
  var menuIdCounter = 0;

  function getMenuItems(menu) {
    if (!menu) return [];
    return Array.prototype.slice.call(menu.querySelectorAll('.row-menu__item'));
  }

  function focusMenuItem(menu, index) {
    var items = getMenuItems(menu);
    if (!items.length) return;
    var boundedIndex = Math.max(0, Math.min(index, items.length - 1));
    items.forEach(function (item, itemIndex) {
      item.tabIndex = itemIndex === boundedIndex ? 0 : -1;
    });
    items[boundedIndex].focus();
  }

  function closeCurrentMenu(returnFocus) {
    if (!openMenu) return;
    var trigger = openMenu.closest('.row-menu-wrap')
      ? openMenu.closest('.row-menu-wrap').querySelector('[data-action="row-menu"]')
      : null;
    openMenu.classList.remove('is-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }
    openMenu = null;
  }

  // Lazy aria setup — runs on first interaction with each button so it
  // works on dynamically-rendered table rows (admin-cms inserts these
  // via innerHTML after page load; the previous static querySelectorAll
  // missed them entirely).
  function setupRowMenu(btn) {
    if (btn.__rowMenuSetup) return null;
    var wrap = btn.closest('.row-menu-wrap');
    var menu = wrap ? wrap.querySelector('.row-menu') : null;
    if (!menu) return null;
    btn.__rowMenuSetup = true;
    if (!menu.id) {
      menuIdCounter += 1;
      menu.id = 'row-menu-' + menuIdCounter;
    }
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Qator amallari');
    getMenuItems(menu).forEach(function (item, itemIndex) {
      item.setAttribute('role', 'menuitem');
      item.tabIndex = itemIndex === 0 ? 0 : -1;
    });
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', menu.id);
    return menu;
  }

  // Click delegation — catches both initially-rendered and late-added
  // row-menu buttons.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-action="row-menu"]');
    if (!btn) return;
    e.stopPropagation();
    var menu = setupRowMenu(btn);
    if (!menu) return;
    if (openMenu && openMenu !== menu) {
      closeCurrentMenu(false);
    }
    menu.classList.toggle('is-open');
    openMenu = menu.classList.contains('is-open') ? menu : null;
    btn.setAttribute('aria-expanded', openMenu ? 'true' : 'false');
    if (openMenu) {
      focusMenuItem(openMenu, 0);
    }
  });

  // Keydown delegation — same late-binding fix as the click handler
  // above. Enter/Space/ArrowDown opens the menu; ArrowUp opens then
  // focuses the LAST item.
  document.addEventListener('keydown', function (e) {
    var btn = e.target.closest && e.target.closest('[data-action="row-menu"]');
    if (!btn) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      btn.click();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!openMenu) btn.click();
      if (openMenu) {
        var items = getMenuItems(openMenu);
        focusMenuItem(openMenu, Math.max(items.length - 1, 0));
      }
    }
  });

  // Static-only setup pass — ensures aria-* attrs are present on
  // initially-rendered buttons even before the user interacts (so a
  // focusing screen reader announces the popup-trigger state).
  document.querySelectorAll('[data-action="row-menu"]').forEach(setupRowMenu);

  // Delegated click + keydown handlers for .row-menu — same late-
  // binding fix as iter 88 modals + iter 90 row-menu triggers.
  // .row-menu elements get rendered along with the rest of each table
  // row (admin-cms innerHTML), so on-load forEach missed them.
  document.addEventListener('click', function (e) {
    var menu = e.target.closest && e.target.closest('.row-menu');
    if (menu) e.stopPropagation();
  });
  document.addEventListener('keydown', function (e) {
    var menu = e.target.closest && e.target.closest('.row-menu');
    if (!menu) return;
    var items = getMenuItems(menu);
    if (!items.length) return;
    var currentIndex = items.indexOf(document.activeElement);
    if (currentIndex < 0) currentIndex = 0;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusMenuItem(menu, (currentIndex + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusMenuItem(menu, (currentIndex - 1 + items.length) % items.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusMenuItem(menu, 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusMenuItem(menu, items.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCurrentMenu(true);
    }
  });

  document.addEventListener('click', function () {
    closeCurrentMenu(false);
  });

  // (Removed iter 277: [data-action="export"] alert placeholder.
  // All admin Eksport buttons now have real CSV handlers wired to
  // window.exportCsv from pacta-foundation.js — no element in any
  // HTML still carries the data-action attribute.)

  // Cabinet pages have their own optimistic-logout flow in
  // cabinet-chrome.js (instant token clear + redirect, no modal).
  // Skip wiring this admin-side modal flow there — both handlers
  // would otherwise fire and flicker the confirm modal mid-navigation.
  var IS_CABINET = location.pathname.indexOf('/cabinet/') === 0;
  document.querySelectorAll('.logout').forEach(function (link) {
    if (IS_CABINET) return;
    // Decorate the logout link as a dialog opener so SR users hear
    // "expanded/collapsed" + "has popup, dialog" instead of a plain
    // link. setTriggersExpanded only matches [data-modal-open=...],
    // so add the attrs here once on init.
    if (!link.hasAttribute('aria-haspopup')) link.setAttribute('aria-haspopup', 'dialog');
    if (!link.hasAttribute('aria-controls')) link.setAttribute('aria-controls', 'logoutModal');
    if (!link.hasAttribute('aria-expanded')) link.setAttribute('aria-expanded', 'false');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      // Pick the post-logout destination from a data-attribute first
      // (lets pages opt in to a custom URL), otherwise default to
      // admin-login. Previously this read link.getAttribute('href')
      // which is hardcoded to "#" — so confirming logout left a stale
      // token in localStorage and just appended a fragment to the URL.
      var dest = link.getAttribute('data-logout-href') || 'admin-login';
      var confirmBtn = document.getElementById('logoutConfirmBtn');
      if (confirmBtn) {
        confirmBtn.onclick = function () {
          if (window.NgoApi && typeof window.NgoApi.logout === 'function') {
            window.NgoApi.logout().then(function () {
              window.location.href = dest;
            });
          } else {
            // Fall back to manual token clear if api-client didn't load.
            try {
              localStorage.removeItem('ngo_api_token');
              localStorage.removeItem('ngo_api_user');
              sessionStorage.removeItem('ngo_api_token');
              sessionStorage.removeItem('ngo_api_user');
            } catch (e) { /* swallow */ }
            window.location.href = dest;
          }
        };
      }
      openModal('logoutModal', link);
    });
  });

  // Filter rows wrap a live-search input + filter chips in
  // <form role="search"> for landmark semantics. Without onsubmit
  // intercepted, pressing Enter in the search field submitted the form
  // — and since the input has no name attribute, the form GET-reloaded
  // the admin page with an empty query string, dropping any in-progress
  // edit state. Block the navigation; the live `input` listener already
  // applies the filter on every keystroke.
  document.querySelectorAll('form[role="search"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  });

  var sidebarToggle = document.getElementById('sidebarToggle');
  var sidebar = document.querySelector('.sidebar');
  if (sidebarToggle && sidebar) {
    // Give the sidebar an id (matches setupMobileSidebar's choice in
    // pacta-foundation.js) so aria-controls on the collapse button
    // resolves. Idempotent — first writer wins.
    if (!sidebar.id) sidebar.id = 'pactaSidebar';
    if (!sidebarToggle.hasAttribute('aria-controls')) {
      sidebarToggle.setAttribute('aria-controls', sidebar.id);
    }
    var SIDEBAR_KEY = 'ngo_sidebar_collapsed_v1';
    function applySidebarState(collapsed) {
      sidebar.classList.toggle('is-collapsed', collapsed);
      sidebarToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      sidebarToggle.textContent = collapsed ? '\u203a' : '\u2039';
      // Sync aria-label to match the action the user is about to take \u2014
      // "yopish" (close) when expanded, "ochish" (open) when collapsed.
      sidebarToggle.setAttribute('aria-label',
        collapsed ? 'Yon panelni ochish' : 'Yon panelni yopish');
    }
    try {
      if (localStorage.getItem(SIDEBAR_KEY) === '1') applySidebarState(true);
    } catch (e) { /* swallow */ }
    sidebarToggle.addEventListener('click', function () {
      var willCollapse = !sidebar.classList.contains('is-collapsed');
      applySidebarState(willCollapse);
      try { localStorage.setItem(SIDEBAR_KEY, willCollapse ? '1' : '0'); } catch (e) {}
    });
  }

  // --- Filter chips: radio-group + dispatch a filter-change event ---
  // Initialize aria-pressed once so AT users can read the current
  // selection without waiting for the first click to flip a value
  // they never had.
  document.querySelectorAll('.filter-chip').forEach(function (chip) {
    if (!chip.hasAttribute('aria-pressed')) {
      chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
    }
    chip.addEventListener('click', function () {
      var group = chip.parentElement.querySelectorAll('.filter-chip');
      group.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      chip.dispatchEvent(new CustomEvent('pacta:filter-change', { bubbles: true }));
    });
  });

  // --- Tabs: radio-group + optional panel show/hide via data-tab ---
  document.querySelectorAll('.tabs, .modal-tabs').forEach(function (tabBar) {
    var tabs = Array.prototype.slice.call(tabBar.querySelectorAll('.tab, .modal-tab'));
    // WAI-ARIA tab pattern: when the tabbar has role="tablist", the
    // active tab is the only one in the tab order (tabindex=0); the
    // rest are -1 and reachable only via Left/Right arrows. Without
    // this, every tab grabbed Tab focus and arrow keys did nothing.
    var isAriaTablist = tabBar.getAttribute('role') === 'tablist';
    tabs.forEach(function (tab) {
      if (!tab.hasAttribute('aria-pressed')) {
        tab.setAttribute('aria-pressed', tab.classList.contains('is-active') ? 'true' : 'false');
      }
      if (isAriaTablist && !tab.hasAttribute('tabindex')) {
        tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');
      }
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        activateTab(tab);
      });
    });

    function activateTab(tab) {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-pressed', 'false');
        if (isAriaTablist) {
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        }
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-pressed', 'true');
      if (isAriaTablist) {
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
      }
      var target = tab.getAttribute('data-tab');
      if (!target) return;
      var root = tabBar.parentElement || document;
      root.querySelectorAll('.modal-tab-panel').forEach(function (panel) {
        panel.classList.toggle('is-active', panel.id === 'tab-' + target);
      });
    }

    if (isAriaTablist) {
      tabBar.addEventListener('keydown', function (e) {
        var key = e.key;
        if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;
        var idx = tabs.indexOf(document.activeElement);
        if (idx === -1) return;
        e.preventDefault();
        var next = idx;
        if (key === 'ArrowLeft')  next = (idx - 1 + tabs.length) % tabs.length;
        if (key === 'ArrowRight') next = (idx + 1) % tabs.length;
        if (key === 'Home')       next = 0;
        if (key === 'End')        next = tabs.length - 1;
        try { tabs[next].focus(); } catch (err) {}
        // Synthesize a click so any page-specific click listeners
        // (e.g. cabinet-applications' renderTable) run alongside the
        // pacta-app activation. Otherwise arrow keys flip the visual
        // tab but the bound content stays on the previous tab.
        // This also covers activateTab() via the existing click hook.
        try { tabs[next].click(); } catch (err) { activateTab(tabs[next]); }
      });
    }
  });

  // --- Table row filtering inside <section class="table-section"> ---
  if (!document.getElementById('pacta-table-empty-style')) {
    var style = document.createElement('style');
    style.id = 'pacta-table-empty-style';
    style.textContent =
      '.table__empty-row td{padding:36px 18px;text-align:center;color:var(--grey-400,#9ca3af);font-size:13px;}' +
      '.table__empty-row td i{margin-right:6px;font-size:16px;vertical-align:middle;}';
    document.head.appendChild(style);
  }

  // --- Client-side form validation (opt-in via data-validate on <form>) ---
  if (!document.getElementById('pacta-form-error-style')) {
    var formStyle = document.createElement('style');
    formStyle.id = 'pacta-form-error-style';
    formStyle.textContent =
      '.is-invalid{border-color:#dc2626 !important;background-color:#fef2f2 !important;}' +
      '.field-error{color:#dc2626;font-size:12px;margin-top:4px;display:block;line-height:1.4;}' +
      '.field-error::before{content:"\\26A0";margin-right:4px;}' +
      '.form-success{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;padding:12px 16px;border-radius:8px;margin-bottom:14px;font-size:14px;}' +
      '.form-success::before{content:"\\2713";font-weight:700;margin-right:6px;}';
    document.head.appendChild(formStyle);
  }

  function clearFieldError(field) {
    field.classList.remove('is-invalid');
    var next = field.nextElementSibling;
    if (next && next.classList && next.classList.contains('field-error')) {
      next.parentNode.removeChild(next);
    }
  }

  function setFieldError(field, message) {
    field.classList.add('is-invalid');
    var existing = field.nextElementSibling;
    if (existing && existing.classList && existing.classList.contains('field-error')) {
      existing.textContent = message;
      return;
    }
    var span = document.createElement('span');
    span.className = 'field-error';
    span.textContent = message;
    if (field.parentNode) field.parentNode.insertBefore(span, field.nextSibling);
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = form.querySelectorAll('input, select, textarea');

    fields.forEach(function (field) {
      if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') return;
      field.addEventListener('blur', function () {
        if (field.value.trim() === '' && !field.required) {
          clearFieldError(field);
          return;
        }
        if (field.checkValidity && field.checkValidity()) {
          clearFieldError(field);
        }
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid') && field.checkValidity && field.checkValidity()) {
          clearFieldError(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      var firstInvalid = null;
      var hasInvalid = false;

      fields.forEach(function (field) {
        if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') return;
        clearFieldError(field);
        if (!field.checkValidity || field.checkValidity()) return;
        hasInvalid = true;
        var message = field.validationMessage || 'Ushbu maydonni to\'ldiring';
        if (field.validity && field.validity.valueMissing) message = 'Ushbu maydon majburiy';
        else if (field.validity && field.validity.typeMismatch && field.type === 'email') message = 'Email manzil noto\'g\'ri';
        else if (field.validity && field.validity.tooShort) message = 'Juda qisqa (kamida ' + field.minLength + ' ta belgi)';
        else if (field.validity && field.validity.patternMismatch) message = 'Format noto\'g\'ri';
        setFieldError(field, message);
        if (!firstInvalid) firstInvalid = field;
      });

      if (hasInvalid) {
        e.preventDefault();
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Valid. If the form has an action attribute, let the native submit
      // take over (it will navigate). Otherwise show an inline success
      // banner so the user gets feedback without a real backend.
      if (form.hasAttribute('action')) return;

      e.preventDefault();
      var existingSuccess = form.querySelector('.form-success');
      if (existingSuccess) existingSuccess.parentNode.removeChild(existingSuccess);
      var success = document.createElement('div');
      success.className = 'form-success';
      success.textContent = 'Ma\'lumotlaringiz qabul qilindi. Tez orada siz bilan bog\'lanamiz.';
      form.insertBefore(success, form.firstChild);
      form.reset();
      setTimeout(function () {
        if (success.parentNode) success.parentNode.removeChild(success);
      }, 6000);
    });
  });

  document.querySelectorAll('.table-section').forEach(function (section) {
    var tbody = section.querySelector('.table tbody');
    if (!tbody) return;
    var searchInput = section.querySelector('input.table-section__search[type="search"]');
    var hasChips = !!section.querySelector('.filter-chip');
    if (!searchInput && !hasChips) return;

    var emptyRow = null;
    function ensureEmptyRow() {
      if (emptyRow) return emptyRow;
      var colCount = 1;
      var headerRow = section.querySelector('.table thead tr');
      if (headerRow) colCount = headerRow.children.length;
      emptyRow = document.createElement('tr');
      emptyRow.className = 'table__empty-row';
      emptyRow.innerHTML =
        '<td colspan="' + colCount + '">' +
          '<span role="status">' +
            '<i class="ph ph-magnifying-glass" aria-hidden="true"></i> Hech narsa topilmadi' +
          '</span>' +
        '</td>';
      return emptyRow;
    }

    function activeFilter() {
      var active = section.querySelector('.filter-chip.is-active');
      if (!active) return 'all';
      return active.getAttribute('data-filter') || 'all';
    }

    function rowMatches(row, filter, term) {
      if (filter !== 'all') {
        var status = row.getAttribute('data-status');
        if (!status || status !== filter) return false;
      }
      if (term && row.textContent.toLowerCase().indexOf(term) === -1) return false;
      return true;
    }

    function apply() {
      var filter = activeFilter();
      var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visible = 0;
      var rows = tbody.querySelectorAll('tr');
      rows.forEach(function (row) {
        if (row.classList.contains('table__empty-row')) return;
        var show = rowMatches(row, filter, term);
        row.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      var emp = ensureEmptyRow();
      if (visible === 0) {
        if (!emp.parentNode) tbody.appendChild(emp);
      } else if (emp.parentNode) {
        emp.parentNode.removeChild(emp);
      }
    }

    section.addEventListener('pacta:filter-change', apply);

    if (searchInput) {
      var debounce;
      searchInput.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(apply, 120);
      });
    }
  });
});
