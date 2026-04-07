/* admin-seed.js - data-driven rendering for repetitive admin rows/lists */

(function () {
  function esc(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function padValue(v) {
    return String(Math.round(v * 10) / 10).replace(/\.0$/, '');
  }

  function buildLineChartSvg(config) {
    var width = config.width || 520;
    var height = config.height || 160;
    var margin = config.margin || { top: 18, right: 8, bottom: 24, left: 32 };
    var labels = config.labels || [];
    var lines = config.lines || [];
    if (!labels.length || !lines.length) return '';

    var yMax = config.yMax;
    if (!yMax) {
      var maxSeen = 0;
      for (var l = 0; l < lines.length; l += 1) {
        for (var p = 0; p < lines[l].data.length; p += 1) {
          maxSeen = Math.max(maxSeen, lines[l].data[p]);
        }
      }
      yMax = Math.ceil(maxSeen / 10) * 10;
    }
    if (yMax < 10) yMax = 10;

    var plotW = width - margin.left - margin.right;
    var plotH = height - margin.top - margin.bottom;
    var xStep = labels.length > 1 ? plotW / (labels.length - 1) : plotW;
    var ticks = config.ticks || [yMax, Math.round(yMax * 0.66), Math.round(yMax * 0.33), 0];

    function xPos(index) {
      return margin.left + xStep * index;
    }

    function yPos(value) {
      return margin.top + plotH - (value / yMax) * plotH;
    }

    var grid = ticks
      .map(function (tick) {
        var y = yPos(tick);
        return '<line x1="' + padValue(margin.left) + '" y1="' + padValue(y) + '" x2="' + padValue(width - margin.right) + '" y2="' + padValue(y) + '" stroke="#e5e7eb" stroke-width="1"/>';
      })
      .join('');

    var yLabels = ticks
      .map(function (tick) {
        var y = yPos(tick) + 3;
        return '<text x="' + padValue(margin.left - 4) + '" y="' + padValue(y) + '" text-anchor="end" font-size="10" fill="#818898" font-family="Archivo,sans-serif">' + esc(tick) + '</text>';
      })
      .join('');

    function buildSmoothPath(coords) {
      if (!coords.length) return '';
      if (coords.length === 1) {
        return 'M ' + padValue(coords[0].x) + ' ' + padValue(coords[0].y);
      }

      var d = 'M ' + padValue(coords[0].x) + ' ' + padValue(coords[0].y);
      for (var i = 1; i < coords.length - 1; i += 1) {
        var xc = (coords[i].x + coords[i + 1].x) / 2;
        var yc = (coords[i].y + coords[i + 1].y) / 2;
        d +=
          ' Q ' + padValue(coords[i].x) + ' ' + padValue(coords[i].y) +
          ' ' + padValue(xc) + ' ' + padValue(yc);
      }

      var last = coords.length - 1;
      d +=
        ' Q ' + padValue(coords[last - 1].x) + ' ' + padValue(coords[last - 1].y) +
        ' ' + padValue(coords[last].x) + ' ' + padValue(coords[last].y);
      return d;
    }

    var paths = lines
      .map(function (line) {
        var coords = line.data
          .map(function (value, idx) {
            return { x: xPos(idx), y: yPos(value) };
          });

        var points = coords
          .map(function (pt) {
            return padValue(pt.x) + ',' + padValue(pt.y);
          })
          .join(' ');

        var smoothPath = buildSmoothPath(coords);

        var area = '';
        if (line.fill) {
          area =
            '<polygon points="' +
            padValue(margin.left) + ',' + padValue(margin.top + plotH) + ' ' +
            points + ' ' +
            padValue(width - margin.right) + ',' + padValue(margin.top + plotH) +
            '" fill="' + esc(line.fill) + '" opacity="' + esc(line.fillOpacity || 0.14) + '"/>';
        }

        var dash = line.dashed ? ' stroke-dasharray="4 3"' : '';
        var curve =
          '<path d="' + smoothPath + '" fill="none" stroke="' + esc(line.color) + '" stroke-width="' + esc(line.strokeWidth || 2) + '"' + dash + ' stroke-linejoin="round" stroke-linecap="round"/>';
        return area + curve;
      })
      .join('');

    var xLabels = labels
      .map(function (label, idx) {
        return '<text x="' + padValue(xPos(idx)) + '" y="' + padValue(height - 5) + '" text-anchor="middle" font-size="10" fill="#818898" font-family="Archivo,sans-serif">' + esc(label) + '</text>';
      })
      .join('');

    return (
      '<svg width="100%" height="' + esc(height) + '" viewBox="0 0 ' + esc(width) + ' ' + esc(height) + '" preserveAspectRatio="none" class="u-chart-svg-main">' +
      grid + yLabels + paths + xLabels +
      '</svg>'
    );
  }

  function donutSvg(segments, options) {
    var size = (options && options.size) || 160;
    var stroke = (options && options.stroke) || 22;
    var radius = (size - stroke) / 2;
    var c = 2 * Math.PI * radius;
    var gap = (options && options.gap) || 4;
    var total = segments.reduce(function (sum, part) { return sum + part.value; }, 0);
    var available = c - gap * segments.length;
    var angle = -90;

    var arcs = segments
      .map(function (part) {
        var len = total > 0 ? (part.value / total) * available : 0;
        var arc =
          '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + radius + '" fill="none" stroke="' + esc(part.color) + '" stroke-width="' + stroke + '" stroke-dasharray="' + padValue(len) + ' ' + padValue(c - len) + '" stroke-linecap="butt" transform="rotate(' + padValue(angle) + ' ' + size / 2 + ' ' + size / 2 + ')"/>';
        angle += (total > 0 ? (part.value / total) * 360 : 0) + (gap / c) * 360;
        return arc;
      })
      .join('');

    return (
      '<svg width="' + esc(size) + '" height="' + esc(size) + '" viewBox="0 0 ' + esc(size) + ' ' + esc(size) + '" class="u-chart-svg-donut">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + radius + '" fill="none" stroke="#e5e7eb" stroke-width="' + stroke + '"/>' +
      arcs +
      '</svg>'
    );
  }

  function renderDashboardCharts() {
    var lineMount = document.getElementById('dashboardLineChart');
    var donutMount = document.getElementById('dashboardDonutChart');
    if (!lineMount || !donutMount) return;

    var labels = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    lineMount.innerHTML = buildLineChartSvg({
      width: 520,
      height: 160,
      yMax: 30,
      labels: labels,
      lines: [
        { color: '#12987b', fill: '#12987b', fillOpacity: 0.08, data: [8, 12, 10, 15, 18, 14, 16, 20, 22, 25, 19, 24] },
        { color: '#f6c03c', fill: '#f6c03c', fillOpacity: 0.15, data: [5, 8, 9, 11, 13, 12, 14, 16, 18, 20, 17, 22] },
      ],
      ticks: [30, 20, 10, 0],
    });

    var donutData = [
      { label: 'Tasdiqlangan', value: 94, color: 'var(--primary-500)', dot: 'chart-card__legend-dot u-bg-primary-500' },
      { label: 'Ko`rib chiqilmoqda', value: 61, color: 'var(--secondary-500)', dot: 'chart-card__legend-dot u-bg-secondary-500' },
      { label: 'Qaytarilgan', value: 18, color: '#dc2626', dot: 'chart-card__legend-dot u-dot-danger' },
    ];

    donutMount.innerHTML =
      donutSvg(donutData, { size: 160, stroke: 22, gap: 4 }) +
      '<div class="u-text-center u-mt-8">' +
        '<div class="u-stat-caption">Jami arizalar</div>' +
        '<div class="u-stat-value">247</div>' +
      '</div>' +
      '<div class="chart-card__legend u-mt-0 u-legend-top-12">' +
        donutData.map(function (part) {
          return '<span class="chart-card__legend-item"><span class="' + esc(part.dot) + '"></span> ' + esc(part.label) + ': ' + esc(part.value) + '</span>';
        }).join('') +
      '</div>';
  }

  function renderReportsCharts() {
    var lineMount = document.getElementById('reportsLineChart');
    var donutMount = document.getElementById('reportsDonutChart');
    if (!lineMount || !donutMount) return;

    var labels = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    lineMount.innerHTML = buildLineChartSvg({
      width: 600,
      height: 160,
      yMax: 30,
      labels: labels,
      margin: { top: 12, right: 0, bottom: 24, left: 24 },
      lines: [
        { color: 'var(--primary-500)', fill: 'rgba(15,106,87,.12)', fillOpacity: 1, strokeWidth: 2.5, data: [8, 10, 12, 14, 13, 16, 18, 17, 20, 21, 23, 24] },
        { color: 'var(--secondary-500)', dashed: true, strokeWidth: 2, data: [4, 5, 6, 8, 7, 9, 10, 10, 12, 13, 15, 16] },
      ],
      ticks: [30, 20, 10, 0],
    });

    var donutData = [
      { label: 'Tasdiqlangan', value: 94, color: 'var(--primary-500)', dot: 'chart-donut__legend-dot u-bg-primary-500' },
      { label: 'Ko`rib chiqilmoqda', value: 61, color: 'var(--secondary-500)', dot: 'chart-donut__legend-dot u-bg-secondary-500' },
      { label: 'Qaytarilgan', value: 18, color: '#dc2626', dot: 'chart-donut__legend-dot u-dot-danger' },
      { label: 'Yangi', value: 74, color: '#94a3b8', dot: 'chart-donut__legend-dot u-dot-slate' },
    ];

    donutMount.innerHTML =
      '<div class="chart-donut__img-wrap u-donut-wrap-center">' +
        donutSvg(donutData, { size: 160, stroke: 22, gap: 4 }) +
        '<div class="chart-donut__center u-donut-center-abs">' +
          '<span class="chart-donut__center-label u-donut-center-label">Jami</span>' +
          '<span class="chart-donut__center-value u-donut-center-value">247</span>' +
        '</div>' +
      '</div>' +
      '<div class="chart-donut__legend u-legend-top-16">' +
        donutData.map(function (part) {
          return '<span class="chart-donut__legend-item"><span class="' + esc(part.dot) + '"></span> ' + esc(part.label) + ': ' + esc(part.value) + '</span>';
        }).join('') +
      '</div>';
  }

  function renderDashboard() {
    var deadlineList = document.getElementById('dashboardDeadlines');
    var recentRows = document.getElementById('dashboardRecentRows');
    var regionRows = document.getElementById('dashboardRegionRows');
    if (!deadlineList || !recentRows || !regionRows) return;

    var deadlines = [
      { tone: 'critical', title: 'Yangi Nafas NNT - hujjat muddati tugayapti', meta: 'ARZ-2026-0418 - Ustav yangi tahrir kerak', date: '10.04.2026' },
      { tone: 'high', title: 'Mehr-Shafqat NNT - shartnoma imzo kutmoqda', meta: 'ARZ-2026-0411 - 3-bosqich', date: '12.04.2026' },
      { tone: 'medium', title: 'Umid Istiqbol NNT - qo`shimcha hujjat kerak', meta: 'ARZ-2026-0405 - Soliq ma`lumotnomasi', date: '15.04.2026' },
      { tone: 'medium', title: 'Yoshlar Ittifoqi - hujjatlar to`liq emas', meta: 'ARZ-2026-0398 - 2-bosqich', date: '18.04.2026' },
    ];

    deadlineList.innerHTML = deadlines
      .map(function (item) {
        return (
          '<li class="alert-item">' +
            '<span class="alert-dot ' + esc(item.tone) + '"></span>' +
            '<div class="alert-text">' +
              '<div class="alert-title">' + esc(item.title) + '</div>' +
              '<div class="alert-meta">' + esc(item.meta) + '</div>' +
            '</div>' +
            '<span class="alert-time">' + esc(item.date) + '</span>' +
          '</li>'
        );
      })
      .join('');

    var recent = [
      { id: 'ARZ-2026-0418', org: 'Yangi Nafas NNT', region: 'Toshkent', step: '2 / 4', statusClass: 'badge--warning', status: 'Ko`rib chiqilmoqda', date: '02.04.2026' },
      { id: 'ARZ-2026-0415', org: 'Mehr-Shafqat NNT', region: 'Samarqand', step: '3 / 4', statusClass: 'badge--warning', status: 'Imzo kutilmoqda', date: '01.04.2026' },
      { id: 'ARZ-2026-0411', org: 'Umid Istiqbol NNT', region: 'Farg`ona', step: '4 / 4', statusClass: 'badge--success', status: 'Tasdiqlangan', date: '29.03.2026' },
      { id: 'ARZ-2026-0408', org: 'Yoshlar Ittifoqi', region: 'Buxoro', step: '1 / 4', statusClass: 'badge--pending', status: 'Qabul qilindi', date: '28.03.2026' },
      { id: 'ARZ-2026-0403', org: 'Ekologiya Markazi', region: 'Namangan', step: '2 / 4', statusClass: 'badge--warning', status: 'Ko`rib chiqilmoqda', date: '27.03.2026' },
    ];

    recentRows.innerHTML = recent
      .map(function (row) {
        return (
          '<tr>' +
            '<th scope="row"><a href="admin-membership-requests.html" class="row-link">' + esc(row.id) + '</a></th>' +
            '<td>' + esc(row.org) + '</td>' +
            '<td>' + esc(row.region) + '</td>' +
            '<td>' + esc(row.step) + '</td>' +
            '<td><span class="badge ' + esc(row.statusClass) + '"><span class="badge__dot"></span>' + esc(row.status) + '</span></td>' +
            '<td>' + esc(row.date) + '</td>' +
          '</tr>'
        );
      })
      .join('');

    var regions = [
      { name: 'Toshkent shahri', total: 52, active: 48, fresh: 7, share: '21.1%', w: 52, tone: 'primary' },
      { name: 'Toshkent viloyati', total: 31, active: 28, fresh: 4, share: '12.6%', w: 31, tone: 'primary' },
      { name: 'Samarqand', total: 28, active: 25, fresh: 3, share: '11.3%', w: 28, tone: 'primary' },
      { name: 'Farg`ona', total: 24, active: 22, fresh: 2, share: '9.7%', w: 24, tone: 'primary' },
      { name: 'Buxoro', total: 19, active: 17, fresh: 2, share: '7.7%', w: 19, tone: 'primary' },
      { name: 'Qolgan viloyatlar', total: 93, active: 76, fresh: 12, share: '37.7%', w: 93, tone: 'secondary' },
    ];

    regionRows.innerHTML = regions
      .map(function (row) {
        return (
          '<tr>' +
            '<th scope="row">' + esc(row.name) + '</th>' +
            '<td>' + esc(row.total) + '</td>' +
            '<td>' + esc(row.active) + '</td>' +
            '<td>' + esc(row.fresh) + '</td>' +
            '<td>' +
              '<div class="u-bar-row">' +
                '<div class="u-bar-track">' +
                  '<div class="u-bar-fill u-bar-fill-' + esc(row.tone) + ' u-bar-w-' + esc(row.w) + '"></div>' +
                '</div>' +
                '<span class="u-stat-caption">' + esc(row.share) + '</span>' +
              '</div>' +
            '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function membershipStatusMeta(statusKey) {
    if (statusKey === 'approved') return { cls: 'badge--success', text: 'Tasdiqlangan' };
    if (statusKey === 'returned') return { cls: 'badge--danger', text: 'Qaytarilgan' };
    if (statusKey === 'pending') return { cls: 'badge--pending', text: 'Qabul qilindi' };
    return { cls: 'badge--warning', text: 'Ko`rib chiqilmoqda' };
  }

  function renderMembershipRequests() {
    var target = document.getElementById('membershipRequestRows');
    if (!target) return;

    var rows = [
      { id: 'ARZ-2026-0418', initials: 'YN', company: 'Yangi Nafas NNT', region: 'Toshkent', date: '02.04.2026', step: '2 / 4', status: 'review', owner: 'Azizova N.' },
      { id: 'ARZ-2026-0415', initials: 'MS', company: 'Mehr-Shafqat NNT', region: 'Samarqand', date: '01.04.2026', step: '3 / 4', status: 'review', owner: 'Toshmatov A.' },
      { id: 'ARZ-2026-0411', initials: 'UI', company: 'Umid Istiqbol NNT', region: 'Farg`ona', date: '29.03.2026', step: '4 / 4', status: 'approved', owner: 'Xolmatova G.' },
      { id: 'ARZ-2026-0408', initials: 'YI', company: 'Yoshlar Ittifoqi', region: 'Buxoro', date: '28.03.2026', step: '1 / 4', status: 'pending', owner: 'Rahimov B.' },
      { id: 'ARZ-2026-0403', initials: 'EM', company: 'Ekologiya Markazi', region: 'Namangan', date: '27.03.2026', step: '2 / 4', status: 'review', owner: 'Azizova N.' },
      { id: 'ARZ-2026-0397', initials: 'HM', company: 'Hayot va Madaniyat', region: 'Andijon', date: '25.03.2026', step: '4 / 4', status: 'approved', owner: 'Toshmatov A.' },
      { id: 'ARZ-2026-0391', initials: 'SP', company: 'Sport va Rivojlanish', region: 'Qashqadaryo', date: '22.03.2026', step: '2 / 4', status: 'returned', owner: 'Xolmatova G.' },
      { id: 'ARZ-2026-0385', initials: 'BF', company: 'Baxtli Oila Fondi', region: 'Xorazm', date: '20.03.2026', step: '3 / 4', status: 'review', owner: 'Rahimov B.' },
    ];

    function rowMenuHtml() {
      return (
        '<div class="row-menu-wrap">' +
          '<button type="button" aria-label="Menyu" data-action="row-menu"><i class="ph ph-dots-three-vertical"></i></button>' +
          '<div class="row-menu">' +
            '<button type="button" class="row-menu__item" data-modal-open="reviewModal"><i class="ph ph-eye"></i> Ko`rish</button>' +
            '<button type="button" class="row-menu__item u-row-menu-item-approve" data-modal-open="approveModal"><i class="ph ph-check-circle"></i> Tasdiqlash</button>' +
            '<button type="button" class="row-menu__item" data-modal-open="returnModal"><i class="ph ph-arrow-counter-clockwise"></i> Qaytarish</button>' +
            '<div class="row-menu__sep"></div>' +
            '<button type="button" class="row-menu__item row-menu__item--danger"><i class="ph ph-trash"></i> O`chirish</button>' +
          '</div>' +
        '</div>'
      );
    }

    target.innerHTML = rows
      .map(function (row) {
        var statusMeta = membershipStatusMeta(row.status);
        return (
          '<tr>' +
            '<td><input type="checkbox" /></td>' +
            '<th scope="row"><a href="#" class="row-link">' + esc(row.id) + '</a></th>' +
            '<td><div class="table__counterparty"><span class="table__avatar">' + esc(row.initials) + '</span><span class="table__company">' + esc(row.company) + '</span></div></td>' +
            '<td>' + esc(row.region) + '</td>' +
            '<td>' + esc(row.date) + '</td>' +
            '<td>' + esc(row.step) + '</td>' +
            '<td><span class="badge ' + esc(statusMeta.cls) + '"><span class="badge__dot"></span>' + esc(statusMeta.text) + '</span></td>' +
            '<td>' + esc(row.owner) + '</td>' +
            '<td>' + rowMenuHtml() + '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function renderReports() {
    var target = document.getElementById('reportRows');
    if (!target) return;

    var rows = [
      { name: '2026 Q1 A`zolik hisoboti', type: 'Choraklik', period: 'Yan - Mar 2026', created: '01.04.2026', status: 'ready' },
      { name: '2025 Yillik hisobot', type: 'Yillik', period: 'Yan - Dek 2025', created: '15.01.2026', status: 'ready' },
      { name: 'Hududiy taqsimot 2026', type: 'Analitik', period: '2026-yil', created: '05.04.2026', status: 'progress' },
      { name: 'A`zolik faolligi monitoring', type: 'Monitoring', period: 'Mar 2026', created: '31.03.2026', status: 'ready' },
    ];

    function statusMeta(key) {
      return key === 'progress'
        ? { cls: 'badge--pending', text: 'Tayyorlanmoqda' }
        : { cls: 'badge--success', text: 'Tayyor' };
    }

    target.innerHTML = rows
      .map(function (row) {
        var status = statusMeta(row.status);
        return (
          '<tr>' +
            '<td><input type="checkbox" /></td>' +
            '<th scope="row"><a href="#" class="doc-link">' + esc(row.name) + '</a></th>' +
            '<td>' + esc(row.type) + '</td>' +
            '<td>' + esc(row.period) + '</td>' +
            '<td>' + esc(row.created) + '</td>' +
            '<td><span class="badge ' + esc(status.cls) + '"><span class="badge__dot"></span>' + esc(status.text) + '</span></td>' +
            '<td>' +
              '<div class="row-menu-wrap">' +
                '<button type="button" data-action="row-menu" aria-label="Menyu"><i class="ph ph-dots-three-vertical"></i></button>' +
                '<div class="row-menu">' +
                  '<button type="button" class="row-menu__item"><i class="ph ph-eye"></i> Ko`rish</button>' +
                  '<button type="button" class="row-menu__item"><i class="ph ph-download-simple"></i> Yuklab olish</button>' +
                  '<div class="row-menu__sep"></div>' +
                  '<button type="button" class="row-menu__item row-menu__item--danger"><i class="ph ph-trash"></i> O`chirish</button>' +
                '</div>' +
              '</div>' +
            '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function permIcon(kind) {
    if (kind === 'deny') {
      return '<svg viewBox="0 0 14 14" fill="none" class="perm-cross"><path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    }
    return '<svg viewBox="0 0 14 14" fill="none" class="perm-check"><path d="M3 7l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  }

  function renderUsers() {
    var membersTarget = document.getElementById('userMemberCards');
    var rolesTarget = document.getElementById('userRoleCards');
    if (!membersTarget || !rolesTarget) return;

    var members = [
      { initials: 'AN', avatarClass: 'u-bg-primary-600', name: 'Azizova Nodira', email: 'azizova@uznntma.uz', roleClass: 'admin', role: 'Admin', online: true, seen: '' },
      { initials: 'TA', avatarClass: 'u-bg-purple-500', name: 'Toshmatov Akbar', email: 'toshmatov@uznntma.uz', roleClass: 'legal', role: 'Moderator', online: true, seen: '' },
      { initials: 'XG', avatarClass: 'u-bg-green-600', name: 'Xolmatova Gulnora', email: 'xolmatova@uznntma.uz', roleClass: 'legal', role: 'Moderator', online: false, seen: 'So`nggi: 03.04' },
      { initials: 'RB', avatarClass: 'u-bg-orange-600', name: 'Rahimov Bobur', email: 'rahimov@uznntma.uz', roleClass: 'viewer', role: 'Ko`ruvchi', online: false, seen: 'So`nggi: 01.04' },
    ];

    function memberMenuHtml() {
      return (
        '<div class="row-menu-wrap">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="row-menu" aria-label="Menyu"><i class="ph ph-dots-three-vertical"></i></button>' +
          '<div class="row-menu">' +
            '<button type="button" class="row-menu__item" data-modal-open="editUserModal"><i class="ph ph-pencil-simple"></i> Tahrirlash</button>' +
            '<button type="button" class="row-menu__item"><i class="ph ph-lock-key"></i> Parolni tiklash</button>' +
            '<div class="row-menu__sep"></div>' +
            '<button type="button" class="row-menu__item row-menu__item--danger"><i class="ph ph-trash"></i> O`chirish</button>' +
          '</div>' +
        '</div>'
      );
    }

    membersTarget.innerHTML = members
      .map(function (m) {
        var statusText = m.online ? 'Online' : m.seen;
        var dotClass = m.online ? 'active' : 'offline';
        return (
          '<div class="member-card">' +
            '<div class="member-avatar ' + esc(m.avatarClass) + '">' + esc(m.initials) + '</div>' +
            '<div class="member-info">' +
              '<div class="member-name">' + esc(m.name) + '</div>' +
              '<div class="member-email">' + esc(m.email) + '</div>' +
              '<div class="member-meta">' +
                '<span class="role-badge ' + esc(m.roleClass) + '">' + esc(m.role) + '</span>' +
                '<span class="member-status"><span class="online-dot ' + esc(dotClass) + '"></span> ' + esc(statusText) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="member-actions">' + memberMenuHtml() + '</div>' +
          '</div>'
        );
      })
      .join('');

    var roles = [
      {
        title: 'Admin',
        titleClass: 'u-text-primary-600',
        count: '1 foydalanuvchi',
        permissions: [
          { text: 'Arizalarni ko`rish va tahrirlash', allow: true },
          { text: 'Hujjatlarni boshqarish', allow: true },
          { text: 'Foydalanuvchilarni boshqarish', allow: true },
          { text: 'Sozlamalarni o`zgartirish', allow: true },
          { text: 'Ma`lumotlarni o`chirish', allow: true },
        ],
      },
      {
        title: 'Moderator',
        titleClass: 'u-text-purple-500',
        count: '2 foydalanuvchi',
        permissions: [
          { text: 'Arizalarni ko`rish va tahrirlash', allow: true },
          { text: 'Hujjatlarni boshqarish', allow: true },
          { text: 'Izohlar qo`shish', allow: true },
          { text: 'Foydalanuvchilarni boshqarish', allow: false },
          { text: 'Ma`lumotlarni o`chirish', allow: false },
        ],
      },
      {
        title: 'Ko`ruvchi',
        titleClass: 'u-text-grey-500',
        count: '1 foydalanuvchi',
        permissions: [
          { text: 'Arizalarni ko`rish', allow: true },
          { text: 'Hisobotlarni yuklab olish', allow: true },
          { text: 'Arizalarni tahrirlash', allow: false },
          { text: 'Foydalanuvchilarni boshqarish', allow: false },
          { text: 'Sozlamalarni o`zgartirish', allow: false },
        ],
      },
    ];

    rolesTarget.innerHTML = roles
      .map(function (role) {
        var permissions = role.permissions
          .map(function (perm) {
            return '<li>' + permIcon(perm.allow ? 'allow' : 'deny') + ' ' + esc(perm.text) + '</li>';
          })
          .join('');
        return (
          '<div class="role-card">' +
            '<div class="role-card-header">' +
              '<span class="role-card-title ' + esc(role.titleClass) + '">' + esc(role.title) + '</span>' +
              '<span class="role-card-count">' + esc(role.count) + '</span>' +
            '</div>' +
            '<ul class="permissions-list">' + permissions + '</ul>' +
          '</div>'
        );
      })
      .join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderDashboard();
      renderDashboardCharts();
      renderMembershipRequests();
      renderReportsCharts();
      renderReports();
      renderUsers();
    });
  } else {
    renderDashboard();
    renderDashboardCharts();
    renderMembershipRequests();
    renderReportsCharts();
    renderReports();
    renderUsers();
  }
})();
