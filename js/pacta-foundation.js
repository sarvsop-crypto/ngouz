(function () {
  'use strict';

  // CSV export helper exposed globally so admin pages can wire
  // their Eksport (CSV) buttons without duplicating the cell-quoting
  // and BOM-prefix logic. Used by admin-feedback / membership-
  // requests / corruption-reports / service-requests (iter 270-272).
  // Excel detects UTF-8 only when a BOM (﻿) leads the file.
  window.exportCsv = function (filename, rows, headers) {
    if (!rows || !rows.length) return false;
    function csvCell(v) {
      var s = String(v == null ? '' : v);
      // CSV formula-injection defang: cells starting with =, +, -, @
      // are interpreted as formulas by Excel / LibreOffice / Numbers
      // when the file is opened. A malicious user submitting a contact-
      // message name like '=cmd|'/c calc'!A1' would execute that on
      // every admin's machine that exports + opens this CSV. Prefix
      // a single tab so the cell renders as text. (The single-quote
      // prefix often used elsewhere is unreliable across spreadsheet
      // apps; tab works in Excel + LibreOffice.) Only apply when the
      // first char is one of the dangerous set so legitimate cells
      // ('John Doe', '+998 90...') aren't disturbed unless they
      // genuinely start with a formula trigger char.
      if (/^[=+\-@\t\r]/.test(s)) s = '\t' + s;
      if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    // Headers also go through csvCell — every current caller passes
    // ASCII column keys, but an untranslated header like 'F.I.Sh.' has
    // a period which CSV treats as data fine, while one like 'Note,
    // remarks' (comma) would silently corrupt the column count. Defense
    // in depth.
    var lines = [headers.map(csvCell).join(',')];
    rows.forEach(function (it) {
      lines.push(headers.map(function (h) { return csvCell(it[h]); }).join(','));
    });
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  };

  function ensureSkipLink() {
    var main = document.querySelector('main');
    if (!main) return;

    if (!main.id) {
      main.id = 'main-content';
    }

    // Skip-link target must be focusable for keyboard users — without
    // tabindex="-1" the anchor jump only moves SR cursor; Tab key
    // resumes from the previous focus position. WCAG 2.4.1.
    if (!main.hasAttribute('tabindex')) {
      main.setAttribute('tabindex', '-1');
    }

    if (!document.querySelector('.skip-link')) {
      var link = document.createElement('a');
      link.className = 'skip-link';
      link.href = '#' + main.id;
      link.textContent = "Asosiy kontentga o'tish";
      document.body.insertBefore(link, document.body.firstChild);
    }
  }

  function hardenLandmarks() {
    // <aside class="sidebar"> is the wrapper; the inner
    // <nav class="sidebar__nav" aria-label="Admin/Kabinet menyusi"> is
    // already the navigation landmark. Earlier this also set
    // role="navigation" on the aside, which created a duplicate
    // landmark — SR users heard the menu announced twice. Leave the
    // aside as its default <aside> semantic ("complementary"); only
    // give it an aria-label so screen readers can distinguish multiple
    // asides if any get added later.
    var sidebar = document.querySelector('.sidebar');
    if (sidebar && !sidebar.getAttribute('aria-label')) {
      sidebar.setAttribute('aria-label', 'Yon panel');
    }

    // The topbar is a <header class="topbar"> nested inside <main>.
    // Per ARIA 1.2, banner should be at document root and not inside
    // another landmark — this used to override the implicit "header
    // descendant of main" (no specific role) with role="banner",
    // creating a banner-inside-main landmark violation. Implicit
    // semantics handle it correctly; no override needed.

    var navs = document.querySelectorAll('nav.sidebar__nav');
    navs.forEach(function (nav) {
      if (!nav.getAttribute('aria-label')) {
        nav.setAttribute('aria-label', 'Asosiy menyu');
      }
    });

    // Tag KPI card grids as ARIA lists so screen readers announce
    // them as a group of related metrics, not 4-8 unrelated divs.
    // Idempotent: only sets role when missing, so manually-curated
    // markup (like the homepage hero with its own role="list") wins.
    document.querySelectorAll('.cards').forEach(function (grid) {
      if (!grid.hasAttribute('role')) grid.setAttribute('role', 'list');
      grid.querySelectorAll(':scope > .card').forEach(function (card) {
        if (!card.hasAttribute('role')) card.setAttribute('role', 'listitem');
      });
    });

    // Phosphor icons are decorative font glyphs — without aria-hidden,
    // some screen readers announce them as "graphic" or read the empty
    // <i> tag, cluttering the announcement of the actual button/link
    // label. Mark all of them hidden idempotently.
    document.querySelectorAll('i[class*="ph-"]').forEach(function (icon) {
      if (!icon.hasAttribute('aria-hidden')) icon.setAttribute('aria-hidden', 'true');
    });
  }

  function normalizeButtons() {
    document.querySelectorAll('button:not([type])').forEach(function (btn) {
      btn.type = 'button';
    });

    document.querySelectorAll('button').forEach(function (btn) {
      if (btn.getAttribute('aria-label')) return;
      if (btn.title) {
        btn.setAttribute('aria-label', btn.title);
        return;
      }

      if (btn.classList.contains('topbar-notifications-btn')) {
        btn.setAttribute('aria-label', 'Bildirishnomalar');
        return;
      }

      if (btn.matches('[data-action="row-menu"], .row-action-btn, .action-menu-btn')) {
        btn.setAttribute('aria-label', 'Qator amallari');
        return;
      }

      var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || !/[A-Za-z0-9]/.test(text)) {
        btn.setAttribute('aria-label', 'Amal');
      }
    });
  }


  function normalizeSelects() {
    document.querySelectorAll('select').forEach(function (select) {
      if (select.getAttribute('aria-label') || select.getAttribute('aria-labelledby')) return;

      if (select.id) {
        var label = document.querySelector('label[for="' + select.id + '"]');
        if (label) {
          var labelText = (label.textContent || '').replace(/\s+/g, ' ').trim();
          if (labelText) {
            select.setAttribute('aria-label', labelText);
            return;
          }
        }
      }

      if (select.name) {
        select.setAttribute('aria-label', select.name.replace(/[-_]+/g, ' ').trim());
      } else if (select.title) {
        select.setAttribute('aria-label', select.title.trim());
      } else {
        select.setAttribute('aria-label', 'Variantni tanlang');
      }
    });
  }
  function wrapTables() {
    var tables = document.querySelectorAll('table.table');
    tables.forEach(function (table) {
      var parent = table.parentElement;
      if (!parent) return;

      if (parent.classList.contains('table-responsive')) {
        return;
      }

      if (parent.style && parent.style.overflowX === 'auto') {
        parent.classList.add('table-responsive');
        if (parent.hasAttribute('style')) {
          parent.style.overflowX = '';
          if (!parent.getAttribute('style').trim()) {
            parent.removeAttribute('style');
          }
        }
        return;
      }

      var wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      // Keyboard-scrollable wrapper: tabindex makes the overflowing
      // wrapper focusable so keyboard users can horizontally scroll
      // wide tables.
      wrapper.setAttribute('tabindex', '0');
      // role="region" is only valid as a landmark when it has an
      // accessible name — earlier we set it unconditionally and let
      // aria-label be optional, which produced a nameless region that
      // SR users heard announced as just "region" with no context. Now
      // we derive a name from the <caption> first, then a labeled
      // ancestor section's heading; if neither is available, we drop
      // role="region" entirely so the wrapper stays focusable for
      // keyboard scroll without polluting the landmark tree.
      var caption = table.querySelector('caption');
      var label = caption ? (caption.textContent || '').trim() : '';
      if (!label) {
        var section = table.closest('section, [aria-labelledby]');
        if (section) {
          var labelledById = section.getAttribute('aria-labelledby');
          if (labelledById) {
            var labelEl = document.getElementById(labelledById);
            if (labelEl) label = (labelEl.textContent || '').trim();
          }
          if (!label) {
            var heading = section.querySelector('h1, h2, h3, .table-section__title');
            if (heading) label = (heading.textContent || '').trim();
          }
        }
      }
      if (label) {
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', label);
      }
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  // On phones the wide admin tables are rendered as stacked cards (see the
  // <=640px block in pacta-foundation.css). For that to read correctly each
  // cell needs to know its column heading, so we copy the matching <th> text
  // onto every <td> as data-label (CSS shows it via ::before). Rows are often
  // injected after an async fetch, so we also observe each tbody and label
  // rows as they arrive.
  function labelTableCells() {
    document.querySelectorAll('table.table').forEach(function (table) {
      var headRow = table.tHead && table.tHead.rows[0];
      var body = table.tBodies[0];
      if (!headRow || !body) return;

      var labels = Array.prototype.map.call(headRow.cells, function (th) {
        return (th.textContent || '').trim();
      });

      function labelRow(tr) {
        // Skip full-width state rows (loading / empty) — a single td that
        // spans the table with colspan, which shouldn't become a card field.
        if (tr.cells.length <= 1) return;
        Array.prototype.forEach.call(tr.cells, function (td, i) {
          if (td.hasAttribute('data-label')) return;
          td.setAttribute('data-label', labels[i] != null ? labels[i] : '');
        });
      }

      Array.prototype.forEach.call(body.rows, labelRow);

      if (!body.__cardsObserved) {
        body.__cardsObserved = true;
        new MutationObserver(function (mutations) {
          mutations.forEach(function (m) {
            Array.prototype.forEach.call(m.addedNodes, function (n) {
              if (n.nodeType === 1 && n.tagName === 'TR') labelRow(n);
            });
          });
        }).observe(body, { childList: true });
      }
    });
  }

  function optimizeImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      if (img.hasAttribute('loading')) return;

      if (img.closest('.header, .topbar, .sidebar__header, .main__profile')) {
        img.setAttribute('loading', 'eager');
      } else {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  function setupMobileSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var topbarLeft = document.querySelector('.topbar-left') || document.querySelector('.topbar');

    if (!sidebar || !topbarLeft) return;

    var menuBtn = document.querySelector('.mobile-nav-toggle');
    if (!menuBtn) {
      menuBtn = document.createElement('button');
      menuBtn.type = 'button';
      menuBtn.className = 'mobile-nav-toggle';
      menuBtn.setAttribute('aria-label', 'Yon panelni ochish');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-haspopup', 'true');
      // Sidebar id is stable: cabinet builds <aside class="sidebar">
      // and admin pages have static <aside class="sidebar"> markup.
      // Give it an id so aria-controls resolves correctly.
      if (!sidebar.id) sidebar.id = 'pactaSidebar';
      menuBtn.setAttribute('aria-controls', sidebar.id);
      menuBtn.innerHTML = '&#9776;';
      topbarLeft.insertBefore(menuBtn, topbarLeft.firstChild);
    }

    var backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    function setOpen(nextState) {
      var isMobile = window.matchMedia('(max-width: 1024px)').matches;
      if (!isMobile) {
        sidebar.classList.remove('is-mobile-open');
        backdrop.classList.remove('is-visible');
        document.body.classList.remove('sidebar-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        return;
      }

      sidebar.classList.toggle('is-mobile-open', nextState);
      backdrop.classList.toggle('is-visible', nextState);
      document.body.classList.toggle('sidebar-open', nextState);
      menuBtn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
    }

    menuBtn.addEventListener('click', function () {
      var isOpen = sidebar.classList.contains('is-mobile-open');
      setOpen(!isOpen);
    });

    backdrop.addEventListener('click', function () {
      setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    });

    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    window.addEventListener('resize', function () {
      setOpen(sidebar.classList.contains('is-mobile-open'));
    }, { passive: true });

    setOpen(false);
  }

  function applyInlineUtilityClasses() {
    document.querySelectorAll('[style]').forEach(function (el) {
      var styleText = (el.getAttribute('style') || '').replace(/\s+/g, '').toLowerCase();
      if (styleText === 'display:flex;align-items:center;gap:10px;') {
        el.classList.add('u-inline-stack');
        el.removeAttribute('style');
      }

      if (styleText === 'margin-top:auto;') {
        el.classList.add('u-mt-auto');
        el.removeAttribute('style');
      }
    });
  }

  var chartTextSelectors = [
    '.chart-card__title',
    '.chart-card__dropdown',
    '.chart-line__legend-item',
    '.chart-donut__legend-item',
    '.chart-line__tooltip-label',
    '.chart-line__tooltip-date',
    '.chart-line__xaxis span',
    '.chart-card__legend-item',
    '.recharts-text',
    '.recharts-legend-item-text',
    '.apexcharts-text',
    '.apexcharts-xaxis-label',
    '.apexcharts-yaxis-label'
  ].join(', ');
  var refreshButtonSelector = 'button[data-action="refresh"], .chart-card__refresh';

  var reportPeriods = ['weekly', 'monthly', 'quarterly', 'yearly'];

  function hasMojibake(text) {
    return /[\u00C3\u00C2\u00E2]/.test(text);
  }

  function decodeLatin1AsUtf8(text) {
    if (!text || typeof TextDecoder !== 'function') return text;
    try {
      var bytes = new Uint8Array(text.length);
      for (var i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i) & 0xff;
      }
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch (err) {
      return text;
    }
  }

  function repairMojibake(text) {
    if (!text || !hasMojibake(text)) return text;
    var next = text;
    for (var i = 0; i < 2; i++) {
      var decoded = decodeLatin1AsUtf8(next);
      if (!decoded || decoded === next) break;
      next = decoded;
      if (!hasMojibake(next)) break;
    }
    return next;
  }

  function normalizeReportPeriodButton(button) {
    if (!button) return;
    var raw = (button.textContent || '').replace(/\s+/g, ' ').trim();
    if (!raw) return;
    var repaired = repairMojibake(raw);
    var lowered = repaired.toLowerCase();
    var match = reportPeriods.find(function (period) {
      return lowered.indexOf(period) !== -1;
    });

    if (match) {
      var periodLabel = match.charAt(0).toUpperCase() + match.slice(1);
      var normalized = periodLabel + ' \u25BE';
      if (button.textContent !== normalized) {
        button.textContent = normalized;
      }
      button.setAttribute('data-selected-period', match);
      return;
    }

    if (repaired !== raw) {
      button.textContent = repaired;
    }
  }

  function normalizeRefreshButton(button) {
    if (!button || !(button instanceof Element) || !button.matches(refreshButtonSelector)) return;

    if (!button.getAttribute('aria-label')) {
      button.setAttribute('aria-label', 'Refresh');
    }

    var raw = (button.textContent || '').replace(/\s+/g, '');
    var repaired = repairMojibake(raw);
    var normalized = repaired.toUpperCase();
    if (!raw || normalized === '21BB' || normalized === '&#X21BB;' || normalized === 'U+21BB') {
      button.textContent = '\u21BB';
      return;
    }

    if (repaired !== raw) {
      button.textContent = repaired;
    }
  }

  function normalizeRefreshButtons() {
    document.querySelectorAll(refreshButtonSelector).forEach(normalizeRefreshButton);
  }

  function repairChartTextElement(el) {
    if (!el || !(el instanceof Element)) return;

    if (el.matches(refreshButtonSelector)) {
      normalizeRefreshButton(el);
      return;
    }

    if (el.matches('.chart-card__dropdown')) {
      normalizeReportPeriodButton(el);
      return;
    }

    var raw = el.textContent || '';
    if (!raw) return;
    var repaired = repairMojibake(raw);
    if (repaired !== raw) {
      el.textContent = repaired;
    }
  }

  function repairChartText() {
    document.querySelectorAll(chartTextSelectors).forEach(repairChartTextElement);
  }

  function observeChartTextMutations() {
    if (typeof MutationObserver !== 'function' || !document.body) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') {
          var parent = mutation.target && mutation.target.parentElement;
          if (parent) {
            repairChartTextElement(parent);
            normalizeRefreshButton(parent);
          }
          return;
        }

        if (mutation.target && mutation.target instanceof Element) {
          if (mutation.target.matches(chartTextSelectors)) {
            repairChartTextElement(mutation.target);
          }
          if (mutation.target.matches(refreshButtonSelector)) {
            normalizeRefreshButton(mutation.target);
          }
        }

        mutation.addedNodes.forEach(function (node) {
          if (!(node instanceof Element)) return;
          if (node.matches(chartTextSelectors)) {
            repairChartTextElement(node);
          }
          if (node.matches(refreshButtonSelector)) {
            normalizeRefreshButton(node);
          }
          node.querySelectorAll(chartTextSelectors).forEach(repairChartTextElement);
          node.querySelectorAll(refreshButtonSelector).forEach(normalizeRefreshButton);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function initChartTextRepair() {
    repairChartText();
    normalizeRefreshButtons();
    observeChartTextMutations();
    window.setTimeout(repairChartText, 150);
    window.setTimeout(normalizeRefreshButtons, 150);
  }

  // Sidebar search lives in #sidebarSearchTrigger > input on every
  // admin/cabinet shell. Typing into it did nothing — wire it to
  // hide non-matching nav links so users can quickly jump to the
  // section they want.
  function setupSidebarSearch() {
    var wrap = document.getElementById('sidebarSearchTrigger');
    if (!wrap) return;
    var input = wrap.querySelector('input');
    if (!input) return;
    var nav = document.querySelector('.sidebar__nav');
    if (!nav) return;
    // Stable id on the nav so SR users hear the input is wired to a
    // specific landmark, not "controls something". Idempotent — the
    // page may already have set this; only add if absent.
    if (!nav.id) nav.id = 'sidebarNav';
    if (!input.hasAttribute('aria-controls')) input.setAttribute('aria-controls', nav.id);
    input.addEventListener('input', function () {
      var q = (this.value || '').trim().toLowerCase();
      nav.querySelectorAll('.sidebar__nav-link').forEach(function (link) {
        if (link.classList.contains('logout')) return;
        var label = (link.textContent || '').toLowerCase();
        link.style.display = (!q || label.indexOf(q) !== -1) ? '' : 'none';
      });
      // Hide group labels when their entire section is filtered out.
      nav.querySelectorAll('.sidebar__nav-section').forEach(function (section) {
        var visibleLink = section.querySelector('.sidebar__nav-link:not([style*="display: none"])');
        var label = section.querySelector('.sidebar__nav-label');
        if (label) label.style.display = (q && !visibleLink) ? 'none' : '';
      });
    });
  }

  // Admin slide-out notification panel — was a hollow shell; the
  // panel template renders "Yuklanmoqda..." forever because no admin
  // page bound it. Cabinet has its own hydrator in cabinet-chrome.js.
  // Here we mirror that behavior using the /admin/notifications
  // endpoint when running on an admin page.
  function hydrateAdminNotifPanel() {
    if (typeof NgoApi === 'undefined' || !NgoApi.getUser || !NgoApi.getUser()) return;
    var listEl = document.getElementById('notifPanelList');
    if (!listEl) return;
    // Skip if cabinet-chrome already wired this (it runs first on
    // cabinet pages and hydrates from /cabinet/notifications).
    if (location.pathname.indexOf('/cabinet/') !== -1) return;
    var TYPE_ICONS = {
      warning: 'ph-warning', info: 'ph-bell', success: 'ph-check-circle',
      action: 'ph-lightning', error: 'ph-x-circle', system: 'ph-gear', security: 'ph-lock'
    };
    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function relTime(iso) {
      if (!iso) return '';
      var ms = new Date(iso).getTime();
      // Backend can return malformed/null/empty timestamps; without a
      // NaN guard the formula produces 'NaN kun oldin', a visible bug.
      // Falling back to the raw ISO string preserves whatever info the
      // backend sent for the user.
      if (isNaN(ms)) return String(iso);
      var diff = (Date.now() - ms) / 1000;
      if (diff < 60) return 'Hozir';
      if (diff < 3600) return Math.floor(diff / 60) + ' daqiqa oldin';
      if (diff < 86400) return Math.floor(diff / 3600) + ' soat oldin';
      return Math.floor(diff / 86400) + ' kun oldin';
    }
    listEl.setAttribute('aria-busy', 'true');
    NgoApi.get('/admin/notifications').then(function (res) {
      var items = (res.items || []).slice(0, 5);
      if (!items.length) {
        listEl.innerHTML = '<p class="text-dim" role="status" style="text-align:center;padding:20px;">Bildirishnomalar yo‘q</p>';
      } else {
        listEl.innerHTML = items.map(function (n) {
          var icon = TYPE_ICONS[n.type] || 'ph-bell';
          var dot = n.is_read ? '' : ' <span class="notifications-panel__dot"></span>';
          var ts = String(n.created_at || '');
          var timeHtml = ts
            ? '<time datetime="' + esc(ts.slice(0, 10)) + '">' + relTime(ts) + '</time>'
            : '';
          return '<div class="notifications-panel__item">' +
            '<div class="notifications-panel__icon"><i class="ph ' + icon + '" aria-hidden="true"></i></div>' +
            '<div class="notifications-panel__content">' +
              '<p class="notifications-panel__item-title">' + esc(n.title || '') + dot + '</p>' +
              '<p class="notifications-panel__item-body">' + esc(n.body || '') + '</p>' +
              '<p class="notifications-panel__item-time">' + timeHtml + '</p>' +
            '</div></div>';
        }).join('');
      }
      var unread = (res.items || []).filter(function (n) { return !n.is_read; }).length;
      var badge = document.querySelector('.topbar-notifications-badge');
      if (badge) {
        badge.textContent = unread || '';
        badge.style.display = unread ? '' : 'none';
      }
      var bellBtn = document.getElementById('notificationsBtn');
      if (bellBtn) {
        bellBtn.setAttribute('aria-label',
          unread ? 'Bildirishnomalar, ' + unread + ' yangi' : 'Bildirishnomalar');
      }
      // Admin /admin/notifications/mark-read is not implemented
      // backend-side (returns 404 as of 2026-05-01). Keep the CTA
      // hidden on admin until the route exists — a click would just
      // 404 and confuse the admin. Cabinet has its own hydrator
      // wiring via cabinet-chrome.js so this no-op is admin-scoped.
      var markBtn = document.getElementById('notifMarkAllRead');
      if (markBtn) markBtn.setAttribute('hidden', '');
      listEl.setAttribute('aria-busy', 'false');
    }).catch(function () {
      // Without a visible failure state, /admin/notifications outage
      // left the slide-out panel stuck on "Yuklanmoqda..." forever.
      if (listEl) {
        listEl.innerHTML = '<p role="alert" style="text-align:center;padding:20px;color:var(--error-600,#dc2626);">Bildirishnomalarni yuklab bo‘lmadi. Sahifani yangilang yoki internet aloqangizni tekshiring.</p>';
        listEl.setAttribute('aria-busy', 'false');
      }
    });
  }

  // The desktop sidebar collapse toggle (#sidebarToggle) is in markup
  // on every admin page (and built late by cabinet-chrome.js for
  // cabinet pages) but had no JS handler — clicking it did nothing
  // despite the .sidebar.is-collapsed CSS already existing in
  // pacta-sidebar.css. Use event delegation + a per-mount hydration
  // pass so this works for both initial-render (admin) and late-
  // injected (cabinet) sidebar markup, and persist state so the
  // collapsed preference survives page navigations.
  function setupSidebarCollapse() {
    var KEY = 'admin_sidebar_collapsed';
    function apply(sidebar, btn, collapsed) {
      sidebar.classList.toggle('is-collapsed', collapsed);
      if (btn) {
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        btn.setAttribute('aria-label', collapsed ? 'Yon panelni ochish' : 'Yon panelni yopish');
      }
    }
    function hydrate() {
      var sidebar = document.querySelector('.sidebar');
      var btn = document.getElementById('sidebarToggle');
      if (!sidebar || !btn || btn.dataset.collapseWired === '1') return;
      btn.dataset.collapseWired = '1';
      if (sidebar.getAttribute('data-sidebar-default') === 'expanded') {
        apply(sidebar, btn, false);
        return;
      }
      try {
        var saved = localStorage.getItem(KEY);
        if (saved === '1') apply(sidebar, btn, true);
      } catch (e) {}
    }
    // Initial pass — covers admin pages where markup is server-rendered.
    hydrate();
    // Re-run on a short delay so cabinet pages that mount the sidebar
    // via cabinet-chrome.js's setTimeout(50ms) after DOMContentLoaded
    // also get hydrated without each cabinet page needing its own
    // wire-up call.
    setTimeout(hydrate, 80);
    // Document-level click delegate — handles both early and late
    // mounted toggles, and survives any future re-mount of the sidebar.
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('#sidebarToggle');
      if (!btn) return;
      var sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      var nowCollapsed = !sidebar.classList.contains('is-collapsed');
      apply(sidebar, btn, nowCollapsed);
      try { localStorage.setItem(KEY, nowCollapsed ? '1' : '0'); } catch (e2) {}
    });
  }

  function init() {
    ensureSkipLink();
    hardenLandmarks();
    normalizeButtons();
    normalizeSelects();
    wrapTables();
    labelTableCells();
    optimizeImages();
    setupMobileSidebar();
    setupSidebarSearch();
    setupSidebarCollapse();
    applyInlineUtilityClasses();
    initChartTextRepair();
    hydrateAdminNotifPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
