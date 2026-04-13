/* admin-cms.js — CMS engine for news, events, grants
   Storage : localStorage (instant, offline)
   Publish : GitHub Contents API (optional – needs token in Settings)
   Export  : download JSON for manual deploy                         */

var AdminCMS = (function () {

  var REPO   = 'sarvsop-crypto/ngo';
  var BRANCH = 'main';
  var RAW    = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/data/';
  var API    = 'https://api.github.com/repos/' + REPO + '/contents/data/';

  var LS = { news: 'admin_cms_news', events: 'admin_cms_events', grants: 'admin_cms_grants' };

  var UZ_MONTHS = [
    'yanvar','fevral','mart','aprel','may','iyun',
    'iyul','avgust','sentabr','oktabr','noyabr','dekabr'
  ];

  // ── helpers ──────────────────────────────────────────────

  function esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.getUTCDate() + ' ' + UZ_MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function genId(type) {
    var prefix = { news: 'news', events: 'event', grants: 'grant' }[type] || type;
    var stamp  = new Date().toISOString().replace(/[-:T]/g,'').slice(0,14);
    var rand   = Math.random().toString(36).slice(2,6);
    return prefix + '-' + stamp + '-' + rand;
  }

  function getToken() {
    return localStorage.getItem('admin_github_token') || '';
  }

  // ── localStorage CRUD ────────────────────────────────────

  function get(type) {
    try {
      var raw = localStorage.getItem(LS[type]);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function set(type, items) {
    localStorage.setItem(LS[type], JSON.stringify(items));
  }

  // ── load: localStorage first, then GitHub ────────────────

  function load(type, cb) {
    var cached = get(type);
    if (cached) { cb(null, cached); return; }
    fetch(RAW + type + '.json?_=' + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        set(type, data);
        cb(null, data);
      })
      .catch(function (e) { cb(e, []); });
  }

  // refresh from GitHub (force-overwrite localStorage)
  function refresh(type, cb) {
    localStorage.removeItem(LS[type]);
    load(type, cb);
  }

  // ── create ───────────────────────────────────────────────

  function create(type, fields) {
    var items = get(type) || [];
    var item  = Object.assign({}, fields);
    item.id   = genId(type);
    _addDateLabels(type, item);
    items.unshift(item);
    set(type, items);
    return item;
  }

  // ── update ───────────────────────────────────────────────

  function update(type, id, fields) {
    var items = get(type) || [];
    var idx   = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return null;
    items[idx] = Object.assign({}, items[idx], fields);
    _addDateLabels(type, items[idx]);
    set(type, items);
    return items[idx];
  }

  // ── remove ───────────────────────────────────────────────

  function remove(type, id) {
    var items = (get(type) || []).filter(function (i) { return i.id !== id; });
    set(type, items);
  }

  // ── date-label helpers ───────────────────────────────────

  function _addDateLabels(type, item) {
    if (type === 'events') {
      if (item.date)     item.dateLabel     = fmtDate(item.date);
      if (item.deadline) item.deadlineLabel = fmtDate(item.deadline);
      else               item.deadlineLabel = null;
    }
    if (type === 'grants') {
      if (item.deadline) item.deadlineLabel = fmtDate(item.deadline);
      else               item.deadlineLabel = null;
    }
  }

  // ── publish via GitHub API ────────────────────────────────

  function publish(type, cb) {
    var token = getToken();
    if (!token) { cb(new Error('no_token')); return; }

    var items   = get(type) || [];
    var json    = JSON.stringify(items, null, 2);
    var encoded = btoa(unescape(encodeURIComponent(json)));
    var url     = API + type + '.json';
    var headers = {
      Authorization : 'token ' + token,
      Accept        : 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    // GET current file to obtain its SHA (required for PUT)
    fetch(url, { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (meta) {
        if (!meta.sha) throw new Error(meta.message || 'Fayl topilmadi');
        return fetch(url, {
          method  : 'PUT',
          headers : headers,
          body    : JSON.stringify({
            message : 'Update ' + type + '.json via admin CMS [' + today() + ']',
            content : encoded,
            sha     : meta.sha,
            branch  : BRANCH
          })
        });
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.content || res.commit) cb(null, res);
        else throw new Error(res.message || 'API xatoligi');
      })
      .catch(cb);
  }

  // ── export JSON download ──────────────────────────────────

  function exportJson(type) {
    var items = get(type) || [];
    var blob  = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    var a     = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = type + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }

  // ── public API ────────────────────────────────────────────

  return {
    load      : load,
    refresh   : refresh,
    get       : get,
    set       : set,
    create    : create,
    update    : update,
    remove    : remove,
    publish   : publish,
    exportJson: exportJson,
    fmtDate   : fmtDate,
    today     : today,
    esc       : esc
  };

})();
