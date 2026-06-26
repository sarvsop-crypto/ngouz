(function () {
  'use strict';

  var API = '/api/visual-content';
  var CANDIDATE_SELECTOR = [
    'main h1', 'main h2', 'main h3', 'main h4', 'main p', 'main li', 'main label', 'main button', 'main span:not([aria-hidden])',
    'main .card', 'main article.card', 'main article:not([data-va-type])',
    'main img', 'main a.btn', 'main a.social-link',
    'footer h2', 'footer p', 'footer a', '.topbar a', '.topbar img'
  ].join(',');

  function pageKey() {
    var path = location.pathname || '/';
    path = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
    return path || '/';
  }

  function assignIds(root) {
    var nodes = Array.prototype.slice.call((root || document).querySelectorAll(CANDIDATE_SELECTOR));
    nodes.forEach(function (node) {
      if (node.closest && node.closest('.va-live-controls,.va-live-add,.search-overlay,.membership-overlay')) return;
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
      var wrap = marker || document.createElement('div');
      wrap.setAttribute('data-va-added-id', patch.id);
      wrap.innerHTML = patch.html;
      if (!marker) {
        if (patch.position === 'before') target.parentNode.insertBefore(wrap, target);
        else if (patch.position === 'prepend') target.insertBefore(wrap, target.firstChild);
        else target.parentNode.insertBefore(wrap, target.nextSibling);
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
    }
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
