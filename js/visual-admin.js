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

  var VISUAL_TYPE = '__visual_block';
  var API_VISUAL = '/api/visual-content';
  var GENERIC_SELECTOR = [
    'main h1', 'main h2', 'main h3', 'main h4', 'main p', 'main li',
    'main .card', 'main article.card', 'main article:not([data-va-type])',
    'main img', 'main a.btn', 'main a.social-link'
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

  var state = { user: null, editing: null, editingType: null, cache: {}, visualTarget: null, visualAction: null };
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
  }

  function showApp() {
    els.shell.setAttribute('data-state', 'app');
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
    assignVisualIds(doc);
    hookFrameNavigation(doc);
    injectGenericBuilderControls(doc);
    injectAddButtons(doc);
    injectDetailPageButton(doc);
    Array.prototype.forEach.call(doc.querySelectorAll('[data-va-type][data-va-id]'), function (node) {
      if (!node.getAttribute('data-va-id') || node.querySelector(':scope > .va-live-controls')) return;
      node.classList.add('va-live-editable');
      if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
      var controls = doc.createElement('div');
      controls.className = 'va-live-controls';
      controls.innerHTML = '<button type="button" data-va-edit title="Tahrirlash" aria-label="Tahrirlash">✎</button><button type="button" data-va-delete title="O\'chirish" aria-label="O\'chirish">×</button>';
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
      '.va-live-controls button,.va-live-add button{width:32px;height:32px;border:1px solid rgba(15,106,87,.28);background:#fff;color:#0f6a57;border-radius:999px;padding:0;font:900 18px/1 Montserrat,system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.16);cursor:pointer}',
      '.va-live-controls button:last-child{color:#b42318;border-color:rgba(180,35,24,.28)}',
      '.va-live-add{position:relative;z-index:9998;display:flex;justify-content:flex-end;margin:0 0 10px;pointer-events:auto}',
      '.va-live-add button{width:38px;height:38px;background:#0f6a57;color:#fff;border-color:#0f6a57;font-size:24px}',
      '.va-live-add--floating{position:fixed;right:18px;bottom:18px;z-index:10000;margin:0}',
      '.va-live-add--floating button{width:44px;height:44px}',
      '.va-generic-editable{outline:1px dashed rgba(14,116,144,.32);outline-offset:3px}',
      '.va-generic-editable:hover{outline-color:#0e7490}',
      '.va-generic-controls{position:absolute;z-index:9997;left:10px;top:10px;display:flex;gap:6px;pointer-events:auto}',
      '.va-generic-controls button{width:28px;height:28px;border:1px solid rgba(14,116,144,.25);background:#fff;color:#0e7490;border-radius:999px;padding:0;font:900 15px/1 Montserrat,system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.14);cursor:pointer}',
      '.va-generic-controls button:last-child{color:#b42318;border-color:rgba(180,35,24,.25)}',
      '.va-generic-add{display:inline-flex;margin:8px 0;vertical-align:middle}',
      '.va-generic-add button{width:30px;height:30px;border:1px solid #0f6a57;background:#0f6a57;color:#fff;border-radius:999px;padding:0;font:900 20px/1 Montserrat,system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.14);cursor:pointer}'
    ].join('');
    doc.head.appendChild(style);
  }

  function assignVisualIds(doc) {
    Array.prototype.forEach.call(doc.querySelectorAll(GENERIC_SELECTOR), function (node) {
      if (!isGenericEditable(node)) return;
      if (!node.getAttribute('data-va-block-id')) node.setAttribute('data-va-block-id', blockId(doc, node));
    });
  }

  function injectGenericBuilderControls(doc) {
    Array.prototype.forEach.call(doc.querySelectorAll('[data-va-block-id]'), function (node) {
      if (!isGenericEditable(node) || node.querySelector(':scope > .va-generic-controls')) return;
      node.classList.add('va-generic-editable');
      if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
      var controls = doc.createElement('div');
      controls.className = 'va-generic-controls';
      controls.innerHTML = '<button type="button" data-va-generic-edit title="Tahrirlash" aria-label="Tahrirlash">✎</button><button type="button" data-va-generic-delete title="O\'chirish" aria-label="O\'chirish">×</button>';
      controls.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.hasAttribute('data-va-generic-delete')) openVisualEditor(node, 'delete');
        else openVisualEditor(node, 'edit');
      });
      node.appendChild(controls);
      var add = doc.createElement('span');
      add.className = 'va-generic-add';
      add.innerHTML = '<button type="button" title="Shu joyga qo\'shish" aria-label="Shu joyga qo\'shish">+</button>';
      add.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openVisualEditor(node, 'add');
      });
      node.parentNode.insertBefore(add, node.nextSibling);
    });
  }

  function isGenericEditable(node) {
    if (!node || !node.matches) return false;
    if (node.closest(PROTECTED_SELECTOR + ',script,style,noscript')) return false;
    if (node.hasAttribute('data-va-type') || node.closest('[data-va-type]')) return false;
    if (node.id === 'siteFrame') return false;
    var text = String(node.textContent || '').trim();
    if (node.tagName === 'IMG') return !!node.getAttribute('src');
    return text.length > 0 || node.tagName === 'A';
  }

  function blockId(doc, node) {
    var parts = [];
    var cur = node;
    while (cur && cur.nodeType === 1 && cur !== doc.body) {
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

  function injectAddButtons(doc) {
    var targets = [
      ['#dynamic-news-home', 'news'],
      ['#dynamic-news-page', 'news'],
      ['#dynamic-publications-page', 'news'],
      ['#dynamic-events-home', 'events'],
      ['#dynamic-events-page', 'events'],
      ['#dynamic-grants-page', 'grants'],
      ['#dynamic-projects-grants', 'grants'],
      ['#dynamic-documents-page', 'documents'],
      ['#nntCards', 'organizations']
    ];
    targets.forEach(function (pair) {
      Array.prototype.forEach.call(doc.querySelectorAll(pair[0]), function (target) {
        if (target.dataset.vaAddInjected) return;
        target.dataset.vaAddInjected = '1';
        var wrap = doc.createElement('div');
        wrap.className = 'va-live-add';
        wrap.innerHTML = '<button type="button" title="Qo\'shish" aria-label="Qo\'shish">+</button>';
        wrap.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openEditor(pair[1], null);
        });
        target.parentNode.insertBefore(wrap, target);
      });
    });
  }

  function injectDetailPageButton(doc) {
    if (doc.getElementById('vaDetailAdd')) return;
    var type = currentDetailType(doc);
    if (!type) return;
    var wrap = doc.createElement('div');
    wrap.id = 'vaDetailAdd';
    wrap.className = 'va-live-add va-live-add--floating';
    wrap.innerHTML = '<button type="button" title="Qo\'shish" aria-label="Qo\'shish">+</button>';
    wrap.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openEditor(type, null);
    });
    doc.body.appendChild(wrap);
  }

  function currentDetailType(doc) {
    var loc = doc.defaultView.location;
    var params = new URLSearchParams(loc.search);
    var path = loc.pathname.replace(/\/$/, '');
    if (path.endsWith('/news-detail')) return params.get('type') === 'documents' ? 'documents' : 'news';
    if (path.endsWith('/event-detail')) return 'events';
    return '';
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

  function openVisualEditor(node, action) {
    state.editingType = VISUAL_TYPE;
    state.editing = null;
    state.visualTarget = node;
    state.visualAction = action;
    var item = visualItemFromNode(node, action);
    els.editorTitle.textContent = action === 'add' ? "Kontent qo'shish" : action === 'delete' ? "Blokni o'chirish" : 'Blokni tahrirlash';
    els.editorKicker.textContent = 'Sahifa kontenti';
    els.deleteBtn.style.display = action === 'edit' ? '' : 'none';
    setError(els.editorError, '');
    els.fields.innerHTML = visualFieldsFor(node, action).map(function (field) { return fieldHtml(field, item); }).join('');
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (action === 'delete') setTimeout(onDelete, 60);
  }

  function visualFieldsFor(node, action) {
    if (action === 'add') {
      return [select('block_kind', 'Blok turi', [['paragraph', 'Matn'], ['heading', 'Sarlavha'], ['card', 'Karta'], ['html', 'HTML']]), area('html', 'Kontent', true, true)];
    }
    if (node.tagName === 'IMG') return [text('src', 'Rasm manzili', true, true), text('alt', 'Alt matn', false, true)];
    if (node.tagName === 'A') return [text('text', 'Matn', false, true), text('href', 'Havola', false, true)];
    return [area('html', 'Kontent', true, true)];
  }

  function visualItemFromNode(node, action) {
    if (action === 'add') return { block_kind: 'paragraph', html: '<p>Yangi matn</p>' };
    if (node.tagName === 'IMG') return { src: node.getAttribute('src') || '', alt: node.getAttribute('alt') || '' };
    if (node.tagName === 'A') return { text: node.textContent || '', href: node.getAttribute('href') || '' };
    return { html: cleanEditorHtml(node.innerHTML) };
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
    if (state.editingType === VISUAL_TYPE) {
      var out = {};
      Array.prototype.forEach.call(els.form.elements, function (el) {
        if (el.name) out[el.name] = String(el.value || '').trim();
      });
      return out;
    }
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
    var data = readEditor();
    if (state.editingType === VISUAL_TYPE) {
      if (state.visualAction !== 'delete' && !(data.html || data.text || data.src || data.href)) {
        setError(els.editorError, 'Kontent bo\'sh bo\'lmasligi kerak.');
        return;
      }
      var visualBtn = e.submitter || els.form.querySelector('button[type="submit"]');
      lock(visualBtn, true, 'Saqlanmoqda...');
      saveVisualPatch(data).then(function () {
        toast('Saqlandi');
        closeEditor();
        reloadSite();
      }).catch(function (err) {
        setError(els.editorError, 'Saqlashda xatolik: ' + message(err));
      }).then(function () { lock(visualBtn, false); });
      return;
    }
    var cfg = TYPES[state.editingType];
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

  function saveVisualPatch(data) {
    var node = state.visualTarget;
    var id = node && node.getAttribute('data-va-block-id');
    var patch = { id: id, kind: (node && node.tagName || '').toLowerCase(), action: 'html' };
    if (state.visualAction === 'delete') {
      patch.action = 'delete';
    } else if (state.visualAction === 'add') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'after';
      patch.html = buildAddedHtml(data.block_kind, data.html);
    } else if (node.tagName === 'IMG') {
      patch.action = 'attrs';
      patch.src = data.src || '';
      patch.alt = data.alt || '';
    } else if (node.tagName === 'A') {
      patch.action = 'attrs';
      patch.text = data.text || '';
      patch.href = data.href || '';
    } else {
      patch.action = 'html';
      patch.html = cleanEditorHtml(data.html || '');
    }
    return fetch(API_VISUAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + NgoApi.getToken(),
      },
      body: JSON.stringify({ page: visualPageKey(), patch: patch }),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (!r.ok) throw new Error(body.error || ('HTTP ' + r.status));
        return body;
      });
    });
  }

  function buildAddedHtml(kind, html) {
    html = cleanEditorHtml(html || '');
    if (kind === 'heading') return /^<h[1-6][\s>]/i.test(html) ? html : '<h2>' + esc(html.replace(/<[^>]*>/g, '')) + '</h2>';
    if (kind === 'card') return /class=["'][^"']*\bcard\b/.test(html) ? html : '<article class="card">' + html + '</article>';
    if (kind === 'html') return html;
    return /^<p[\s>]/i.test(html) ? html : '<p>' + esc(html.replace(/<[^>]*>/g, '')) + '</p>';
  }

  function cleanEditorHtml(html) {
    return String(html || '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\sclass="[^"]*\b(va-live|va-generic)[^"]*"/gi, '')
      .replace(/\sdata-va-[a-z-]+="[^"]*"/gi, '')
      .replace(/<div class="va-[\s\S]*?<\/div>/gi, '');
  }

  function visualPageKey() {
    var loc = els.frame.contentWindow.location;
    var path = loc.pathname || '/';
    path = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
    return path || '/';
  }

  function onDelete() {
    if (state.editingType === VISUAL_TYPE) {
      if (!state.visualTarget) return;
      if (!confirm('Bu blokni o\'chirishni tasdiqlaysizmi?')) return;
      lock(els.deleteBtn, true, 'O\'chirilmoqda...');
      saveVisualPatch({}).then(function () {
        toast('O\'chirildi');
        closeEditor();
        reloadSite();
      }).catch(function (err) {
        setError(els.editorError, 'O\'chirishda xatolik: ' + message(err));
      }).then(function () { lock(els.deleteBtn, false); });
      return;
    }
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
