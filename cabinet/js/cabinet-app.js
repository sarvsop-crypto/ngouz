(function () {
  var iconsScript = document.createElement('script');
  iconsScript.src = 'https://unpkg.com/@phosphor-icons/web@2.1.1';
  document.head.appendChild(iconsScript);

  function ensureGlobalStyles() {
    if (document.querySelector('link[data-cabinet-admin-style]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../css/style.css';
    link.setAttribute('data-cabinet-admin-style', 'true');
    document.head.appendChild(link);
  }

  function buildSiteHeader() {
    return (
      '<header class="site-header">' +
        '<div class="container nav">' +
          '<a class="brand" href="../index.html"><span class="brand-dot">NGO</span>ngo.uz</a>' +
          '<span class="cab-panel-label">A\'zo Kabineti</span>' +
          '<div class="cab-header-right">' +
            '<a class="cab-site-link" href="../index.html">Asosiy sayt</a>' +
            '<a class="contact-btn" href="cabinet-login.html">Chiqish</a>' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function buildFooter() {
    return (
      '<footer class="cab-footer">' +
        '<div class="container">' +
          '<span>© 2019-2026 O\'zNNTMA</span>' +
          '<a href="../contact.html">Bog\'lanish</a>' +
          '<a href="../index.html">Asosiy sayt ↗</a>' +
        '</div>' +
      '</footer>'
    );
  }

  function getSubtopContent() {
    var heading = document.querySelector('.page-heading h1');
    var subtitle = document.querySelector('.page-sub');

    var titleText = heading
      ? heading.textContent.replace(/\s+/g, ' ').trim()
      : "A'zo kabineti";

    var subText = subtitle
      ? subtitle.textContent.replace(/\s+/g, ' ').trim()
      : "A'zolik arizasi va shartnoma jarayoni uchun soddalashtirilgan kabinet.";

    return { title: titleText, subtitle: subText };
  }

  function buildSubtopBar() {
    var subtop = getSubtopContent();
    return (
      '<section class="grid-bg cabinet-subtop">' +
        '<div class="container hero center">' +
          '<h1>' + subtop.title + '</h1>' +
          '<p class="sub">' + subtop.subtitle + '</p>' +
        '</div>' +
      '</section>'
    );
  }

  function removeDuplicateInlineHeading() {
    var heading = document.querySelector('.page-heading h1');
    var subtitle = document.querySelector('.page-sub');
    var pageHeading = document.querySelector('.page-heading');

    if (heading) heading.remove();
    if (subtitle) subtitle.remove();

    if (pageHeading && pageHeading.textContent.replace(/\s+/g, '').length === 0) {
      pageHeading.remove();
    }
  }

  function initHeaderFooter() {
    if (!document.querySelector('.site-header')) {
      document.body.insertAdjacentHTML('afterbegin', buildSiteHeader());
    }

    if (!document.querySelector('.cabinet-subtop')) {
      var header = document.querySelector('.site-header');
      if (header) {
        header.insertAdjacentHTML('afterend', buildSubtopBar());
        removeDuplicateInlineHeading();
      }
    }

    var app = document.querySelector('.app');
    if (app && !document.querySelector('.cab-footer')) {
      app.insertAdjacentHTML('afterend', buildFooter());
    }
  }

  var NAV = [
    { href: 'cabinet-dashboard.html', label: 'Bosh sahifa' },
    { href: 'cabinet-applications.html', label: 'A\'zolik arizasi' },
    { href: 'cabinet-documents.html', label: 'Shartnoma hujjatlari' },
    { href: 'cabinet-support.html', label: 'Murojaat' },
    { href: 'cabinet-settings.html', label: 'Sozlamalar' }
  ];

  function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'cabinet-dashboard.html';
  }

  function buildNavPanel(currentPage) {
    var html =
      '<aside class="cab-nav-panel card">' +
      '<h3>Kabinet bo\'limlari</h3>' +
      '<nav class="cab-menu">';

    NAV.forEach(function (item) {
      var active = item.href === currentPage ? ' active' : '';
      html += '<a class="' + active.trim() + '" href="' + item.href + '">' + item.label + '</a>';
    });

    html += '</nav></aside>';
    return html;
  }

  function updateDateChip() {
    var dateChip = document.getElementById('js-date');
    if (!dateChip) return;
    var d = new Date();
    var months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    dateChip.textContent = d.getFullYear() + '-yil, ' + d.getDate() + '-' + months[d.getMonth()];
  }

  function initCabinetLayout() {
    var app = document.querySelector('.app');
    if (!app) return;

    var main = app.querySelector('.main');
    if (!main || main.querySelector('.cab-layout')) return;

    var currentPage = getCurrentPage();
    var originalChildren = Array.prototype.slice.call(main.childNodes);

    var layout = document.createElement('div');
    layout.className = 'cab-layout';

    var navWrap = document.createElement('div');
    navWrap.innerHTML = buildNavPanel(currentPage);

    var content = document.createElement('div');
    content.className = 'cab-main-content';

    originalChildren.forEach(function (node) {
      content.appendChild(node);
    });

    layout.appendChild(navWrap.firstElementChild);
    layout.appendChild(content);

    main.appendChild(layout);

    updateDateChip();
  }

  function init() {
    ensureGlobalStyles();
    initHeaderFooter();
    initCabinetLayout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
