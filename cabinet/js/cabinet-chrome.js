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

  var NAV_SECTIONS = [
    {
      label: 'ASOSIY',
      items: [
        { key: 'dashboard',     href: 'cabinet-dashboard.html',     title: 'Bosh sahifa',    icon: 'ph-squares-four',   text: 'Bosh sahifa' },
        { key: 'organization',  href: 'cabinet-organization.html',  title: 'Tashkilotim',    icon: 'ph-buildings',      text: 'Tashkilotim' },
        { key: 'applications',  href: 'cabinet-applications.html',  title: 'Ariza holati',   icon: 'ph-clipboard-text', text: 'Ariza holati' },
        { key: 'reports',       href: 'cabinet-reports.html',       title: 'Hisobotlar',     icon: 'ph-chart-bar',      text: 'Hisobotlar' },
        { key: 'documents',     href: 'cabinet-documents.html',     title: 'Hujjatlar',      icon: 'ph-files',          text: 'Hujjatlar' }
      ]
    },
    {
      label: 'XABARNOMA',
      items: [
        { key: 'events',        href: 'cabinet-events.html',        title: 'Tadbirlar',      icon: 'ph-calendar-check', text: 'Tadbirlar' },
        { key: 'news',          href: 'cabinet-news.html',          title: 'Yangiliklar',    icon: 'ph-newspaper',      text: 'Yangiliklar' },
        { key: 'notifications', href: 'cabinet-notifications.html', title: 'Bildirishnomalar', icon: 'ph-bell',         text: 'Bildirishnomalar' }
      ]
    },
    {
      label: 'XIZMATLAR',
      items: [
        { key: 'grants',        href: 'cabinet-grants.html',        title: 'Grantlar',       icon: 'ph-trophy',            text: 'Grantlar' },
        { key: 'support',       href: 'cabinet-support.html',       title: 'Murojaat',       icon: 'ph-chat-circle-text',  text: 'Murojaat' },
        { key: 'settings',      href: 'cabinet-settings.html',      title: 'Sozlamalar',     icon: 'ph-gear',              text: 'Sozlamalar' }
      ]
    }
  ];

  var PANEL_ITEMS = [
    {
      icon: 'ph-file-text',
      title: 'Ustav yangi tahrir so' + RSQUO + 'raldi',
      body:  'Arizangiz bo' + RSQUO + 'yicha qo' + RSQUO + 'shimcha hujjat talab qilinmoqda.',
      time:  '2 daqiqa oldin',
      unread: true
    },
    {
      icon: 'ph-magnifying-glass',
      title: 'Tekshiruv boshlandi',
      body:  'ARZ-2026-0418 arizangiz tekshiruv bosqichiga o' + RSQUO + 'tkazildi.',
      time:  '1 soat oldin',
      unread: true
    },
    {
      icon: 'ph-calendar',
      title: 'Yangi tadbir e' + RSQUO + 'lon qilindi',
      body:  'O' + RSQUO + 'zNNTMA yillik anjumani 2026 uchun ro' + RSQUO + 'yxat ochildi.',
      time:  '1 kun oldin',
      unread: false
    }
  ];

  function buildNavLink(item, activeKey) {
    var activeClass = item.key === activeKey ? ' is-active' : '';
    return (
      '<a href="' + item.href + '" class="sidebar__nav-link' + activeClass + '" title="' + item.title + '">' +
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
          '<button type="button" class="sidebar__collapse" id="sidebarToggle" aria-label="Collapse sidebar" aria-expanded="true">&lsaquo;</button>' +
        '</div>' +
        '<div class="sidebar__search" id="sidebarSearchTrigger">' +
          '<span class="sidebar__nav-icon" aria-hidden="true"><i class="ph ph-magnifying-glass"></i></span>' +
          '<input type="text" placeholder="Qidirish" aria-label="Qidirish" />' +
        '</div>' +
        '<nav class="sidebar__nav">' +
          sections +
          '<div class="sidebar__nav-section u-mt-auto">' +
            '<a href="cabinet-login.html" class="sidebar__nav-link logout" title="Chiqish">' +
              '<span class="sidebar__nav-icon"><i class="ph ph-sign-out"></i></span>' +
              '<span class="sidebar__nav-link-text">Chiqish</span>' +
            '</a>' +
          '</div>' +
        '</nav>' +
      '</aside>'
    );
  }

  function buildNotificationsPanel() {
    var items = PANEL_ITEMS.map(function (n) {
      var dot = n.unread ? ' <span class="notifications-panel__dot"></span>' : '';
      return (
        '<div class="notifications-panel__item">' +
          '<div class="notifications-panel__icon"><i class="ph ' + n.icon + '"></i></div>' +
          '<div class="notifications-panel__content">' +
            '<p class="notifications-panel__item-title">' + n.title + dot + '</p>' +
            '<p class="notifications-panel__item-body">' + n.body + '</p>' +
            '<p class="notifications-panel__item-time">' + n.time + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="notifications-panel" id="notificationsPanel" role="dialog" aria-label="Bildirishnomalar" aria-modal="true" aria-hidden="true">' +
        '<div class="notifications-panel__header">' +
          '<h2 class="notifications-panel__title">Bildirishnomalar</h2>' +
        '</div>' +
        '<div class="notifications-panel__list">' + items + '</div>' +
        '<div class="notifications-panel__footer">' +
          '<button type="button" class="notifications-panel__mark-read">Barchasini o' + RSQUO + 'qildi deb belgilash</button>' +
          '<a href="cabinet-notifications.html" class="btn btn--primary">Barcha bildirishnomalar</a>' +
        '</div>' +
      '</div>'
    );
  }

  function mount() {
    var activeKey = document.body.getAttribute('data-nav-active') || '';
    var sidebarRoot = document.getElementById('cabinet-sidebar-root');
    var panelRoot   = document.getElementById('cabinet-notifications-root');
    if (sidebarRoot) sidebarRoot.outerHTML = buildSidebar(activeKey);
    if (panelRoot)   panelRoot.outerHTML   = buildNotificationsPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
