(function () {
  'use strict';

  var API = '/api/visual-content';
  var GLOBAL_FOOTER_PAGE = '__global_footer';
  var loadedPatches = [];
  var refreshTimer = 0;
  var isRefreshing = false;
  var CANDIDATE_SELECTOR = [
    'main h1', 'main h2', 'main h3', 'main h4', 'main p', 'main li',
    'main th', 'main td', 'main svg text', 'main tspan',
    'main .card', 'main article.card', 'main article:not([data-va-type])',
    'main .hero-stat', 'main .hero-stat-num', 'main .hero-stat-label', 'main .nnt-stat-box', 'main .struct-stat',
    'main .council-stat', 'main .kpi', 'main .criterion-card', 'main .apply-step',
    'main .partner', 'main .vazifa-card', 'main .about-reg-card', 'main .cert-level-card',
    'main .doc-row:not(.head)', 'main tbody tr', 'main .vacancy', 'main .media-card',
    'main img', 'main a.btn', 'main a.social-link',
    'main .partner-grid', 'main .partner', 'main .useful-links-grid', 'main .useful-link-card',
    'main .team-grid', 'main .team-card', 'main .leader-card',
    'main .proj-accordion', 'main .proj-item',
    'footer h2', 'footer p', 'footer span', 'footer a', 'footer img'
  ].join(',');
  var PROTECTED_SELECTOR = [
    'header', 'nav', 'form', 'fieldset', 'select', 'option', 'input', 'textarea', 'button',
    '[role="navigation"]', '[role="search"]', '[role="tablist"]', '[role="tab"]',
    '.site-header', '.topbar', '.menu', '.nav-item', '.dropdown',
    '.language-switcher', '.search-overlay', '.search-btn', '.membership-overlay',
    '.breadcrumbs', '.breadcrumb', '.pagination', '.pager', '.tabs', '.lang-tabs',
    '.filter-chip', '.u-filter-row', '.form-field', '.form-actions', '.form-card',
    '.nnt-cards', '.nnt-card', '.nnt-stat',
    '.va-live-controls', '.va-live-add', '.va-generic-controls', '.va-generic-add'
  ].join(',');

  function pageKey() {
    var path = location.pathname || '/';
    path = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
    return path || '/';
  }

  function assignIds(root) {
    var nodes = Array.prototype.slice.call((root || document).querySelectorAll(CANDIDATE_SELECTOR));
    nodes.forEach(function (node) {
      if (node.closest && !node.closest('footer.site-footer,.site-footer') && node.closest(PROTECTED_SELECTOR)) return;
      if (!node.getAttribute('data-va-block-id')) node.setAttribute('data-va-block-id', blockId(node));
    });
  }

  function blockId(node) {
    var addedId = node && node.getAttribute && node.getAttribute('data-va-added-id');
    if (addedId) return addedId;
    var parts = [];
    var cur = node;
    while (cur && cur.nodeType === 1 && cur !== document.body) {
      var tag = cur.tagName.toLowerCase();
      var idx = 1;
      var sib = cur;
      while ((sib = sib.previousElementSibling)) {
        if (sib.tagName && sib.tagName.toLowerCase() === tag) idx++;
      }
      parts.unshift(tag + ':' + idx);
      cur = cur.parentElement;
    }
    return parts.join('/');
  }

  function applyPatch(patch) {
    if (!patch || !patch.id) return;
    var el = document.querySelector('[data-va-block-id="' + cssEscape(patch.id) + '"]');
    if (patch.action === 'delete') {
      if (el) el.hidden = true;
      return;
    }
    if (patch.action === 'add') {
      var target = document.querySelector('[data-va-block-id="' + cssEscape(patch.targetId || '') + '"]') || document.querySelector('main .container, main, body');
      if (!target || !patch.html) return;
      var marker = document.querySelector('[data-va-added-id="' + cssEscape(patch.id) + '"]');
      // `refresh()` also runs after dynamic DOM changes. Replacing an existing
      // marker here strips the editor controls that visual-admin just attached,
      // which triggers both observers again and creates a replace/reinject loop.
      // Patch content only changes across a page load (the API is fetched once),
      // so an existing marker is already the current representation.
      if (marker) return;
      var node = htmlToAddedNode(patch);
      if (patch.position === 'before') target.parentNode.insertBefore(node, target);
      else if (patch.position === 'prepend') target.insertBefore(node, target.firstChild);
      else if (patch.position === 'append') target.appendChild(node);
      else target.parentNode.insertBefore(node, target.nextSibling);
      return;
    }
    if (!el) return;
    if (patch.action === 'html' && patch.html != null) el.innerHTML = patch.html;
    else if (patch.action === 'text' && patch.text != null) el.textContent = patch.text;
    else if (patch.action === 'attrs') {
      if (patch.src != null && el.tagName === 'IMG') el.setAttribute('src', patch.src);
      if (patch.alt != null && el.tagName === 'IMG') el.setAttribute('alt', patch.alt);
      if (patch.href != null && el.tagName === 'A') el.setAttribute('href', patch.href);
      if (patch.text != null && el.tagName === 'A') el.textContent = patch.text;
      if (patch.html != null) el.innerHTML = patch.html;
    }
  }

  function refresh() {
    if (isRefreshing) return;
    isRefreshing = true;
    assignIds(document);
    loadedPatches.forEach(applyPatch);
    renumberTables();
    isRefreshing = false;
  }

  function renumberTables() {
    [
      '.idx-table tbody',
      '.council-table tbody',
      '.reg-table tbody'
    ].forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (tbody) {
        Array.prototype.forEach.call(tbody.querySelectorAll('tr'), function (row, index) {
          var first = row.querySelector('td:first-child');
          if (first && first.getAttribute('colspan') == null) setCellNumber(first, String(index + 1));
        });
      });
    });
  }

  function setCellNumber(cell, value) {
    var textNode = null;
    Array.prototype.some.call(cell.childNodes, function (node) {
      if (node.nodeType === 3 && String(node.nodeValue || '').trim()) {
        textNode = node;
        return true;
      }
      return false;
    });
    if (textNode) {
      textNode.nodeValue = value;
      return;
    }
    var anchor = cell.querySelector('.va-generic-controls');
    cell.insertBefore(document.createTextNode(value), anchor ? anchor.nextSibling : cell.firstChild);
  }

  function htmlToAddedNode(patch) {
    var template = document.createElement('template');
    template.innerHTML = patch.html || '';
    var nodes = Array.prototype.filter.call(template.content.childNodes, function (node) {
      return node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim());
    });
    var node;
    if (nodes.length === 1 && nodes[0].nodeType === 1) {
      node = nodes[0];
    } else {
      node = document.createElement('div');
      node.appendChild(template.content);
    }
    node.setAttribute('data-va-added-id', patch.id);
    // Added records use the patch id as their permanent editor identity. A
    // positional DOM path changes whenever a sibling is added or removed and,
    // more importantly, cannot be mapped back to the original `add` patch for
    // later edits/deletion.
    node.setAttribute('data-va-block-id', patch.id);
    node.setAttribute('data-va-added-target-id', patch.targetId || '');
    node.setAttribute('data-va-added-position', patch.position || 'after');
    return node;
  }

  function load() {
    Promise.all([GLOBAL_FOOTER_PAGE, pageKey()].map(function (key) {
      return fetch(API + '?page=' + encodeURIComponent(key), { headers: { accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : { items: [] }; })
        .catch(function () { return { items: [] }; });
    }))
      .then(function (results) {
        loadedPatches = [];
        results.forEach(function (res) {
          loadedPatches = loadedPatches.concat(res.items || []);
        });
        refresh();
      })
      .catch(function () {});
    refresh();
    observeMutations();
  }

  function observeMutations() {
    if (window.NGO_VISUAL_OVERRIDES_OBSERVING || !window.MutationObserver) return;
    var target = document.body;
    if (!target || typeof target.nodeType !== 'number') return;
    var observer = new MutationObserver(function (records) {
      if (isRefreshing) return;
      var relevant = records.some(function (record) {
        return Array.prototype.some.call(record.addedNodes || [], function (node) {
          if (!node || node.nodeType !== 1) return false;
          return !(node.matches && node.matches('.va-live-controls,.va-live-add,.va-generic-controls,.va-generic-add,.va-context-add,.va-i18n-controls'));
        });
      });
      if (!relevant) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, 120);
    });
    try {
      observer.observe(target, { childList: true, subtree: true });
      window.NGO_VISUAL_OVERRIDES_OBSERVING = true;
    } catch (e) {
      window.NGO_VISUAL_OVERRIDES_OBSERVING = false;
    }
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();

  window.NgoVisualOverrides = {
    assignIds: assignIds,
    blockId: blockId,
    pageKey: pageKey,
    applyPatch: applyPatch,
  };
})();
