/**
 * content.js — fetches data/*.json from the GitHub repo and renders
 * dynamic content on public-facing pages.
 */

(function () {
  var REPO_RAW = 'https://raw.githubusercontent.com/sarvsop-crypto/ngo/main/data/';

  function fetchJSON(file, cb) {
    fetch(REPO_RAW + file + '.json?_=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(cb)
      .catch(function () { cb([]); });
  }

  var UZ_MONTHS = ['Yan','Feb','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];

  function fmtDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '.' + p[1] + '.' + p[0];
  }

  function dateDay(iso) {
    if (!iso) return '';
    return iso.split('-')[2] || '';
  }

  function dateMonthAbbr(iso) {
    if (!iso) return '';
    var m = parseInt(iso.split('-')[1], 10);
    return UZ_MONTHS[m - 1] || '';
  }

  function bodyToHTML(text) {
    if (!text) return '';
    return text.split(/\n\n+/).map(function (p) {
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /* ── News ─────────────────────────────────────────────────── */
  function renderNewsHome(items, container) {
    var featured = items.find(function (n) { return n.featured; }) || items[0];
    var rest = items.filter(function (n) { return n !== featured; }).slice(0, 3);

    var html = '<div class="top-story-grid">'
      + '<article class="top-story-main">'
      + '<span class="tag">' + featured.category + ' · ' + fmtDate(featured.date) + '</span>'
      + '<h3>' + featured.title + '</h3>'
      + '<p>' + featured.excerpt + '</p>'
      + '<a class="btn" href="news-detail.html?id=' + featured.id + '">Batafsil o\'qish</a>'
      + '</article>'
      + '<div class="top-story-list">';

    rest.forEach(function (n) {
      html += '<a class="news-item" href="news-detail.html?id=' + n.id + '">'
        + '<span class="tag">' + n.category + ' · ' + fmtDate(n.date) + '</span>'
        + '<h4>' + n.title + '</h4>'
        + '<p>' + n.excerpt + '</p>'
        + '</a>';
    });

    html += '</div></div>';
    container.innerHTML = html;
  }

  function renderNewsPage(items, container) {
    if (!items.length) { container.innerHTML = '<p style="color:rgba(180,220,255,.5)">Yangiliklar topilmadi.</p>'; return; }
    var html = '<div class="gov-news-grid">';
    items.forEach(function (n) {
      var url = 'news-detail.html?id=' + n.id;
      var cat = n.category || '';
      html += '<article class="gov-news-card" data-cat="' + cat + '">'
        + '<a href="' + url + '" class="gov-news-img" tabindex="-1" aria-hidden="true">'
        + '<div class="gov-news-img-inner"></div>'
        + '<div class="gov-news-overlay"></div>'
        + '</a>'
        + '<div class="gov-news-content">'
        + '<div class="gov-news-header">'
        + '<div class="gov-news-date"><b>' + dateDay(n.date) + '</b><span>' + dateMonthAbbr(n.date) + '</span></div>'
        + '<a href="' + url + '" class="gov-news-title">' + n.title + '</a>'
        + '</div>'
        + '<a href="' + url + '" class="gov-news-excerpt">' + n.excerpt + '</a>'
        + '<div class="gov-news-footer">'
        + '<span>' + fmtDate(n.date) + '</span>'
        + '<a href="' + url + '">' + cat + '</a>'
        + '</div>'
        + '</div>'
        + '</article>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function coverGradient(key) {
    var map = {
      'TADBIR':   'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)',
      'TAHLIL':   'linear-gradient(135deg,#3b1a5c 0%,#7c3aed 100%)',
      "E'LON":    'linear-gradient(135deg,#5c3a1a 0%,#d97706 100%)',
      'PRESS':    'linear-gradient(135deg,#1a4a5c 0%,#0891b2 100%)',
      'upcoming': 'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)',
    };
    return map[key] || 'linear-gradient(135deg,#1a5c35 0%,#2e7d52 100%)';
  }

  function shareButtons(pageUrl, title) {
    var u = encodeURIComponent(pageUrl);
    var t = encodeURIComponent(title);
    var fb = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
    var tg = 'https://t.me/share/url?url=' + u + '&text=' + t;
    var tw = 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t;
    return '<div class="detail-share-row">'
      + '<span class="detail-share-label">Ulashish:</span>'
      + '<a href="' + fb + '" target="_blank" rel="noopener noreferrer" class="detail-share-btn" aria-label="Facebook">'
      + '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>'
      + '<a href="' + tg + '" target="_blank" rel="noopener noreferrer" class="detail-share-btn" aria-label="Telegram">'
      + '<svg width="15" height="15" viewBox="0 0 496 512"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239-92.1c11.1-4 20.8 2.7 17.3 19.4z"/></svg></a>'
      + '<a href="' + tw + '" target="_blank" rel="noopener noreferrer" class="detail-share-btn" aria-label="X / Twitter">'
      + '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>'
      + '</div>';
  }

  function renderNewsDetail(items, container, id) {
    var item = id ? items.find(function (n) { return n.id === id; }) : null;
    if (!item) item = items[0];
    if (!item) { container.innerHTML = '<p>Yangilik topilmadi.</p>'; return; }

    document.title = item.title + ' - ngo.uz';
    var cat = item.category || '';
    var pageUrl = window.location.href;

    var others = items.filter(function (n) { return n !== item; }).slice(0, 8);
    var sidebar = '<aside class="detail-sidebar"><p class="detail-sidebar-heading">Boshqa yangiliklar</p>';
    others.forEach(function (n) {
      sidebar += '<a href="news-detail.html?id=' + n.id + '" class="detail-sidebar-item">'
        + '<p class="detail-sidebar-item-date">' + fmtDate(n.date) + ' · ' + (n.category || '') + '</p>'
        + '<p class="detail-sidebar-item-title">' + n.title + '</p>'
        + '</a>';
    });
    sidebar += '</aside>';

    container.innerHTML = '<div class="detail-layout">'
      + '<div class="detail-paper">'
      + '<div class="detail-top-bar">'
      + '<p class="detail-breadcrumbs"><a href="index.html">Bosh sahifa</a><span class="detail-bc-sep">›</span><a href="news.html">Yangiliklar</a><span class="detail-bc-sep">›</span><span>' + cat + '</span></p>'
      + '<button class="detail-print-btn" onclick="window.print()" aria-label="Chop etish"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>'
      + '</div>'
      + '<h1 class="detail-title">' + item.title + '</h1>'
      + '<p class="detail-meta"><span>' + fmtDate(item.date) + '</span><span class="detail-meta-sep">/</span><a href="news.html">' + cat + '</a></p>'
      + '<div class="detail-cover" style="background:' + coverGradient(cat) + '"></div>'
      + '<div class="detail-body">' + bodyToHTML(item.body || item.excerpt) + '</div>'
      + '<div class="detail-tags"><a href="news.html" class="detail-tag">' + cat + '</a></div>'
      + shareButtons(pageUrl, item.title)
      + '</div>'
      + sidebar
      + '</div>';
  }

  /* ── Events ───────────────────────────────────────────────── */
  function renderEventsHome(items, upcomingEl, pastEl) {
    var upcoming = items.filter(function (e) { return e.status === 'upcoming'; });
    var past     = items.filter(function (e) { return e.status === 'past'; });

    function listHTML(arr) {
      return arr.map(function (e) {
        return '<a class="item" href="event-detail.html?id=' + e.id + '">'
          + '<h4>' + e.title + '</h4>'
          + '<p>' + e.dateLabel + (e.location ? ' · ' + e.location : '')
          + (e.participants ? ' · ' + e.participants + ' ishtirokchi' : '')
          + (e.deadline ? ' · Ariza: ' + e.deadlineLabel : '') + '</p></a>';
      }).join('');
    }

    if (upcomingEl) upcomingEl.innerHTML = listHTML(upcoming);
    if (pastEl)     pastEl.innerHTML     = listHTML(past);
  }

  function renderEventsPage(items, container) {
    if (!items.length) { container.innerHTML = '<p style="color:rgba(180,220,255,.5)">Tadbirlar topilmadi.</p>'; return; }
    var upcoming = items.filter(function (e) { return e.status === 'upcoming'; });
    var past     = items.filter(function (e) { return e.status === 'past'; });

    function sectionHTML(arr, label) {
      if (!arr.length) return '';
      var rows = arr.map(function (e) {
        return '<article class="card">'
          + '<span class="tag">' + e.dateLabel + (e.status === 'upcoming' ? ' · Rejalashtirilgan' : ' · Bo\'lib o\'tdi') + '</span>'
          + '<h3>' + e.title + '</h3>'
          + '<p>' + e.description + '</p>'
          + (e.location ? '<p style="font-size:13px;color:rgba(180,220,255,.5);margin-top:6px"><ph-map-pin weight="fill" style="font-size:13px"></ph-map-pin> ' + e.location + '</p>' : '')
          + (e.deadline ? '<p style="font-size:13px;color:#00b4d8;margin-top:4px">Ariza muddati: ' + e.deadlineLabel + '</p>' : '')
          + '<a class="btn" href="event-detail.html?id=' + e.id + '" style="margin-top:14px;display:inline-block">Batafsil</a>'
          + '</article>';
      }).join('');
      return '<h2 class="section-title" style="margin-top:32px">' + label + '</h2><div class="cards">' + rows + '</div>';
    }

    container.innerHTML = sectionHTML(upcoming, 'Rejalashtirilgan tadbirlar') + sectionHTML(past, 'Bo\'lib o\'tgan tadbirlar');
  }

  function renderEventDetail(items, container, id) {
    var item = id ? items.find(function (e) { return e.id === id; }) : null;
    if (!item) item = items[0];
    if (!item) { container.innerHTML = '<p>Tadbir topilmadi.</p>'; return; }

    document.title = item.title + ' - ngo.uz';
    var pageUrl = window.location.href;
    var statusKey = item.status || '';
    var statusLabel = statusKey === 'upcoming' ? 'Rejalashtirilgan' : "Bo'lib o'tdi";

    var body = bodyToHTML(item.description)
      + (item.location ? '<p><strong>Joyi:</strong> ' + item.location + '</p>' : '')
      + (item.participants ? '<p><strong>Ishtirokchilar:</strong> ' + item.participants + ' kishi</p>' : '')
      + (item.deadline ? '<p><strong>Ariza muddati:</strong> ' + item.deadlineLabel + '</p>' : '');

    var others = items.filter(function (e) { return e !== item; }).slice(0, 8);
    var sidebar = '<aside class="detail-sidebar"><p class="detail-sidebar-heading">Boshqa tadbirlar</p>';
    others.forEach(function (e) {
      sidebar += '<a href="event-detail.html?id=' + e.id + '" class="detail-sidebar-item">'
        + '<p class="detail-sidebar-item-date">' + e.dateLabel + '</p>'
        + '<p class="detail-sidebar-item-title">' + e.title + '</p>'
        + '</a>';
    });
    sidebar += '</aside>';

    container.innerHTML = '<div class="detail-layout">'
      + '<div class="detail-paper">'
      + '<div class="detail-top-bar">'
      + '<p class="detail-breadcrumbs"><a href="index.html">Bosh sahifa</a><span class="detail-bc-sep">›</span><a href="events.html">Tadbirlar</a><span class="detail-bc-sep">›</span><span>' + statusLabel + '</span></p>'
      + '<button class="detail-print-btn" onclick="window.print()" aria-label="Chop etish"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>'
      + '</div>'
      + '<h1 class="detail-title">' + item.title + '</h1>'
      + '<p class="detail-meta"><span>' + item.dateLabel + '</span><span class="detail-meta-sep">/</span><a href="events.html">' + statusLabel + '</a></p>'
      + '<div class="detail-cover" style="background:' + coverGradient(statusKey) + '"></div>'
      + '<div class="detail-body">' + body + '</div>'
      + '<div class="detail-tags"><a href="events.html" class="detail-tag">Tadbir</a><a href="events.html" class="detail-tag">' + statusLabel + '</a></div>'
      + shareButtons(pageUrl, item.title)
      + '</div>'
      + sidebar
      + '</div>';
  }

  /* ── Grants ───────────────────────────────────────────────── */
  function renderGrantsPage(items, container) {
    if (!items.length) { container.innerHTML = '<p style="color:rgba(180,220,255,.5)">Faol grant yoki tanlov mavjud emas.</p>'; return; }
    var html = '<div class="cards">';
    items.forEach(function (g) {
      html += '<article class="card">'
        + '<span class="tag">' + g.category + (g.status === 'active' ? ' · Faol' : ' · Yopilgan') + '</span>'
        + '<h3>' + g.title + '</h3>'
        + '<p>' + g.description + '</p>'
        + (g.amount ? '<p style="font-size:13px;color:#00b4d8;margin-top:8px">Miqdor: ' + g.amount + '</p>' : '')
        + (g.deadlineLabel ? '<p style="font-size:13px;color:rgba(180,220,255,.6);margin-top:4px">Muddat: ' + g.deadlineLabel + '</p>' : '')
        + '<a class="btn" href="service-request.html" style="margin-top:14px;display:inline-block">Ariza topshirish</a>'
        + '</article>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /* ── Auto-init on page load ───────────────────────────────── */
  function init() {
    // Home page — news
    var newsHomeEl = document.getElementById('dynamic-news-home');
    if (newsHomeEl) fetchJSON('news', function (items) { renderNewsHome(items, newsHomeEl); });

    // Home page — events
    var upcomingEl = document.getElementById('dynamic-events-upcoming');
    var pastEl     = document.getElementById('dynamic-events-past');
    if (upcomingEl || pastEl) fetchJSON('events', function (items) { renderEventsHome(items, upcomingEl, pastEl); });

    // news.html full page
    var newsPageEl = document.getElementById('dynamic-news-page');
    if (newsPageEl) fetchJSON('news', function (items) { renderNewsPage(items, newsPageEl); });

    // events.html full page
    var eventsPageEl = document.getElementById('dynamic-events-page');
    if (eventsPageEl) fetchJSON('events', function (items) { renderEventsPage(items, eventsPageEl); });

    // news-detail.html
    var newsDetailEl = document.getElementById('detail-news-content');
    if (newsDetailEl) {
      var newsId = new URLSearchParams(window.location.search).get('id');
      fetchJSON('news', function (items) { renderNewsDetail(items, newsDetailEl, newsId); });
    }

    // event-detail.html
    var eventDetailEl = document.getElementById('detail-event-content');
    if (eventDetailEl) {
      var eventId = new URLSearchParams(window.location.search).get('id');
      fetchJSON('events', function (items) { renderEventDetail(items, eventDetailEl, eventId); });
    }

    // projects.html grants
    var grantsEl = document.getElementById('dynamic-grants-page');
    if (grantsEl) fetchJSON('grants', function (items) { renderGrantsPage(items, grantsEl); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
