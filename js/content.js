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

  function fmtDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '.' + p[1] + '.' + p[0];
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
    var html = '<div class="news-grid">';
    items.forEach(function (n) {
      html += '<article class="news-card">'
        + '<span class="tag">' + n.category + ' · ' + fmtDate(n.date) + '</span>'
        + '<h3>' + n.title + '</h3>'
        + '<p>' + n.excerpt + '</p>'
        + '<a class="btn" href="news-detail.html?id=' + n.id + '" style="margin-top:14px;display:inline-block">Batafsil</a>'
        + '</article>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function renderNewsDetail(items, container, id) {
    var item = id ? items.find(function (n) { return n.id === id; }) : null;
    if (!item) item = items[0];
    if (!item) { container.innerHTML = '<p style="color:rgba(180,220,255,.5)">Yangilik topilmadi.</p>'; return; }

    document.title = item.title + ' - ngo.uz';
    container.innerHTML = '<div class="content-shell">'
      + '<p class="breadcrumbs"><a href="index.html">Bosh sahifa</a> / <a href="news.html">Yangiliklar</a> / ' + item.category + '</p>'
      + '<h1>' + item.title + '</h1>'
      + '<p class="meta-line">' + fmtDate(item.date) + ' · ' + item.category + ' · Admin</p>'
      + '<div class="article-cover"></div>'
      + '<div class="article-content">' + bodyToHTML(item.body || item.excerpt) + '</div>'
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
    if (!item) { container.innerHTML = '<p style="color:rgba(180,220,255,.5)">Tadbir topilmadi.</p>'; return; }

    document.title = item.title + ' - ngo.uz';
    var metaParts = [item.dateLabel];
    if (item.location) metaParts.push(item.location);

    container.innerHTML = '<div class="content-shell">'
      + '<p class="breadcrumbs"><a href="index.html">Bosh sahifa</a> / <a href="events.html">Tadbirlar</a> / Tadbir tafsiloti</p>'
      + '<h1>' + item.title + '</h1>'
      + '<p class="meta-line">' + metaParts.join(' · ') + '</p>'
      + '<div class="article-cover"></div>'
      + '<div class="article-content">'
      + bodyToHTML(item.description)
      + (item.participants ? '<p><strong>Ishtirokchilar:</strong> ' + item.participants + '</p>' : '')
      + (item.deadline ? '<p style="color:#00b4d8">Ariza muddati: ' + item.deadlineLabel + '</p>' : '')
      + '</div>'
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
