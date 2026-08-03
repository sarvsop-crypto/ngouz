(function () {
  'use strict';

  var API = 'https://ngo-api-proxy.sarvsop.workers.dev/v1/public/staff-positions';
  var cache = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function language() {
    var value = window.ngoI18n && window.ngoI18n.get ? window.ngoI18n.get() : '';
    if (!value) {
      try { value = localStorage.getItem('ngo_public_lang_v1') || 'uz'; } catch (e) { value = 'uz'; }
    }
    return value === 'ru' || value === 'en' ? value : 'uz';
  }

  function translated(map) {
    var lang = language();
    return map && (map[lang] || map.uz || map.ru || map.en) || '';
  }

  function labels() {
    var lang = language();
    return {
      vacancy: lang === 'ru' ? 'Вакансия' : lang === 'en' ? 'Vacancy' : "Bo'sh ish o'rni",
      apply: lang === 'ru' ? 'Подать заявку' : lang === 'en' ? 'Apply' : 'Ariza topshirish',
      fullTime: lang === 'ru' ? 'Полная занятость' : lang === 'en' ? 'Full-time' : "To'liq stavka",
      loadingError: lang === 'ru' ? 'Не удалось загрузить список. Попробуйте обновить страницу.' : lang === 'en' ? 'The directory could not be loaded. Please refresh the page.' : "Ro'yxatni yuklab bo'lmadi. Sahifani yangilang.",
      total: lang === 'ru' ? 'Всего' : lang === 'en' ? 'Total' : 'Jami',
      occupied: lang === 'ru' ? 'Сотрудники' : lang === 'en' ? 'Employees' : 'Xodimlar',
      branches: lang === 'ru' ? 'Региональные отделения' : lang === 'en' ? 'Regional branches' : "Hududiy bo'linmalar",
      heads: lang === 'ru' ? 'Руководители' : lang === 'en' ? 'Heads' : "Boshliqlar",
      specialists: lang === 'ru' ? 'Специалисты' : lang === 'en' ? 'Specialists' : 'Mutaxassislar',
      vacancies: lang === 'ru' ? 'Вакансии' : lang === 'en' ? 'Vacancies' : "Bo'sh ish o'rinlari"
    };
  }

  function load() {
    if (!cache) {
      cache = fetch(API, { credentials: 'omit', headers: { Accept: 'application/json' } }).then(function (response) {
        if (!response.ok) throw new Error('staff_directory_http_' + response.status);
        return response.json();
      }).then(function (payload) {
        if (!payload || !Array.isArray(payload.items)) throw new Error('staff_directory_invalid_payload');
        return payload;
      }).catch(function (error) {
        cache = null;
        throw error;
      });
    }
    return cache;
  }

  function searchable(item) {
    var person = item.current_assignment && item.current_assignment.person;
    return [person && person.full_name, person && person.email, item.title && item.title.uz,
      item.title && item.title.ru, item.title && item.title.en, item.region && item.region.uz,
      item.region && item.region.ru, item.region && item.region.en].join(' ').toLowerCase();
  }

  function teamCard(item) {
    var person = item.current_assignment && item.current_assignment.person;
    var label = labels();
    var title = translated(item.title);
    var region = translated(item.region);
    var photo = person && person.photo_url;
    var photoHtml = photo ? '<img src="' + esc(photo) + '" alt="' + esc(person.full_name) + '" loading="lazy" decoding="async" width="130" height="130">' : '';
    return '<article id="position-' + esc(item.id) + '" class="team-card' + (item.is_vacant ? ' vacancy' : '') + '" data-staff-position-id="' + esc(item.id) + '" data-va-type="staff_position" data-va-id="' + esc(item.id) + '" data-staff-category="' + esc(item.category) + '">' +
      '<div class="team-photo">' + photoHtml + '</div>' +
      '<h3>' + esc(person ? person.full_name : label.vacancy) + '</h3>' +
      '<p class="team-role">' + esc(title) + '</p>' +
      (region ? '<p class="team-region">' + esc(region) + '</p>' : '') +
      '<div class="team-meta">' +
      (person && person.email ? '<span>Email: <a href="mailto:' + esc(person.email) + '">' + esc(person.email) + '</a></span>' : '') +
      (item.is_vacant ? '<span class="staff-vacancy-label">' + esc(label.vacancy) + '</span>' : '') +
      '</div></article>';
  }

  function leaderCard(item) {
    var person = item.current_assignment && item.current_assignment.person;
    if (!person) return teamCard(item);
    var photo = person.photo_url ? '<img src="' + esc(person.photo_url) + '" alt="' + esc(person.full_name) + '" loading="lazy" decoding="async" width="768" height="768">' : '';
    return '<article id="position-' + esc(item.id) + '" class="leader-card" data-staff-position-id="' + esc(item.id) + '" data-va-type="staff_position" data-va-id="' + esc(item.id) + '">' +
      '<div class="leader-card-body"><div class="leader-photo">' + photo + '</div><div class="leader-center">' +
      '<h2 class="leader-name">' + esc(person.full_name) + '</h2><p class="leader-role">' + esc(translated(item.title)) + '</p></div>' +
      '<div class="leader-contacts-col">' + (person.email ? '<a class="leader-contact-item" href="mailto:' + esc(person.email) + '">' + esc(person.email) + '</a>' : '') + '</div></div></article>';
  }

  function vacancyCard(item) {
    var label = labels();
    var region = translated(item.region);
    var description = translated(item.vacancy_description);
    return '<article id="position-' + esc(item.id) + '" class="card vacancy-card vacancy" data-staff-position-id="' + esc(item.id) + '" data-va-type="staff_position" data-va-id="' + esc(item.id) + '">' +
      '<h3>' + esc(translated(item.title)) + '</h3><p class="vacancy-card__meta">' + esc(label.fullTime + (region ? ' · ' + region : '')) + '</p>' +
      (description ? '<p>' + esc(description) + '</p>' : '') +
      '<div class="card-action"><a class="btn" href="stajirovka-volontyorlik?vacancy_id=' + encodeURIComponent(item.id) + '">' + esc(label.apply) + '</a></div></article>';
  }

  function pageItems(payload, mode) {
    if (mode === 'central') return payload.items.filter(function (item) { return item.section === 'central_team'; });
    if (mode === 'regional') return payload.items.filter(function (item) { return item.section === 'regional_branch'; });
    if (mode === 'leadership') return payload.items.filter(function (item) { return item.section === 'leadership'; });
    if (mode === 'vacancies') return payload.items.filter(function (item) { return item.is_vacant; });
    return payload.items;
  }

  function updateChips(rootItems) {
    var l = labels();
    var branches = {};
    rootItems.forEach(function (item) { if (item.region_code) branches[item.region_code] = true; });
    var values = {
      total: rootItems.length,
      occupied: rootItems.filter(function (item) { return !item.is_vacant; }).length,
      operational_occupied: rootItems.filter(function (item) { return item.section !== 'leadership' && !item.is_vacant; }).length,
      central_occupied: rootItems.filter(function (item) { return item.section === 'central_team' && !item.is_vacant; }).length,
      regional_occupied: rootItems.filter(function (item) { return item.section === 'regional_branch' && !item.is_vacant; }).length,
      branches: Object.keys(branches).length,
      heads: rootItems.filter(function (item) { return item.category === 'head' && !item.is_vacant; }).length,
      specialists: rootItems.filter(function (item) { return item.category === 'specialist' && !item.is_vacant; }).length,
      vacancies: rootItems.filter(function (item) { return item.is_vacant; }).length
    };
    document.querySelectorAll('[data-staff-stat]').forEach(function (node) {
      var key = node.getAttribute('data-staff-stat');
      node.textContent = (l[key] || key) + ': ' + (values[key] == null ? 0 : values[key]);
    });
    document.querySelectorAll('[data-staff-stat-number]').forEach(function (node) {
      var key = node.getAttribute('data-staff-stat-number');
      node.textContent = values[key] == null ? 0 : values[key];
    });
  }

  function bindDirectory(root, payload) {
    var mode = root.getAttribute('data-staff-directory');
    var all = pageItems(payload, mode);
    var search = document.getElementById('teamSearch');
    var empty = document.getElementById('teamEmpty');
    var filters = Array.prototype.slice.call(document.querySelectorAll('.team-filter'));
    var active = 'all';
    function render() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var rows = all.filter(function (item) {
        var byFilter = active === 'all' || (active === 'vacancy' && item.is_vacant) || item.category === active;
        return byFilter && (!query || searchable(item).indexOf(query) !== -1);
      });
      root.innerHTML = rows.map(mode === 'leadership' ? leaderCard : mode === 'vacancies' ? vacancyCard : teamCard).join('');
      root.setAttribute('aria-busy', 'false');
      if (empty) empty.style.display = rows.length ? 'none' : 'block';
      updateChips(all);
      document.dispatchEvent(new CustomEvent('ngo:staff-rendered', { detail: { mode: mode, count: rows.length } }));
    }
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter') || 'all';
        filters.forEach(function (candidate) {
          var selected = candidate === button;
          candidate.classList.toggle('active', selected);
          candidate.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        render();
      });
    });
    if (search) search.addEventListener('input', render);
    render();
    if (window.ngoI18n && typeof window.ngoI18n.onChange === 'function') window.ngoI18n.onChange(render);
  }

  function initialize() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-staff-directory]'));
    var hasStats = document.querySelector('[data-staff-stat-number]');
    if (!roots.length && !hasStats) return;
    load().then(function (payload) {
      roots.forEach(function (root) { bindDirectory(root, payload); });
      if (hasStats) updateChips(payload.items);
    }).catch(function (error) {
      roots.forEach(function (root) {
        root.innerHTML = '<p class="staff-directory-error" role="alert">' + esc(labels().loadingError) + '</p>';
        root.setAttribute('aria-busy', 'false');
      });
      console.error('[ngo:staff-directory]', error);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
}());
