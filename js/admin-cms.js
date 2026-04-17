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
      .then(function (res) { cache[type] = res.items || []; cb(null, cache[type]); })
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

  function uploadFile(fileInput, cb) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) { cb(new Error('No file selected')); return; }
    var fd = new FormData();
    fd.append('file', fileInput.files[0]);
    NgoApi.post('/admin/upload', fd)
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
    uploadFile: uploadFile,
    fmtDate   : fmtDate,
    today     : today,
    esc       : esc,
    genId     : genId
  };

})();
