(function () {
  'use strict';

  var API = '/api/visual-content';
  var CANDIDATE_SELECTOR = [
    'main h1', 'main h2', 'main h3', 'main h4', 'main p', 'main li',
    'main .card', 'main article.card', 'main article:not([data-va-type])',
    'main img', 'main a.btn', 'main a.social-link',
    'main .partner-grid', 'main .partner', 'main .useful-links-grid', 'main .useful-link-card',
    'main .team-grid', 'main .team-card', 'main .leader-card',
    'main .proj-accordion', 'main .proj-item'
  ].join(',');
  var PROTECTED_SELECTOR = [
    'header', 'footer', 'nav', 'form', 'fieldset', 'select', 'option', 'input', 'textarea', 'button',
    '[role="navigation"]', '[role="search"]', '[role="tablist"]', '[role="tab"]',
    '.site-header', '.site-footer', '.topbar', '.menu', '.nav-item', '.dropdown',
    '.language-switcher', '.search-overlay', '.search-btn', '.membership-overlay',
    '.breadcrumbs', '.breadcrumb', '.pagination', '.pager', '.tabs', '.lang-tabs',
    '.filter-chip', '.u-filter-row', '.form-field', '.form-actions', '.form-card',
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
      if (node.closest && node.closest(PROTECTED_SELECTOR)) return;
      if (!node.getAttribute('data-va-block-id')) node.setAttribute('data-va-block-id', blockId(node));
    });
  }

  function blockId(node) {
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
      var node = htmlToAddedNode(patch);
      if (marker) {
        marker.parentNode.replaceChild(node, marker);
      } else {
        if (patch.position === 'before') target.parentNode.insertBefore(node, target);
        else if (patch.position === 'prepend') target.insertBefore(node, target.firstChild);
        else if (patch.position === 'append') target.appendChild(node);
        else target.parentNode.insertBefore(node, target.nextSibling);
      }
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
    return node;
  }

  function load() {
    assignIds(document);
    fetch(API + '?page=' + encodeURIComponent(pageKey()), { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .then(function (res) { (res.items || []).forEach(applyPatch); })
      .catch(function () {});
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
