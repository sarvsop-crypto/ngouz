/**
 * Shared sidebar + notifications panel for the cabinet portal.
 *
 * Usage in each cabinet HTML page:
 *   <body data-nav-active="organization">
 *     <div class="layout">
 *       <div id="cabinet-sidebar-root"></div>
 *       <main class="main">...</main>
 *     </div>
 *     <div id="cabinet-notifications-root"></div>
 *     <script src="js/cabinet-chrome.js" defer></script>
 *
 * The active nav key is read from <body data-nav-active>. Settings sub-pages
 * (cabinet-settings-org, cabinet-settings-notifications, cabinet-settings-security)
 * should use data-nav-active="settings" to keep the parent item highlighted.
 */
(function () {
  var RSQUO = '\u2019';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  var NAV_SECTIONS = [
    {
      label: 'ASOSIY',
      items: [
        { key: 'dashboard',     href: 'cabinet-dashboard',     title: 'Bosh sahifa',    icon: 'ph-squares-four',   text: 'Bosh sahifa' },
        { key: 'organization',  href: 'cabinet-organization',  title: 'Tashkilotim',    icon: 'ph-buildings',      text: 'Tashkilotim' },
        { key: 'applications',  href: 'cabinet-applications',  title: 'Ariza holati',   icon: 'ph-clipboard-text', text: 'Ariza holati' },
        { key: 'reports',       href: 'cabinet-reports',       title: 'Hisobotlar',     icon: 'ph-chart-bar',      text: 'Hisobotlar' },
        { key: 'documents',     href: 'cabinet-documents',     title: 'Hujjatlar',      icon: 'ph-files',          text: 'Hujjatlar' }
      ]
    },
    {
      label: 'XABARNOMA',
      items: [
        { key: 'events',        href: 'cabinet-events',        title: 'Tadbirlar',      icon: 'ph-calendar-check', text: 'Tadbirlar' },
        { key: 'news',          href: 'cabinet-news',          title: 'Yangiliklar',    icon: 'ph-newspaper',      text: 'Yangiliklar' },
        { key: 'notifications', href: 'cabinet-notifications', title: 'Bildirishnomalar', icon: 'ph-bell',         text: 'Bildirishnomalar' }
      ]
    },
    {
      label: 'XIZMATLAR',
      items: [
        { key: 'grants',        href: 'cabinet-grants',        title: 'Grantlar',       icon: 'ph-trophy',            text: 'Grantlar' },
        { key: 'support',       href: 'cabinet-support',       title: 'Murojaat',       icon: 'ph-chat-circle-text',  text: 'Murojaat' },
        { key: 'settings',      href: 'cabinet-settings',      title: 'Sozlamalar',     icon: 'ph-gear',              text: 'Sozlamalar' }
      ]
    }
  ];

  var PANEL_ITEMS = []; // loaded dynamically from API

  function buildNavLink(item, activeKey) {
    var isActive = item.key === activeKey;
    var activeClass = isActive ? ' is-active' : '';
    // aria-current="page" lets screen readers announce "current page"
    // when the user lands on or tabs to the link — without it, the
    // is-active class is purely visual.
    var ariaCurrent = isActive ? ' aria-current="page"' : '';
    return (
      '<a href="' + item.href + '" class="sidebar__nav-link' + activeClass + '" title="' + item.title + '"' + ariaCurrent + '>' +
        '<span class="sidebar__nav-icon"><i class="ph ' + item.icon + '"></i></span>' +
        '<span class="sidebar__nav-link-text">' + item.text + '</span>' +
      '</a>'
    );
  }

  function buildSidebar(activeKey) {
    var sections = NAV_SECTIONS.map(function (section) {
      var links = section.items.map(function (item) { return buildNavLink(item, activeKey); }).join('');
      return (
        '<div class="sidebar__nav-section">' +
          '<div class="sidebar__nav-label">' + section.label + '</div>' +
          links +
        '</div>'
      );
    }).join('');

    return (
      '<aside class="sidebar">' +
        '<div class="sidebar__header">' +
          '<div class="u-inline-stack">' +
            '<div class="sidebar__logo u-logo-initial">A</div>' +
            '<span class="sidebar__title">A\'zo Kabinet</span>' +
          '</div>' +
          '<button type="button" class="sidebar__collapse" id="sidebarToggle" aria-label="Yon panelni yopish" aria-expanded="true">&lsaquo;</button>' +
        '</div>' +
        '<div class="sidebar__search" id="sidebarSearchTrigger">' +
          '<span class="sidebar__nav-icon" aria-hidden="true"><i class="ph ph-magnifying-glass"></i></span>' +
          '<input type="text" placeholder="Qidirish" aria-label="Qidirish" />' +
        '</div>' +
        '<nav class="sidebar__nav" aria-label="Kabinet menyusi">' +
          sections +
          '<div class="sidebar__nav-section u-mt-auto">' +
            '<a href="cabinet-login" data-action="logout" class="sidebar__nav-link logout" title="Chiqish">' +
              '<span class="sidebar__nav-icon"><i class="ph ph-sign-out"></i></span>' +
              '<span class="sidebar__nav-link-text">Chiqish</span>' +
            '</a>' +
          '</div>' +
        '</nav>' +
      '</aside>'
    );
  }

  function buildNotificationsPanel() {
    return (
      '<div class="notifications-panel" id="notificationsPanel" role="dialog" aria-label="Bildirishnomalar" aria-modal="true" aria-hidden="true">' +
        '<div class="notifications-panel__header">' +
          '<h2 class="notifications-panel__title">Bildirishnomalar</h2>' +
        '</div>' +
        '<div class="notifications-panel__list" id="notifPanelList">' +
          '<div class="notif-empty">Yuklanmoqda...</div>' +
        '</div>' +
        '<div class="notifications-panel__footer">' +
          '<button type="button" class="notifications-panel__mark-read">Barchasini o' + RSQUO + 'qildi deb belgilash</button>' +
          '<a href="cabinet-notifications" class="btn btn--primary">Barcha bildirishnomalar</a>' +
        '</div>' +
      '</div>'
    );
  }

  /** Fill the topbar profile from cached user or /me API */
  function hydrateProfile() {
    if (typeof NgoApi === 'undefined') return;
    var user = NgoApi.getUser && NgoApi.getUser();
    if (user) applyProfile(user);
    // Also fetch fresh data if token exists
    if (NgoApi.getToken && NgoApi.getToken()) {
      NgoApi.get('/cabinet/dashboard').then(function (d) {
        if (d.user) applyProfile(d.user);
        if (d.organization) applyOrgName(d.organization.name);
      }).catch(function () {});
    }
  }

  function applyProfile(u) {
    var nameEls = document.querySelectorAll('.main__profile-name');
    var initial = (u.full_name || u.email || '?').charAt(0).toUpperCase();
    nameEls.forEach(function (el) { el.textContent = u.full_name || u.email || ''; });
    var avatarEls = document.querySelectorAll('.main__profile-avatar');
    avatarEls.forEach(function (el) { el.textContent = initial; });
  }

  function applyOrgName(name) {
    var roleEls = document.querySelectorAll('.main__profile-role');
    roleEls.forEach(function (el) { el.textContent = name || ''; });
  }

  /** Load real notifications into the slide-out panel */
  function hydrateNotifPanel() {
    if (typeof NgoApi === 'undefined' || !NgoApi.getToken || !NgoApi.getToken()) return;
    var typeIcons = {
      warning: 'ph-file-text', info: 'ph-magnifying-glass', success: 'ph-check-circle',
      event: 'ph-calendar', error: 'ph-x-circle', grant: 'ph-trophy',
      system: 'ph-gear', security: 'ph-lock'
    };
    function relTime(iso) {
      if (!iso) return '';
      var diff = (Date.now() - new Date(iso).getTime()) / 1000;
      if (diff < 60) return 'Hozir';
      if (diff < 3600) return Math.floor(diff / 60) + ' daqiqa oldin';
      if (diff < 86400) return Math.floor(diff / 3600) + ' soat oldin';
      return Math.floor(diff / 86400) + ' kun oldin';
    }
    NgoApi.get('/cabinet/notifications').then(function (res) {
      var items = (res.items || []).slice(0, 5);
      var listEl = document.getElementById('notifPanelList');
      if (!listEl) return;
      if (!items.length) {
        listEl.innerHTML = '<div class="notif-empty">Bildirishnomalar yo\u2018q</div>';
        return;
      }
      listEl.innerHTML = items.map(function (n) {
        var icon = typeIcons[n.type] || 'ph-bell';
        var dot = n.is_read ? '' : ' <span class="notifications-panel__dot"></span>';
        return '<div class="notifications-panel__item">' +
          '<div class="notifications-panel__icon"><i class="ph ' + icon + '"></i></div>' +
          '<div class="notifications-panel__content">' +
            '<p class="notifications-panel__item-title">' + esc(n.title || '') + dot + '</p>' +
            '<p class="notifications-panel__item-body">' + esc(n.body || '') + '</p>' +
            '<p class="notifications-panel__item-time">' + relTime(n.created_at) + '</p>' +
          '</div></div>';
      }).join('');
      // Update badge count
      var unread = (res.items || []).filter(function (n) { return !n.is_read; }).length;
      var badge = document.querySelector('.topbar-notifications-badge');
      if (badge) {
        badge.textContent = unread || '';
        badge.style.display = unread ? '' : 'none';
      }
    }).catch(function () {});
  }

  function mount() {
    var activeKey = document.body.getAttribute('data-nav-active') || '';
    var sidebarRoot = document.getElementById('cabinet-sidebar-root');
    var panelRoot   = document.getElementById('cabinet-notifications-root');
    if (sidebarRoot) sidebarRoot.outerHTML = buildSidebar(activeKey);
    if (panelRoot)   panelRoot.outerHTML   = buildNotificationsPanel();
    // Hydrate profile and notifications from API after DOM is ready
    // Use a short delay to ensure api-client.js has loaded
    setTimeout(function () {
      hydrateProfile();
      hydrateNotifPanel();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // Logout: the sidebar link was previously a plain
  // <a href="cabinet-login.html"> — navigation only, never cleared
  // the token. The cabinet-login page checked for an existing token
  // and bounced the user right back to the dashboard, so "Logout"
  // silently never logged anyone out. Now intercepts the click,
  // clears the token via NgoApi.logout, then navigates.
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest && ev.target.closest('[data-action="logout"]');
    if (!el) return;
    ev.preventDefault();
    // Optimistic logout: clear the token + navigate immediately so
    // the user sees the login page within ~50 ms instead of waiting
    // for the /auth/logout POST to complete (up to 15 s on a slow
    // network). The fetch is fire-and-forget — backend cleans up its
    // session record when it eventually receives the call. If the
    // user was offline entirely, the navigation still happens since
    // the token is already gone client-side.
    try { localStorage.removeItem('ngo_api_token'); localStorage.removeItem('ngo_api_user'); } catch (e) { /* swallow */ }
    if (window.NgoApi && typeof NgoApi.logout === 'function') {
      // logout() also clears the token internally — that's fine, it's
      // idempotent. We don't await it.
      NgoApi.logout().catch(function () {});
    }
    location.replace('cabinet-login');
  });
})();
