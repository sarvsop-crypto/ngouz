/* pacta-app.js - shared interactions: modals, row menus, sidebar, export stubs */

(function injectLogoutModal() {
  var html =
    '<div class="modal-overlay" id="logoutModal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="logoutModalTitle" hidden inert>' +
      '<div class="modal modal--logout">' +
        '<div class="modal__header">' +
          '<h2 class="modal__title" id="logoutModalTitle" data-i18n="common.logout.title">Tizimdan chiqish</h2>' +
          '<button type="button" class="modal__close" data-modal-close data-i18n-aria-label="common.closeAria" aria-label="Yopish"><i class="ph ph-x" aria-hidden="true"></i></button>' +
        '</div>' +
        '<div class="modal__body">' +
          '<div class="logout-dialog__content">' +
            '<div class="logout-dialog__icon"><i class="ph ph-sign-out" aria-hidden="true"></i></div>' +
            '<div>' +
              '<p class="logout-dialog__title" data-i18n="common.logout.confirm">Haqiqatan ham chiqmoqchimisiz?</p>' +
              '<p class="logout-dialog__copy" data-i18n="common.logout.copy">Tizimdan chiqsangiz, qayta kirishingiz kerak bo\'ladi.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal__footer">' +
          '<button type="button" class="modal__btn modal__btn--secondary" data-modal-close data-i18n="common.logout.cancel">Bekor qilish</button>' +
          '<button type="button" class="modal__btn modal__btn--danger" id="logoutConfirmBtn"><i class="ph ph-sign-out" aria-hidden="true"></i> <span data-i18n="common.logout.confirmBtn">Ha, chiqish</span></button>' +
        '</div>' +
      '</div>' +
    '</div>';

  function addModal() {
    if (!document.getElementById('logoutModal')) {
      document.body.insertAdjacentHTML('beforeend', html);
      // Injected after the loader's initial pass; translate it now (later
      // language switches are covered by the loader's apply(document)).
      var m = document.getElementById('logoutModal');
      if (m && window.ngoI18n && typeof window.ngoI18n.apply === 'function') window.ngoI18n.apply(m);
      if (window.AdminModal && typeof window.AdminModal.decorate === 'function') window.AdminModal.decorate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addModal);
  } else {
    addModal();
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  var openMenu = null;
  var menuIdCounter = 0;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openMenu) closeCurrentMenu(true);
  });

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
    // Decorate the logout link as a dialog opener so screen-reader users
    // hear its expanded state and dialog relationship.
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
            window.location.href = dest;
          }
        };
      }
      if (window.AdminModal) window.AdminModal.open('logoutModal', link);
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
