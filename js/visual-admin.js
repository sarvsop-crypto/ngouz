(function () {
  'use strict';

  var TYPES = {
    news: {
      label: 'Yangiliklar',
      singular: 'maqola',
      endpoint: '/admin/news',
      cardMeta: function (x) { return [x.date, x.category].filter(Boolean).join(' · '); },
      badge: function (x) { return x.category || 'Yangilik'; },
      summary: function (x) { return x.excerpt || x.body || ''; },
      required: ['title', 'date', 'category', 'excerpt', 'body'],
      fields: [
        text('title', 'Sarlavha', true), text('title_ru', 'Sarlavha RU'), text('title_en', 'Sarlavha EN'),
        date('date', 'Sana', true), text('category', 'Kategoriya', true), checkbox('featured', 'Muhim yangilik'),
        area('excerpt', 'Qisqa matn', true), area('excerpt_ru', 'Qisqa matn RU'), area('excerpt_en', 'Qisqa matn EN'),
        area('body', 'Asosiy matn', true, true), area('body_ru', 'Asosiy matn RU', false, true), area('body_en', 'Asosiy matn EN', false, true),
        text('cover_image', 'Muqova rasmi path')
      ]
    },
    events: {
      label: 'Tadbirlar',
      singular: 'tadbir',
      endpoint: '/admin/events',
      cardMeta: function (x) { return [x.date, x.location].filter(Boolean).join(' · '); },
      badge: function (x) { return x.status || 'event'; },
      summary: function (x) { return x.description || ''; },
      required: ['title', 'date', 'description'],
      fields: [
        text('title', 'Sarlavha', true), text('title_ru', 'Sarlavha RU'), text('title_en', 'Sarlavha EN'),
        date('date', 'Sana', true), select('status', 'Holat', [['upcoming', 'Rejalashtirilgan'], ['past', "Bo'lib o'tdi"], ['cancelled', 'Bekor qilingan']]),
        text('location', 'Manzil'), number('participants', 'Ishtirokchilar'), date('deadline', 'Ro\'yxatdan o\'tish muddati'),
        area('description', 'Tavsif', true, true), area('description_ru', 'Tavsif RU', false, true), area('description_en', 'Tavsif EN', false, true),
        text('cover_image', 'Muqova rasmi path')
      ]
    },
    grants: {
      label: 'Grantlar',
      singular: 'grant',
      endpoint: '/admin/grants',
      cardMeta: function (x) { return [x.deadline ? 'Muddat: ' + x.deadline : '', x.organizer].filter(Boolean).join(' · '); },
      badge: function (x) { return x.status || 'open'; },
      summary: function (x) { return x.description || ''; },
      required: ['title', 'description'],
      fields: [
        text('title', 'Sarlavha', true), text('title_ru', 'Sarlavha RU'), text('title_en', 'Sarlavha EN'),
        text('organizer', 'Tashkilotchi'), text('category', 'Kategoriya'), text('category_ru', 'Kategoriya RU'), text('category_en', 'Kategoriya EN'),
        text('amount', 'Mablag\''), date('deadline', 'Topshirish muddati'),
        select('status', 'Holat', [['open', 'Ochiq'], ['closed', 'Yopilgan'], ['active', 'Faol']]),
        area('description', 'Tavsif', true, true), area('description_ru', 'Tavsif RU', false, true), area('description_en', 'Tavsif EN', false, true),
        text('cover_image', 'Muqova rasmi path')
      ]
    },
    documents: {
      label: 'Hujjatlar',
      singular: 'hujjat',
      endpoint: '/admin/documents',
      cardMeta: function (x) { return [x.date, x.category].filter(Boolean).join(' · '); },
      badge: function (x) { return x.category || 'Hujjat'; },
      summary: function (x) { return x.excerpt || x.body || ''; },
      required: ['title', 'date', 'category', 'body'],
      fields: [
        text('title', 'Sarlavha', true), date('date', 'Sana', true), text('category', 'Kategoriya', true),
        area('excerpt', 'Qisqa matn'), area('body', 'Asosiy matn', true, true), text('cover_image', 'Muqova rasmi path')
      ]
    },
    organizations: {
      label: 'NNTlar',
      singular: 'NNT',
      endpoint: '/admin/organizations',
      direct: true,
      cardMeta: function (x) { return [x.region_name || x.region_code, x.status].filter(Boolean).join(' · '); },
      badge: function (x) { return x.region_name || x.region_code || 'NNT'; },
      summary: function (x) { return [x.phone, x.email, x.address].filter(Boolean).join(' · '); },
      required: ['name'],
      fields: [
        text('name', 'Nomi', true), text('region_code', 'Hudud kodi'), text('status', 'Holat'),
        text('phone', 'Telefon'), text('email', 'Email'), text('address', 'Manzil', false, true)
      ]
    }
  };

  var state = { type: 'news', user: null, items: [], editing: null, busy: false };
  var els = {};

  function text(name, label, required, wide) { return { kind: 'text', name: name, label: label, required: !!required, wide: !!wide }; }
  function number(name, label) { return { kind: 'number', name: name, label: label }; }
  function date(name, label, required) { return { kind: 'date', name: name, label: label, required: !!required }; }
  function area(name, label, required, wide) { return { kind: 'textarea', name: name, label: label, required: !!required, wide: wide !== false }; }
  function checkbox(name, label) { return { kind: 'checkbox', name: name, label: label }; }
  function select(name, label, options) { return { kind: 'select', name: name, label: label, options: options || [] }; }

  function init() {
    els.shell = document.querySelector('.va-shell');
    els.loginForm = document.getElementById('loginForm');
    els.loginError = document.getElementById('loginError');
    els.appView = document.getElementById('appView');
    els.typeTabs = document.getElementById('typeTabs');
    els.itemGrid = document.getElementById('itemGrid');
    els.search = document.getElementById('searchInput');
    els.loadState = document.getElementById('loadState');
    els.sectionTitle = document.getElementById('sectionTitle');
    els.canvasTitle = document.getElementById('canvasTitle');
    els.totalCount = document.getElementById('totalCount');
    els.visibleCount = document.getElementById('visibleCount');
    els.userLabel = document.getElementById('userLabel');
    els.modal = document.getElementById('editorModal');
    els.form = document.getElementById('editorForm');
    els.fields = document.getElementById('editorFields');
    els.editorTitle = document.getElementById('editorTitle');
    els.editorError = document.getElementById('editorError');
    els.deleteBtn = document.getElementById('deleteBtn');
    els.toast = document.getElementById('toast');

    buildTabs();
    bind();
    boot();
  }

  function bind() {
    els.loginForm.addEventListener('submit', onLogin);
    document.getElementById('newItemBtn').addEventListener('click', function () { openEditor(null); });
    document.getElementById('refreshBtn').addEventListener('click', loadCurrent);
    document.getElementById('logoutBtn').addEventListener('click', function () {
      NgoApi.logout().then(function () { showLogin(); });
    });
    els.search.addEventListener('input', render);
    els.form.addEventListener('submit', onSave);
    els.deleteBtn.addEventListener('click', onDelete);
    els.modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close-modal')) closeEditor();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && els.modal.classList.contains('is-open')) closeEditor();
    });
  }

  function boot() {
    if (!NgoApi.getToken()) { showLogin(); return; }
    NgoApi.me().then(function (res) {
      state.user = res.user || res;
      if (!canUseVisualAdmin(state.user)) {
        NgoApi.clearToken();
        showLogin();
        setError(els.loginError, 'Bu sahifa uchun admin huquqi kerak.');
        return;
      }
      showApp();
      loadCurrent();
    }).catch(function () {
      NgoApi.clearToken();
      showLogin();
    });
  }

  function showLogin() {
    els.shell.setAttribute('data-state', 'login');
  }

  function showApp() {
    els.shell.setAttribute('data-state', 'app');
    els.userLabel.textContent = state.user ? ((state.user.name || state.user.email || 'Admin') + ' · ' + (state.user.role || '')) : 'Admin';
  }

  function onLogin(e) {
    e.preventDefault();
    setError(els.loginError, '');
    var btn = e.submitter || els.loginForm.querySelector('button[type="submit"]');
    lock(btn, true, 'Kirilmoqda...');
    NgoApi.login(
      document.getElementById('loginEmail').value.trim(),
      document.getElementById('loginPassword').value,
      { persistent: document.getElementById('loginRemember').checked }
    ).then(function (res) {
      state.user = res.user;
      if (!canUseVisualAdmin(state.user)) {
        NgoApi.clearToken();
        showLogin();
        setError(els.loginError, 'Bu sahifa uchun admin huquqi kerak.');
        return;
      }
      showApp();
      loadCurrent();
    }).catch(function (err) {
      setError(els.loginError, 'Kirishda xatolik: ' + message(err));
    }).then(function () { lock(btn, false); });
  }

  function buildTabs() {
    Object.keys(TYPES).forEach(function (key) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = TYPES[key].label;
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', function () {
        state.type = key;
        state.editing = null;
        els.search.value = '';
        updateHeadings();
        updateTabs();
        loadCurrent();
      });
      els.typeTabs.appendChild(btn);
    });
    updateTabs();
    updateHeadings();
  }

  function updateTabs() {
    Array.prototype.forEach.call(els.typeTabs.children, function (btn, idx) {
      var key = Object.keys(TYPES)[idx];
      btn.setAttribute('aria-selected', key === state.type ? 'true' : 'false');
    });
  }

  function updateHeadings() {
    var cfg = TYPES[state.type];
    els.sectionTitle.textContent = cfg.label;
    els.canvasTitle.textContent = cfg.label;
  }

  function loadCurrent() {
    var cfg = TYPES[state.type];
    els.loadState.textContent = 'Yuklanmoqda...';
    state.items = [];
    render();
    var req = cfg.direct
      ? NgoApi.get(cfg.endpoint + '?limit=200')
      : new Promise(function (resolve, reject) {
          AdminCMS.load(state.type, function (err, items) {
            if (err) reject(err); else resolve({ items: items || [] });
          });
        });
    req.then(function (res) {
      state.items = normalizeItems(res);
      els.loadState.textContent = 'Tayyor';
      render();
    }).catch(function (err) {
      els.loadState.textContent = 'Xatolik';
      els.itemGrid.innerHTML = '<div class="va-empty">Ma\'lumot yuklanmadi: ' + esc(message(err)) + '</div>';
    });
  }

  function normalizeItems(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.items)) return res.items;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  function render() {
    var cfg = TYPES[state.type];
    var q = (els.search.value || '').trim().toLowerCase();
    var rows = state.items.filter(function (item) {
      if (!q) return true;
      return [item.title, item.name, item.category, item.region_name, item.region_code, item.description, item.excerpt]
        .some(function (v) { return String(v || '').toLowerCase().indexOf(q) !== -1; });
    });
    els.totalCount.textContent = state.items.length;
    els.visibleCount.textContent = rows.length;
    if (!rows.length) {
      els.itemGrid.innerHTML = '<div class="va-empty">Hozircha ko\'rsatiladigan yozuv yo\'q.</div>';
      return;
    }
    els.itemGrid.innerHTML = rows.map(function (item) {
      var title = item.title || item.name || 'Nomsiz';
      var cover = mediaUrl(item.cover_image);
      return '<article class="va-card">' +
        '<div class="va-card__media">' +
          (cover ? '<img src="' + escAttr(cover) + '" alt="">' : '') +
          '<span class="va-card__badge">' + esc(cfg.badge(item)) + '</span>' +
        '</div>' +
        '<div class="va-card__body">' +
          '<div class="va-card__meta">' + esc(cfg.cardMeta(item) || item.id || '') + '</div>' +
          '<h3>' + esc(title) + '</h3>' +
          '<p>' + esc(trimText(cfg.summary(item), 135)) + '</p>' +
          '<div class="va-card__actions">' +
            '<button class="va-btn va-btn--ghost" type="button" data-edit="' + escAttr(item.id || '') + '">Tahrirlash</button>' +
            '<button class="va-btn va-btn--danger" type="button" data-delete="' + escAttr(item.id || '') + '">O\'chirish</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
    Array.prototype.forEach.call(els.itemGrid.querySelectorAll('[data-edit]'), function (btn) {
      btn.addEventListener('click', function () { openEditor(findItem(btn.getAttribute('data-edit'))); });
    });
    Array.prototype.forEach.call(els.itemGrid.querySelectorAll('[data-delete]'), function (btn) {
      btn.addEventListener('click', function () { openEditor(findItem(btn.getAttribute('data-delete')), true); });
    });
  }

  function openEditor(item, confirmDelete) {
    var cfg = TYPES[state.type];
    state.editing = item || null;
    els.editorTitle.textContent = item ? cfg.singular + 'ni tahrirlash' : 'Yangi ' + cfg.singular;
    document.getElementById('editorKicker').textContent = cfg.label;
    els.deleteBtn.style.display = item ? '' : 'none';
    setError(els.editorError, '');
    els.fields.innerHTML = cfg.fields.map(function (field) { return fieldHtml(field, item || {}); }).join('');
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (confirmDelete) setTimeout(onDelete, 60);
  }

  function closeEditor() {
    els.modal.classList.remove('is-open');
    els.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.editing = null;
  }

  function fieldHtml(field, item) {
    var value = item[field.name];
    var id = 'va-field-' + field.name;
    var cls = field.wide || field.kind === 'textarea' ? ' va-field--wide' : '';
    if (field.kind === 'checkbox') {
      return '<label class="va-check' + cls + '" for="' + escAttr(id) + '">' +
        '<input id="' + escAttr(id) + '" name="' + escAttr(field.name) + '" type="checkbox" ' + (value ? 'checked' : '') + '>' +
        '<span>' + esc(field.label) + '</span></label>';
    }
    var req = field.required ? ' required' : '';
    if (field.kind === 'select') {
      return '<label class="' + cls + '" for="' + escAttr(id) + '"><span>' + esc(field.label) + '</span><select id="' + escAttr(id) + '" name="' + escAttr(field.name) + '"' + req + '>' +
        field.options.map(function (opt) {
          var selected = String(value || '') === String(opt[0]) ? ' selected' : '';
          return '<option value="' + escAttr(opt[0]) + '"' + selected + '>' + esc(opt[1]) + '</option>';
        }).join('') + '</select></label>';
    }
    if (field.kind === 'textarea') {
      return '<label class="' + cls + '" for="' + escAttr(id) + '"><span>' + esc(field.label) + '</span><textarea id="' + escAttr(id) + '" name="' + escAttr(field.name) + '"' + req + '>' + esc(value || '') + '</textarea></label>';
    }
    return '<label class="' + cls + '" for="' + escAttr(id) + '"><span>' + esc(field.label) + '</span><input id="' + escAttr(id) + '" name="' + escAttr(field.name) + '" type="' + field.kind + '" value="' + escAttr(value || '') + '"' + req + '></label>';
  }

  function readEditor() {
    var cfg = TYPES[state.type];
    var data = {};
    cfg.fields.forEach(function (field) {
      var el = els.form.elements[field.name];
      if (!el) return;
      if (field.kind === 'checkbox') data[field.name] = !!el.checked;
      else if (field.kind === 'number') data[field.name] = el.value ? parseInt(el.value, 10) : null;
      else data[field.name] = String(el.value || '').trim();
    });
    return data;
  }

  function onSave(e) {
    e.preventDefault();
    var cfg = TYPES[state.type];
    var data = readEditor();
    var missing = cfg.required.find(function (name) { return !data[name]; });
    if (missing) {
      setError(els.editorError, 'Iltimos, majburiy maydonlarni to\'ldiring.');
      var input = els.form.elements[missing];
      if (input) input.focus();
      return;
    }
    setError(els.editorError, '');
    var btn = e.submitter || els.form.querySelector('button[type="submit"]');
    lock(btn, true, 'Saqlanmoqda...');
    saveItem(data).then(function () {
      toast('Saqlandi');
      closeEditor();
      loadCurrent();
    }).catch(function (err) {
      setError(els.editorError, 'Saqlashda xatolik: ' + message(err));
    }).then(function () { lock(btn, false); });
  }

  function saveItem(data) {
    var cfg = TYPES[state.type];
    if (cfg.direct) {
      if (state.editing && state.editing.id) return NgoApi.patch(cfg.endpoint + '/' + encodeURIComponent(state.editing.id), data);
      return NgoApi.post(cfg.endpoint, data);
    }
    if (state.editing && state.editing.id) return AdminCMS.update(state.type, state.editing.id, data);
    return AdminCMS.create(state.type, data);
  }

  function onDelete() {
    if (!state.editing || !state.editing.id) return;
    var cfg = TYPES[state.type];
    var title = state.editing.title || state.editing.name || state.editing.id;
    if (!confirm('O\'chirishni tasdiqlaysizmi: ' + title + '?')) return;
    lock(els.deleteBtn, true, 'O\'chirilmoqda...');
    var req = cfg.direct
      ? NgoApi.del(cfg.endpoint + '/' + encodeURIComponent(state.editing.id))
      : AdminCMS.remove(state.type, state.editing.id);
    req.then(function () {
      toast('O\'chirildi');
      closeEditor();
      loadCurrent();
    }).catch(function (err) {
      setError(els.editorError, 'O\'chirishda xatolik: ' + message(err));
    }).then(function () { lock(els.deleteBtn, false); });
  }

  function findItem(id) {
    return state.items.find(function (x) { return String(x.id) === String(id); }) || null;
  }

  function mediaUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return 'https://ngo-api-proxy.sarvsop.workers.dev/media.php?path=' + encodeURIComponent(path);
  }

  function trimText(value, len) {
    value = String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return value.length > len ? value.slice(0, len - 1) + '…' : value;
  }

  function setError(el, textValue) {
    el.textContent = textValue || '';
    el.style.display = textValue ? 'block' : 'none';
  }

  function lock(btn, on, label) {
    if (!btn) return;
    if (on) {
      btn.dataset.oldText = btn.textContent;
      btn.disabled = true;
      btn.textContent = label || 'Kutilmoqda...';
    } else {
      btn.disabled = false;
      if (btn.dataset.oldText) btn.textContent = btn.dataset.oldText;
    }
  }

  function toast(textValue) {
    els.toast.textContent = textValue;
    els.toast.classList.add('is-open');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { els.toast.classList.remove('is-open'); }, 2600);
  }

  function message(err) {
    return (err && (err.message || err.code)) || 'noma\'lum';
  }

  function canUseVisualAdmin(user) {
    var levels = { super_admin: 100, regional_admin: 60, portal_moderator: 40, member_manager: 20, member_user: 10 };
    return !!user && (levels[user.role] || 0) >= levels.regional_admin;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(value) { return esc(value); }

  document.addEventListener('DOMContentLoaded', init);
})();
