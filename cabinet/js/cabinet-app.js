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
        '<div class="utility-bar">' +
          '<div class="container utility-row">' +
            '<div class="utility-left">' +
              '<span>Toshkent sh., Shayxontohur t., Furqat ko\'chasi, 1A</span>' +
              '<a href="tel:+998555030512">(+998 55) 503-05-12</a>' +
            '</div>' +
            '<div class="utility-right">' +
              '<a href="../index.html">O\'zbekcha</a>' +
              '<a href="../ru/index.html">Russian</a>' +
              '<a href="../en/index.html">English</a>' +
              '<button type="button" class="vis-btn">Ko\'z ojizlar uchun</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="container nav">' +
          '<a class="brand" href="../index.html"><span class="brand-dot">NGO</span>ngo.uz</a>' +
          '<nav class="menu">' +
            '<div class="nav-item has-dropdown">' +
              '<a href="../about.html">Biz haqimizda <ph-caret-down weight="bold" aria-hidden="true"></ph-caret-down></a>' +
              '<div class="dropdown">' +
                '<a href="../who-we-are.html">Tashkilot haqida</a>' +
                '<a href="../leadership.html">Rahbariyat</a>' +
                '<a href="../nnt-school.html">NNTlar maktabi</a>' +
                '<a href="../online-library.html">Onlayn kutubxona</a>' +
              '</div>' +
            '</div>' +
            '<a href="../news.html">Yangiliklar</a>' +
            '<a href="../events.html">Tadbirlar</a>' +
            '<div class="nav-item has-dropdown">' +
              '<a href="../services.html">Xizmatlar <ph-caret-down weight="bold" aria-hidden="true"></ph-caret-down></a>' +
              '<div class="dropdown">' +
                '<a href="../official-docs.html">Rasmiy hujjatlar</a>' +
                '<a href="../reporting-forms.html">Hisobot shakllari</a>' +
                '<a href="../faq.html">Savol-javob</a>' +
                '<a href="../service-request.html">Murojaat yuborish</a>' +
              '</div>' +
            '</div>' +
            '<a href="../awards.html">Hamkorlar</a>' +
          '</nav>' +
          '<button class="hamburger" id="cabinetHamburgerBtn" type="button" aria-label="Menyu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
          '<a class="contact-btn" href="../membership.html">A\'zo bo\'lish</a>' +
        '</div>' +
      '</header>'
    );
  }

  function buildFooter() {
    return (
      '<section class="dark-cta">' +
        '<div class="container row">' +
          '<h2>Rasmiy murojaat, hamkorlik va ma\'lumot olish uchun biz bilan bog\'laning.</h2>' +
          '<a class="btn" href="../contact.html">Bog\'lanish</a>' +
        '</div>' +
      '</section>' +
      '<footer class="site-footer">' +
        '<div class="container footer-top">' +
          '<div class="footer-info">' +
            '<h4>Tezkor havolalar</h4>' +
            '<a href="../about.html">Biz haqimizda</a>' +
            '<a href="../news.html">Yangiliklar</a>' +
            '<a href="../events.html">Tadbirlarimiz</a>' +
            '<a href="../membership.html">A\'zo bo\'lish</a>' +
            '<a href="../projects.html">Grant va tanlovlar</a>' +
            '<h4>Bog\'lanish</h4>' +
            '<p>Tel: (+998 55) 503-05-12</p>' +
            '<p>1A, Furqat ko\'chasi, Shayxontohur t., Toshkent, 100170</p>' +
            '<h4>Ijtimoiy tarmoqlar</h4>' +
            '<a href="https://facebook.com/uznntma1" target="_blank" rel="noopener noreferrer">Facebook - @uznntma1</a>' +
            '<a href="https://instagram.com/uznntma" target="_blank" rel="noopener noreferrer">Instagram - @uznntma</a>' +
            '<a href="https://t.me/UzNNTMA1" target="_blank" rel="noopener noreferrer">Telegram - @UzNNTMA1</a>' +
            '<a href="https://youtube.com/@uznntma" target="_blank" rel="noopener noreferrer">YouTube - @uznntma</a>' +
          '</div>' +
          '<div class="footer-map-col">' +
            '<iframe src="https://yandex.uz/map-widget/v1/?ll=69.240568%2C41.312565&z=17&pt=69.240568%2C41.312565%2Cpm2rdm" frameborder="0" allowfullscreen loading="lazy" title="Manzil xaritasi"></iframe>' +
          '</div>' +
        '</div>' +
        '<div class="container footer-bottom">' +
          '<span>© COPYRIGHT 2019-2026 O\'zNNTMA</span>' +
          '<a href="https://yandex.com/maps/?text=41.312565,69.240568&si=grwyen5zr7arv86fckt25k4vmw" target="_blank" rel="noopener noreferrer" style="color:var(--neutral-300)">Manzil: 1A, Furqat ko\'chasi, Shayxontohur t., Toshkent, 100170</a>' +
        '</div>' +
      '</footer>'
    );
  }
  function getSubtopContent() {
    var heading = document.querySelector('.page-heading h1');
    var subtitle = document.querySelector('.page-sub');

    var titleText = heading
      ? heading.textContent.replace(/\s+/g, ' ').trim()
      : 'Kabinet boshqaruvi';

    var subText = subtitle
      ? subtitle.textContent.replace(/\s+/g, ' ').trim()
      : "NNT a'zolari va tashkilotlar uchun yagona boshqaruv muhiti.";

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
  function initHeaderFooter() {
    if (!document.querySelector('.site-header')) {
      document.body.insertAdjacentHTML('afterbegin', buildSiteHeader());
    }

    if (!document.querySelector('.cabinet-subtop')) {
      var header = document.querySelector('.site-header');
      if (header) {
        header.insertAdjacentHTML('afterend', buildSubtopBar());
      }
    }

    var app = document.querySelector('.app');
    if (app && !document.querySelector('.site-footer')) {
      app.insertAdjacentHTML('afterend', buildFooter());
    }

    var hamburgerBtn = document.getElementById('cabinetHamburgerBtn');
    if (hamburgerBtn && !document.getElementById('cabinetMobileNav')) {
      var mobileNav = document.createElement('div');
      mobileNav.className = 'mobile-nav';
      mobileNav.id = 'cabinetMobileNav';
      mobileNav.innerHTML =
        '<span class="mobile-nav-label">Asosiy bo\'limlar</span>' +
        '<a href="../about.html">Biz haqimizda</a>' +
        '<a href="../news.html">Yangiliklar</a>' +
        '<a href="../events.html">Tadbirlar</a>' +
        '<a href="../services.html">Xizmatlar</a>' +
        '<a href="../awards.html">Hamkorlar</a>' +
        '<a href="../membership.html" class="mobile-nav-cta">A\'zo bo\'lish</a>';
      document.body.appendChild(mobileNav);

      var toggleMobileNav = function (open) {
        var isOpen = typeof open === 'boolean' ? open : !mobileNav.classList.contains('is-open');
        mobileNav.classList.toggle('is-open', isOpen);
        hamburgerBtn.classList.toggle('is-open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };

      hamburgerBtn.addEventListener('click', function () {
        toggleMobileNav();
      });

      mobileNav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') toggleMobileNav(false);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') toggleMobileNav(false);
      });
    }
  }

  var NAV = [
    {
      label: 'Asosiy',
      items: [
        { href: 'cabinet-dashboard.html', label: 'Dashboard' },
        { href: 'cabinet-organization.html', label: 'Hududiy kabinet' },
        { href: 'cabinet-applications.html', label: 'Arizalar' },
        { href: 'cabinet-approvals.html', label: 'Tasdiqlashlar' }
      ]
    },
    {
      label: 'Reyestr',
      items: [
        { href: 'cabinet-nnt-data.html', label: "NNT ma'lumotlari" },
        { href: 'cabinet-documents.html', label: 'Hujjatlar' },
        { href: 'cabinet-reports.html', label: 'Hisobotlar' },
        { href: 'cabinet-audit.html', label: 'Audit jurnali' }
      ]
    },
    {
      label: 'Kontent',
      items: [
        { href: 'cabinet-news.html', label: 'Yangiliklar' },
        { href: 'cabinet-events.html', label: 'Tadbirlar' },
        { href: 'cabinet-grants.html', label: 'Grantlar' },
        { href: 'cabinet-notifications.html', label: 'Bildirishnomalar' }
      ]
    },
    {
      label: 'Tizim',
      items: [
        { href: 'cabinet-calendar.html', label: 'Kalendar' },
        { href: 'cabinet-support.html', label: 'Murojaatlar' },
        { href: 'cabinet-api.html', label: 'API va integratsiya' },
        { href: 'cabinet-settings.html', label: 'Sozlamalar' }
      ]
    }
  ];

  function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'cabinet-dashboard.html';
  }

  function buildNavPanel(currentPage) {
    var html =
      '<aside class="cab-nav-panel card">' +
      '<h3>Kabinet bo\'limlari</h3>' +
      '<nav class="cab-menu">';

    NAV.forEach(function (section) {
      html += '<div class="cab-menu-group">' + section.label + '</div>';
      section.items.forEach(function (item) {
        var active = item.href === currentPage ? ' active' : '';
        html += '<a class="' + active.trim() + '" href="' + item.href + '">' + item.label + '</a>';
      });
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

