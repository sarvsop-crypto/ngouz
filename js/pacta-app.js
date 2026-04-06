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
});
