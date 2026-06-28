(function () {
  'use strict';

  var API_BASE = 'https://ngo-api-proxy.sarvsop.workers.dev/v1';
  var AUTH_KEY = 'ngouz_member_auth_v2';
  var rootId = 'ngo-membership-workflow';
  var state = { loading: false, data: null, error: null };
  var lastHtml = '';

  var statusLabels = {
    pending: 'Yuborildi',
    submitted: 'Yuborildi',
    payment_pending: "To'lov kutilmoqda",
    paid: "To'landi",
    regional_review: "Hududiy bo'linmada",
    superadmin_review: "Superadmin ko'rib chiqmoqda",
    leader_review: "Rahbar tasdig'ida",
    accepted: "A'zolikka qabul qilindi",
    approved: 'Qabul qilindi',
    returned: 'Qaytarildi',
    rejected: 'Rad etildi'
  };

  var workflow = [
    ['submitted', 'Yuborildi'],
    ['payment_pending', "To'lov"],
    ['paid', "To'landi"],
    ['regional_review', 'Hududiy'],
    ['superadmin_review', 'Superadmin'],
    ['leader_review', 'Rahbar'],
    ['accepted', 'Qabul'],
    ['returned', 'Rad/Qaytarildi']
  ];

  function auth() {
    try {
      var parsed = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
      return parsed && parsed.token ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function api(path, options) {
    var session = auth();
    if (!session) return Promise.reject(new Error('Auth token missing'));
    options = options || {};
    var headers = { Accept: 'application/json', Authorization: 'Bearer ' + session.token };
    if (options.body) headers['Content-Type'] = 'application/json';
    return fetch(API_BASE + path, {
      method: options.method || (options.body ? 'POST' : 'GET'),
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (response) {
      return response.text().then(function (text) {
        var payload = text ? JSON.parse(text) : null;
        if (!response.ok) {
          throw new Error((payload && (payload.message || payload.error)) || response.statusText);
        }
        return payload;
      });
    });
  }

  function latestApplication(items) {
    return (items || []).slice().sort(function (a, b) {
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    })[0] || null;
  }

  function currentIndex(status) {
    if (status === 'pending') status = 'submitted';
    if (status === 'approved') status = 'accepted';
    if (status === 'rejected') status = 'returned';
    var index = workflow.findIndex(function (item) { return item[0] === status; });
    return index < 0 ? 0 : index;
  }

  function responsible(status) {
    return {
      pending: 'Hududiy bo\'linma',
      submitted: 'Hududiy bo\'linma',
      payment_pending: 'NNT',
      paid: 'Hududiy bo\'linma',
      regional_review: 'Hududiy bo\'linma',
      superadmin_review: 'Superadmin',
      leader_review: 'Assotsiatsiya rahbari',
      accepted: 'Yakunlangan',
      approved: 'Yakunlangan',
      returned: 'NNT',
      rejected: 'Yakunlangan'
    }[status] || 'Mas\'ul foydalanuvchi';
  }

  function nextStep(status) {
    return {
      pending: "Hududiy bo'linma arizani ko'rib chiqadi.",
      submitted: "Hududiy bo'linma arizani ko'rib chiqadi.",
      payment_pending: "A'zolik badalini Payme orqali to'lang.",
      paid: "To'lov tasdiqlandi, hujjatlar hududiy bo'linmada.",
      regional_review: "Hududiy bo'linma hujjatlarni tekshiradi.",
      superadmin_review: "Superadmin hujjatlar to'plamini tekshiradi.",
      leader_review: 'Rahbar ERI orqali shartnoma va sertifikatni tasdiqlaydi.',
      accepted: 'Shartnoma va sertifikatni yuklab olishingiz mumkin.',
      approved: 'Shartnoma va sertifikatni yuklab olishingiz mumkin.',
      returned: "Kamchiliklarni bartaraf etib qayta yuboring.",
      rejected: 'Rad etish sababi tarixda saqlangan.'
    }[status] || "Ariza bo'yicha keyingi amal kutilmoqda.";
  }

  function fmtDate(value) {
    if (!value) return '-';
    var date = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function fmtSize(bytes) {
    var n = Number(bytes || 0);
    if (!n) return '-';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function stageMarkup(app) {
    var index = currentIndex(app && app.status);
    return workflow.map(function (item, i) {
      var cls = i < index ? ' is-done' : i === index ? ' is-active' : '';
      if ((app.status === 'returned' || app.status === 'rejected') && item[0] === 'returned') cls = ' is-alert';
      return '<div class="ngo-stage' + cls + '"><span></span><b>' + escapeHtml(item[1]) + '</b></div>';
    }).join('');
  }

  function actionMarkup(app) {
    if (!app) return '<button type="button" class="ngo-btn ngo-btn-primary" data-ngo-action="apply">Ariza topshirish</button>';
    if (app.status === 'payment_pending') return '<button type="button" class="ngo-btn ngo-btn-primary" data-ngo-action="pay">A\'zolik badalini to\'lash</button>';
    if (app.status === 'returned') return '<button type="button" class="ngo-btn ngo-btn-primary" data-ngo-action="returned">Kamchiliklarni ko\'rish</button><button type="button" class="ngo-btn" data-ngo-action="resubmit">Qayta yuborish</button>';
    if (app.status === 'accepted' || app.status === 'approved') return '<button type="button" class="ngo-btn ngo-btn-primary" data-ngo-action="contract">Shartnomani yuklab olish</button><button type="button" class="ngo-btn" data-ngo-action="certificate">Sertifikatni yuklab olish</button>';
    return '<button type="button" class="ngo-btn" data-ngo-action="refresh">Yangilash</button>';
  }

  function docsMarkup(docs, app) {
    var rows = (docs || []).slice(0, 5).map(function (doc) {
      var signed = /shartnoma|sertifikat|guvohnoma/i.test(doc.name || '') && app && (app.status === 'accepted' || app.status === 'approved');
      return '<tr><td><b>' + escapeHtml(doc.name || 'Hujjat') + '</b><small>' + escapeHtml(doc.category || 'boshqa') + '</small></td><td><span class="ngo-doc-state' + (signed ? ' is-locked' : '') + '">' + (signed ? "Imzolangan, tahrirlab bo'lmaydi" : 'Yuklangan') + '</span></td><td>' + fmtDate(doc.created_at) + '</td><td>' + fmtSize(doc.size_bytes) + '</td><td><button type="button" data-doc-id="' + Number(doc.id) + '" data-doc-name="' + escapeHtml(doc.name || 'document') + '">Yuklab olish</button></td></tr>';
    }).join('');
    if (!rows) rows = '<tr><td colspan="5" class="ngo-empty">Hujjatlar hali yuklanmagan.</td></tr>';
    return '<div class="ngo-docs"><div class="ngo-section-title">Hujjatlar</div><table><thead><tr><th>Nomi</th><th>Status</th><th>Sana</th><th>Hajm</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function render() {
    if (!location.pathname.startsWith('/cabinet/home') && location.pathname !== '/cabinet/' && location.pathname !== '/cabinet') {
      var stale = document.getElementById(rootId);
      if (stale) stale.remove();
      lastHtml = '';
      return;
    }
    var screen = document.querySelector('#root .fade-up');
    if (!screen) return;

    var existing = document.getElementById(rootId);
    if (!existing) {
      existing = document.createElement('section');
      existing.id = rootId;
      var first = screen.children[0];
      if (first && first.nextSibling) screen.insertBefore(existing, first.nextSibling);
      else screen.insertBefore(existing, screen.firstChild);
    }

    if (state.loading) {
      var loadingHtml = '<div class="ngo-card"><div class="ngo-muted">A\'zolik holati yuklanmoqda...</div></div>';
      if (lastHtml !== loadingHtml) {
        existing.innerHTML = loadingHtml;
        lastHtml = loadingHtml;
      }
      return;
    }
    if (state.error) {
      var errorHtml = '<div class="ngo-card"><div class="ngo-error">' + escapeHtml(state.error) + '</div></div>';
      if (lastHtml !== errorHtml) {
        existing.innerHTML = errorHtml;
        lastHtml = errorHtml;
      }
      return;
    }

    var data = state.data || {};
    var app = latestApplication(data.membership && data.membership.items);
    var status = app ? app.status : 'submitted';
    var html = [
      '<style>',
      '#ngo-membership-workflow{padding:16px 20px 0;flex-shrink:0}',
      '#ngo-membership-workflow .ngo-card{background:#fff;border:1px solid rgba(14,23,38,.10);border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(14,23,38,.04);font-family:"IBM Plex Sans",system-ui,sans-serif;color:#0e1726}',
      '#ngo-membership-workflow .ngo-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}',
      '#ngo-membership-workflow h2{font-size:18px;line-height:1.2;margin:0;font-weight:700;letter-spacing:0}',
      '#ngo-membership-workflow .ngo-badge{display:inline-flex;border-radius:999px;background:#e6ecfc;color:#1e4fd9;padding:5px 10px;font-size:12px;font-weight:700;white-space:nowrap}',
      '#ngo-membership-workflow .ngo-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}',
      '#ngo-membership-workflow .ngo-meta div{background:#f5f6f8;border-radius:10px;padding:10px}',
      '#ngo-membership-workflow .ngo-meta span{display:block;font-size:11px;color:#616a77;font-weight:700;text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px}',
      '#ngo-membership-workflow .ngo-meta b{font-size:13px;line-height:1.35}',
      '#ngo-membership-workflow .ngo-flow{display:grid;grid-template-columns:repeat(8,minmax(86px,1fr));gap:6px;overflow:auto;padding-bottom:2px}',
      '#ngo-membership-workflow .ngo-stage{border:1px solid rgba(14,23,38,.08);background:#f5f6f8;border-radius:10px;padding:9px;min-height:58px}',
      '#ngo-membership-workflow .ngo-stage span{display:block;width:8px;height:8px;border-radius:50%;background:#b6bfca;margin-bottom:8px}',
      '#ngo-membership-workflow .ngo-stage b{font-size:11.5px;line-height:1.2;display:block}',
      '#ngo-membership-workflow .ngo-stage.is-done{background:#dcede4;color:#0a6b4e}',
      '#ngo-membership-workflow .ngo-stage.is-done span{background:#0a6b4e}',
      '#ngo-membership-workflow .ngo-stage.is-active{background:#e6ecfc;border-color:#9fb4f5;color:#1e4fd9}',
      '#ngo-membership-workflow .ngo-stage.is-active span{background:#1e4fd9}',
      '#ngo-membership-workflow .ngo-stage.is-alert{background:#fff0e6;border-color:#ffd1ad;color:#a8530c}',
      '#ngo-membership-workflow .ngo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}',
      '#ngo-membership-workflow .ngo-btn{height:40px;border-radius:10px;border:1px solid rgba(14,23,38,.14);background:#fff;color:#0e1726;padding:0 14px;font:600 13px inherit;cursor:pointer}',
      '#ngo-membership-workflow .ngo-btn-primary{background:#0e1726;color:#fff;border-color:#0e1726}',
      '#ngo-membership-workflow .ngo-section-title{font-size:13px;font-weight:800;margin:16px 0 8px}',
      '#ngo-membership-workflow table{width:100%;border-collapse:collapse;font-size:12.5px}',
      '#ngo-membership-workflow th{text-align:left;color:#616a77;font-size:11px;text-transform:uppercase;letter-spacing:.3px;border-bottom:1px solid rgba(14,23,38,.08);padding:8px}',
      '#ngo-membership-workflow td{border-bottom:1px solid rgba(14,23,38,.08);padding:9px 8px;vertical-align:middle}',
      '#ngo-membership-workflow td small{display:block;color:#616a77;margin-top:2px}',
      '#ngo-membership-workflow td button{border:0;background:#e6ecfc;color:#1e4fd9;border-radius:8px;padding:7px 10px;font-weight:700;cursor:pointer}',
      '#ngo-membership-workflow .ngo-doc-state{display:inline-flex;border-radius:999px;background:#f5f6f8;padding:4px 8px;font-weight:700;color:#3a4658}',
      '#ngo-membership-workflow .ngo-doc-state.is-locked{background:#dcede4;color:#0a6b4e}',
      '#ngo-membership-workflow .ngo-muted,#ngo-membership-workflow .ngo-empty{color:#616a77}',
      '#ngo-membership-workflow .ngo-error{color:#a1281c}',
      '@media(max-width:720px){#ngo-membership-workflow{padding:12px 14px 0}#ngo-membership-workflow .ngo-head{display:block}#ngo-membership-workflow .ngo-badge{margin-top:8px}#ngo-membership-workflow .ngo-meta{grid-template-columns:1fr 1fr}#ngo-membership-workflow .ngo-flow{grid-template-columns:repeat(8,112px)}#ngo-membership-workflow .ngo-docs{overflow:auto}}',
      '</style>',
      '<div class="ngo-card">',
      '<div class="ngo-head"><div><h2>A\'zolik jarayoni</h2><div class="ngo-muted">Ariza holati, keyingi qadam va hujjatlar bir joyda.</div></div><span class="ngo-badge">' + escapeHtml(statusLabels[status] || status) + '</span></div>',
      '<div class="ngo-meta">',
      '<div><span>Ariza holati</span><b>' + escapeHtml(statusLabels[status] || status) + '</b></div>',
      '<div><span>Keyingi qadam</span><b>' + escapeHtml(nextStep(status)) + '</b></div>',
      '<div><span>Kim ko\'rib chiqmoqda</span><b>' + escapeHtml(responsible(status)) + '</b></div>',
      '<div><span>Oxirgi yangilanish</span><b>' + fmtDate(app && (app.updated_at || app.created_at)) + '</b></div>',
      '</div>',
      '<div class="ngo-flow">' + stageMarkup(app || { status: status }) + '</div>',
      '<div class="ngo-actions">' + actionMarkup(app) + '</div>',
      app && (app.return_reason || app.rejection_reason) ? '<div class="ngo-error" style="margin-top:10px">' + escapeHtml(app.return_reason || app.rejection_reason) + '</div>' : '',
      docsMarkup(data.documents && data.documents.items, app),
      '</div>'
    ].join('');
    if (lastHtml !== html) {
      existing.innerHTML = html;
      lastHtml = html;
    }
  }

  function load() {
    if (state.loading || !auth()) return;
    state.loading = true;
    state.error = null;
    render();
    Promise.all([
      api('/cabinet/membership').catch(function () { return { items: [] }; }),
      api('/cabinet/documents').catch(function () { return { items: [] }; })
    ]).then(function (responses) {
      state.data = { membership: responses[0], documents: responses[1] };
    }).catch(function (error) {
      state.error = error.message || 'Membership data unavailable';
    }).finally(function () {
      state.loading = false;
      render();
    });
  }

  function startPayment(button) {
    button.disabled = true;
    button.textContent = "To'lov oynasi ochilmoqda...";
    api('/cabinet/payments', { body: { purpose: 'membership' } }).then(function (payload) {
      if (payload && payload.checkout_url) location.href = payload.checkout_url;
      else throw new Error("To'lov havolasi qaytmadi");
    }).catch(function (error) {
      button.disabled = false;
      button.textContent = "A'zolik badalini to'lash";
      alert(error.message || "To'lovni boshlashda xato");
    });
  }

  function downloadDoc(id, name) {
    var session = auth();
    if (!session) return;
    fetch(API_BASE + '/cabinet/documents/' + id + '/file', {
      headers: { Authorization: 'Bearer ' + session.token }
    }).then(function (response) {
      if (!response.ok) throw new Error('Download failed');
      return response.blob();
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = name || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }).catch(function () {
      alert('Hujjatni yuklab bo\'lmadi');
    });
  }

  document.addEventListener('click', function (event) {
    var action = event.target.closest('[data-ngo-action]');
    if (action) {
      var type = action.getAttribute('data-ngo-action');
      if (type === 'pay') startPayment(action);
      else if (type === 'refresh') load();
      else if (type === 'returned') alert("Qaytarish sababi a'zolik kartasida ko'rsatiladi.");
      else if (type === 'resubmit' || type === 'apply') location.href = '/cabinet/profile/organization';
      else alert('Bu hujjat tayyor bo\'lganda yuklab olish ulanadi.');
      return;
    }
    var doc = event.target.closest('[data-doc-id]');
    if (doc) downloadDoc(doc.getAttribute('data-doc-id'), doc.getAttribute('data-doc-name'));
  });

  function boot() {
    render();
    load();
  }

  var pushState = history.pushState;
  history.pushState = function () {
    var result = pushState.apply(this, arguments);
    setTimeout(boot, 80);
    return result;
  };
  window.addEventListener('popstate', function () { setTimeout(boot, 80); });
  new MutationObserver(function () { render(); }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
