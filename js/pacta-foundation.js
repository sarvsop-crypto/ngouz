(function () {
  'use strict';

  function ensureSkipLink() {
    var main = document.querySelector('main');
    if (!main) return;

    if (!main.id) {
      main.id = 'main-content';
    }

    if (!document.querySelector('.skip-link')) {
      var link = document.createElement('a');
      link.className = 'skip-link';
      link.href = '#' + main.id;
      link.textContent = 'Skip to content';
      document.body.insertBefore(link, document.body.firstChild);
    }
  }

  function hardenLandmarks() {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.setAttribute('role', sidebar.getAttribute('role') || 'navigation');
      if (!sidebar.getAttribute('aria-label')) {
        sidebar.setAttribute('aria-label', 'Primary navigation');
      }
    }

    var topbar = document.querySelector('.topbar');
    if (topbar && !topbar.getAttribute('role')) {
      topbar.setAttribute('role', 'banner');
    }

    var navs = document.querySelectorAll('nav.sidebar__nav');
    navs.forEach(function (nav) {
      if (!nav.getAttribute('aria-label')) {
        nav.setAttribute('aria-label', 'Main navigation');
      }
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
        btn.setAttribute('aria-label', 'Open notifications');
        return;
      }

      if (btn.matches('[data-action="row-menu"], .row-action-btn, .action-menu-btn')) {
        btn.setAttribute('aria-label', 'Row actions');
        return;
      }

      var text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || !/[A-Za-z0-9]/.test(text)) {
        btn.setAttribute('aria-label', 'Action');
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
        select.setAttribute('aria-label', 'Select option');
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
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
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
      menuBtn.setAttribute('aria-label', 'Open navigation menu');
      menuBtn.setAttribute('aria-expanded', 'false');
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
    });

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

  function init() {
    ensureSkipLink();
    hardenLandmarks();
    normalizeButtons();
    normalizeSelects();
    wrapTables();
    optimizeImages();
    setupMobileSidebar();
    applyInlineUtilityClasses();
    initChartTextRepair();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

