/** Canonical admin navigation and page/role authorization matrix. */
(function () {
  'use strict';

  var ADMIN = ['super_admin'];
  var OPERATIONS = ['super_admin', 'regional_admin'];
  var COMMISSION = ['commission'];
  var LEADER = ['leader'];
  var ALL_SHELL_ROLES = ['super_admin', 'regional_admin', 'commission', 'leader'];

  var sections = [
    { key: 'main', label: 'ASOSIY MENYU', items: [
      item('dashboard', 'admin-dashboard', 'squares-four', 'Boshqaruv paneli', 'admin.nav.dashboard', OPERATIONS),
      item('membership', 'admin-membership-requests', 'file-text', "A'zolik arizalari", 'admin.nav.membershipRequests', OPERATIONS),
      item('registry', 'admin-registry', 'list-bullets', "NNT Ro'yxati", 'admin.nav.registry', OPERATIONS),
      item('regions', 'admin-regions', 'map-pin', 'Hududlar', 'admin.nav.regions', OPERATIONS),
      item('tasks', 'admin-tasks', 'check-square', 'Topshiriqlar', 'admin.nav.tasks', OPERATIONS),
      item('messages', 'admin-messages', 'chats-circle', 'Ichki xabarlar', 'admin.nav.messages', OPERATIONS, 'messages'),
      item('users', 'admin-users', 'users', 'Foydalanuvchilar', 'admin.nav.users', ADMIN),
      item('reports', 'admin-reports', 'chart-bar', 'Hisobotlar', 'admin.nav.reports', OPERATIONS),
      item('analytics', 'admin-analytics', 'trend-up', "Tahliliy ma'lumotlar", 'admin.nav.analytics', OPERATIONS)
    ]},
    { key: 'requests', label: 'MUROJAATLAR', items: [
      item('serviceRequests', 'admin-service-requests', 'wrench', "Xizmat so'rovlari", 'admin.nav.serviceRequests', OPERATIONS),
      item('corruptionReports', 'admin-corruption-reports', 'shield-warning', 'Korrupsiya murojaatlari', 'admin.nav.corruptionReports', OPERATIONS),
      item('feedback', 'admin-feedback', 'chat-dots', 'Qayta aloqa', 'admin.nav.feedback', OPERATIONS),
      item('scientificAppeals', 'admin-murojaat', 'graduation-cap', 'Ilmiy daraja murojaatlari', 'admin.nav.scientificAppeals', OPERATIONS),
      item('passwordReset', 'admin-password-reset-requests', 'key', "Parol tiklash so'rovlari", 'admin.nav.passwordResetReq', ADMIN)
    ]},
    { key: 'content', label: 'KONTENT', items: [
      item('news', 'admin-news', 'newspaper', 'Yangiliklar', 'admin.nav.news', OPERATIONS),
      item('events', 'admin-events', 'calendar-dots', 'Tadbirlar', 'admin.nav.events', OPERATIONS),
      item('grants', 'admin-grants', 'gift', 'Grantlar', 'admin.nav.grants', OPERATIONS)
    ]},
    { key: 'account', label: 'TIZIM', items: [
      item('notifications', 'admin-notifications', 'bell', 'Bildirishnomalar', 'admin.nav.notifications', OPERATIONS, 'notifications'),
      item('settings', 'admin-settings', 'gear', 'Sozlamalar', 'admin.nav.settings', OPERATIONS, null, ['admin-settings-notifications', 'admin-settings-security', 'admin-settings-system']),
      item('commission', 'admin-commission', 'seal-check', 'Komissiya', 'admin.nav.commission', COMMISSION),
      item('leader', 'admin-leader-signing', 'signature', 'Rahbar imzosi', 'admin.nav.leaderSigning', LEADER)
    ]}
  ];

  var pageRoles = {
    'admin-dashboard': OPERATIONS,
    'admin-membership-requests': OPERATIONS,
    'admin-registry': OPERATIONS,
    'admin-regions': OPERATIONS,
    'admin-tasks': OPERATIONS,
    'admin-messages': OPERATIONS,
    'admin-users': ADMIN,
    'admin-reports': OPERATIONS,
    'admin-analytics': OPERATIONS,
    'admin-service-requests': OPERATIONS,
    'admin-corruption-reports': OPERATIONS,
    'admin-feedback': OPERATIONS,
    'admin-murojaat': OPERATIONS,
    'admin-password-reset-requests': ADMIN,
    'admin-news': OPERATIONS,
    'admin-events': OPERATIONS,
    'admin-grants': OPERATIONS,
    'admin-notifications': OPERATIONS,
    'admin-settings': OPERATIONS,
    'admin-settings-notifications': OPERATIONS,
    'admin-settings-security': OPERATIONS,
    'admin-settings-system': ADMIN,
    'admin-commission': COMMISSION,
    'admin-leader-signing': LEADER
  };

  function item(id, route, icon, label, i18n, roles, badge, aliases) {
    return { id: id, route: route, icon: icon, label: label, i18n: i18n, roles: roles, badge: badge || null, aliases: aliases || [] };
  }

  function currentPage() {
    return (location.pathname.split('/').pop() || 'admin-dashboard').replace(/\.html$/, '') || 'admin-dashboard';
  }

  function allowedRoles(page) {
    return (pageRoles[page || currentPage()] || []).slice();
  }

  function canSee(entry, role) {
    return entry.roles.indexOf(role) !== -1;
  }

  function active(entry, page) {
    return entry.route === page || entry.aliases.indexOf(page) !== -1;
  }

  function linkHtml(entry, page) {
    var selected = active(entry, page);
    return '<a href="' + entry.route + '" class="sidebar__nav-link' + (selected ? ' is-active' : '') + '"'
      + (selected ? ' aria-current="page"' : '') + ' data-nav-id="' + entry.id + '"'
      + ' data-i18n-title="' + entry.i18n + '" title="' + entry.label + '">'
      + '<span class="sidebar__nav-icon" aria-hidden="true"><i class="ph ph-' + entry.icon + '" aria-hidden="true"></i></span>'
      + '<span class="sidebar__nav-link-text" data-i18n="' + entry.i18n + '">' + entry.label + '</span>'
      + (entry.badge ? '<span class="unread-badge" data-nav-badge="' + entry.badge + '" hidden></span>' : '')
      + '</a>';
  }

  function mount(user) {
    var root = document.querySelector('[data-admin-navigation]');
    if (!root || !user || ALL_SHELL_ROLES.indexOf(user.role) === -1) return;
    var page = currentPage();
    var homeRoute = user.role === 'commission' ? 'admin-commission'
      : user.role === 'leader' ? 'admin-leader-signing' : 'admin-dashboard';
    var homeLabel = user.role === 'commission' ? 'Komissiya ish maydoniga qaytish'
      : user.role === 'leader' ? 'Rahbar ish maydoniga qaytish' : 'Boshqaruv paneliga qaytish';
    var body = '<div class="sidebar__header"><a class="sidebar__brand" href="' + homeRoute + '" aria-label="' + homeLabel + '">'
      + '<span class="sidebar__logo">N</span><span class="sidebar__title" data-i18n="admin.brand">O\'zNNTMA Admin</span></a>'
      + '<button type="button" class="sidebar__collapse" id="sidebarToggle" aria-label="Yon panelni yopish" aria-expanded="true" title="Yon panelni yopish">'
      + '<i class="ph ph-arrow-left" aria-hidden="true"></i></button></div>'
      + '<div class="sidebar__search" id="sidebarSearchTrigger"><span class="sidebar__nav-icon" aria-hidden="true"><i class="ph ph-magnifying-glass" aria-hidden="true"></i></span>'
      + '<input type="search" enterkeyhint="search" aria-label="Menyudan qidirish" placeholder="Qidirish"></div>'
      + '<nav class="sidebar__nav" aria-label="Admin menyusi">';
    sections.forEach(function (section) {
      var visible = section.items.filter(function (entry) { return canSee(entry, user.role); });
      if (!visible.length) return;
      body += '<div class="sidebar__nav-section"><div class="sidebar__nav-label">' + section.label + '</div>';
      visible.forEach(function (entry) { body += linkHtml(entry, page); });
      body += '</div>';
    });
    body += '<div class="sidebar__nav-section u-mt-auto"><a data-action="logout" href="admin-login" class="sidebar__nav-link logout">'
      + '<span class="sidebar__nav-icon" aria-hidden="true"><i class="ph ph-sign-out" aria-hidden="true"></i></span>'
      + '<span class="sidebar__nav-link-text" data-i18n="admin.nav.logout">Chiqish</span></a></div></nav>';
    root.className = 'sidebar';
    root.id = 'pactaSidebar';
    root.setAttribute('aria-label', 'Yon panel');
    root.innerHTML = body;
    root.setAttribute('aria-busy', 'false');
    if (window.ngoI18n) ngoI18n.onReady(function () { ngoI18n.apply(root); });
    wireSearch(root);
    wireLogout(root);
    hydrateBadges();
    document.dispatchEvent(new CustomEvent('NgoAdminNavigationReady', { detail: { user: user, page: page } }));
  }

  function wireSearch(root) {
    var input = root.querySelector('.sidebar__search input');
    if (!input) return;
    input.addEventListener('input', function () {
      var query = input.value.trim().toLocaleLowerCase();
      root.querySelectorAll('.sidebar__nav-link:not(.logout)').forEach(function (link) {
        link.hidden = !!query && (link.textContent || '').toLocaleLowerCase().indexOf(query) === -1;
      });
      root.querySelectorAll('.sidebar__nav-section').forEach(function (section) {
        var links = section.querySelectorAll('.sidebar__nav-link:not([hidden])');
        section.hidden = !links.length;
      });
    });
  }

  function wireLogout(root) {
    root.addEventListener('click', function (event) {
      var link = event.target.closest('[data-action="logout"]');
      if (!link || !window.NgoApi) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      NgoApi.logout().then(function () { location.replace('admin-login'); })
        .catch(function () { location.replace('admin-login'); });
    });
  }

  function setBadge(name, value) {
    var badge = document.querySelector('[data-nav-badge="' + name + '"]');
    if (!badge) return;
    var count = Math.max(0, Number(value) || 0);
    badge.hidden = !count;
    badge.textContent = count > 99 ? '99+' : String(count || '');
  }

  function hydrateBadges() {
    if (!window.NgoApi) return;
    if (document.querySelector('[data-nav-badge="messages"]')) {
      NgoApi.get('/admin/messages/threads?limit=100').then(function (res) {
        var unread = (res.items || []).reduce(function (sum, thread) { return sum + Number(thread.unread_count || 0); }, 0);
        setBadge('messages', unread);
      }).catch(function () {});
    }
    if (document.querySelector('[data-nav-badge="notifications"]')) {
      NgoApi.get('/admin/notifications').then(function (res) {
        setBadge('notifications', (res.items || []).filter(function (notice) { return !notice.is_read; }).length);
      }).catch(function () {});
    }
  }

  window.NgoAdminNavigation = {
    mount: mount,
    currentPage: currentPage,
    allowedRoles: allowedRoles,
    setBadge: setBadge,
    definition: sections,
    pageRoles: pageRoles
  };
})();
