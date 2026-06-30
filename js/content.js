/**
 * content.js — fetches news/events/grants/etc. from the API proxy
 * (ngo-api-proxy.sarvsop.workers.dev/v1/public/) and renders dynamic
 * content on public-facing pages.
 */

(function () {
  var API_BASE = 'https://ngo-api-proxy.sarvsop.workers.dev/v1/public/';
  var MEDIA_BASE = 'https://ngo-api-proxy.sarvsop.workers.dev/media.php?path=';
  var TIMEOUT_MS = 15000;

  // Wrapper around fetch with a 15s AbortController timeout. Without
  // it a hanging upstream PHP backend would leave the news / events /
  // grants page stuck on "Yuklanmoqda…" forever — the existing
  // .catch handlers only fire on rejections, not stalls.
  function fetchWithTimeout(url) {
    if (typeof AbortController !== 'function') return fetch(url);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    return fetch(url, { signal: ctrl.signal }).finally(function () {
      clearTimeout(timer);
    });
  }

  // HTML-escape user-supplied / API-returned strings before they land
  // in innerHTML templates. The legacy PHP backend's sanitization
  // story is unknown and admin CMS users edit titles/descriptions
  // directly — a single <script> in any item.title would otherwise
  // be stored XSS. Use for every backend-string interpolation; it's
  // a no-op for null/undefined.
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fetchJSON(kind, cb, extraParams) {
    var url = API_BASE + kind + '?limit=100&_=' + Date.now();
    if (extraParams) url += '&' + extraParams;
    fetchWithTimeout(url)
      .then(function (r) {
        // Distinguish "API replied but with non-2xx" (treat as empty
        // for graceful UX on home strips, but flag __error so list
        // pages can render a recoverable alert) from a clean response.
        if (!r.ok) return { items: [], total: 0, __error: true };
        return r.json();
      })
      .then(function (data) {
        cb(data && data.items ? data.items : (Array.isArray(data) ? data : []), data);
      })
      .catch(function () { cb([], { total: 0, __error: true }); });
  }

  // Common pattern: fetch a kind into a container. If the API erred or
  // timed out, surface a recoverable alert instead of the render-fn's
  // generic "no items" copy — users on a flaky network previously saw
  // "Yangiliklar topilmadi" and assumed there was no content.
  function fillContainer(kind, container, render, extraParams) {
    try { container.setAttribute('aria-busy', 'true'); } catch (e) {}
    fetchJSON(kind, function (items, data) {
      try { container.setAttribute('aria-busy', 'false'); } catch (e) {}
      if (data && data.__error) {
        container.innerHTML = '<p role="alert" class="text-muted-light" data-i18n="common.dataLoadError">Ma\'lumotlarni yuklab bo\'lmadi. Sahifani qayta yuklang yoki keyinroq urinib ko\'ring.</p>';
        applyI18n(container);
        return;
      }
      render(items, container);
    }, extraParams);
  }

  // Detail pages need to distinguish "API said 404" (genuinely not
  // found — show error page + noindex) from "network/5xx" (transient,
  // do NOT noindex). Pass a second arg to cb when it's transient so
  // detail handlers can render a recoverable error instead of the
  // permanent "topilmadi" copy.
  function fetchOne(kind, id, cb) {
    fetchWithTimeout(API_BASE + kind + '/' + encodeURIComponent(id) + '?_=' + Date.now())
      .then(function (r) {
        if (r.status === 404) { cb(null); return; }
        if (!r.ok) { cb(null, { __error: true, status: r.status }); return; }
        return r.json().then(function (data) { cb(data); });
      })
      .catch(function () { cb(null, { __error: true, status: 0 }); });
  }

  function mediaUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return MEDIA_BASE + encodeURIComponent(path);
  }

  function coverStyle(item) {
    var img = mediaUrl(item.cover_image || item.cover_image_url || item.cover_url);
    if (img) {
      // url() argument lives in a CSS string literal that lands in
      // a style attribute. encodeURIComponent already covers the
      // relative path, but the absolute-URL fast-path in mediaUrl
      // returns the value as-is; defensively escape ' \\ \n in case a
      // backend cover_image contains characters that would otherwise
      // break out of url('...') or the style="..." attribute.
      var safe = String(img).replace(/\\/g, '\\\\').replace(/'/g, '%27').replace(/\n|\r/g, '');
      return 'background:#f6f8fa url(\'' + safe + '\') center/contain no-repeat';
    }
    return 'background:' + coverGradient(item.category || item.status || '');
  }

  var MONTHS_ABBR = {
    uz: ['Yan','Feb','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'],
    ru: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  };
  // Active UI language, clamped to a supported locale (matches i18n.js).
  function curLang() {
    var l = (window.ngoI18n && window.ngoI18n.get && window.ngoI18n.get()) ||
      (function () { try { return localStorage.getItem('ngo_public_lang_v1') || 'uz'; } catch (e) { return 'uz'; } })();
    return (l === 'ru' || l === 'en') ? l : 'uz';
  }
  // The renderers below run AFTER the loader's initial DOM pass, so newly
  // injected data-i18n nodes need an explicit apply(); subsequent language
  // switches are covered by the loader's own apply(document) on set().
  function applyI18n(scope) {
    if (window.ngoI18n && typeof window.ngoI18n.apply === 'function') window.ngoI18n.apply(scope || document);
  }
  // Prefer the active-language DB field (e.g. title_ru / description_en) when the
  // backend provides it, else fall back to the Uzbek original. Events already
  // carry *_ru/*_en; news/documents light up here once their columns are added.
  function tField(item, base) {
    var l = curLang();
    if (l !== 'uz') { var v = item[base + '_' + l]; if (v != null && v !== '') return v; }
    return item[base];
  }

  // Trim datetime suffix (T-separated time, or space-separated time
  // some backends return) before splitting — without this a datetime
  // like '2026-05-01T10:30:00Z' parses to '01T10:30:00Z.05.2026'.
  function _datePart(iso) {
    if (!iso) return '';
    return String(iso).slice(0, 10);
  }
  function fmtDate(iso) {
    var d = _datePart(iso);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return '';
    var p = d.split('-');
    return p[2] + '.' + p[1] + '.' + p[0];
  }

  function dateDay(iso) {
    var d = _datePart(iso);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return '';
    return d.split('-')[2] || '';
  }

  function dateMonthAbbr(iso) {
    var d = _datePart(iso);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return '';
    var m = parseInt(d.split('-')[1], 10);
    return (MONTHS_ABBR[curLang()] || MONTHS_ABBR.uz)[m - 1] || '';
  }

  // Linkify http(s):// URLs that appear as plain text in admin-edited
  // article bodies. Operate on the already-esc'd string so the URL
  // chars are HTML-encoded; we still need to undo the encoding for the
  // href attribute (browsers want the raw URL there). Restrict to
  // safe schemes and add rel/noopener.
  function linkifyEscaped(escapedText) {
    return escapedText.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, function (match) {
      // The match is the HTML-escaped form (& → &amp;). For the href
      // we need the un-escaped raw URL so the browser navigates
      // correctly. Then wrap in an <a> with the escaped form as
      // visible text + as href (esc again, ensuring no breakout).
      var raw = match.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      return '<a href="' + esc(raw) + '" target="_blank" rel="noopener noreferrer">' + match + '</a>';
    });
  }
  function bodyToHTML(text) {
    if (!text) return '';
    // Escape before paragraph/newline-splitting so admin-entered HTML
    // (or copy-pasted content with stray <script>/<img onerror>) gets
    // rendered as text, not executed. Result: only the <p>/<br> we
    // synthesize survive as live markup. Then linkify http(s):// URLs
    // so admins don't have to author HTML to make a citation clickable.
    return text.split(/\n\n+/).map(function (p) {
      return '<p>' + linkifyEscaped(esc(p).replace(/\n/g, '<br>')) + '</p>';
    }).join('');
  }

  function sanitizeArticleHTML(html) {
    if (!html) return '';
    var allowed = {
      A: ['href', 'title', 'target', 'rel'],
      B: [], STRONG: [], I: [], EM: [], U: [], BR: [],
      P: [], DIV: [], SPAN: [],
      UL: [], OL: [], LI: [],
      H2: [], H3: [], H4: [],
      BLOCKQUOTE: []
    };
    var template = document.createElement('template');
    template.innerHTML = String(html);
    function clean(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) {
          var tag = child.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') {
            child.parentNode.removeChild(child);
            return;
          }
          if (!allowed[tag]) {
            var frag = document.createDocumentFragment();
            while (child.firstChild) frag.appendChild(child.firstChild);
            child.parentNode.replaceChild(frag, child);
            clean(node);
            return;
          }
          Array.prototype.slice.call(child.attributes).forEach(function (attr) {
            var name = attr.name.toLowerCase();
            var value = attr.value || '';
            if (name.indexOf('on') === 0 || name === 'style' || allowed[tag].indexOf(attr.name) === -1) {
              child.removeAttribute(attr.name);
              return;
            }
            if (tag === 'A' && name === 'href' && !/^(https?:|mailto:|tel:|\/|#)/i.test(value.trim())) {
              child.removeAttribute(attr.name);
            }
          });
          if (tag === 'A') {
            child.setAttribute('rel', 'noopener noreferrer');
            if (!child.getAttribute('target')) child.setAttribute('target', '_blank');
          }
          clean(child);
        } else if (child.nodeType !== 3) {
          child.parentNode.removeChild(child);
        }
      });
    }
    clean(template.content);
    return template.innerHTML;
  }

  function renderArticleBody(item, bodyBase, fallbackBase) {
    var html = tField(item, bodyBase + '_html') || item[bodyBase + '_html'];
    if (html) return sanitizeArticleHTML(html);
    return bodyToHTML(tField(item, bodyBase) || tField(item, fallbackBase));
  }

  function parseMediaGallery(item) {
    var value = item && (item.media_gallery || item.gallery || item.media_items || item.attachments);
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'object') return [value];
    var text = String(value || '').trim();
    if (!text) return [];
    try {
      var parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch (e) {}
    return text.split(/\n+/).map(function (line) {
      line = line.trim();
      if (!line) return null;
      return { type: /\.(mp4|webm|ogg)(\?|#|$)/i.test(line) ? 'video' : 'embed', url: line };
    }).filter(Boolean);
  }

  function mediaItemUrl(item) {
    return mediaUrl(item.url || item.src || item.path || item.file_path || item.href);
  }

  function youtubeEmbedUrl(url) {
    var m = String(url || '').match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return m ? 'https://www.youtube.com/embed/' + encodeURIComponent(m[1]) : '';
  }

  function renderMediaGallery(item) {
    var media = parseMediaGallery(item);
    if (!media.length) return '';
    var title = esc(tField(item, 'title') || item.title || 'Media');
    var html = '<section class="detail-media-gallery" aria-label="Media galereya">';
    media.forEach(function (m) {
      var url = mediaItemUrl(m);
      if (!url || !/^https?:\/\//i.test(url)) return;
      var type = String(m.type || m.mime || '').toLowerCase();
      var caption = m.title || m.caption || '';
      var yt = youtubeEmbedUrl(url);
      if (yt) {
        html += '<figure class="detail-media-item detail-media-item--video"><iframe src="' + esc(yt) + '" title="' + title + '" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>' + (caption ? '<figcaption>' + esc(caption) + '</figcaption>' : '') + '</figure>';
      } else if (type.indexOf('video') === 0 || /\.(mp4|webm|ogg)(\?|#|$)/i.test(url)) {
        html += '<figure class="detail-media-item detail-media-item--video"><video controls preload="metadata" src="' + esc(url) + '"></video>' + (caption ? '<figcaption>' + esc(caption) + '</figcaption>' : '') + '</figure>';
      } else {
        html += '<figure class="detail-media-item"><img src="' + esc(url) + '" alt="' + title + '" loading="lazy" decoding="async">' + (caption ? '<figcaption>' + esc(caption) + '</figcaption>' : '') + '</figure>';
      }
    });
    html += '</section>';
    return html === '<section class="detail-media-gallery" aria-label="Media galereya"></section>' ? '' : html;
  }

  /* ── News ─────────────────────────────────────────────────── */
  // Route news cards to the matching detail page so list-page clicks
  // stay in context. publications.html (category=nashrlar) used to
  // link every card to /news-detail; same for videos.html.
  function newsDetailRouteFor(category) {
    var c = String(category || '').toLowerCase();
    if (c === 'nashrlar') return 'publication-detail';
    if (c === 'video')    return 'video-detail';
    return 'news-detail';
  }

  function newsCardHTML(n) {
    var url = newsDetailRouteFor(n.category) + '?id=' + encodeURIComponent(n.id);
    var cat = n.category || '';
    var vaType = String(cat).toLowerCase() === 'nashrlar' ? 'publications' : String(cat).toLowerCase() === 'video' ? 'videos' : 'news';
    var archiveBadge = (n.is_archive === '1' || n.is_archive === 1)
      ? '<span class="gov-news-archive-badge">Arxiv</span>' : '';
    return '<article class="gov-news-card" data-cat="' + esc(cat) + '" data-va-type="' + esc(vaType) + '" data-va-id="' + esc(n.id || '') + '">'
      + '<a href="' + url + '" class="gov-news-img" tabindex="-1" aria-hidden="true">'
      + '<div class="gov-news-img-inner" style="' + coverStyle(n) + '"></div>'
      + '<div class="gov-news-overlay"></div>' + archiveBadge + '</a>'
      + '<div class="gov-news-content">'
      + '<div class="gov-news-header">'
      + '<time class="gov-news-date" datetime="' + esc(_datePart(n.date) || '') + '" aria-hidden="true"><b>' + dateDay(n.date) + '</b><span>' + dateMonthAbbr(n.date) + '</span></time>'
      + '<h3 class="gov-news-title"><a href="' + url + '">' + esc(tField(n,'title')) + '</a></h3>'
      + '</div>'
      + '<a href="' + url + '" class="gov-news-excerpt">' + esc(tField(n,'excerpt')) + '</a>'
      + '<div class="gov-news-footer"><time datetime="' + esc(_datePart(n.date) || '') + '">' + fmtDate(n.date) + '</time><a href="' + url + '">' + esc(cat) + '</a></div>'
      + '</div></article>';
  }

  // Newest-first sort: ensure home strip and listing pages don't
  // depend on backend order. Falls back to 0 for items with no date
  // so they sink to the bottom.
  function sortNewsByDateDesc(items) {
    return items.slice().sort(function (a, b) {
      return (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
    });
  }

  function renderNewsHome(items, container) {
    var latest = sortNewsByDateDesc(items).slice(0, 3);
    if (!latest.length) {
      // Was an early return — left the section header above with an
      // empty area beneath it. Show a placeholder so the layout flow
      // doesn't break and the user sees what's intended.
      container.innerHTML = '<p role="status" class="text-muted-light" style="padding:16px 0;" data-i18n="pages.news.emptyRecent">So‘nggi yangiliklar topilmadi.</p>';
      applyI18n(container);
      return;
    }
    var html = '<div class="gov-news-grid">';
    latest.forEach(function (n) { html += newsCardHTML(n); });
    html += '</div>';
    container.innerHTML = html;
    applyI18n(container);
  }

  function renderNewsPage(items, container) {
    if (!items.length) { container.innerHTML = '<p role="status" class="text-muted-light" data-i18n="pages.news.emptyAll">Yangiliklar topilmadi.</p>'; applyI18n(container); return; }
    var sorted = sortNewsByDateDesc(items);
    var html = '<div class="gov-news-grid">';
    sorted.forEach(function (n) { html += newsCardHTML(n); });
    html += '</div>';
    container.innerHTML = html;
    applyI18n(container);
  }

  function coverGradient(key) {
    // Normalize key — backend rows mix uppercase ('TADBIR') and lower
    // ('tadbir') for the same category. Without normalization, the
    // lowercase rows fell through to the fallback gradient even
    // though their category had a dedicated color. Match by uppercase.
    var k = String(key || '').toUpperCase();
    var map = {
      'TADBIR':   'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)',
      'TAHLIL':   'linear-gradient(135deg,#3b1a5c 0%,#7c3aed 100%)',
      "E'LON":    'linear-gradient(135deg,#5c3a1a 0%,#d97706 100%)',
      'PRESS':    'linear-gradient(135deg,#1a4a5c 0%,#0891b2 100%)',
      'UPCOMING': 'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)',
    };
    return map[k] || 'linear-gradient(135deg,#1a5c35 0%,#2e7d52 100%)';
  }

  function shareButtons(pageUrl, title) {
    var u = encodeURIComponent(pageUrl);
    var t = encodeURIComponent(title);
    var fb = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
    var tg = 'https://t.me/share/url?url=' + u + '&text=' + t;
    var tw = 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t;
    // LinkedIn share — relevant audience for grants / events /
    // training announcements; missing from the strip until now.
    var li = 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
    return '<div class="detail-share-row">'
      + '<span class="detail-share-label">Ulashish:</span>'
      + '<a href="' + fb + '" target="_blank" rel="noopener noreferrer" class="detail-share-btn" aria-label="Facebook">'
      + '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>'
      + '<a href="' + tg + '" target="_blank" rel="noopener noreferrer" class="detail-share-btn" aria-label="Telegram">'
      + '<svg width="15" height="15" viewBox="0 0 496 512" aria-hidden="true" focusable="false"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239-92.1c11.1-4 20.8 2.7 17.3 19.4z"/></svg></a>'
      + '<a href="' + tw + '" target="_blank" rel="noopener noreferrer" class="detail-share-btn" aria-label="X / Twitter">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>'
      + '<a href="' + li + '" target="_blank" rel="noopener noreferrer" class="detail-share-btn" aria-label="LinkedIn">'
      + '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>'
      + '</div>';
  }

  function setCanonical(url) {
    var link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  // Detail page resolved to no item — keep the URL out of search
  // indexes (Google would otherwise crawl every ?id=N variant) and
  // update the title so browser tab/history reflects the 404 state.
  function markNotFound(title) {
    try { document.title = title; } catch (e) {}
    var meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, follow';
  }

  // Build a canonical URL that ignores marketing params (utm_*,
  // fbclid, gclid, ref, etc.) so shared/clicked links don't fragment
  // SEO signals across query variants. Keeps `id` and `type` since
  // those disambiguate which article/event/document the page is
  // showing — without `type=documents` the canonical for a document
  // URL would point to /news-detail?id=X which the page handler
  // would treat as a news article, surfacing wrong/missing content
  // to crawlers and link-preview bots.
  function canonicalDetailUrl() {
    var p = new URLSearchParams(window.location.search);
    var id = p.get('id') || '';
    var type = p.get('type') || '';
    var base = window.location.origin + window.location.pathname;
    if (!id) return base;
    var qs = '?id=' + encodeURIComponent(id);
    if (type) qs += '&type=' + encodeURIComponent(type);
    return base + qs;
  }

  // Without per-article OG/Twitter updates, every shared link previews
  // as the generic news-detail / event-detail meta. Update the tags
  // in place so Facebook/Twitter/LinkedIn/Telegram render the actual
  // article title + excerpt + cover image.
  function setMetaContent(selector, value) {
    var el = document.head.querySelector(selector);
    if (el && value != null) el.setAttribute('content', value);
  }
  function updateSocialMeta(title, description, imageUrl, pageUrl) {
    var t = title || '';
    var d = String(description || '').slice(0, 280);
    setMetaContent('meta[name="description"]', d);
    setMetaContent('meta[property="og:title"]', t);
    setMetaContent('meta[property="og:description"]', d);
    setMetaContent('meta[property="og:url"]', pageUrl);
    setMetaContent('meta[name="twitter:title"]', t);
    setMetaContent('meta[name="twitter:description"]', d);
    if (imageUrl) {
      setMetaContent('meta[property="og:image"]', imageUrl);
      setMetaContent('meta[property="og:image:alt"]', t);
      setMetaContent('meta[name="twitter:image"]', imageUrl);
      setMetaContent('meta[name="twitter:image:alt"]', t);
    }
  }

  function injectArticleJsonLd(item) {
    try {
      var existing = document.getElementById('news-article-jsonld');
      if (existing) existing.remove();
      var pageUrl = canonicalDetailUrl();
      setCanonical(pageUrl);
      var coverImg = (item.cover_image_url || item.cover_url || '');
      if (coverImg && !/^https?:\/\//.test(coverImg)) {
        coverImg = MEDIA_BASE + encodeURIComponent(coverImg);
      }
      updateSocialMeta(item.title, item.excerpt, coverImg, pageUrl);
      var data = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': String(item.title || '').slice(0, 300),
        'datePublished': item.published_at || item.date || item.created_at || '',
        'dateModified': item.updated_at || item.published_at || item.date || '',
        'description': String(item.excerpt || '').slice(0, 500),
        'articleSection': item.category || 'Yangiliklar',
        'inLanguage': 'uz-UZ',
        'mainEntityOfPage': { '@type': 'WebPage', '@id': pageUrl },
        'url': pageUrl,
        'author': {
          '@type': 'Organization',
          'name': "O'zNNTMA",
          'url': 'https://www.ngo.uz/'
        },
        'publisher': {
          '@type': 'Organization',
          'name': "O'zNNTMA",
          'url': 'https://www.ngo.uz/',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://www.ngo.uz/img/logo-oznntma.png'
          }
        }
      };
      if (coverImg) data.image = [coverImg];
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = 'news-article-jsonld';
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      injectBreadcrumbJsonLd(item, pageUrl);
    } catch (e) { /* swallow — JSON-LD failure must not break the page */ }
  }

  // Inject 3-level BreadcrumbList JSON-LD: Home → Section → Article.
  // Section is derived from the document URL (news/event/publication/
  // video). Static breadcrumbs would have to ship without the article
  // title, so we do this dynamically once the item is loaded — Google
  // and other crawlers all execute JS for JSON-LD now.
  function injectBreadcrumbJsonLd(item, pageUrl) {
    try {
      var existing = document.getElementById('detail-breadcrumb-jsonld');
      if (existing) existing.remove();
      var page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
      var sectionMap = {
        'news-detail':        { name: 'Yangiliklar',     url: 'https://www.ngo.uz/news' },
        'event-detail':       { name: 'Tadbirlar',       url: 'https://www.ngo.uz/events' },
        'publication-detail': { name: 'Publikatsiyalar', url: 'https://www.ngo.uz/publications' },
        'video-detail':       { name: 'Videolar',        url: 'https://www.ngo.uz/videos' }
      };
      var section = sectionMap[page];
      // news-detail also serves documents via ?type=documents — relabel
      // the section so the breadcrumb reflects /official-docs, not /news.
      var qsType = new URLSearchParams(location.search).get('type');
      if (page === 'news-detail' && qsType === 'documents') {
        section = { name: 'Hujjatlar', url: 'https://www.ngo.uz/official-docs' };
      }
      if (!section) return;
      var data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Bosh sahifa',  'item': 'https://www.ngo.uz/' },
          { '@type': 'ListItem', 'position': 2, 'name': section.name,    'item': section.url },
          { '@type': 'ListItem', 'position': 3, 'name': String(item.title || '').slice(0, 200), 'item': pageUrl }
        ]
      };
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = 'detail-breadcrumb-jsonld';
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    } catch (e) { /* swallow */ }
  }

  function renderNewsDetail(items, container, id) {
    var item = id ? items.find(function (n) { return n.id === id; }) : null;
    if (!item) item = items[0];
    if (!item) { container.innerHTML = '<p role="status">Yangilik topilmadi.</p>'; return; }

    document.title = item.title + ' — O\'zNNTMA | ngo.uz';
    injectArticleJsonLd(item);
    var cat = item.category || '';
    var pageUrl = window.location.href;

    // Filter by id, not reference: this list comes from a SEPARATE
    // fetchJSON call than fetchOne (which produced `item`), so the
    // same article shows up as a different object instance. With the
    // old `n !== item` reference check, the current article appeared
    // as the first "Boshqa yangiliklar" sidebar entry — a clearly
    // wrong "see also" suggestion.
    var others = items.filter(function (n) { return String(n.id) !== String(item.id); }).slice(0, 8);
    // Sidebar heading reflects the page context; each entry's link
    // uses the correct per-category detail route so a 'nashrlar'
    // article in the news-detail sidebar still goes to /publication-
    // detail, not /news-detail.
    var pn = (window.location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    var sidebarHeading = (pn === 'publication-detail') ? 'Boshqa publikatsiyalar'
                       : (pn === 'video-detail') ? 'Boshqa videolar'
                       : 'Boshqa yangiliklar';
    // Real <h2> heading instead of styled <p> so screen readers
    // announce the sidebar landmark with its actual purpose ("Boshqa
    // yangiliklar, heading 2") instead of just "complementary,
    // paragraph". The CSS class already has margin:0 so visuals match.
    // aria-labelledby ties the <aside> complementary landmark to its
    // own heading so SR users hear "Boshqa yangiliklar, complementary
    // landmark" rather than an unnamed "complementary".
    var sidebar = '<aside class="detail-sidebar" aria-labelledby="detailSidebarHeading"><h2 id="detailSidebarHeading" class="detail-sidebar-heading">' + sidebarHeading + '</h2>';
    others.forEach(function (n) {
      sidebar += '<a href="' + newsDetailRouteFor(n.category) + '?id=' + encodeURIComponent(n.id) + '" class="detail-sidebar-item">'
        + '<p class="detail-sidebar-item-date"><time datetime="' + esc(_datePart(n.date) || '') + '">' + fmtDate(n.date) + '</time> · ' + esc(n.category || '') + '</p>'
        + '<p class="detail-sidebar-item-title">' + esc(tField(n,'title')) + '</p>'
        + '</a>';
    });
    sidebar += '</aside>';

    // Breadcrumb / category links should reflect the current detail
    // route — same fix as the sidebar above. /news for news-detail,
    // /publications for publication-detail, /videos for video-detail.
    // /news-detail?type=documents → /official-docs route + Hujjatlar.
    var qsType = new URLSearchParams(location.search).get('type');
    var isDocRoute = (pn === 'news-detail' && qsType === 'documents');
    var listRoute = isDocRoute ? 'official-docs'
                  : (pn === 'publication-detail') ? 'publications'
                  : (pn === 'video-detail') ? 'videos'
                  : 'news';
    var listLabel = isDocRoute ? 'Hujjatlar'
                  : (pn === 'publication-detail') ? 'Publikatsiyalar'
                  : (pn === 'video-detail') ? 'Videolar'
                  : 'Yangiliklar';
    container.innerHTML = '<div class="detail-layout">'
      + '<div class="detail-paper">'
      + '<div class="detail-top-bar">'
      + '<nav aria-label="Sahifa joylashuvi"><p class="detail-breadcrumbs"><a href="index">Bosh sahifa</a><span class="detail-bc-sep" aria-hidden="true">›</span><a href="' + listRoute + '">' + listLabel + '</a><span class="detail-bc-sep" aria-hidden="true">›</span><span aria-current="page">' + esc(cat) + '</span></p></nav>'
      + '<button class="detail-print-btn" onclick="window.print()" aria-label="Chop etish"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>'
      + '</div>'
      + '<h1 class="detail-title">' + esc(tField(item,'title')) + '</h1>'
      + '<p class="detail-meta"><time datetime="' + esc(_datePart(item.date) || '') + '">' + fmtDate(item.date) + '</time><span class="detail-meta-sep">/</span><a href="' + listRoute + '">' + esc(cat) + '</a></p>'
      + '<div class="detail-cover" style="' + coverStyle(item) + '"></div>'
      + '<div class="detail-body">' + renderArticleBody(item, 'body', 'excerpt') + '</div>'
      + renderMediaGallery(item)
      + '<div class="detail-tags"><a href="' + listRoute + '" class="detail-tag">' + esc(cat) + '</a></div>'
      + shareButtons(pageUrl, item.title)
      + '</div>'
      + sidebar
      + '</div>';
    try { container.setAttribute('aria-busy', 'false'); } catch (e) {}
  }

  /* ── Events ───────────────────────────────────────────────── */
  // Resolve an event's effective status from explicit field + date
  // fallback. Used by both the card render and the events page
  // section split so a future-dated event with no status still
  // shows up as 'Rejalashtirilgan' (planned) instead of 'Bo'lib
  // o'tdi' (past).
  function eventStatus(e) {
    if (e.status === 'upcoming' || e.status === 'past') return e.status;
    var t = e.date ? new Date(e.date).getTime() : NaN;
    if (!isNaN(t) && t >= new Date().setHours(0, 0, 0, 0)) return 'upcoming';
    return 'past';
  }

  function eventCardHTML(e) {
    var url = 'event-detail?id=' + encodeURIComponent(e.id);
    var cat = eventStatus(e);
    var label = cat === 'upcoming'
      ? '<span data-i18n="pages.events.statusUpcoming">Rejalashtirilgan</span>'
      : '<span data-i18n="pages.events.statusPast">Bo\'lib o\'tdi</span>';
    var archiveBadge = (e.is_archive === '1' || e.is_archive === 1)
      ? '<span class="gov-news-archive-badge" data-i18n="common.archive">Arxiv</span>' : '';
    return '<article class="gov-news-card" data-cat="' + esc(cat) + '" data-va-type="events" data-va-id="' + esc(e.id || '') + '">'
      + '<a href="' + url + '" class="gov-news-img" tabindex="-1" aria-hidden="true">'
      + '<div class="gov-news-img-inner" style="' + coverStyle(e) + '"></div>'
      + '<div class="gov-news-overlay"></div>' + archiveBadge + '</a>'
      + '<div class="gov-news-content">'
      + '<div class="gov-news-header">'
      + '<time class="gov-news-date" datetime="' + esc(_datePart(e.date) || '') + '" aria-hidden="true"><b>' + dateDay(e.date) + '</b><span>' + dateMonthAbbr(e.date) + '</span></time>'
      + '<h3 class="gov-news-title"><a href="' + url + '">' + esc(tField(e,'title')) + '</a></h3>'
      + '</div>'
      + '<a href="' + url + '" class="gov-news-excerpt">' + esc(tField(e,'description') || '') + '</a>'
      + '<div class="gov-news-footer"><time datetime="' + esc(_datePart(e.date) || '') + '">' + esc(e.dateLabel || fmtDate(e.date)) + '</time><a href="' + url + '">' + label + '</a></div>'
      + '</div></article>';
  }

  function renderEventsHome(items, container) {
    // The section header reads "Yaqin tadbirlar" (Upcoming events) —
    // surface only upcoming, soonest first, max 3. Was raw API order
    // limited to 3, which could promote a past event over an
    // upcoming one when the backend didn't return events in date
    // order.
    var upcoming = items.filter(function (e) { return eventStatus(e) === 'upcoming'; })
      .sort(function (a, b) { return (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0); });
    var latest = upcoming.slice(0, 3);
    if (!latest.length) {
      container.innerHTML = '<p role="status" class="text-muted-light" style="padding:16px 0;" data-i18n="pages.events.emptyUpcoming">Yaqin tadbirlar topilmadi.</p>';
      applyI18n(container);
      return;
    }
    var html = '<div class="gov-news-grid">';
    latest.forEach(function (e) { html += eventCardHTML(e); });
    html += '</div>';
    container.innerHTML = html;
    applyI18n(container);
  }

  function renderEventsPage(items, container) {
    if (!items.length) { container.innerHTML = '<p role="status" data-i18n="pages.events.emptyAll">Tadbirlar topilmadi.</p>'; applyI18n(container); return; }
    // Within each section: soonest upcoming first, most recent past
    // first. Without sort the API order leaked through; admins
    // reorganized via the admin-events table couldn't reorder.
    var upcoming = items.filter(function (e) { return eventStatus(e) === 'upcoming'; })
      .sort(function (a, b) { return (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0); });
    var past = items.filter(function (e) { return eventStatus(e) === 'past'; })
      .sort(function (a, b) { return (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0); });

    function sectionHTML(arr, key, fb) {
      if (!arr.length) return '';
      return '<h2 class="gov-news-section-label" data-i18n="' + key + '">' + fb + '</h2>'
        + '<div class="gov-news-grid mb-section">'
        + arr.map(eventCardHTML).join('')
        + '</div>';
    }

    container.innerHTML = sectionHTML(upcoming, 'pages.events.sectionUpcoming', 'Rejalashtirilgan tadbirlar')
      + sectionHTML(past, 'pages.events.sectionPast', "Bo'lib o'tgan tadbirlar");
    applyI18n(container);
  }

  function injectEventJsonLd(item) {
    try {
      var existing = document.getElementById('event-jsonld');
      if (existing) existing.remove();
      var pageUrl = canonicalDetailUrl();
      setCanonical(pageUrl);
      var coverImg = (item.cover_image_url || item.cover_url || '');
      if (coverImg && !/^https?:\/\//.test(coverImg)) {
        coverImg = MEDIA_BASE + encodeURIComponent(coverImg);
      }
      updateSocialMeta(item.title, item.description, coverImg, pageUrl);
      var data = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': String(item.title || '').slice(0, 300),
        'description': String(item.description || '').slice(0, 500),
        'startDate': item.start_date || item.date || item.event_date || '',
        'endDate': item.end_date || item.start_date || item.date || '',
        // schema.org's EventStatusType has no 'completed' value —
        // past events without modifications stay as Scheduled. The
        // previous ternary returned EventScheduled in both branches,
        // so it was dead code. Drop the branch.
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'inLanguage': 'uz-UZ',
        'url': pageUrl,
        'organizer': {
          '@type': 'Organization',
          'name': "O'zNNTMA",
          'url': 'https://www.ngo.uz/'
        }
      };
      if (item.location) {
        data.location = {
          '@type': 'Place',
          'name': String(item.location).slice(0, 200),
          'address': { '@type': 'PostalAddress', 'addressLocality': 'Toshkent', 'addressCountry': 'UZ' }
        };
      } else {
        data.location = {
          '@type': 'VirtualLocation',
          'url': pageUrl
        };
        data.eventAttendanceMode = 'https://schema.org/OnlineEventAttendanceMode';
      }
      if (coverImg) data.image = [coverImg];
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = 'event-jsonld';
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      injectBreadcrumbJsonLd(item, pageUrl);
    } catch (e) { /* swallow */ }
  }

  function renderEventDetail(items, container, id) {
    var item = id ? items.find(function (e) { return e.id === id; }) : null;
    if (!item) item = items[0];
    if (!item) { container.innerHTML = '<p role="status">Tadbir topilmadi.</p>'; return; }

    document.title = item.title + ' — O\'zNNTMA | ngo.uz';
    injectEventJsonLd(item);
    var pageUrl = window.location.href;
    // Use the shared resolver (iter 238) so a missing status field
    // doesn't mislabel a future event as 'Bo'lib o'tdi'.
    var statusLabel = eventStatus(item) === 'upcoming' ? 'Rejalashtirilgan' : "Bo'lib o'tdi";

    var tt = function (k, fb) { return (window.ngoI18n && window.ngoI18n.t) ? window.ngoI18n.t(k, fb) : fb; };
    var body = renderArticleBody(item, 'description', 'description')
      + (item.location ? '<p><strong>' + esc(tt('pages.eventDetail.location', 'Joyi:')) + '</strong> ' + esc(item.location) + '</p>' : '')
      + (item.participants ? '<p><strong>' + esc(tt('pages.eventDetail.participants', 'Ishtirokchilar:')) + '</strong> ' + esc(item.participants) + ' ' + esc(tt('pages.eventDetail.people', 'kishi')) + '</p>' : '')
      + (item.deadline ? '<p><strong>' + esc(tt('pages.eventDetail.deadline', 'Ariza muddati:')) + '</strong> <time datetime="' + esc(_datePart(item.deadline) || '') + '">' + esc(item.deadlineLabel || fmtDate(item.deadline)) + '</time></p>' : '');

    // Filter by id, not reference — see news-detail equivalent for
    // why: items comes from a different fetch than `item`, so two
    // separate object instances with the same id sneak the current
    // event into the "Boshqa tadbirlar" sidebar.
    var others = items.filter(function (e) { return String(e.id) !== String(item.id); }).slice(0, 8);
    var sidebar = '<aside class="detail-sidebar" aria-labelledby="detailEventSidebarHeading"><h2 id="detailEventSidebarHeading" class="detail-sidebar-heading">Boshqa tadbirlar</h2>';
    others.forEach(function (e) {
      sidebar += '<a href="event-detail?id=' + encodeURIComponent(e.id) + '" class="detail-sidebar-item">'
        + '<p class="detail-sidebar-item-date"><time datetime="' + esc(_datePart(e.date) || '') + '">' + esc(e.dateLabel || fmtDate(e.date)) + '</time></p>'
        + '<p class="detail-sidebar-item-title">' + esc(tField(e,'title')) + '</p>'
        + '</a>';
    });
    sidebar += '</aside>';

    container.innerHTML = '<div class="detail-layout">'
      + '<div class="detail-paper">'
      + '<div class="detail-top-bar">'
      + '<nav aria-label="Sahifa joylashuvi"><p class="detail-breadcrumbs"><a href="index">Bosh sahifa</a><span class="detail-bc-sep" aria-hidden="true">›</span><a href="events">Tadbirlar</a><span class="detail-bc-sep" aria-hidden="true">›</span><span aria-current="page">' + statusLabel + '</span></p></nav>'
      + '<button class="detail-print-btn" onclick="window.print()" aria-label="Chop etish"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>'
      + '</div>'
      + '<h1 class="detail-title">' + esc(tField(item,'title')) + '</h1>'
      + '<p class="detail-meta"><time datetime="' + esc(_datePart(item.date) || '') + '">' + esc(item.dateLabel || fmtDate(item.date)) + '</time><span class="detail-meta-sep">/</span><a href="events">' + statusLabel + '</a></p>'
      + '<div class="detail-cover" style="' + coverStyle(item) + '"></div>'
      + '<div class="detail-body">' + body + '</div>'
      + renderMediaGallery(item)
      + '<div class="detail-tags"><a href="events" class="detail-tag">Tadbir</a><a href="events" class="detail-tag">' + statusLabel + '</a></div>'
      + shareButtons(pageUrl, item.title)
      + '</div>'
      + sidebar
      + '</div>';
    try { container.setAttribute('aria-busy', 'false'); } catch (e) {}
  }

  /* ── Grants ───────────────────────────────────────────────── */
  // Mirror the admin-grants resolver (iter 241): explicit status
  // wins; otherwise check deadline against today. Without this a
  // grant with a future deadline but no status field rendered as
  // 'Yopilgan' on the public /grants page.
  function grantStatus(g) {
    if (g.status === 'active' || g.status === 'closed') return g.status;
    if (g.deadline) {
      var t = new Date(g.deadline).getTime();
      if (!isNaN(t)) return t >= new Date().setHours(0, 0, 0, 0) ? 'active' : 'closed';
    }
    return 'closed';
  }

  function renderGrantsPage(items, container) {
    if (!items.length) { container.innerHTML = '<p class="text-muted-light" data-i18n="pages.grants.emptyActive">Faol grant yoki tanlov mavjud emas.</p>'; applyI18n(container); return; }
    // Active grants first (nearest deadline first — most actionable),
    // closed grants second (most-recent first). Was raw API order.
    var sorted = items.slice().sort(function (a, b) {
      var aActive = grantStatus(a) === 'active' ? 1 : 0;
      var bActive = grantStatus(b) === 'active' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      var ad = new Date(a.deadline || 0).getTime() || 0;
      var bd = new Date(b.deadline || 0).getTime() || 0;
      return aActive ? (ad - bd) : (bd - ad);
    });
    var html = '<div class="cards">';
    sorted.forEach(function (g) {
      // Restrict to ascii word/dash chars; backend grant ids match
      // /^[a-z0-9-]+$/, but be defensive — this id lands directly in
      // an HTML attribute and an RSS link target.
      var safeId = String(g.id || '').replace(/[^A-Za-z0-9_-]/g, '');
      var id = safeId ? ' id="' + safeId + '"' : '';
      var cover = g.cover_image
        ? '<div class="card-cover" style="' + coverStyle(g) + '" aria-hidden="true"></div>'
        : '';
      var isActive = grantStatus(g) === 'active';
      // Hide the "Ariza topshirish" CTA on closed grants — applications
      // wouldn't be accepted, so the button just frustrates users.
      var cta = isActive
        ? '<a class="btn btn-inline" href="service-request" data-i18n="pages.grants.apply">Ariza topshirish</a>'
        : '<span class="btn btn-inline" style="opacity:.55;cursor:not-allowed" aria-disabled="true" data-i18n="pages.grants.closed">Tanlov yopilgan</span>';
      var statusTag = isActive
        ? ' · <span data-i18n="pages.grants.tagActive">Faol</span>'
        : ' · <span data-i18n="pages.grants.tagClosed">Yopilgan</span>';
      var amount = g.amount ? esc(g.amount) : '<span class="grant-meta-empty">—</span>';
      var deadline = (g.deadline || g.deadlineLabel)
        ? '<time datetime="' + esc(_datePart(g.deadline) || '') + '">' + esc(g.deadlineLabel || fmtDate(g.deadline)) + '</time>'
        : '<span class="grant-meta-empty">—</span>';
      html += '<article class="card grant-card"' + id + ' data-va-type="grants" data-va-id="' + esc(g.id || '') + '">'
        + cover
        + '<div class="grant-card__content">'
        + '<span class="tag grant-card__tag">' + esc(tField(g,'category')) + statusTag + '</span>'
        + '<h3 class="grant-card__title">' + esc(tField(g,'title')) + '</h3>'
        + '<p class="grant-card__desc">' + esc(tField(g,'description')) + '</p>'
        + '<div class="grant-card__meta">'
        + '<p class="grant-amount"><span data-i18n="pages.grants.amount">Miqdor:</span> ' + amount + '</p>'
        + '<p class="grant-deadline"><span data-i18n="pages.grants.deadline">Muddat:</span> ' + deadline + '</p>'
        + '</div>'
        + '<div class="grant-card__action">' + cta + '</div>'
        + '</div>'
        + '</article>';
    });
    html += '</div>';
    container.innerHTML = html;
    applyI18n(container);
    // RSS feed items link via /grants#<id>; if the page loaded with a
    // hash, scroll the matching article into view (browsers don't re-
    // resolve :target after innerHTML replacement).
    if (location.hash && location.hash.length > 1) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }

  /* ── Documents ────────────────────────────────────────────── */
  var DOC_CATEGORY_LABELS = {
    'qonunlar': 'Qonunlar va qarorlar',
    'davlat-dasturlari': 'Davlat dasturlari',
    'nogironlar-huquqi': 'Nogironlar huquqlarini himoya qilish',
    'rasmiy-hujjat': 'Rasmiy hujjatlar'
  };

  function renderDocumentsPage(items, container) {
    if (!items.length) { container.innerHTML = '<p role="status" data-i18n="pages.docs.empty">Hujjatlar topilmadi.</p>'; applyI18n(container); return; }
    var byCat = {};
    items.forEach(function (d) {
      var cat = d.category || 'boshqa';
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(d);
    });
    var html = '';
    var order = ['qonunlar', 'davlat-dasturlari', 'nogironlar-huquqi', 'rasmiy-hujjat'];
    order.forEach(function (cat) {
      var arr = byCat[cat];
      if (!arr || !arr.length) return;
      // Newest documents first within each category — was raw API
      // order, so a 2025 decree could sit below a 2018 one.
      arr.sort(function (a, b) {
        return (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
      });
      var label = DOC_CATEGORY_LABELS[cat] || cat;
      html += '<h2 class="section-title mt-section">' + label + '</h2>';
      html += '<div class="doc-table">';
      html += '<div class="doc-row head"><span data-i18n="pages.docs.colName">Hujjat nomi</span><span data-i18n="pages.docs.colCategory">Toifa</span><span data-i18n="pages.docs.colDate">Sana</span></div>';
      arr.forEach(function (d) {
        html += '<div class="doc-row" data-va-type="documents" data-va-id="' + esc(d.id || '') + '">'
          + '<a href="news-detail?id=' + encodeURIComponent(d.id) + '&type=documents" style="color:#0e7490;text-decoration:underline;font-weight:600">' + esc(d.title) + '</a>'
          + '<span>' + esc(label) + '</span>'
          + '<time datetime="' + esc(_datePart(d.date) || '') + '">' + fmtDate(d.date) + '</time>'
          + '</div>';
      });
      html += '</div>';
    });
    container.innerHTML = html;
    applyI18n(container);
  }

  /* ── Paginated list with "Load more" ──────────────────────── */
  function renderPaginatedList(container, kind, renderFn) {
    var allItems = [];
    var offset = 0;
    var total = 0;
    var gridEl = null;
    var loadMoreBtn = null;
    var inFlight = false;

    function loadPage() {
      // Guard against double-fire from rapid clicks on the load-more
      // button — the click could land twice before the network
      // request returned, duplicating items in the grid.
      if (inFlight) return;
      inFlight = true;
      // aria-busy lets screen readers defer announcing partial DOM
      // changes until the load completes. Without this, the
      // aria-live="polite" container would announce each rendered
      // card as it lands during pagination, flooding the SR queue.
      try { container.setAttribute('aria-busy', 'true'); } catch (e) {}
      var btnEl = loadMoreBtn && loadMoreBtn.querySelector('#loadMoreBtn');
      var btnLabel = btnEl ? btnEl.innerHTML : '';
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = '<i class="ph ph-spinner" aria-hidden="true"></i> ' + (window.ngoI18n && window.ngoI18n.t ? window.ngoI18n.t('common.loading', 'Yuklanmoqda...') : 'Yuklanmoqda...');
      }
      // Match the homepage news/events strips and cabinet listings
      // by hiding archived items by default. Without this, the
      // full-page /news, /events, /grants listings showed archived
      // alongside current — inconsistent with every other surface
      // that fetches the same data.
      var url = kind + '?limit=100&offset=' + offset + '&archive=0';
      // Drop any stale mid-pagination error notice from a prior retry —
      // if this fetch succeeds we don't want it to linger above the
      // newly appended items.
      var staleErr = container.querySelector('.load-more-err');
      if (staleErr) staleErr.parentNode.removeChild(staleErr);
      fetchWithTimeout(API_BASE + url + '&_=' + Date.now())
        .then(function (r) {
          // Throw on non-2xx so .catch() handles error UI uniformly.
          // Previously we returned an empty page on 5xx, which fed
          // through the success path: first-load showed "topilmadi"
          // and mid-pagination silently hid the load-more button.
          if (!r.ok) { var e = new Error('http_' + r.status); e.status = r.status; throw e; }
          return r.json();
        })
        .then(function (data) {
          var items = data.items || [];
          total = data.total || 0;
          allItems = allItems.concat(items);
          offset += items.length;

          if (!gridEl) {
            container.innerHTML = '';
            renderFn(allItems, container);
            gridEl = container.querySelector('.gov-news-grid, .cards, .doc-table');
          } else {
            var temp = document.createElement('div');
            renderFn(items, temp);
            var newGrid = temp.querySelector('.gov-news-grid, .cards, .doc-table');
            if (newGrid && gridEl) {
              while (newGrid.firstChild) gridEl.appendChild(newGrid.firstChild);
            }
          }

          if (!loadMoreBtn) {
            loadMoreBtn = document.createElement('div');
            loadMoreBtn.className = 'load-more-wrap';
            loadMoreBtn.innerHTML = '<button class="btn" id="loadMoreBtn" data-i18n="common.loadMore">Ko\'proq ko\'rish</button>'
              + '<p class="load-more-count" id="loadMoreCount"></p>';
            container.appendChild(loadMoreBtn);
            loadMoreBtn.querySelector('#loadMoreBtn').addEventListener('click', loadPage);
          }

          var countEl = container.querySelector('#loadMoreCount');
          // Number stays literal; the trailing word carries data-i18n so a
          // language switch re-localizes it via the loader's apply(document).
          if (countEl) countEl.innerHTML = allItems.length + ' / ' + total + ' <span data-i18n="common.showing">ko\'rsatilmoqda</span>';
          applyI18n(loadMoreBtn);

          if (offset >= total) {
            var btn = container.querySelector('#loadMoreBtn');
            if (btn) btn.style.display = 'none';
          }
          inFlight = false;
          try { container.setAttribute('aria-busy', 'false'); } catch (e) {}
          var btnReEnable = loadMoreBtn && loadMoreBtn.querySelector('#loadMoreBtn');
          if (btnReEnable) {
            btnReEnable.disabled = false;
            if (btnLabel) btnReEnable.innerHTML = btnLabel;
          }
        })
        .catch(function () {
          inFlight = false;
          try { container.setAttribute('aria-busy', 'false'); } catch (e) {}
          var btnReEnable = loadMoreBtn && loadMoreBtn.querySelector('#loadMoreBtn');
          if (btnReEnable) {
            btnReEnable.disabled = false;
            if (btnLabel) btnReEnable.innerHTML = btnLabel;
          }
          if (!allItems.length) {
            container.innerHTML = '<p role="alert">Yuklanmadi. Internet aloqangizni tekshirib, sahifani yangilang.</p>';
          } else if (loadMoreBtn) {
            // Mid-pagination failure: keep loaded items + button
            // visible (so retry works), but make the failure visible.
            // Previously the click silently re-enabled the button
            // and the user assumed nothing happened.
            if (!container.querySelector('.load-more-err')) {
              var msg = document.createElement('p');
              msg.className = 'load-more-err';
              msg.setAttribute('role', 'alert');
              msg.style.cssText = 'color:var(--error-600,#dc2626);font-size:13px;text-align:center;margin:8px 0 0;';
              msg.textContent = 'Keyingi yozuvlarni yuklab bo\'lmadi. Tugmani qaytadan bosing yoki keyinroq urinib ko\'ring.';
              loadMoreBtn.parentNode.insertBefore(msg, loadMoreBtn);
            }
          }
        });
    }

    container.innerHTML = '<p class="loading-text" role="status" data-i18n="common.loading">Yuklanmoqda...</p>';
    applyI18n(container);
    loadPage();
  }

  /* ── Auto-init on page load ───────────────────────────────── */
  function init() {
    // Format integer with space-separated thousands (1 234) to match
    // hardcoded fallback values around live stats.
    function fmtNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

    // Hero stat: total registered member organizations.
    // Canonical member-org total — the single source for every member count
    // on the page. Update all [data-live-stat="member-orgs"] elements and
    // announce the number so the growth chart card derives its 2025 point +
    // headline stats from it instead of its own hardcoded figures.
    function applyLiveOrgTotal(total) {
      if (typeof total !== 'number') return;
      var s = fmtNum(total);
      var liveOrgEls = document.querySelectorAll('[data-live-stat="member-orgs"]');
      for (var i = 0; i < liveOrgEls.length; i++) liveOrgEls[i].textContent = s;
    }
    fetchWithTimeout(API_BASE + 'organizations?limit=1')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (typeof d.total !== 'number') return;
        applyLiveOrgTotal(d.total);
        window.__ngoMemberTotal = d.total;
        try { window.dispatchEvent(new CustomEvent('ngo:member-total', { detail: d.total })); } catch (e) {}
      })
      .catch(function () { /* leave loading placeholders when live count is unavailable */ });
    if (window.ngoI18n && typeof window.ngoI18n.onChange === 'function') {
      window.ngoI18n.onChange(function () { applyLiveOrgTotal(window.__ngoMemberTotal); });
    }

    // Hero stat: total events held (past). Compute as totalEvents -
    // upcomingEvents via two cheap 1-row requests. Hardcoded fallback
    // (1 411) is the historic pre-API count; only update if the live
    // number exceeds the fallback so we don't downgrade.
    var liveEventsHeldEl = document.querySelector('[data-live-stat="events-held"]');
    if (liveEventsHeldEl) {
      Promise.all([
        fetchWithTimeout(API_BASE + 'events?limit=1').then(function (r) { return r.json(); }),
        fetchWithTimeout(API_BASE + 'events?limit=1&archive=0').then(function (r) { return r.json(); })
      ])
        .then(function (results) {
          var t = (results[0] && typeof results[0].total === 'number') ? results[0].total : null;
          var u = (results[1] && typeof results[1].total === 'number') ? results[1].total : null;
          if (t === null || u === null) return;
          var held = Math.max(0, t - u);
          var fallback = parseInt(String(liveEventsHeldEl.textContent || '').replace(/\D/g, ''), 10) || 0;
          if (held > fallback) liveEventsHeldEl.textContent = fmtNum(held);
        })
        .catch(function () { /* keep hardcoded fallback */ });
    }

    // Home page — news (current only)
    var newsHomeEl = document.getElementById('dynamic-news-home');
    if (newsHomeEl) fetchJSON('news', function (items) {
      renderNewsHome(items, newsHomeEl);
      try { newsHomeEl.setAttribute('aria-busy', 'false'); } catch (e) {}
    }, 'archive=0');

    // Home page — events (current only)
    var eventsHomeEl = document.getElementById('dynamic-events-home');
    if (eventsHomeEl) fetchJSON('events', function (items) {
      renderEventsHome(items, eventsHomeEl);
      try { eventsHomeEl.setAttribute('aria-busy', 'false'); } catch (e) {}
    }, 'archive=0');

    // news.html full page — all articles with pagination
    var newsPageEl = document.getElementById('dynamic-news-page');
    if (newsPageEl) renderPaginatedList(newsPageEl, 'news', renderNewsPage);

    // events.html full page — all events with pagination
    var eventsPageEl = document.getElementById('dynamic-events-page');
    if (eventsPageEl) renderPaginatedList(eventsPageEl, 'events', renderEventsPage);

    // news-detail.html — use single-item API
    var newsDetailEl = document.getElementById('detail-news-content');
    var detailType = new URLSearchParams(window.location.search).get('type');
    if (newsDetailEl && detailType !== 'documents') {
      var newsId = new URLSearchParams(window.location.search).get('id');
      if (newsId) {
        fetchOne('news', newsId, function (item, errInfo) {
          if (item) {
            // renderNewsDetail toggles aria-busy=false itself once
            // it appends content; the others-fetch is best-effort.
            fetchJSON('news', function (others) { renderNewsDetail([item].concat(others), newsDetailEl, newsId); }, 'archive=0');
          } else if (errInfo && errInfo.__error) {
            newsDetailEl.innerHTML = '<p role="alert">Ma\'lumotni yuklab bo\'lmadi. Sahifani qayta yuklang yoki keyinroq urinib ko\'ring.</p>';
            try { newsDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
          } else {
            newsDetailEl.innerHTML = '<p role="alert">Yangilik topilmadi. <a href="news">Yangiliklar ro\'yxatiga qaytish</a></p>';
            try { newsDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
            markNotFound('Yangilik topilmadi — O\'zNNTMA | ngo.uz');
          }
        });
      } else {
        newsDetailEl.innerHTML = '<p role="status">Yangilik ID ko\'rsatilmagan.</p>';
        try { newsDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
      }
    }

    // event-detail.html — use single-item API
    var eventDetailEl = document.getElementById('detail-event-content');
    if (eventDetailEl) {
      var eventId = new URLSearchParams(window.location.search).get('id');
      if (eventId) {
        fetchOne('events', eventId, function (item, errInfo) {
          if (item) {
            fetchJSON('events', function (others) { renderEventDetail([item].concat(others), eventDetailEl, eventId); }, 'archive=0');
          } else if (errInfo && errInfo.__error) {
            eventDetailEl.innerHTML = '<p role="alert">Ma\'lumotni yuklab bo\'lmadi. Sahifani qayta yuklang yoki keyinroq urinib ko\'ring.</p>';
            try { eventDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
          } else {
            eventDetailEl.innerHTML = '<p role="alert">Tadbir topilmadi. <a href="events">Tadbirlar ro\'yxatiga qaytish</a></p>';
            try { eventDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
            markNotFound('Tadbir topilmadi — O\'zNNTMA | ngo.uz');
          }
        });
      } else {
        eventDetailEl.innerHTML = '<p role="status">Tadbir ID ko\'rsatilmagan.</p>';
        try { eventDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
      }
    }

    // grants.html — all grants with pagination
    var grantsEl = document.getElementById('dynamic-grants-page');
    if (grantsEl) renderPaginatedList(grantsEl, 'grants', renderGrantsPage);

    // official-docs.html — documents
    var docsEl = document.getElementById('dynamic-documents-page');
    if (docsEl) fillContainer('documents', docsEl, renderDocumentsPage);

    // news-detail.html — handle documents via ?type=documents
    if (newsDetailEl && detailType === 'documents') {
      var docId = new URLSearchParams(window.location.search).get('id');
      if (docId) {
        fetchOne('documents', docId, function (item, errInfo) {
          if (item) {
            renderNewsDetail([item], newsDetailEl, docId);
          } else if (errInfo && errInfo.__error) {
            newsDetailEl.innerHTML = '<p role="alert">Ma\'lumotni yuklab bo\'lmadi. Sahifani qayta yuklang yoki keyinroq urinib ko\'ring.</p>';
            try { newsDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
          } else {
            newsDetailEl.innerHTML = '<p role="alert">Hujjat topilmadi. <a href="official-docs">Hujjatlar ro\'yxatiga qaytish</a></p>';
            try { newsDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
            markNotFound('Hujjat topilmadi — O\'zNNTMA | ngo.uz');
          }
        });
      } else {
        newsDetailEl.innerHTML = '<p role="status">Hujjat ID ko\'rsatilmagan.</p>';
        try { newsDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
      }
    }

    // publications.html — nashrlar category
    var pubsEl = document.getElementById('dynamic-publications-page');
    if (pubsEl) fillContainer('news', pubsEl, renderNewsPage, 'category=nashrlar&archive=0');

    // video-detail.html — single video by ID. The id may belong to
    // a different news category; reject those so /video-detail?
    // id=<news-article> doesn't render a regular article inside
    // the video chrome.
    var videoDetailEl = document.getElementById('detail-video-content');
    if (videoDetailEl) {
      var vidId = new URLSearchParams(window.location.search).get('id');
      if (vidId) {
        fetchOne('news', vidId, function (item, errInfo) {
          if (item && (item.category || '').toLowerCase() === 'video') {
            fetchJSON('news', function (others) { renderNewsDetail([item].concat(others), videoDetailEl, vidId); }, 'category=video&archive=0');
          } else if (!item && errInfo && errInfo.__error) {
            videoDetailEl.innerHTML = '<p role="alert">Ma\'lumotni yuklab bo\'lmadi. Sahifani qayta yuklang yoki keyinroq urinib ko\'ring.</p>';
            try { videoDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
          } else {
            videoDetailEl.innerHTML = '<p role="alert">Video topilmadi. <a href="videos">Videolar ro\'yxatiga qaytish</a></p>';
            try { videoDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
            markNotFound('Video topilmadi — O\'zNNTMA | ngo.uz');
          }
        });
      } else {
        videoDetailEl.innerHTML = '<p role="status">Video ID ko\'rsatilmagan.</p>';
        try { videoDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
      }
    }

    // publication-detail.html — same category check as video-detail.
    var pubDetailEl = document.getElementById('detail-publication-content');
    if (pubDetailEl) {
      var pubId = new URLSearchParams(window.location.search).get('id');
      if (!pubId) {
        pubDetailEl.innerHTML = '<p role="status">Publikatsiya ID ko\'rsatilmagan.</p>';
        try { pubDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
      } else {
        fetchOne('news', pubId, function (item, errInfo) {
          if (item && (item.category || '').toLowerCase() === 'nashrlar') {
            fetchJSON('news', function (others) { renderNewsDetail([item].concat(others), pubDetailEl, pubId); }, 'category=nashrlar&archive=0');
          } else if (!item && errInfo && errInfo.__error) {
            pubDetailEl.innerHTML = '<p role="alert">Ma\'lumotni yuklab bo\'lmadi. Sahifani qayta yuklang yoki keyinroq urinib ko\'ring.</p>';
            try { pubDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
          } else {
            pubDetailEl.innerHTML = '<p role="alert">Publikatsiya topilmadi. <a href="publications">Publikatsiyalar ro\'yxatiga qaytish</a></p>';
            try { pubDetailEl.setAttribute('aria-busy', 'false'); } catch (e) {}
            markNotFound('Publikatsiya topilmadi — O\'zNNTMA | ngo.uz');
          }
        });
      }
    }

    // projects.html — grants as project cards
    var projGrantsEl = document.getElementById('dynamic-projects-grants');
    if (projGrantsEl) fillContainer('grants', projGrantsEl, renderGrantsPage, 'archive=0');

    // search-results.html — client-side search
    var searchResultsEl = document.getElementById('dynamic-search-results');
    if (searchResultsEl) {
      var query = new URLSearchParams(window.location.search).get('q') || '';
      var queryDisplay = document.getElementById('search-query');
      if (queryDisplay) queryDisplay.textContent = query || 'so\'rov';
      // Reflect the query in the browser tab + back-forward history
      // labels — landing on /search-results from a Telegram link
      // previously showed only the generic "Qidiruv natijalari" tab
      // title, indistinguishable from any other search.
      if (query) {
        try { document.title = '"' + query.slice(0, 60) + '" — Qidiruv natijalari — O\'zNNTMA | ngo.uz'; } catch (e) {}
      }
      // Two-section page (#search-static-results above us) means
      // main.js handles static-page matches; we only own news. On the
      // legacy single-bucket page, keep the old 'no results found'
      // copy since main.js shares this node.
      var hasStaticSection = !!document.getElementById('search-static-results');
      if (query) {
        fetchJSON('news', function (items, data) {
          // API failure shouldn't surface as "no matches" — that
          // misleads the user into thinking the query has no hits
          // when actually the backend is down. Show a recoverable
          // alert instead, leaving the static-results section alone
          // so any static-page matches still render.
          if (data && data.__error) {
            var errCopy = '<p role="alert" class="search-empty">Yangiliklar bo\'yicha qidiruv natijalarini yuklab bo\'lmadi. Internet aloqasini tekshirib, sahifani yangilang.</p>';
            searchResultsEl.innerHTML = errCopy;
            try { searchResultsEl.setAttribute('aria-busy', 'false'); } catch (e) {}
            return;
          }
          var q = query.toLowerCase();
          var matched = items.filter(function (n) {
            return (n.title && n.title.toLowerCase().indexOf(q) !== -1)
              || (n.excerpt && n.excerpt.toLowerCase().indexOf(q) !== -1);
          });
          if (matched.length) {
            var heading = hasStaticSection
              ? '<h2 class="search-section-title">Yangiliklar (' + matched.length + ')</h2>'
              : '';
            searchResultsEl.innerHTML = heading;
            // renderNewsPage replaces innerHTML; render into a temp
            // child so the heading sticks above the news grid.
            var grid = document.createElement('div');
            searchResultsEl.appendChild(grid);
            renderNewsPage(matched, grid);
          } else if (hasStaticSection) {
            // Static section may have its own results — silently leave
            // dynamic empty rather than printing a duplicate empty
            // state. If static is also empty, surface a single
            // combined message.
            var staticBody = (document.getElementById('search-static-results') || {}).innerHTML || '';
            if (!staticBody.trim()) {
              searchResultsEl.innerHTML = '<p class="search-empty">"' + esc(query) + '" bo\'yicha hech narsa topilmadi.</p>';
            } else {
              searchResultsEl.innerHTML = '';
            }
          } else {
            // Legacy single-bucket page — query is from ?q= URL param
            // and lands in innerHTML, so esc() is mandatory.
            searchResultsEl.innerHTML = '<p class="search-empty">"' + esc(query) + '" bo\'yicha hech narsa topilmadi.</p>';
          }
          try { searchResultsEl.setAttribute('aria-busy', 'false'); } catch (e) {}
        });
      } else {
        searchResultsEl.innerHTML = hasStaticSection ? '' : '<p class="search-empty">Qidiruv so\'rovi kiritilmagan.</p>';
        try { searchResultsEl.setAttribute('aria-busy', 'false'); } catch (e) {}
      }
    }

    // about.html — biz-haqimizda articles
    var aboutEl = document.getElementById('dynamic-about-page');
    if (aboutEl) fillContainer('news', aboutEl, renderNewsPage, 'category=biz-haqimizda&archive=0');

    // services.html — xalqaro-faoliyat articles
    var intlEl = document.getElementById('dynamic-intl-page');
    if (intlEl) fillContainer('news', intlEl, renderNewsPage, 'category=xalqaro-faoliyat&archive=0');

    // videos.html — video category
    var videoEl = document.getElementById('dynamic-video-page');
    if (videoEl) fillContainer('news', videoEl, renderNewsPage, 'category=video&archive=0');

    // dayjestlar.html — digest articles
    var digestEl = document.getElementById('dynamic-digest-page');
    if (digestEl) fillContainer('news', digestEl, renderNewsPage, 'category=daydjest&archive=0');

    // jamoatchilik-kengashi.html — kengash articles
    var councilEl = document.getElementById('dynamic-council-page');
    if (councilEl) fillContainer('news', councilEl, renderNewsPage, 'category=kengash&archive=0');

    // leadership.html — rahbariyat articles
    var leaderEl = document.getElementById('dynamic-leadership-page');
    if (leaderEl) fillContainer('news', leaderEl, renderNewsPage, 'category=rahbariyat&archive=0');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
