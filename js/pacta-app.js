/* pacta-app.js - shared interactions: modals, row menus, sidebar, export stubs */

(function injectLogoutModal() {
  var html =
    '<div class="modal-overlay" id="logoutModal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="logoutModalTitle">' +
      '<div class="modal u-modal-max-400">' +
        '<div class="modal__head">' +
          '<h2 class="modal__title" id="logoutModalTitle">Tizimdan chiqish</h2>' +
          '<button type="button" class="modal__close" data-modal-close aria-label="Yopish"><i class="ph ph-x"></i></button>' +
        '</div>' +
        '<div class="modal__body">' +
          '<div class="u-logout-intro">' +
            '<div class="u-logout-icon-box"><i class="ph ph-sign-out"></i></div>' +
            '<div>' +
              '<p class="u-logout-title">Haqiqatan ham chiqmoqchimisiz?</p>' +
              '<p class="u-logout-copy">Tizimdan chiqsangiz, qayta kirishingiz kerak bo\'ladi.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal__foot">' +
          '<button type="button" class="btn btn--secondary" data-modal-close>Bekor qilish</button>' +
          '<button type="button" class="btn btn--danger" id="logoutConfirmBtn"><i class="ph ph-sign-out"></i> Ha, chiqish</button>' +
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

  function openModal(id, triggerEl) {
    var overlay = document.getElementById(id);
    if (!overlay) return;

    if (activeModal && activeModal !== overlay) {
      closeModal(activeModal);
    }

    lastFocusedElement = triggerEl || document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    activeModal = overlay;

    var focusables = getFocusableElements(overlay);
    if (focusables.length) focusables[0].focus();
  }

  function closeModal(target) {
    var overlay = typeof target === 'string' ? document.getElementById(target) : target;
    if (!overlay) return;

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');

    if (!document.querySelector('.modal-overlay.is-open')) {
      document.body.style.overflow = '';
      activeModal = null;
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    }
  }

  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-modal-open'), btn);
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var overlay = btn.closest('.modal-overlay');
      if (overlay) closeModal(overlay);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.setAttribute('aria-hidden', overlay.classList.contains('is-open') ? 'false' : 'true');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
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

  document.querySelectorAll('[data-action="row-menu"]').forEach(function (btn) {
    var wrap = btn.closest('.row-menu-wrap');
    var menu = wrap ? wrap.querySelector('.row-menu') : null;
    if (!menu) return;

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

    btn.addEventListener('click', function (e) {
      e.stopPropagation();

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

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        btn.click();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!openMenu) {
          btn.click();
        }
        if (openMenu) {
          var items = getMenuItems(openMenu);
          focusMenuItem(openMenu, Math.max(items.length - 1, 0));
        }
      }
    });
  });

  document.querySelectorAll('.row-menu').forEach(function (menu) {
    menu.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    menu.addEventListener('keydown', function (e) {
      var items = getMenuItems(menu);
      if (!items.length) return;
      var currentIndex = items.indexOf(document.activeElement);
      if (currentIndex < 0) {
        currentIndex = 0;
      }

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
  });

  document.addEventListener('click', function () {
    closeCurrentMenu(false);
  });

  document.querySelectorAll('[data-action="export"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var title = btn.getAttribute('data-export-title') || 'Eksport';
      alert(title + ' funksiyasi tez orada qo\'shiladi.');
    });
  });

  document.querySelectorAll('.logout').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var dest = link.getAttribute('href');
      var confirmBtn = document.getElementById('logoutConfirmBtn');
      if (confirmBtn) {
        confirmBtn.onclick = function () {
          window.location.href = dest || 'admin-login.html';
        };
      }
      openModal('logoutModal', link);
    });
  });

  var sidebarToggle = document.getElementById('sidebarToggle');
  var sidebar = document.querySelector('.sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('is-collapsed');
      var expanded = !sidebar.classList.contains('is-collapsed');
      sidebarToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      sidebarToggle.textContent = expanded ? '\u2039' : '\u203a';
    });
  }

  // --- Filter chips: radio-group + dispatch a filter-change event ---
  document.querySelectorAll('.filter-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var group = chip.parentElement.querySelectorAll('.filter-chip');
      group.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      chip.dispatchEvent(new CustomEvent('pacta:filter-change', { bubbles: true }));
    });
  });

  // --- Tabs: radio-group + optional panel show/hide via data-tab ---
  document.querySelectorAll('.tabs, .modal-tabs').forEach(function (tabBar) {
    var tabs = tabBar.querySelectorAll('.tab, .modal-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        var target = tab.getAttribute('data-tab');
        if (!target) return;
        var root = tabBar.parentElement || document;
        root.querySelectorAll('.modal-tab-panel').forEach(function (panel) {
          panel.classList.toggle('is-active', panel.id === 'tab-' + target);
        });
      });
    });
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
      emptyRow.setAttribute('aria-hidden', 'true');
      emptyRow.innerHTML =
        '<td colspan="' + colCount + '">' +
          '<i class="ph ph-magnifying-glass"></i> Hech narsa topilmadi' +
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
