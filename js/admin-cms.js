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

  // ── API (loads through the Cloudflare Worker proxy) ──────

  // Newest-first sort by date/created_at/published_at — extracted so
  // create() and update() can re-apply after mutating the cache,
  // keeping the in-memory order aligned with the load-time order.
  function _sortNewestFirst(arr) {
    arr.sort(function (a, b) {
      var ta = new Date(a.date || a.created_at || a.published_at || 0).getTime() || 0;
      var tb = new Date(b.date || b.created_at || b.published_at || 0).getTime() || 0;
      return tb - ta;
    });
    return arr;
  }

  function load(type, cb) {
    if (!window.NgoApi) { cb(new Error('api_client_not_loaded')); return; }
    NgoApi.get('/admin/' + type + '?limit=200')
      .then(function (res) {
        cache[type] = _sortNewestFirst(res.items || []);
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
        // unshift puts the just-created item at front; re-sort because
        // admin could have backdated the new item (e.g., entering an
        // older event after-the-fact), in which case it should land
        // chronologically not at the top.
        cache[type].unshift(res.item);
        _sortNewestFirst(cache[type]);
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
        // Re-sort in case the date field changed during edit.
        _sortNewestFirst(cache[type]);
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
    // Date-stamped filename so successive exports don't overwrite each
    // other in the admin's Downloads folder. Matches the iter 282-era
    // convention used by every CSV export across the admin pages.
    a.download = type + '-' + new Date().toISOString().slice(0, 10) + '.json';
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
    var pickedFiles = Array.prototype.slice.call(fileInput.files);
    if (pickedFiles.length > 10) {
      cb(new Error('Ko\'pi bilan 10 ta fayl yuklash mumkin.'));
      return;
    }
    var picked = pickedFiles[0];
    // MIME-type guard. The <input accept="image/*"> attribute is only
    // a file-picker hint — users can override via the "All files"
    // dropdown and pick a .pdf or .exe. Backend validates the file
    // bytes (magic-number check) but a wrong-type upload rides 90s
    // of bandwidth before the server rejects, and the UX shows a
    // generic "Xatolik" instead of explaining the type mismatch.
    // Only enforce this for inputs that declared accept="image/*"
    // to leave non-image upload paths (cabinet-reports PDFs) alone.
    var accept = (fileInput.getAttribute('accept') || '').trim();
    var allowVideo = accept.indexOf('video/') !== -1;
    if (accept === 'image/*' || (accept.indexOf('image/') !== -1 && !allowVideo)) {
      for (var i = 0; i < pickedFiles.length; i++) {
        if (pickedFiles[i].type && pickedFiles[i].type.indexOf('image/') !== 0) {
          cb(new Error("Faqat rasm (image) fayllar yuklanadi. Tanlangan fayl turi: " + (pickedFiles[i].type || 'noma\'lum')));
          return;
        }
      }
    }
    // Client-side cap on cover images. Backend has its own limit but
    // surfacing it here saves the admin a minute of upload-and-reject
    // for images > 10 MB. Most photo cover images are 200 KB–2 MB.
    for (var j = 0; j < pickedFiles.length; j++) {
      if (pickedFiles[j].size > 20 * 1024 * 1024) {
        cb(new Error('Har bir fayl hajmi 20 MB dan oshmasligi kerak (' + (pickedFiles[j].size / (1024 * 1024)).toFixed(1) + ' MB tanlangan).'));
        return;
      }
    }
    var fd = new FormData();
    pickedFiles.forEach(function (file) { fd.append('file[]', file); });
    // Uploads need more headroom than the 15s api-client default —
    // a 10 MB cover image on a slow connection routinely exceeds it
    // and the user just sees 'Xatolik!'. 90s matches the 60s used by
    // the iter-108 cabinet upload buttons, with extra slack since
    // these run on admin desktop sessions where 4G/3G is rarer.
    NgoApi.post('/admin/upload', fd, { timeout: 90000 })
      .then(function (res) {
        if (res && res.files && res.files.length && !res.path) {
          res.allFiles = res.files;
          res.path = res.files[0].path;
          res.url = res.files[0].url;
          res.mime = res.files[0].mime;
          res.size = res.files[0].size;
        }
        cb(null, res);
      })
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
