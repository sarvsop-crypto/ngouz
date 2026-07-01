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
        file('cover_image_file', 'Muqova rasmi yuklash', 'image/*', true),
        text('cover_image', 'Muqova rasmi path'),
        multiFile('media_files', "Qo'shimcha rasm/video yuklash", 'image/*,video/*', true),
        area('video_links', 'Video havolalar (har qatorda bitta URL)', false, true),
        hidden('media_gallery')
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
        file('cover_image_file', 'Muqova rasmi yuklash', 'image/*', true),
        text('cover_image', 'Muqova rasmi path'),
        multiFile('media_files', "Qo'shimcha rasm/video yuklash", 'image/*,video/*', true),
        area('video_links', 'Video havolalar (har qatorda bitta URL)', false, true),
        hidden('media_gallery')
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
        file('cover_image_file', 'Muqova rasmi yuklash', 'image/*', true),
        text('cover_image', 'Muqova rasmi path'),
        multiFile('media_files', "Qo'shimcha rasm/video yuklash", 'image/*,video/*', true),
        area('video_links', 'Video havolalar (har qatorda bitta URL)', false, true),
        hidden('media_gallery')
      ]
    },
    documents: {
      label: 'Hujjatlar',
      singular: 'hujjat',
      endpoint: '/admin/documents',
      required: ['title', 'date', 'category', 'body'],
      fields: [
        text('title', 'Sarlavha', true), date('date', 'Sana', true), text('category', 'Kategoriya', true),
        area('excerpt', 'Qisqa matn'), area('body', 'Asosiy matn', true, true),
        file('cover_image_file', 'Muqova rasmi yuklash', 'image/*', true), text('cover_image', 'Muqova rasmi path'),
        multiFile('media_files', "Qo'shimcha rasm/video yuklash", 'image/*,video/*', true),
        area('video_links', 'Video havolalar (har qatorda bitta URL)', false, true),
        hidden('media_gallery')
      ]
    },
    publications: {
      label: 'Publikatsiyalar',
      singular: 'publikatsiya',
      storageType: 'news',
      category: 'nashrlar',
      required: ['title', 'date', 'excerpt', 'body'],
      fields: [
        text('title', 'Sarlavha', true), text('title_ru', 'Sarlavha RU'), text('title_en', 'Sarlavha EN'),
        date('date', 'Sana', true), checkbox('featured', 'Muhim publikatsiya'),
        area('excerpt', 'Qisqa matn', true), area('excerpt_ru', 'Qisqa matn RU'), area('excerpt_en', 'Qisqa matn EN'),
        area('body', 'Asosiy matn', true, true), area('body_ru', 'Asosiy matn RU', false, true), area('body_en', 'Asosiy matn EN', false, true),
        file('cover_image_file', 'Muqova rasmi yuklash', 'image/*', true),
        text('cover_image', 'Muqova rasmi path'),
        multiFile('media_files', "Qo'shimcha rasm/video yuklash", 'image/*,video/*', true),
        area('video_links', 'Video havolalar (har qatorda bitta URL)', false, true),
        hidden('media_gallery')
      ]
    },
    videos: {
      label: 'Videolar',
      singular: 'video',
      storageType: 'news',
      category: 'video',
      required: ['title', 'date', 'excerpt', 'body'],
      fields: [
        text('title', 'Sarlavha', true), text('title_ru', 'Sarlavha RU'), text('title_en', 'Sarlavha EN'),
        date('date', 'Sana', true), checkbox('featured', 'Muhim video'),
        area('excerpt', 'Qisqa matn', true), area('excerpt_ru', 'Qisqa matn RU'), area('excerpt_en', 'Qisqa matn EN'),
        area('body', 'Asosiy matn / video embed', true, true), area('body_ru', 'Asosiy matn RU', false, true), area('body_en', 'Asosiy matn EN', false, true),
        file('cover_image_file', 'Muqova rasmi yuklash', 'image/*', true),
        text('cover_image', 'Muqova rasmi path'),
        multiFile('media_files', "Qo'shimcha rasm/video yuklash", 'image/*,video/*', true),
        area('video_links', 'Video havolalar (har qatorda bitta URL)', false, true),
        hidden('media_gallery')
      ]
    },
    digests: {
      label: 'Dayjestlar',
      singular: 'dayjest',
      storageType: 'news',
      category: 'daydjest',
      required: ['title', 'date', 'excerpt', 'body'],
      fields: [
        text('title', 'Sarlavha', true), text('title_ru', 'Sarlavha RU'), text('title_en', 'Sarlavha EN'),
        date('date', 'Sana', true), checkbox('featured', 'Muhim dayjest'),
        area('excerpt', 'Qisqa matn', true), area('excerpt_ru', 'Qisqa matn RU'), area('excerpt_en', 'Qisqa matn EN'),
        area('body', 'Asosiy matn', true, true), area('body_ru', 'Asosiy matn RU', false, true), area('body_en', 'Asosiy matn EN', false, true),
        file('cover_image_file', 'Muqova rasmi yuklash', 'image/*', true),
        text('cover_image', 'Muqova rasmi path'),
        multiFile('media_files', "Qo'shimcha rasm/video yuklash", 'image/*,video/*', true),
        area('video_links', 'Video havolalar (har qatorda bitta URL)', false, true),
        hidden('media_gallery')
      ]
    }
  };

  var VISUAL_TYPE = '__visual_block';
  var API_VISUAL = '/api/visual-content';
  var GLOBAL_FOOTER_PAGE = '__global_footer';
  var GENERIC_SELECTOR = [
    'main h1', 'main h2', 'main h3', 'main h4', 'main p', 'main li',
    'main th', 'main td', 'main svg text', 'main tspan',
    'main .card', 'main article.card', 'main article:not([data-va-type])',
    'main .hero-stat', 'main .hero-stat-num', 'main .hero-stat-label', 'main .nnt-stat-box', 'main .struct-stat',
    'main .council-stat', 'main .kpi', 'main .criterion-card', 'main .apply-step',
    'main .partner', 'main .vazifa-card', 'main .about-reg-card', 'main .cert-level-card',
    'main .doc-row:not(.head)', 'main tbody tr', 'main .vacancy', 'main .media-card',
    'main img', 'main a.btn', 'main a.social-link',
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

  var state = { user: null, editing: null, editingType: null, cache: {}, visualTarget: null, visualAction: null };
  var els = {};

  function text(name, label, required, wide) { return { kind: 'text', name: name, label: label, required: !!required, wide: !!wide }; }
  function number(name, label) { return { kind: 'number', name: name, label: label }; }
  function date(name, label, required) { return { kind: 'date', name: name, label: label, required: !!required }; }
  function area(name, label, required, wide) { return { kind: 'textarea', name: name, label: label, required: !!required, wide: wide !== false }; }
  function checkbox(name, label) { return { kind: 'checkbox', name: name, label: label }; }
  function select(name, label, options) { return { kind: 'select', name: name, label: label, options: options || [] }; }
  function file(name, label, accept, wide) { return { kind: 'file', name: name, label: label, accept: accept || '', wide: wide !== false }; }
  function multiFile(name, label, accept, wide) { return { kind: 'multi-file', name: name, label: label, accept: accept || '', wide: wide !== false }; }
  function hidden(name) { return { kind: 'hidden', name: name }; }

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
    els.saveBtn = els.form.querySelector('button[type="submit"]');
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
    observeFrameMutations(doc);
    assignVisualIds(doc);
    hookFrameNavigation(doc);
    injectStructuredItemControls(doc);
    injectProjectControls(doc);
    injectGenericBuilderControls(doc);
    injectStructuredAddButtons(doc);
    injectAddButtons(doc);
    injectDetailPageButton(doc);
    Array.prototype.forEach.call(doc.querySelectorAll('[data-va-type][data-va-id]'), function (node) {
      if (!node.getAttribute('data-va-id') || node.querySelector(':scope > .va-live-controls')) return;
      if (!isEditableType(node.getAttribute('data-va-type'))) return;
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
      '.va-live-editable{outline:1px solid rgba(14,116,144,.42);outline-offset:5px}',
      '.va-live-editable:hover{outline-color:#0e7490}',
      '.va-live-controls{position:absolute;z-index:9999;right:10px;top:-38px;display:flex;gap:4px;padding:4px;border:1px solid #e4e7e7;background:rgba(255,255,255,.96);box-shadow:0 3px 6px rgba(100,100,100,.2);border-radius:8px;pointer-events:auto}',
      '.va-live-controls button,.va-live-add button{width:30px;height:30px;border:1px solid transparent;background:#fff;color:#023347;border-radius:6px;padding:0;font:800 15px/1 Montserrat,system-ui,sans-serif;cursor:pointer}',
      '.va-live-controls button:hover{background:#E8F5FB;color:#023347}',
      '.va-live-controls button:last-child{color:#b42318}',
      '.va-live-controls button:last-child:hover{background:#fff8f7}',
      '.va-live-add{position:relative;z-index:9998;display:flex;justify-content:flex-end;margin:0 0 10px;pointer-events:auto}',
      '.va-live-add button{width:36px;height:36px;background:#023347;color:#fff;border-color:#023347;border-radius:8px;font-size:22px;box-shadow:0 3px 6px rgba(100,100,100,.2)}',
      '.va-context-add{position:relative;z-index:9998;display:flex;justify-content:flex-end;margin:0 0 12px;pointer-events:auto}',
      '.va-context-add button{min-height:36px;border:1px solid #023347;background:#023347;color:#fff;border-radius:8px;padding:8px 12px;font:800 13px/1 Montserrat,system-ui,sans-serif;box-shadow:0 3px 6px rgba(100,100,100,.2);cursor:pointer}',
      '.va-live-add--floating{position:fixed;right:18px;bottom:18px;z-index:10000;margin:0}',
      '.va-live-add--floating button{width:44px;height:44px}',
      '.va-generic-editable{outline:1px dashed rgba(14,116,144,.34);outline-offset:5px}',
      '.va-generic-editable:hover{outline-color:#0e7490}',
      '.va-generic-controls{position:absolute;z-index:9997;left:0;top:-38px;display:flex;gap:4px;padding:4px;border:1px solid #e4e7e7;background:rgba(255,255,255,.96);box-shadow:0 3px 6px rgba(100,100,100,.2);border-radius:8px;pointer-events:auto}',
      '.va-generic-controls--image{left:auto;right:0}',
      '.va-generic-controls button{width:28px;height:28px;border:1px solid transparent;background:#fff;color:#023347;border-radius:6px;padding:0;font:800 14px/1 Montserrat,system-ui,sans-serif;cursor:pointer}',
      '.va-generic-controls button:hover{background:#E8F5FB}',
      '.va-generic-controls button:last-child{color:#b42318}',
      '.va-generic-controls button:last-child:hover{background:#fff8f7}',
      '.proj-item summary>.va-generic-controls{right:12px;left:auto;top:10px}',
      '.partner>.va-generic-controls,.useful-link-card>.va-generic-controls,.team-card>.va-generic-controls,.leader-card>.va-generic-controls,.card>.va-generic-controls,.criterion-card>.va-generic-controls,.apply-step>.va-generic-controls,.kpi>.va-generic-controls,.struct-stat>.va-generic-controls,.nnt-stat>.va-generic-controls,.council-stat>.va-generic-controls,.cert-level-card>.va-generic-controls,.vazifa-card>.va-generic-controls{right:8px;left:auto;top:8px}',
      'tr.va-generic-editable{outline-offset:-2px}',
      'tr>.va-generic-controls{right:8px;left:auto;top:4px}',
      '.va-generic-add{display:none}'
    ].join('');
    doc.head.appendChild(style);
  }

  function observeFrameMutations(doc) {
    if (!doc.defaultView || !doc.defaultView.MutationObserver || doc.documentElement.dataset.vaMutationHooked) return;
    doc.documentElement.dataset.vaMutationHooked = '1';
    var timer = 0;
    var observer = new doc.defaultView.MutationObserver(function (records) {
      var relevant = records.some(function (record) {
        var node = record.target;
        return node && node.nodeType === 1 && !node.closest('.va-live-controls,.va-live-add,.va-generic-controls,.va-generic-add,.va-context-add');
      });
      if (!relevant) return;
      doc.defaultView.clearTimeout(timer);
      timer = doc.defaultView.setTimeout(injectEditorLayer, 180);
    });
    observer.observe(doc.body, { childList: true, subtree: true });
  }

  function assignVisualIds(doc) {
    Array.prototype.forEach.call(doc.querySelectorAll(GENERIC_SELECTOR), function (node) {
      if (!isGenericEditable(node)) return;
      if (!node.getAttribute('data-va-block-id')) node.setAttribute('data-va-block-id', blockId(doc, node));
    });
  }

  function injectGenericBuilderControls(doc) {
    Array.prototype.forEach.call(doc.querySelectorAll('[data-va-block-id]'), function (node) {
      if (!isGenericEditable(node) || node.dataset.vaGenericInjected) return;
      node.dataset.vaGenericInjected = '1';
      node.classList.add('va-generic-editable');
      if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
      if (node.tagName === 'IMG' && node.parentNode && getComputedStyle(node.parentNode).position === 'static') {
        node.parentNode.style.position = 'relative';
      }
      var controls = doc.createElement('div');
      controls.className = 'va-generic-controls' + (node.tagName === 'IMG' ? ' va-generic-controls--image' : '');
      controls.innerHTML = '<button type="button" data-va-generic-edit title="Tahrirlash" aria-label="Tahrirlash">✎</button><button type="button" data-va-generic-delete title="O\'chirish" aria-label="O\'chirish">×</button>';
      controls.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.hasAttribute('data-va-generic-delete')) openVisualEditor(node, 'delete');
        else openVisualEditor(node, 'edit');
      });
      if (node.tagName === 'IMG') node.parentNode.insertBefore(controls, node.nextSibling);
      else attachControls(node, controls);
    });
  }

  function injectStructuredAddButtons(doc) {
    [
      ['.partner-grid', 'partner', "Hamkor qo'shish"],
      ['.useful-links-grid', 'useful_link', "Havola qo'shish"],
      ['.team-grid', 'person_card', "Xodim qo'shish"],
      ['.leader-grid,.leadership-grid,.container:has(> .leader-card)', 'leader_card', "Rahbar qo'shish"],
      ['.about-intro-grid', 'simple_card', "Blok qo'shish"],
      ['.vazifalar-grid', 'simple_card', "Vazifa qo'shish"],
      ['.cards', 'simple_card', "Karta qo'shish"],
      ['.criteria-grid', 'simple_card', "Mezon qo'shish"],
      ['.apply-steps', 'simple_li', "Bosqich qo'shish"],
      ['.kpi-grid', 'simple_stat', "Ko'rsatkich qo'shish"],
      ['.idx-table tbody:not(#sustainabilityTableBody)', 'top500_row', "Bitiruvchi qo'shish"],
      ['.council-table tbody', 'council_row', "Vakil qo'shish"],
      ['#sustainabilityTableBody', 'sustainability_row', "Natija qo'shish"],
      ['#certTableBody', 'certificate_row', "Sertifikat qo'shish"],
      ['.doc-table', 'simple_row', "Qator qo'shish"],
      ['table tbody', 'simple_row', "Qator qo'shish"],
      ['ol', 'simple_li', "Band qo'shish"],
      ['.proj-accordion', 'project', "Loyiha qo'shish"]
    ].forEach(function (cfg) {
      Array.prototype.forEach.call(queryAll(doc, cfg[0]), function (target) {
        if (target.dataset.vaContextAddInjected) return;
        target.dataset.vaContextAddInjected = '1';
        if (!target.getAttribute('data-va-block-id')) target.setAttribute('data-va-block-id', blockId(doc, target));
        var wrap = doc.createElement('div');
        wrap.className = 'va-context-add';
        wrap.innerHTML = '<button type="button">' + esc(cfg[2]) + '</button>';
        wrap.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openStructuredAdd(target, cfg[1]);
        });
        target.parentNode.insertBefore(wrap, target);
      });
    });
  }

  function injectStructuredItemControls(doc) {
    [
      ['.partner', 'partner'],
      ['.useful-link-card', 'useful_link'],
      ['.team-card', 'person_card'],
      ['.leader-card', 'leader_card'],
      ['.idx-table tbody:not(#sustainabilityTableBody) tr', 'top500_row'],
      ['.council-table tbody tr', 'council_row'],
      ['#sustainabilityTableBody tr', 'sustainability_row'],
      ['#certTableBody tr', 'certificate_row'],
      ['.doc-row:not(.head),tbody tr', 'simple_row'],
      ['.criterion-card,.apply-step,.kpi,.struct-stat,.council-stat,article.card,.vazifa-card,.about-reg-card', 'simple_block']
    ].forEach(function (cfg) {
      Array.prototype.forEach.call(queryAll(doc, cfg[0]), function (node) {
        if (node.dataset.vaStructuredInjected && node.querySelector('[data-va-structured-edit]')) return;
        if (!node.getAttribute('data-va-block-id')) node.setAttribute('data-va-block-id', blockId(doc, node));
        node.classList.add('va-generic-editable');
        if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
        var controls = doc.createElement('div');
        controls.className = 'va-generic-controls';
        controls.innerHTML = '<button type="button" data-va-structured-edit title="Tahrirlash" aria-label="Tahrirlash">✎</button><button type="button" data-va-structured-delete title="O\'chirish" aria-label="O\'chirish">×</button>';
        controls.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openStructuredItemEditor(node, cfg[1], e.target.hasAttribute('data-va-structured-delete') ? 'delete' : 'edit');
        });
        attachControls(node, controls);
        node.dataset.vaStructuredInjected = '1';
      });
    });
  }

  function attachControls(node, controls) {
    if (node && node.tagName === 'TR') {
      var cell = node.querySelector('td,th');
      if (cell) {
        if (getComputedStyle(cell).position === 'static') cell.style.position = 'relative';
        cell.insertBefore(controls, cell.firstChild);
        return;
      }
    }
    node.appendChild(controls);
  }

  function injectProjectControls(doc) {
    Array.prototype.forEach.call(doc.querySelectorAll('.proj-accordion,.proj-item'), function (node) {
      if (!node.getAttribute('data-va-block-id')) node.setAttribute('data-va-block-id', blockId(doc, node));
    });
    Array.prototype.forEach.call(doc.querySelectorAll('.proj-item'), function (node) {
      if (node.dataset.vaProjectInjected) return;
      node.dataset.vaProjectInjected = '1';
      node.classList.add('va-generic-editable');
      if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
      var summary = node.querySelector('summary') || node;
      if (getComputedStyle(summary).position === 'static') summary.style.position = 'relative';
      var controls = doc.createElement('div');
      controls.className = 'va-generic-controls';
      controls.innerHTML = '<button type="button" data-va-project-edit title="Tahrirlash" aria-label="Tahrirlash">✎</button><button type="button" data-va-project-delete title="O\'chirish" aria-label="O\'chirish">×</button>';
      controls.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.hasAttribute('data-va-project-delete')) openProjectEditor(node, 'delete');
        else openProjectEditor(node, 'edit');
      });
      summary.appendChild(controls);
    });
  }

  function isGenericEditable(node) {
    if (!node || !node.matches) return false;
    if (node.closest('script,style,noscript')) return false;
    if (!node.closest('footer.site-footer,.site-footer') && node.closest(PROTECTED_SELECTOR)) return false;
    if (node.hasAttribute('data-va-type') || node.closest('[data-va-type]')) return false;
    if (node.closest('.partner,.useful-link-card,.team-card,.leader-card,.proj-item')) return false;
    if (node.matches('tbody tr') || node.closest('.idx-table,.council-table,.reg-table')) return false;
    if (node.id === 'siteFrame') return false;
    var text = String(node.textContent || '').trim();
    if (node.tagName === 'IMG') return !!node.getAttribute('src');
    return text.length > 0 || node.tagName === 'A';
  }

  function queryAll(doc, selector) {
    try {
      return doc.querySelectorAll(selector);
    } catch (e) {
      return [];
    }
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
      ['#dynamic-publications-page', 'publications'],
      ['#dynamic-events-home', 'events'],
      ['#dynamic-events-page', 'events'],
      ['#dynamic-grants-page', 'grants'],
      ['#dynamic-projects-grants', 'grants'],
      ['#dynamic-documents-page', 'documents'],
      ['#dynamic-video-page', 'videos'],
      ['#dynamic-digest-page', 'digests']
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
    if (!isEditableType(type)) return Promise.reject(new Error('visual_admin_type_disabled'));
    return loadItems(type).then(function (items) {
      var item = items.find(function (x) { return String(x.id) === String(id); });
      if (!item) throw new Error('item_topilmadi');
      return item;
    });
  }

  function loadItems(type) {
    if (!isEditableType(type)) return Promise.reject(new Error('visual_admin_type_disabled'));
    if (state.cache[type]) return Promise.resolve(state.cache[type]);
    var cfg = TYPES[type];
    var storageType = cfg.storageType || type;
    if (cfg.direct) {
      return NgoApi.get(cfg.endpoint + '?limit=250').then(function (res) {
        state.cache[type] = normalizeItems(res);
        return state.cache[type];
      });
    }
    return new Promise(function (resolve, reject) {
      AdminCMS.load(storageType, function (err, items) {
        if (err) reject(err);
        else {
          state.cache[type] = cfg.category
            ? (items || []).filter(function (item) { return String(item.category || '').toLowerCase() === String(cfg.category).toLowerCase(); })
            : (items || []);
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
    if (!isEditableType(type)) {
      toast('Bu bo\'lim visual admin orqali tahrirlanmaydi.');
      return;
    }
    var cfg = TYPES[type];
    state.editingType = type;
    state.editing = item || null;
    state.visualAction = null;
    els.editorTitle.textContent = item ? cfg.singular + 'ni tahrirlash' : 'Yangi ' + cfg.singular;
    els.editorKicker.textContent = cfg.label;
    els.deleteBtn.style.display = item ? '' : 'none';
    els.saveBtn.style.display = '';
    els.form.dataset.mode = item ? 'edit' : 'add';
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
    els.form.dataset.mode = 'visual-' + action;
    els.deleteBtn.style.display = action === 'delete' || action === 'edit' ? '' : 'none';
    els.saveBtn.style.display = action === 'delete' ? 'none' : '';
    els.deleteBtn.textContent = action === 'delete' ? "O'chirish" : "O'chirish";
    setError(els.editorError, '');
    if (action === 'delete') {
      els.fields.innerHTML = deleteConfirmHtml(node);
    } else {
      els.fields.innerHTML = visualFieldsFor(node, action).map(function (field) { return fieldHtml(field, item); }).join('');
      initImagePreview();
    }
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function openStructuredAdd(target, kind) {
    state.editingType = VISUAL_TYPE;
    state.editing = null;
    state.visualTarget = target;
    state.visualAction = 'add-' + kind;
    els.editorTitle.textContent = addTitle(kind);
    els.editorKicker.textContent = addKicker(kind);
    els.form.dataset.mode = 'visual-add-' + kind;
    els.deleteBtn.style.display = 'none';
    els.saveBtn.style.display = '';
    setError(els.editorError, '');
    els.fields.innerHTML = structuredFieldsFor(kind).map(function (field) { return fieldHtml(field, structuredDefaults(kind)); }).join('');
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    initImagePreview();
  }

  function structuredDefaults(kind) {
    if (kind === 'partner') return { name: '', href: '', src: '', alt: '' };
    if (kind === 'useful_link') return { title: '', href: '', icon_src: 'img/emblem-uz.svg', icon_alt: "O'zbekiston gerbi" };
    if (kind === 'person_card') return { name: '', role: '', region: '', email: '', photo: '' };
    if (kind === 'project') return { status: 'rejadagi', title: '', body: '' };
    if (kind === 'leader_card') return { name: '', role: '', email: '', photo: '', bio: '' };
    if (kind === 'simple_stat') return { value: '', label: '' };
    if (kind === 'simple_li') return { title: '', body: '' };
    if (kind === 'simple_row') return { html: "<span>Yangi qator</span><span>Ma'lumot</span>" };
    if (kind === 'simple_card') return { title: '', body: '' };
    if (kind === 'top500_row') return { name: '', nnt: '', university: '', level: '', year: '', qs: '', the: '' };
    if (kind === 'council_row') return { agency: '', member_name: '', member_role: '', photo: '' };
    if (kind === 'sustainability_row') return { organization: '', region: '', score: '', level: '' };
    if (kind === 'certificate_row') return { organization: '', region: '', score: '', level: '', issued: '', expires: '' };
    return {};
  }

  function structuredFieldsFor(kind) {
    if (kind === 'partner') {
      return [
        file('logo_file', 'Logotip yuklash', 'image/*', true),
        text('src', 'Logotip manzili', false, true),
        text('name', 'Hamkor nomi', true, true),
        text('href', 'Vebsayt URL', false, true)
      ];
    }
    if (kind === 'useful_link') {
      return [
        text('title', 'Havola nomi', true, true),
        text('href', 'URL', true, true),
        file('icon_file', 'Ikonka yuklash', 'image/*', true),
        text('icon_src', 'Ikonka manzili', false, true),
        text('icon_alt', 'Ikonka alt matni', false, true)
      ];
    }
    if (kind === 'project') {
      return projectFields();
    }
    if (kind === 'person_card' || kind === 'leader_card') {
      return personFields(kind === 'leader_card');
    }
    if (kind === 'simple_stat') return [text('value', 'Raqam', true), text('label', 'Izoh', true, true)];
    if (kind === 'simple_li') return [text('title', 'Sarlavha', false, true), area('body', 'Matn', true, true)];
    if (kind === 'simple_row') return [area('html', 'Qator HTML', true, true)];
    if (kind === 'simple_card' || kind === 'simple_block') return [text('title', 'Sarlavha', false, true), area('body', 'Matn', true, true)];
    if (kind === 'top500_row') {
      return [
        text('name', 'F.I.Sh.', true, true),
        text('nnt', 'NNT nomi', true, true),
        text('university', 'OTM nomi', true, true),
        text('level', 'Ta\'lim darajasi', true),
        text('year', 'Tamomlagan yili', true),
        text('qs', 'QS reytingi'),
        text('the', 'THE reytingi')
      ];
    }
    if (kind === 'council_row') {
      return [
        text('agency', 'Vazirlik / idora', true, true),
        file('photo_file', 'Vakil rasmi yuklash', 'image/*', true),
        text('photo', 'Vakil rasmi manzili', false, true),
        text('member_name', 'Vakil F.I.Sh.', true, true),
        text('member_role', 'Lavozim', true, true)
      ];
    }
    if (kind === 'sustainability_row') {
      return [
        text('organization', 'Tashkilot nomi', true, true),
        text('region', 'Viloyat', true),
        number('score', 'Ball'),
        text('level', 'Daraja', true)
      ];
    }
    if (kind === 'certificate_row') {
      return [
        text('organization', 'Tashkilot nomi', true, true),
        text('region', 'Viloyat / shahar', true),
        number('score', 'Ball'),
        text('level', 'Sertifikat darajasi', true),
        date('issued', 'Berilgan sana'),
        date('expires', 'Amal qilish muddati')
      ];
    }
    return [];
  }

  function addTitle(kind) {
    if (kind === 'partner') return "Hamkor qo'shish";
    if (kind === 'project') return "Loyiha qo'shish";
    if (kind === 'person_card') return "Xodim qo'shish";
    if (kind === 'leader_card') return "Rahbar qo'shish";
    if (kind === 'simple_stat') return "Ko'rsatkich qo'shish";
    if (kind === 'simple_li') return "Band qo'shish";
    if (kind === 'simple_row') return "Qator qo'shish";
    if (kind === 'simple_card') return "Karta qo'shish";
    if (kind === 'top500_row') return "Bitiruvchi qo'shish";
    if (kind === 'council_row') return "Vakil qo'shish";
    if (kind === 'sustainability_row') return "Natija qo'shish";
    if (kind === 'certificate_row') return "Sertifikat qo'shish";
    return "Foydali havola qo'shish";
  }

  function addKicker(kind) {
    if (kind === 'partner') return 'Hamkorlar';
    if (kind === 'project') return 'Loyihalar';
    if (kind === 'person_card') return 'Jamoa / kartalar';
    if (kind === 'leader_card') return 'Rahbariyat';
    if (kind === 'simple_stat') return "Ko'rsatkichlar";
    if (kind === 'simple_li' || kind === 'simple_row' || kind === 'simple_card') return 'Sahifa kontenti';
    if (kind === 'top500_row') return 'TOP-500 reyestri';
    if (kind === 'council_row') return 'Jamoatchilik kengashi';
    if (kind === 'sustainability_row') return 'Barqarorlik indeksi';
    if (kind === 'certificate_row') return 'Barqaror NNT sertifikati';
    return 'Foydali havolalar';
  }

  function openStructuredItemEditor(node, kind, action) {
    state.editingType = VISUAL_TYPE;
    state.editing = null;
    state.visualTarget = node;
    state.visualAction = action + '-' + kind;
    els.editorTitle.textContent = action === 'delete' ? itemDeleteTitle(kind) : itemEditTitle(kind);
    els.editorKicker.textContent = itemKicker(kind);
    els.form.dataset.mode = 'visual-' + state.visualAction;
    els.deleteBtn.style.display = action === 'delete' || action === 'edit' ? '' : 'none';
    els.saveBtn.style.display = action === 'delete' ? 'none' : '';
    setError(els.editorError, '');
    els.fields.innerHTML = action === 'delete'
      ? deleteConfirmHtml(node)
      : fieldsForStructuredItem(kind).map(function (field) { return fieldHtml(field, structuredItemFromNode(node, kind)); }).join('');
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    initImagePreview();
  }

  function itemEditTitle(kind) {
    if (kind === 'partner') return 'Hamkorni tahrirlash';
    if (kind === 'useful_link') return 'Foydali havolani tahrirlash';
    if (kind === 'leader_card') return 'Rahbar kartasini tahrirlash';
    if (kind === 'simple_row') return 'Qatorni tahrirlash';
    if (kind === 'simple_block') return 'Blokni tahrirlash';
    if (kind === 'top500_row') return 'TOP-500 qatorini tahrirlash';
    if (kind === 'council_row') return 'Kengash qatorini tahrirlash';
    if (kind === 'sustainability_row') return 'Indeks qatorini tahrirlash';
    if (kind === 'certificate_row') return 'Sertifikat qatorini tahrirlash';
    return 'Xodim kartasini tahrirlash';
  }

  function itemDeleteTitle(kind) {
    if (kind === 'partner') return "Hamkorni o'chirish";
    if (kind === 'useful_link') return "Foydali havolani o'chirish";
    if (kind === 'leader_card') return "Rahbar kartasini o'chirish";
    if (kind === 'simple_row') return "Qatorni o'chirish";
    if (kind === 'simple_block') return "Blokni o'chirish";
    if (kind === 'top500_row') return "TOP-500 qatorini o'chirish";
    if (kind === 'council_row') return "Kengash qatorini o'chirish";
    if (kind === 'sustainability_row') return "Indeks qatorini o'chirish";
    if (kind === 'certificate_row') return "Sertifikat qatorini o'chirish";
    return "Xodim kartasini o'chirish";
  }

  function itemKicker(kind) {
    if (kind === 'partner') return 'Hamkorlar';
    if (kind === 'useful_link') return 'Foydali havolalar';
    if (kind === 'leader_card') return 'Rahbariyat';
    if (kind === 'simple_row') return 'Jadval qatori';
    if (kind === 'simple_block') return 'Sahifa kontenti';
    if (kind === 'top500_row') return 'TOP-500 reyestri';
    if (kind === 'council_row') return 'Jamoatchilik kengashi';
    if (kind === 'sustainability_row') return 'Barqarorlik indeksi';
    if (kind === 'certificate_row') return 'Barqaror NNT sertifikati';
    return 'Jamoa / kartalar';
  }

  function fieldsForStructuredItem(kind) {
    if (kind === 'partner') return structuredFieldsFor('partner');
    if (kind === 'useful_link') return structuredFieldsFor('useful_link');
    if (kind === 'simple_row') return structuredFieldsFor('simple_row');
    if (kind === 'simple_block') return structuredFieldsFor('simple_block');
    if (kind === 'top500_row' || kind === 'council_row' || kind === 'sustainability_row' || kind === 'certificate_row') return structuredFieldsFor(kind);
    return personFields(kind === 'leader_card');
  }

  function personFields(isLeader) {
    return [
      file('photo_file', 'Rasm yuklash', 'image/*', true),
      text('photo', 'Rasm manzili', false, true),
      text('name', 'Ism-familiya', true, true),
      text('role', 'Lavozim', true, true),
      text('region', 'Hudud', false, true),
      text('email', 'Email', false, true),
      isLeader ? area('bio', 'Biografiya', false, true) : text('meta', "Qo'shimcha ma'lumot", false, true)
    ];
  }

  function structuredItemFromNode(node, kind) {
    if (kind === 'partner') {
      var pImg = node.querySelector('img');
      var pLink = node.matches('a[href]') ? node : node.querySelector('a[href]');
      return {
        src: pImg ? pImg.getAttribute('src') || '' : '',
        name: pImg ? pImg.getAttribute('alt') || '' : cleanNodeText(node),
        href: pLink ? pLink.getAttribute('href') || '' : ''
      };
    }
    if (kind === 'useful_link') {
      var icon = node.querySelector('img');
      return {
        title: cleanNodeText(node.querySelector('h3') || node),
        href: node.getAttribute('href') || '',
        icon_src: icon ? icon.getAttribute('src') || '' : 'img/emblem-uz.svg',
        icon_alt: icon ? icon.getAttribute('alt') || '' : ''
      };
    }
    if (kind === 'simple_block') {
      return blockFieldsFromNode(node);
    }
    if (kind === 'simple_row') {
      return { html: cleanNodeHtml(node) };
    }
    if (kind === 'top500_row') return top500RowFromNode(node);
    if (kind === 'council_row') return councilRowFromNode(node);
    if (kind === 'sustainability_row') return sustainabilityRowFromNode(node);
    if (kind === 'certificate_row') return certificateRowFromNode(node);
    var img = node.querySelector('img');
    var email = node.querySelector('a[href^="mailto:"]');
    return {
      photo: img ? img.getAttribute('src') || '' : '',
      name: cleanNodeText(node.querySelector('h2,h3,.leader-name') || node),
      role: cleanNodeText(node.querySelector('.team-role,.leader-role') || ''),
      region: cleanNodeText(node.querySelector('.team-region') || ''),
      email: email ? (email.getAttribute('href') || '').replace(/^mailto:/i, '') : '',
      meta: cleanNodeText(node.querySelector('.team-meta') || ''),
      bio: cleanNodeText(node.querySelector('.leader-expand-body') || '')
    };
  }

  function openProjectEditor(node, action) {
    state.editingType = VISUAL_TYPE;
    state.editing = null;
    state.visualTarget = node;
    state.visualAction = action === 'delete' ? 'delete-project' : 'edit-project';
    els.editorTitle.textContent = action === 'delete' ? "Loyihani o'chirish" : 'Loyihani tahrirlash';
    els.editorKicker.textContent = 'Loyihalar';
    els.form.dataset.mode = 'visual-' + state.visualAction;
    els.deleteBtn.style.display = action === 'delete' || action === 'edit' ? '' : 'none';
    els.saveBtn.style.display = action === 'delete' ? 'none' : '';
    setError(els.editorError, '');
    els.fields.innerHTML = action === 'delete'
      ? deleteConfirmHtml(node)
      : projectFields().map(function (field) { return fieldHtml(field, projectItemFromNode(node)); }).join('');
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function projectFields() {
    return [
      select('status', 'Holat', [['amaldagi', 'Amaldagi'], ['yakunlangan', 'Yakunlangan'], ['rejadagi', 'Rejadagi']]),
      text('title', 'Loyiha nomi', true, true),
      area('body', 'Tavsif', true, true)
    ];
  }

  function projectItemFromNode(node) {
    var status = node.querySelector('.proj-status');
    var title = node.querySelector('.proj-title');
    var body = node.querySelector('.proj-body');
    var statusKey = 'rejadagi';
    if (status) {
      if (status.classList.contains('s-amaldagi')) statusKey = 'amaldagi';
      else if (status.classList.contains('s-yakunlangan')) statusKey = 'yakunlangan';
      else if (status.classList.contains('s-rejadagi')) statusKey = 'rejadagi';
    }
    return {
      status: statusKey,
      title: title ? cleanNodeText(title) : '',
      body: body ? cleanNodeText(body) : ''
    };
  }

  function visualFieldsFor(node, action) {
    if (action === 'add') {
      return [select('block_kind', 'Blok turi', [['paragraph', 'Matn'], ['heading', 'Sarlavha'], ['card', 'Karta'], ['html', 'HTML']]), area('html', 'Kontent', true, true)];
    }
    if (isDetailMetaNode(node)) {
      return [date('date', 'Sana', false), text('label', "Bo'lim / turi", false, true), text('href', 'Havola', false, true)];
    }
    if (node.tagName === 'IMG') return [file('file', 'Yangi rasm yuklash', 'image/*', true), text('src', 'Rasm manzili', true, true), text('alt', 'Alt matn', false, true)];
    if (node.tagName === 'A') return [text('text', 'Matn', false, true), text('href', 'Havola', false, true)];
    return [area('html', 'Kontent', true, true)];
  }

  function visualItemFromNode(node, action) {
    if (action === 'add') return { block_kind: 'paragraph', html: 'Yangi matn' };
    if (isDetailMetaNode(node)) return detailMetaFromNode(node);
    if (node.tagName === 'IMG') return { src: node.getAttribute('src') || '', alt: node.getAttribute('alt') || '' };
    if (node.tagName === 'A') return { text: cleanNodeText(node), href: node.getAttribute('href') || '' };
    return { html: cleanNodeHtml(node) };
  }

  function cleanNodeHtml(node) {
    var clone = node.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('.va-live-controls,.va-live-add,.va-generic-controls,.va-generic-add'), function (child) {
      child.remove();
    });
    return cleanEditorHtml(clone.innerHTML).trim();
  }

  function cleanNodeText(node) {
    var clone = node.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('.va-live-controls,.va-live-add,.va-generic-controls,.va-generic-add'), function (child) {
      child.remove();
    });
    return String(clone.textContent || '').trim();
  }

  function deleteConfirmHtml(node) {
    var label = node.tagName === 'IMG'
      ? (node.getAttribute('alt') || node.getAttribute('src') || 'Rasm')
      : cleanNodeText(node);
    return '<div class="va-delete-confirm va-field--wide">' +
      '<strong>Bu blokni o\'chirishni tasdiqlaysizmi?</strong>' +
      '<p>' + esc(label.slice(0, 220) || 'Tanlangan blok') + '</p>' +
      '</div>';
  }

  function closeEditor() {
    els.modal.classList.remove('is-open');
    els.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.editing = null;
    state.editingType = null;
    state.visualTarget = null;
    state.visualAction = null;
    els.form.dataset.mode = '';
    els.saveBtn.style.display = '';
    els.deleteBtn.style.display = '';
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
    if (field.kind === 'hidden') {
      if (value && typeof value !== 'string') {
        try { value = JSON.stringify(value); } catch (e) { value = ''; }
      }
      return '<input id="' + escAttr(id) + '" name="' + escAttr(field.name) + '" type="hidden" value="' + escAttr(value || '') + '">';
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
      if (field.name === 'media_gallery' && value && typeof value !== 'string') {
        try { value = JSON.stringify(value, null, 2); } catch (e) { value = ''; }
      }
      return '<label class="' + cls + '" for="' + escAttr(id) + '"><span>' + esc(field.label) + '</span><textarea id="' + escAttr(id) + '" name="' + escAttr(field.name) + '"' + req + '>' + esc(value || '') + '</textarea></label>';
    }
    if (field.kind === 'file') {
      var accept = field.accept ? ' accept="' + escAttr(field.accept) + '"' : '';
      return '<label class="' + cls + ' va-file-field" for="' + escAttr(id) + '"><span>' + esc(field.label) + '</span><input id="' + escAttr(id) + '" name="' + escAttr(field.name) + '" type="file"' + accept + '><small>JPG, PNG, WebP yoki SVG rasm tanlang. Saqlaganda yuklanadi.</small></label>';
    }
    if (field.kind === 'multi-file') {
      var multiAccept = field.accept ? ' accept="' + escAttr(field.accept) + '"' : '';
      return '<label class="' + cls + ' va-file-field" for="' + escAttr(id) + '"><span>' + esc(field.label) + '</span><input id="' + escAttr(id) + '" name="' + escAttr(field.name) + '" type="file" multiple' + multiAccept + '><small>Ko\'pi bilan 10 ta fayl. Rasmlar va video fayllar saqlaganda yuklanadi.</small></label>';
    }
    return '<label class="' + cls + '" for="' + escAttr(id) + '"><span>' + esc(field.label) + '</span><input id="' + escAttr(id) + '" name="' + escAttr(field.name) + '" type="' + field.kind + '" value="' + escAttr(value || '') + '"' + req + '></label>';
  }

  function readEditor() {
    if (state.editingType === VISUAL_TYPE) {
      var out = {};
      Array.prototype.forEach.call(els.form.elements, function (el) {
        if (!el.name) return;
        if (el.type === 'file') out[el.name] = el.files && el.files[0] ? el.files[0] : null;
        else out[el.name] = String(el.value || '').trim();
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
      else if (field.kind === 'file') data[field.name] = el.files && el.files[0] ? el.files[0] : null;
      else if (field.kind === 'multi-file') data[field.name] = el.files ? Array.prototype.slice.call(el.files) : [];
      else data[field.name] = String(el.value || '').trim();
    });
    return data;
  }

  function onSave(e) {
    e.preventDefault();
    if (state.editingType === VISUAL_TYPE && state.visualAction === 'delete') {
      onDelete();
      return;
    }
    var data = readEditor();
    if (state.editingType === VISUAL_TYPE) {
      if (state.visualAction === 'add-partner' && (!data.name || !(data.src || data.logo_file))) {
        setError(els.editorError, 'Hamkor nomi va logotip majburiy.');
        return;
      }
      if (state.visualAction === 'add-useful_link' && (!data.title || !data.href)) {
        setError(els.editorError, 'Havola nomi va URL majburiy.');
        return;
      }
      if ((state.visualAction === 'add-person_card' || state.visualAction === 'edit-person_card' || state.visualAction === 'add-leader_card' || state.visualAction === 'edit-leader_card') && (!data.name || !data.role)) {
        setError(els.editorError, 'Ism-familiya va lavozim majburiy.');
        return;
      }
      if ((state.visualAction === 'add-project' || state.visualAction === 'edit-project') && (!data.title || !data.body)) {
        setError(els.editorError, 'Loyiha nomi va tavsifi majburiy.');
        return;
      }
      if ((state.visualAction === 'add-simple_card' || state.visualAction === 'add-simple_li' || state.visualAction === 'edit-simple_block') && !data.body) {
        setError(els.editorError, 'Matn majburiy.');
        return;
      }
      if (state.visualAction === 'add-simple_stat' && (!data.value || !data.label)) {
        setError(els.editorError, 'Raqam va izoh majburiy.');
        return;
      }
      if ((state.visualAction === 'add-top500_row' || state.visualAction === 'edit-top500_row') && (!data.name || !data.nnt || !data.university || !data.level || !data.year)) {
        setError(els.editorError, 'F.I.Sh., NNT, OTM, ta\'lim darajasi va yil majburiy.');
        return;
      }
      if ((state.visualAction === 'add-council_row' || state.visualAction === 'edit-council_row') && (!data.agency || !data.member_name || !data.member_role)) {
        setError(els.editorError, 'Idora nomi, vakil F.I.Sh. va lavozim majburiy.');
        return;
      }
      if ((state.visualAction === 'add-sustainability_row' || state.visualAction === 'edit-sustainability_row') && (!data.organization || !data.region || !data.level)) {
        setError(els.editorError, 'Tashkilot, hudud va daraja majburiy.');
        return;
      }
      if ((state.visualAction === 'add-certificate_row' || state.visualAction === 'edit-certificate_row') && (!data.organization || !data.region || !data.level)) {
        setError(els.editorError, 'Tashkilot, hudud va sertifikat darajasi majburiy.');
        return;
      }
      if (state.visualAction !== 'delete' && !(data.html || data.text || data.src || data.href || data.file || data.title || data.body || data.name || data.role || data.value || data.label || data.date)) {
        setError(els.editorError, 'Kontent bo\'sh bo\'lmasligi kerak.');
        return;
      }
      var visualBtn = e.submitter || els.form.querySelector('button[type="submit"]');
      lock(visualBtn, true, 'Saqlanmoqda...');
      prepareVisualData(data).then(saveVisualPatch).then(function () {
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
    prepareItemData(data).then(saveItem).then(function () {
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
    if (!cfg) return Promise.reject(new Error('visual_admin_type_disabled'));
    var storageType = cfg.storageType || state.editingType;
    if (cfg.category) data.category = cfg.category;
    if (cfg.direct) {
      if (state.editing && state.editing.id) return NgoApi.patch(cfg.endpoint + '/' + encodeURIComponent(state.editing.id), data);
      return NgoApi.post(cfg.endpoint, data);
    }
    if (state.editing && state.editing.id) return AdminCMS.update(storageType, state.editing.id, data);
    return AdminCMS.create(storageType, data);
  }

  function prepareItemData(data) {
    if (!data) return Promise.resolve(data);
    var tasks = [];
    if (data.cover_image_file) {
      tasks.push(uploadVisualImage(data.cover_image_file).then(function (res) {
        data.cover_image = res && res.path ? res.path : data.cover_image;
        delete data.cover_image_file;
      }));
    } else {
      delete data.cover_image_file;
    }
    tasks.push(prepareItemMediaGallery(data));
    return Promise.all(tasks).then(function () { return data; });
  }

  function prepareItemMediaGallery(data) {
    var picked = Array.isArray(data.media_files) ? data.media_files.filter(Boolean) : [];
    if (picked.length > 10) return Promise.reject(new Error('Ko\'pi bilan 10 ta media fayl yuklash mumkin.'));
    var gallery = parseMediaGallery(data.media_gallery);
    var linkItems = parseMediaLinks(data.video_links);
    delete data.media_files;
    delete data.video_links;

    var uploads = picked.map(function (file) {
      return uploadVisualMedia(file).then(function (res) {
        return mediaItemFromUpload(file, res);
      });
    });

    return Promise.all(uploads).then(function (uploaded) {
      gallery = gallery.concat(uploaded.filter(Boolean)).concat(linkItems);
      data.media_gallery = gallery.length ? JSON.stringify(gallery) : '';
      return data;
    });
  }

  function parseMediaGallery(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'object') return [value];
    var textValue = String(value || '').trim();
    if (!textValue) return [];
    try {
      var parsed = JSON.parse(textValue);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch (e) {}
    return textValue.split(/\n+/).map(function (line) {
      line = line.trim();
      if (!line) return null;
      return mediaItemFromUrl(line);
    }).filter(Boolean);
  }

  function parseMediaLinks(value) {
    return String(value || '').split(/\n+/).map(function (line) {
      line = line.trim();
      if (!line) return null;
      return mediaItemFromUrl(line);
    }).filter(Boolean);
  }

  function mediaItemFromUpload(file, res) {
    if (!res) return null;
    var mime = (res.mime || file.type || '').toLowerCase();
    return {
      type: mime.indexOf('video/') === 0 ? 'video' : 'image',
      path: res.path || '',
      url: uploadResultUrl(res),
      mime: mime,
      title: file.name || '',
      size: res.size || file.size || 0
    };
  }

  function mediaItemFromUrl(url) {
    var clean = String(url || '').trim();
    if (!/^https?:\/\//i.test(clean)) return null;
    return {
      type: /\.(mp4|webm|ogg)(\?|#|$)/i.test(clean) ? 'video' : 'embed',
      url: clean,
      title: ''
    };
  }

  function prepareVisualData(data) {
    if (state.editingType !== VISUAL_TYPE || !data) return Promise.resolve(data);
    var tasks = [];
    if (data.file && state.visualTarget && state.visualTarget.tagName === 'IMG') {
      tasks.push(uploadVisualImage(data.file).then(function (res) { data.src = uploadResultUrl(res); data.file = null; }));
    }
    if (data.logo_file) {
      tasks.push(uploadVisualImage(data.logo_file).then(function (res) { data.src = uploadResultUrl(res); data.logo_file = null; }));
    }
    if (data.icon_file) {
      tasks.push(uploadVisualImage(data.icon_file).then(function (res) { data.icon_src = uploadResultUrl(res); data.icon_file = null; }));
    }
    if (data.photo_file) {
      tasks.push(uploadVisualImage(data.photo_file).then(function (res) { data.photo = uploadResultUrl(res); data.photo_file = null; }));
    }
    if (!tasks.length) return Promise.resolve(data);
    return Promise.all(tasks).then(function () { return data; });
  }

  function uploadVisualImage(picked) {
    if (!picked) return Promise.resolve(null);
    if (picked.type && picked.type.indexOf('image/') !== 0) {
      return Promise.reject(new Error("Faqat rasm (image) fayllar yuklanadi. Tanlangan fayl turi: " + picked.type));
    }
    if (picked.size > 10 * 1024 * 1024) {
      return Promise.reject(new Error('Fayl hajmi 10 MB dan oshmasligi kerak (' + (picked.size / (1024 * 1024)).toFixed(1) + ' MB tanlangan).'));
    }
    var fd = new FormData();
    fd.append('file', picked);
    return NgoApi.post('/admin/upload', fd, { timeout: 90000 });
  }

  function uploadVisualMedia(picked) {
    if (!picked) return Promise.resolve(null);
    var type = picked.type || '';
    if (type && type.indexOf('image/') !== 0 && type.indexOf('video/') !== 0) {
      return Promise.reject(new Error("Faqat rasm yoki video fayllar yuklanadi. Tanlangan fayl turi: " + type));
    }
    if (picked.size > 20 * 1024 * 1024) {
      return Promise.reject(new Error('Har bir media fayl hajmi 20 MB dan oshmasligi kerak (' + (picked.size / (1024 * 1024)).toFixed(1) + ' MB tanlangan).'));
    }
    var fd = new FormData();
    fd.append('file', picked);
    return NgoApi.post('/admin/upload', fd, { timeout: 90000 });
  }

  function uploadResultUrl(res) {
    if (!res) return '';
    if (res.url) return res.url;
    if (res.path) return 'https://ngo-api-proxy.sarvsop.workers.dev/media.php?path=' + encodeURIComponent(res.path);
    return '';
  }

  function saveVisualPatch(data) {
    var node = state.visualTarget;
    var id = node && node.getAttribute('data-va-block-id');
    var patch = { id: id, kind: (node && node.tagName || '').toLowerCase(), action: 'html' };
    if (state.visualAction === 'delete' || state.visualAction === 'delete-project' || /^delete-/.test(state.visualAction || '')) {
      patch.action = 'delete';
    } else if (state.visualAction === 'add-partner') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'partner';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildPartnerHtml(data);
    } else if (state.visualAction === 'add-useful_link') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'useful_link';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildUsefulLinkHtml(data);
    } else if (state.visualAction === 'edit-partner') {
      patch.kind = 'partner';
      patch.action = 'html';
      patch.html = buildPartnerInnerHtml(data);
    } else if (state.visualAction === 'edit-useful_link') {
      patch.kind = 'useful_link';
      patch.action = 'attrs';
      patch.href = data.href || '';
      patch.html = buildUsefulLinkInnerHtml(data);
    } else if (state.visualAction === 'add-person_card') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'person_card';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildPersonCardHtml(data);
    } else if (state.visualAction === 'edit-person_card') {
      patch.kind = 'person_card';
      patch.action = 'html';
      patch.html = buildPersonCardInnerHtml(data);
    } else if (state.visualAction === 'edit-leader_card') {
      patch.kind = 'leader_card';
      patch.action = 'html';
      patch.html = buildLeaderCardInnerHtml(data);
    } else if (state.visualAction === 'add-leader_card') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'leader_card';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = '<div class="leader-card">' + buildLeaderCardInnerHtml(data) + '</div>';
    } else if (state.visualAction === 'add-simple_stat') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'simple_stat';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildSimpleStatHtml(data);
    } else if (state.visualAction === 'add-simple_li') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'simple_li';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildSimpleLiHtml(data);
    } else if (state.visualAction === 'add-simple_row') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'simple_row';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildSimpleRowHtml(data, node);
    } else if (state.visualAction === 'edit-simple_row') {
      patch.kind = 'simple_row';
      patch.action = 'html';
      patch.html = cleanEditorHtml(data.html || '');
    } else if (state.visualAction === 'add-simple_card') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'simple_card';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildSimpleCardHtml(data);
    } else if (state.visualAction === 'edit-simple_block') {
      patch.kind = 'simple_block';
      patch.action = 'html';
      patch.html = buildSimpleBlockInnerHtml(data);
    } else if (state.visualAction === 'add-top500_row') {
      patch.id = newVisualId('top500');
      patch.kind = 'top500_row';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildTop500RowHtml(data);
    } else if (state.visualAction === 'edit-top500_row') {
      patch.kind = 'top500_row';
      patch.action = 'html';
      patch.html = buildTop500RowInnerHtml(data);
    } else if (state.visualAction === 'add-council_row') {
      patch.id = newVisualId('council');
      patch.kind = 'council_row';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildCouncilRowHtml(data);
    } else if (state.visualAction === 'edit-council_row') {
      patch.kind = 'council_row';
      patch.action = 'html';
      patch.html = buildCouncilRowInnerHtml(data);
    } else if (state.visualAction === 'add-sustainability_row') {
      patch.id = newVisualId('sustainability');
      patch.kind = 'sustainability_row';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildSustainabilityRowHtml(data);
    } else if (state.visualAction === 'edit-sustainability_row') {
      patch.kind = 'sustainability_row';
      patch.action = 'html';
      patch.html = buildSustainabilityRowInnerHtml(data);
    } else if (state.visualAction === 'add-certificate_row') {
      patch.id = newVisualId('certificate');
      patch.kind = 'certificate_row';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildCertificateRowHtml(data);
    } else if (state.visualAction === 'edit-certificate_row') {
      patch.kind = 'certificate_row';
      patch.action = 'html';
      patch.html = buildCertificateRowInnerHtml(data);
    } else if (state.visualAction === 'add-project') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.kind = 'project';
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'append';
      patch.html = buildProjectHtml(data);
    } else if (state.visualAction === 'edit-project') {
      patch.kind = 'project';
      patch.action = 'html';
      patch.html = buildProjectInnerHtml(data);
    } else if (state.visualAction === 'add') {
      patch.id = 'add:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
      patch.action = 'add';
      patch.targetId = id;
      patch.position = 'after';
      patch.html = buildAddedHtml(data.block_kind, data.html);
    } else if (isDetailMetaNode(node)) {
      patch.action = 'html';
      patch.html = buildDetailMetaInnerHtml(data);
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
      body: JSON.stringify({ page: visualPatchPageKey(node), patch: patch }),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (!r.ok) throw new Error(body.error || ('HTTP ' + r.status));
        return body;
      });
    });
  }

  function buildPartnerHtml(data) {
    return '<div class="partner">' + buildPartnerInnerHtml(data) + '</div>';
  }

  function buildPartnerInnerHtml(data) {
    var name = String(data.name || data.alt || '').trim();
    var src = String(data.src || '').trim();
    var href = String(data.href || '').trim();
    var img = '<img alt="' + escAttr(name || 'Hamkor') + '" loading="lazy" src="' + escAttr(src) + '" decoding="async" width="160" height="56">';
    return href ? '<a href="' + escAttr(href) + '" target="_blank" rel="noopener noreferrer">' + img + '</a>' : img;
  }

  function buildUsefulLinkHtml(data) {
    var href = String(data.href || '').trim();
    return '<a class="useful-link-card" href="' + escAttr(href) + '" target="_blank" rel="noopener noreferrer">' + buildUsefulLinkInnerHtml(data) + '</a>';
  }

  function buildUsefulLinkInnerHtml(data) {
    var title = String(data.title || '').trim();
    var icon = String(data.icon_src || 'img/emblem-uz.svg').trim();
    var alt = String(data.icon_alt || title || 'Havola').trim();
    return '<img class="ul-icon" src="' + escAttr(icon) + '" alt="' + escAttr(alt) + '" loading="lazy" decoding="async" width="18" height="18">' +
      '<h3>' + esc(title) + '</h3>';
  }

  function buildPersonCardHtml(data) {
    return '<article class="team-card">' + buildPersonCardInnerHtml(data) + '</article>';
  }

  function buildPersonCardInnerHtml(data) {
    var photo = String(data.photo || '').trim();
    var name = String(data.name || '').trim();
    var role = String(data.role || '').trim();
    var region = String(data.region || '').trim();
    var email = String(data.email || '').trim();
    var meta = String(data.meta || '').trim();
    return '<div class="team-photo">' + (photo ? '<img src="' + escAttr(photo) + '" alt="' + escAttr(name) + '" loading="lazy" decoding="async" width="130" height="130">' : '') + '</div>' +
      '<h3>' + esc(name) + '</h3>' +
      '<p class="team-role">' + esc(role) + '</p>' +
      (region ? '<p class="team-region">' + esc(region) + '</p>' : '') +
      '<div class="team-meta">' +
      (email ? '<span>Email: <a href="mailto:' + escAttr(email) + '">' + esc(email) + '</a></span>' : '') +
      (meta ? '<span>' + esc(meta) + '</span>' : '') +
      '</div>';
  }

  function buildLeaderCardInnerHtml(data) {
    var photo = String(data.photo || '').trim();
    var name = String(data.name || '').trim();
    var role = String(data.role || '').trim();
    var email = String(data.email || '').trim();
    var bio = String(data.bio || '').trim();
    var safeId = 'leader-bio-' + Math.random().toString(36).slice(2, 8);
    return '<div class="leader-card-body"><div class="leader-photo">' +
      (photo ? '<img src="' + escAttr(photo) + '" alt="' + escAttr(name) + '" loading="lazy" decoding="async" width="768" height="768">' : '') +
      '</div><div class="leader-center"><h2 class="leader-name">' + esc(name) + '</h2><p class="leader-role">' + esc(role) + '</p>' +
      '<div class="leader-btns"><button type="button" class="leader-btn" data-target="' + safeId + '" aria-expanded="false" aria-controls="' + safeId + '">Biografiya</button></div></div>' +
      '<div class="leader-contacts-col">' + (email ? '<a class="leader-contact-item" href="mailto:' + escAttr(email) + '">' + esc(email) + '</a>' : '') + '</div></div>' +
      '<div class="leader-expand-body" id="' + safeId + '"><p>' + esc(bio || "Biografiya: Ma'lumot yaqin kunda qo'shiladi.") + '</p></div>';
  }

  function buildProjectHtml(data) {
    return '<details class="proj-item">' + buildProjectInnerHtml(data) + '</details>';
  }

  function buildProjectInnerHtml(data) {
    var status = String(data.status || 'rejadagi').trim();
    var title = String(data.title || '').trim();
    var body = String(data.body || '').trim();
    var label = status === 'amaldagi' ? 'Amaldagi' : status === 'yakunlangan' ? 'Yakunlangan' : 'Rejadagi';
    var cls = status === 'amaldagi' ? 's-amaldagi' : status === 'yakunlangan' ? 's-yakunlangan' : 's-rejadagi';
    return '<summary>' +
      '<span class="proj-status ' + cls + '">' + label + '</span>' +
      '<span class="proj-title">' + esc(title) + '</span>' +
      '<svg aria-hidden="true" focusable="false" class="proj-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</summary><div class="proj-body">' + esc(body) + '</div>';
  }

  function buildAddedHtml(kind, html) {
    html = cleanEditorHtml(html || '');
    if (kind === 'heading') return /^<h[1-6][\s>]/i.test(html) ? html : '<h2>' + esc(html.replace(/<[^>]*>/g, '')) + '</h2>';
    if (kind === 'card') return /class=["'][^"']*\bcard\b/.test(html) ? html : '<article class="card">' + html + '</article>';
    if (kind === 'html') return html;
    return /^<p[\s>]/i.test(html) ? html : '<p>' + esc(html.replace(/<[^>]*>/g, '')) + '</p>';
  }

  function isDetailMetaNode(node) {
    if (!node || !node.matches) return false;
    return node.matches('.detail-meta') || (!!node.querySelector && !!node.querySelector('time') && !!node.querySelector('.detail-meta-sep'));
  }

  function detailMetaFromNode(node) {
    var time = node.querySelector('time');
    var link = node.querySelector('a[href]');
    return {
      date: time ? normalizeDateValue(time.getAttribute('datetime') || cleanNodeText(time)) : '',
      label: link ? cleanNodeText(link) : '',
      href: link ? link.getAttribute('href') || '' : ''
    };
  }

  function buildDetailMetaInnerHtml(data) {
    var dateValue = normalizeDateValue(data.date || '');
    var label = String(data.label || '').trim();
    var href = String(data.href || '').trim();
    var parts = [];
    if (dateValue) parts.push(dateCell(dateValue));
    if (label) {
      if (parts.length) parts.push('<span class="detail-meta-sep">/</span>');
      parts.push(href ? '<a href="' + escAttr(href) + '">' + esc(label) + '</a>' : '<span>' + esc(label) + '</span>');
    }
    return parts.join('');
  }

  function blockFieldsFromNode(node) {
    var title = node.querySelector('h1,h2,h3,h4,strong,.struct-stat__num,.nnt-stat-value,.nnt-stat strong,.council-stat__num,.hero-stat-num,.kpi strong');
    var body = node.querySelector('p,.struct-stat__label,.nnt-stat-label,.nnt-stat span,.council-stat__label,.hero-stat-label,.kpi span');
    if (node.matches('tr,.doc-row')) return { title: '', body: cleanNodeHtml(node) };
    if (title || body) return { title: title ? cleanNodeText(title) : '', body: body ? cleanNodeText(body) : cleanNodeText(node) };
    return { title: '', body: cleanNodeHtml(node) };
  }

  function buildSimpleStatHtml(data) {
    return '<div class="kpi"><strong>' + esc(data.value || '') + '</strong><span>' + esc(data.label || '') + '</span></div>';
  }

  function buildSimpleLiHtml(data) {
    var title = String(data.title || '').trim();
    var body = String(data.body || '').trim();
    return '<li>' + (title ? '<strong>' + esc(title) + ':</strong> ' : '') + esc(body) + '</li>';
  }

  function buildSimpleRowHtml(data, target) {
    var html = cleanEditorHtml(data.html || '<span>Yangi qator</span>');
    if (target && target.tagName === 'TBODY') return '<tr>' + (/<t[dh][\s>]/i.test(html) ? html : '<td>' + html + '</td>') + '</tr>';
    return '<div class="doc-row">' + html + '</div>';
  }

  function buildSimpleCardHtml(data) {
    return '<article class="card">' + buildSimpleBlockInnerHtml(data) + '</article>';
  }

  function buildSimpleBlockInnerHtml(data) {
    var title = String(data.title || '').trim();
    var body = String(data.body || '').trim();
    if (/<[a-z][\s\S]*>/i.test(body)) return (title ? '<h3>' + esc(title) + '</h3>' : '') + cleanEditorHtml(body);
    return (title ? '<h3>' + esc(title) + '</h3>' : '') + '<p>' + esc(body) + '</p>';
  }

  function top500RowFromNode(node) {
    var c = rowCells(node);
    return {
      name: cellText(c, 1),
      nnt: cellText(c, 2),
      university: cellText(c, 3),
      level: cellText(c, 4),
      year: cellText(c, 5),
      qs: cellText(c, 6),
      the: cellText(c, 7)
    };
  }

  function councilRowFromNode(node) {
    var img = node.querySelector('.member-photo,img');
    return {
      agency: cleanNodeText(node.querySelector('.agency-name') || rowCells(node)[1] || ''),
      photo: img ? img.getAttribute('src') || '' : '',
      member_name: cleanNodeText(node.querySelector('.member-name') || ''),
      member_role: cleanNodeText(node.querySelector('.member-role') || '')
    };
  }

  function sustainabilityRowFromNode(node) {
    var c = rowCells(node);
    return {
      organization: cellText(c, 1),
      region: cellText(c, 2),
      score: cleanNodeText((c[3] && (c[3].querySelector('.score-num') || c[3])) || ''),
      level: cleanNodeText(c[4] || '')
    };
  }

  function certificateRowFromNode(node) {
    var c = rowCells(node);
    var issuedTime = c[5] && c[5].querySelector('time');
    return {
      organization: cellText(c, 1),
      region: cellText(c, 2),
      score: cellText(c, 3),
      level: cleanNodeText(c[4] || ''),
      issued: issuedTime ? issuedTime.getAttribute('datetime') || '' : cellText(c, 5),
      expires: cellText(c, 6)
    };
  }

  function rowCells(node) {
    return Array.prototype.slice.call(node ? node.children || [] : []);
  }

  function cellText(cells, index) {
    return cleanNodeText(cells[index] || '');
  }

  function buildTop500RowHtml(data) {
    return '<tr>' + buildTop500RowInnerHtml(data) + '</tr>';
  }

  function buildTop500RowInnerHtml(data) {
    return '<td></td>' +
      '<td style="font-weight:500;">' + esc(data.name || '') + '</td>' +
      '<td>' + esc(data.nnt || '') + '</td>' +
      '<td>' + esc(data.university || '') + '</td>' +
      '<td>' + esc(data.level || '') + '</td>' +
      '<td>' + esc(data.year || '') + '</td>' +
      '<td>' + esc(data.qs || '') + '</td>' +
      '<td>' + esc(data.the || '') + '</td>';
  }

  function buildCouncilRowHtml(data) {
    return '<tr>' + buildCouncilRowInnerHtml(data) + '</tr>';
  }

  function buildCouncilRowInnerHtml(data) {
    var photo = String(data.photo || '').trim();
    var name = String(data.member_name || '').trim();
    return '<td></td>' +
      '<td><div class="agency-cell"><div class="agency-icon"><svg aria-hidden="true" focusable="false" fill="none" height="18" stroke="var(--green-500)" stroke-width="1.8" viewBox="0 0 24 24" width="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><span class="agency-name">' + esc(data.agency || '') + '</span></div></td>' +
      '<td><div class="member-cell">' +
      (photo ? '<img class="member-photo" src="' + escAttr(photo) + '" alt="' + escAttr(name) + '" loading="lazy" decoding="async" width="52" height="52">' : '') +
      '<div class="member-info"><span class="member-name">' + esc(name) + '</span><span class="member-role">' + esc(data.member_role || '') + '</span></div>' +
      '</div></td>';
  }

  function buildSustainabilityRowHtml(data) {
    return '<tr>' + buildSustainabilityRowInnerHtml(data) + '</tr>';
  }

  function buildSustainabilityRowInnerHtml(data) {
    var score = normalizeScore(data.score);
    var level = String(data.level || '').trim();
    var cls = score >= 80 ? 'sus' : score >= 60 ? 'cons' : score >= 40 ? 'grow' : 'dev';
    var color = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : score >= 40 ? '#ea580c' : '#dc2626';
    return '<td></td>' +
      '<td style="font-weight:500;">' + esc(data.organization || '') + '</td>' +
      '<td>' + esc(data.region || '') + '</td>' +
      '<td class="score-cell"><div class="score-bar-wrap"><div class="score-bar"><div class="score-fill score-fill--' + cls + '" style="width:' + score + '%"></div></div><span class="score-num" style="color:' + color + ';">' + score + '</span></div></td>' +
      '<td><span class="idx-level-tag tag--' + cls + '">' + esc(level) + '</span></td>';
  }

  function buildCertificateRowHtml(data) {
    return '<tr>' + buildCertificateRowInnerHtml(data) + '</tr>';
  }

  function buildCertificateRowInnerHtml(data) {
    var score = normalizeScore(data.score);
    var level = String(data.level || '').trim();
    var cls = /birinchi|1|gold/i.test(level) ? 'gold' : /ikkinchi|2|silver/i.test(level) ? 'silver' : 'bronze';
    return '<td></td>' +
      '<td style="font-weight:500;">' + esc(data.organization || '') + '</td>' +
      '<td>' + esc(data.region || '') + '</td>' +
      '<td><span style="font-weight:700;color:' + (score >= 80 ? '#16a34a' : '#ca8a04') + ';">' + score + '</span></td>' +
      '<td><span class="cert-badge cert-badge--' + cls + '"><i aria-hidden="true" class="ph ph-medal"></i> ' + esc(level) + '</span></td>' +
      '<td>' + dateCell(data.issued) + '</td>' +
      '<td>' + dateCell(data.expires) + '</td>';
  }

  function normalizeScore(value) {
    var n = parseInt(value, 10);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function dateCell(value) {
    value = String(value || '').trim();
    if (!value) return '&mdash;';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      var p = value.split('-');
      return '<time datetime="' + escAttr(value) + '">' + p[2] + '.' + p[1] + '.' + p[0] + '</time>';
    }
    return esc(value);
  }

  function normalizeDateValue(value) {
    value = String(value || '').trim();
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    var dotted = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dotted) return dotted[3] + '-' + dotted[2] + '-' + dotted[1];
    return value;
  }

  function newVisualId(prefix) {
    return 'add:' + prefix + ':' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 7);
  }

  function cleanEditorHtml(html) {
    return String(html || '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\sclass="[^"]*\b(va-live|va-generic)[^"]*"/gi, '')
      .replace(/\sdata-va-[a-z-]+="[^"]*"/gi, '')
      .replace(/<div class="va-[\s\S]*?<\/div>/gi, '');
  }

  function initImagePreview() {
    var src = els.form.elements.src || els.form.elements.icon_src || els.form.elements.photo;
    var fileInput = els.form.elements.file || els.form.elements.logo_file || els.form.elements.icon_file || els.form.elements.photo_file;
    if (!src && !fileInput) return;
    var label = (src && src.closest('label')) || (fileInput && fileInput.closest('label'));
    if (!label || label.querySelector('.va-image-preview')) return;
    var preview = document.createElement('div');
    preview.className = 'va-image-preview';
    preview.innerHTML = '<img alt="">';
    label.appendChild(preview);
    var img = preview.querySelector('img');
    var objectUrl = '';
    function update() {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = '';
      }
      if (fileInput && fileInput.files && fileInput.files[0]) {
        objectUrl = URL.createObjectURL(fileInput.files[0]);
        img.src = objectUrl;
        preview.hidden = false;
        return;
      }
      img.src = src ? src.value || '' : '';
      preview.hidden = !(src && src.value);
    }
    if (src) src.addEventListener('input', update);
    if (fileInput) fileInput.addEventListener('change', update);
    update();
  }

  function visualPageKey() {
    var loc = els.frame.contentWindow.location;
    var path = loc.pathname || '/';
    path = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
    return path || '/';
  }

  function visualPatchPageKey(node) {
    return node && node.closest && node.closest('footer.site-footer,.site-footer') ? GLOBAL_FOOTER_PAGE : visualPageKey();
  }

  function onDelete() {
    if (state.editingType === VISUAL_TYPE) {
      if (!state.visualTarget) return;
      if (!confirm('Bu blokni o\'chirishni tasdiqlaysizmi?')) return;
      lock(els.deleteBtn, true, 'O\'chirilmoqda...');
      if (state.visualAction !== 'delete' && !/^delete-/.test(state.visualAction || '')) state.visualAction = 'delete';
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
    if (!cfg) {
      setError(els.editorError, 'Bu bo\'lim visual admin orqali tahrirlanmaydi.');
      return;
    }
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

  function isEditableType(type) {
    return !!type && !!TYPES[type];
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
