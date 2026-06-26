(function () {
  'use strict';

  var TYPES = {
    news: {
      label: 'Yangiliklar',
      singular: 'maqola',
      endpoint: '/admin/news',
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
      required: ['name'],
      fields: [
        text('name', 'Nomi', true), text('region_code', 'Hudud kodi'), text('status', 'Holat'),
        text('phone', 'Telefon'), text('email', 'Email'), text('address', 'Manzil', false, true)
      ]
    }
  };

  var state = { user: null, editing: null, editingType: null, cache: {} };
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
    els.frame = document.getElementById('siteFrame');
    els.status = document.getElementById('siteStatus');
    els.adminDock = document.getElementById('adminDock');
    els.adminToggle = document.getElementById('adminToggle');
    els.userLabel = document.getElementById('userLabel');
    els.newType = document.getElementById('newTypeSelect');
    els.modal = document.getElementById('editorModal');
    els.form = document.getElementById('editorForm');
    els.fields = document.getElementById('editorFields');
    els.editorTitle = document.getElementById('editorTitle');
    els.editorKicker = document.getElementById('editorKicker');
    els.editorError = document.getElementById('editorError');
    els.deleteBtn = document.getElementById('deleteBtn');
    els.toast = document.getElementById('toast');
    bind();
    boot();
  }

  function bind() {
    els.loginForm.addEventListener('submit', onLogin);
    document.getElementById('newItemBtn').addEventListener('click', function () {
      openEditor(els.newType.value, null);
    });
    document.getElementById('editCurrentBtn').addEventListener('click', editCurrentPage);
    document.getElementById('refreshBtn').addEventListener('click', reloadSite);
    document.getElementById('logoutBtn').addEventListener('click', function () {
      NgoApi.logout().then(function () { showLogin(); });
    });
    els.adminToggle.addEventListener('click', function () {
      var open = !els.adminDock.classList.contains('is-open');
      els.adminDock.classList.toggle('is-open', open);
      els.adminToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.getElementById('pageTabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-page]');
      if (btn) {
        navigateSite(btn.getAttribute('data-page'));
        closeAdminDock();
      }
    });
    els.frame.addEventListener('load', onFrameLoad);
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
    }).catch(function () {
      NgoApi.clearToken();
      showLogin();
    });
  }

  function showLogin() {
    els.shell.setAttribute('data-state', 'login');
    closeAdminDock();
  }

  function showApp() {
    els.shell.setAttribute('data-state', 'app');
    els.userLabel.textContent = state.user ? ((state.user.name || state.user.email || 'Admin') + ' · ' + (state.user.role || '')) : 'Admin';
    navigateSite(new URLSearchParams(location.search).get('page') || '/');
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
    }).catch(function (err) {
      setError(els.loginError, 'Kirishda xatolik: ' + message(err));
    }).then(function () { lock(btn, false); });
  }

  function navigateSite(path) {
    if (!path) path = '/';
    els.status.textContent = 'Sayt yuklanmoqda...';
    els.frame.src = path;
  }

  function closeAdminDock() {
    if (!els.adminDock) return;
    els.adminDock.classList.remove('is-open');
    if (els.adminToggle) els.adminToggle.setAttribute('aria-expanded', 'false');
  }

  function reloadSite() {
    els.status.textContent = 'Yangilanmoqda...';
    try { els.frame.contentWindow.location.reload(); }
    catch (e) { els.frame.src = els.frame.src; }
  }

  function onFrameLoad() {
    els.status.textContent = 'Edit rejimi yoqilgan';
    injectEditorLayer();
  }

  function injectEditorLayer() {
    var doc;
    try { doc = els.frame.contentDocument; } catch (e) { return; }
    if (!doc || !doc.body) return;
    ensureFrameStyles(doc);
    hookFrameNavigation(doc);
    Array.prototype.forEach.call(doc.querySelectorAll('[data-va-type][data-va-id]'), function (node) {
      if (!node.getAttribute('data-va-id') || node.querySelector(':scope > .va-live-controls')) return;
      node.classList.add('va-live-editable');
      if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
      var controls = doc.createElement('div');
      controls.className = 'va-live-controls';
      controls.innerHTML = '<button type="button" data-va-edit>Tahrirlash</button><button type="button" data-va-delete>O\'chirish</button>';
      controls.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var type = node.getAttribute('data-va-type');
        var id = node.getAttribute('data-va-id');
        if (e.target.hasAttribute('data-va-delete')) {
          loadItem(type, id).then(function (item) { openEditor(type, item, true); }).catch(showLoadError);
        } else {
          loadItem(type, id).then(function (item) { openEditor(type, item); }).catch(showLoadError);
        }
      });
      node.appendChild(controls);
    });
  }

  function ensureFrameStyles(doc) {
    if (doc.getElementById('va-live-style')) return;
    var style = doc.createElement('style');
    style.id = 'va-live-style';
    style.textContent = [
      '.va-live-editable{outline:2px solid rgba(15,106,87,.38);outline-offset:4px}',
      '.va-live-editable:hover{outline-color:#0f6a57}',
      '.va-live-controls{position:absolute;z-index:9999;right:10px;top:10px;display:flex;gap:6px;pointer-events:auto}',
      '.va-live-controls button{border:1px solid rgba(15,106,87,.28);background:#fff;color:#0f6a57;border-radius:8px;padding:7px 9px;font:700 12px/1.1 Montserrat,system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.16);cursor:pointer}',
      '.va-live-controls button:last-child{color:#b42318;border-color:rgba(180,35,24,.28)}'
    ].join('');
    doc.head.appendChild(style);
  }

  function hookFrameNavigation(doc) {
    if (doc.documentElement.dataset.vaNavHooked) return;
    doc.documentElement.dataset.vaNavHooked = '1';
    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (/^(https?:|mailto:|tel:|#)/i.test(href)) return;
      e.preventDefault();
      navigateSite(new URL(href, els.frame.contentWindow.location.href).pathname + new URL(href, els.frame.contentWindow.location.href).search + new URL(href, els.frame.contentWindow.location.href).hash);
    }, true);
  }

  function editCurrentPage() {
    var loc;
    try { loc = els.frame.contentWindow.location; } catch (e) {}
    if (!loc) { toast('Joriy sahifa aniqlanmadi'); return; }
    var params = new URLSearchParams(loc.search);
    var id = params.get('id');
    var path = loc.pathname.replace(/\/$/, '');
    var type = '';
    if (path.endsWith('/news-detail')) type = params.get('type') === 'documents' ? 'documents' : 'news';
    else if (path.endsWith('/event-detail')) type = 'events';
    if (!type || !id) { toast('Bu sahifada tahrirlanadigan item topilmadi'); return; }
    loadItem(type, id).then(function (item) { openEditor(type, item); }).catch(showLoadError);
  }

  function loadItem(type, id) {
    return loadItems(type).then(function (items) {
      var item = items.find(function (x) { return String(x.id) === String(id); });
      if (!item) throw new Error('item_topilmadi');
      return item;
    });
  }

  function loadItems(type) {
    if (state.cache[type]) return Promise.resolve(state.cache[type]);
    var cfg = TYPES[type];
    if (cfg.direct) {
      return NgoApi.get(cfg.endpoint + '?limit=250').then(function (res) {
        state.cache[type] = normalizeItems(res);
        return state.cache[type];
      });
    }
    return new Promise(function (resolve, reject) {
      AdminCMS.load(type, function (err, items) {
        if (err) reject(err);
        else {
          state.cache[type] = items || [];
          resolve(state.cache[type]);
        }
      });
    });
  }

  function normalizeItems(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.items)) return res.items;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  function openEditor(type, item, confirmDelete) {
    var cfg = TYPES[type];
    state.editingType = type;
    state.editing = item || null;
    els.editorTitle.textContent = item ? cfg.singular + 'ni tahrirlash' : 'Yangi ' + cfg.singular;
    els.editorKicker.textContent = cfg.label;
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
    state.editingType = null;
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
    var cfg = TYPES[state.editingType];
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
    var cfg = TYPES[state.editingType];
    var data = readEditor();
    var missing = cfg.required.find(function (name) { return !data[name]; });
    if (missing) {
      setError(els.editorError, 'Iltimos, majburiy maydonlarni to\'ldiring.');
      var input = els.form.elements[missing];
      if (input) input.focus();
      return;
    }
    var btn = e.submitter || els.form.querySelector('button[type="submit"]');
    lock(btn, true, 'Saqlanmoqda...');
    saveItem(data).then(function () {
      state.cache[state.editingType] = null;
      toast('Saqlandi');
      closeEditor();
      reloadSite();
    }).catch(function (err) {
      setError(els.editorError, 'Saqlashda xatolik: ' + message(err));
    }).then(function () { lock(btn, false); });
  }

  function saveItem(data) {
    var cfg = TYPES[state.editingType];
    if (cfg.direct) {
      if (state.editing && state.editing.id) return NgoApi.patch(cfg.endpoint + '/' + encodeURIComponent(state.editing.id), data);
      return NgoApi.post(cfg.endpoint, data);
    }
    if (state.editing && state.editing.id) return AdminCMS.update(state.editingType, state.editing.id, data);
    return AdminCMS.create(state.editingType, data);
  }

  function onDelete() {
    if (!state.editing || !state.editing.id) return;
    var cfg = TYPES[state.editingType];
    var title = state.editing.title || state.editing.name || state.editing.id;
    if (!confirm('O\'chirishni tasdiqlaysizmi: ' + title + '?')) return;
    lock(els.deleteBtn, true, 'O\'chirilmoqda...');
    var req = cfg.direct
      ? NgoApi.del(cfg.endpoint + '/' + encodeURIComponent(state.editing.id))
      : AdminCMS.remove(state.editingType, state.editing.id);
    req.then(function () {
      state.cache[state.editingType] = null;
      toast('O\'chirildi');
      closeEditor();
      reloadSite();
    }).catch(function (err) {
      setError(els.editorError, 'O\'chirishda xatolik: ' + message(err));
    }).then(function () { lock(els.deleteBtn, false); });
  }

  function showLoadError(err) {
    toast('Item yuklanmadi: ' + message(err));
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
    toast._t = setTimeout(function () { els.toast.classList.remove('is-open'); }, 2800);
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
