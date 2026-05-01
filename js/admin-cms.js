/* admin-cms.js — API-backed CMS engine for news, events, grants.
   Preserves the public interface of the earlier localStorage+GitHub version
   so admin-{news,events,grants}.html don't need to change. */

var AdminCMS = (function () {

  var UZ_MONTHS = [
    'yanvar','fevral','mart','aprel','may','iyun',
    'iyul','avgust','sentabr','oktabr','noyabr','dekabr'
  ];

  var cache = { news: [], events: [], grants: [], documents: [] };

  // ── helpers ──────────────────────────────────────────────

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  // Strip ids down to ASCII word/dash chars before they land in an
  // inline onclick="editItem('...')" / data-id="..." attribute. Backend
  // ids are already in this charset, so this is a defensive no-op for
  // legitimate data — but a single ' in an id would otherwise break
  // out of the JS string and execute attacker JS.
  function safeId(s) {
    return String(s == null ? '' : s).replace(/[^A-Za-z0-9_-]/g, '');
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
    var prefix = { news: 'news', events: 'event', grants: 'grant', documents: 'doc' }[type] || type;
    var stamp  = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14).toLowerCase();
    var rand   = Math.random().toString(36).slice(2, 6);
    return prefix + '-' + stamp + '-' + rand;
  }

  function _addDateLabels(type, item) {
    if (type === 'events') {
      if (item.date && !item.dateLabel) item.dateLabel = fmtDate(item.date);
      if (item.deadline && !item.deadlineLabel) item.deadlineLabel = fmtDate(item.deadline);
    } else if (type === 'grants') {
      if (item.deadline && !item.deadlineLabel) item.deadlineLabel = fmtDate(item.deadline);
    }
    return item;
  }

  // ── API (loads from api.ngo.uz) ──────────────────────────

  function load(type, cb) {
    if (!window.NgoApi) { cb(new Error('api_client_not_loaded')); return; }
    NgoApi.get('/admin/' + type + '?limit=200')
      .then(function (res) {
        var items = res.items || [];
        // Sort newest-first by date/created_at so admins editing
        // news/events/grants/documents see fresh content at the top
        // of the table. Backend ordering is not guaranteed; without
        // this admins were sometimes presented with stale 2024 items
        // first while their newly-created article sat at the bottom.
        items.sort(function (a, b) {
          var ta = new Date(a.date || a.created_at || a.published_at || 0).getTime() || 0;
          var tb = new Date(b.date || b.created_at || b.published_at || 0).getTime() || 0;
          return tb - ta;
        });
        cache[type] = items;
        cb(null, cache[type]);
      })
      .catch(function (err) { cache[type] = []; cb(err); });
  }

  function refresh(type, cb) { return load(type, cb); }

  function get(type) { return cache[type] || []; }

  function set(type, items) { cache[type] = items || []; }

  function create(type, fields) {
    if (!fields.id) fields.id = genId(type);
    _addDateLabels(type, fields);
    return NgoApi.post('/admin/' + type, fields).then(function (res) {
      if (res && res.item) {
        cache[type].unshift(res.item);
      }
      return res && res.item;
    });
  }

  function update(type, id, fields) {
    _addDateLabels(type, fields);
    return NgoApi.patch('/admin/' + type + '/' + encodeURIComponent(id), fields).then(function (res) {
      if (res && res.item) {
        for (var i = 0; i < cache[type].length; i++) {
          if (cache[type][i].id === id) { cache[type][i] = res.item; break; }
        }
      }
      return res && res.item;
    });
  }

  function remove(type, id) {
    return NgoApi.del('/admin/' + type + '/' + encodeURIComponent(id)).then(function () {
      cache[type] = cache[type].filter(function (x) { return x.id !== id; });
      return true;
    });
  }

  // ── publish() retained as a no-op for backward compatibility.
  // In the new world every create/update/remove already persists to the API.
  function publish(type, cb) { if (cb) setTimeout(function () { cb(null); }, 0); }

  function exportJson(type) {
    var blob = new Blob([JSON.stringify(cache[type] || [], null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = type + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generic CSV exporter delegates to the pacta-foundation helper
  // installed on window. Kept on AdminCMS for callers that already
  // import this module.
  function exportCsv(filename, rows, headers) {
    if (typeof window.exportCsv === 'function') return window.exportCsv(filename, rows, headers);
    return false;
  }

  function uploadFile(fileInput, cb) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      cb(new Error('Fayl tanlanmagan'));
      return;
    }
    var fd = new FormData();
    fd.append('file', fileInput.files[0]);
    // Uploads need more headroom than the 15s api-client default —
    // a 10 MB cover image on a slow connection routinely exceeds it
    // and the user just sees 'Xatolik!'. 90s matches the 60s used by
    // the iter-108 cabinet upload buttons, with extra slack since
    // these run on admin desktop sessions where 4G/3G is rarer.
    NgoApi.post('/admin/upload', fd, { timeout: 90000 })
      .then(function (res) { cb(null, res); })
      .catch(function (err) { cb(err); });
  }

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
    exportCsv : exportCsv,
    uploadFile: uploadFile,
    fmtDate   : fmtDate,
    today     : today,
    esc       : esc,
    safeId    : safeId,
    genId     : genId
  };

})();
