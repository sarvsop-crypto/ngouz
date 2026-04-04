(function () {
  /* ── Load Phosphor Icons 2.1 ─────────────────────────────── */
  var _ph = document.createElement('script');
  _ph.src = 'https://unpkg.com/@phosphor-icons/web@2.1.1';
  document.head.appendChild(_ph);

  /* ── Navigation map ──────────────────────────────────────── */
  var NAV = [
    {
      label: 'Asosiy',
      items: [
        { href: 'cabinet-dashboard.html',    label: 'Dashboard',          icon: 'squares-four'      },
        { href: 'cabinet-organization.html', label: 'Hududiy kabinet',    icon: 'user'              },
        { href: 'cabinet-applications.html', label: 'Arizalar',           icon: 'clipboard-text'    },
        { href: 'cabinet-approvals.html',    label: 'Tasdiqlashlar',      icon: 'check-square'      }
      ]
    },
    {
      label: 'Reyestr',
      items: [
        { href: 'cabinet-nnt-data.html',    label: "NNT ma'lumotlari",   icon: 'database'               },
        { href: 'cabinet-documents.html',   label: 'Hujjatlar',          icon: 'files'                  },
        { href: 'cabinet-reports.html',     label: 'Hisobotlar',         icon: 'chart-bar'              },
        { href: 'cabinet-audit.html',       label: 'Audit jurnali',      icon: 'list-magnifying-glass'  }
      ]
    },
    {
      label: 'Kontent',
      items: [
        { href: 'cabinet-news.html',          label: 'Yangiliklar',      icon: 'newspaper'         },
        { href: 'cabinet-events.html',        label: 'Tadbirlar',        icon: 'calendar'          },
        { href: 'cabinet-grants.html',        label: 'Grantlar',         icon: 'trophy'            },
        { href: 'cabinet-notifications.html', label: 'Bildirishnomalar', icon: 'bell'              }
      ]
    },
    {
      label: 'Tizim',
      items: [
        { href: 'cabinet-calendar.html', label: 'Kalendar',           icon: 'calendar-blank' },
        { href: 'cabinet-support.html',  label: 'Murojaatlar',        icon: 'chat-dots'      },
        { href: 'cabinet-api.html',      label: 'API va integratsiya', icon: 'code'           },
        { href: 'cabinet-settings.html', label: 'Sozlamalar',         icon: 'gear'           }
      ]
    }
  ];

  function ph(name, cls) {
    var c = cls ? ' class="' + cls + '"' : '';
    return '<ph-' + name + c + ' aria-hidden="true"></ph-' + name + '>';
  }

  function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'cabinet-dashboard.html';
  }

  function getPageTitle() {
    var heading = document.querySelector('.page-heading h1');
    if (heading) return heading.textContent.replace(/\s+/g, ' ').trim();
    if (document.title) return document.title.replace(/\s*[-|].*$/, '').trim();
    return 'Kabinet';
  }

  function buildTopbar() {
    var title = getPageTitle();
    return (
      '<div class="topbar-title">O\'zNNTMA <span>Cabinet</span> — ' + title + '</div>' +
      '<div class="topbar-right">' +
        '<div class="topbar-badge" title="Bildirishnomalar" role="button" tabindex="0" aria-label="Bildirishnomalar">' +
          ph('bell') +
          '<span class="dot" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="user-chip" role="button" tabindex="0">' +
          '<div class="user-avatar">AB</div>' +
          '<div class="user-info">' +
            '<div class="user-name">Admin Bekmurod</div>' +
            '<div class="user-role">Platforma administratori</div>' +
          '</div>' +
        '</div>' +
        '<button class="btn-logout" type="button" onclick="window.location.href=\'cabinet-login.html\'">Chiqish</button>' +
      '</div>'
    );
  }

  function buildSidebar(currentPage) {
    var html =
      '<div class="sidebar-logo">' +
        '<div class="logo-icon">NNT</div>' +
        '<div class="logo-text">O\'zNNTMA<span>Member cabinet</span></div>' +
      '</div>';

    NAV.forEach(function (section) {
      html += '<div class="sidebar-section"><div class="sidebar-section-label">' + section.label + '</div>';
      section.items.forEach(function (item) {
        var active = item.href === currentPage ? ' active' : '';
        html += '<a class="nav-item' + active + '" href="' + item.href + '">' + ph(item.icon, 'nav-icon') + item.label + '</a>';
      });
      html += '</div>';
    });

    return html;
  }

  function updateDateChip() {
    var dateChip = document.getElementById('js-date');
    if (!dateChip) return;
    var d = new Date();
    var months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    dateChip.textContent = d.getFullYear() + '-yil, ' + d.getDate() + '-' + months[d.getMonth()];
  }

  function init() {
    var app = document.querySelector('.app');
    if (!app) return;

    var currentPage = getCurrentPage();

    var sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = buildSidebar(currentPage);

    var topbar = document.createElement('header');
    topbar.className = 'topbar';
    topbar.innerHTML = buildTopbar();

    var main = app.querySelector('.main');
    app.insertBefore(sidebar, main);
    app.insertBefore(topbar, main);

    updateDateChip();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
