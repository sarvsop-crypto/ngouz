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
      { label: 'Tasdiqlangan', value: 94, color: 'var(--primary-500)' },
      { label: 'Ko`rib chiqilmoqda', value: 61, color: 'var(--secondary-500)' },
      { label: 'Qaytarilgan', value: 18, color: '#dc2626' },
    ];

    donutMount.innerHTML =
      '<div class="chart-donut__img-wrap">' +
        donutSvg(donutData, { size: 160, stroke: 22, gap: 4 }) +
        '<div class="chart-donut__center">' +
          '<span class="chart-donut__center-label">Jami arizalar</span>' +
          '<span class="chart-donut__center-value">247</span>' +
        '</div>' +
      '</div>' +
      '<div class="chart-donut__legend">' +
        donutData.map(function (part) {
          return '<span class="chart-donut__legend-item"><span class="chart-donut__legend-dot" style="background:' + esc(part.color) + ';"></span> ' + esc(part.label) + ': ' + esc(part.value) + '</span>';
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

  /* ── Analytics page ── */
  function renderAnalyticsCharts() {
    var lineMount = document.getElementById('analyticsLineChart');
    var donutMount = document.getElementById('analyticsDonutChart');
    if (!lineMount || !donutMount) return;

    lineMount.innerHTML = buildLineChartSvg({
      width: 520, height: 160, yMax: 1400,
      labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
      lines: [
        { color: '#12987b', fill: '#12987b', fillOpacity: 0.08, data: [740, 820, 890, 980, 1060, 1180, 1250] },
        { color: '#f6c03c', fill: '#f6c03c', fillOpacity: 0.15, data: [590, 650, 700, 780, 840, 920, 980] },
      ],
      ticks: [1400, 1000, 600, 200],
    });

    var sectors = [
      { label: 'Ijtimoiy', value: 312, color: 'var(--primary-500)' },
      { label: "Ta'lim", value: 248, color: 'var(--secondary-500)' },
      { label: 'Xayriya', value: 186, color: '#f59e0b' },
      { label: 'Ekologiya', value: 124, color: '#10b981' },
      { label: 'Yoshlar', value: 98, color: '#8b5cf6' },
      { label: 'Boshqa', value: 282, color: '#94a3b8' },
    ];

    donutMount.innerHTML =
      '<div class="chart-donut__img-wrap">' +
        donutSvg(sectors, { size: 160, stroke: 22, gap: 4 }) +
        '<div class="chart-donut__center">' +
          '<span class="chart-donut__center-label">Jami NNT</span>' +
          '<span class="chart-donut__center-value">1 250</span>' +
        '</div>' +
      '</div>' +
      '<div class="chart-donut__legend">' +
        sectors.map(function (s) {
          return '<span class="chart-donut__legend-item"><span class="chart-donut__legend-dot" style="background:' + esc(s.color) + '"></span> ' + esc(s.label) + ': ' + esc(s.value) + '</span>';
        }).join('') +
      '</div>';
  }

  function renderAnalyticsTables() {
    var regionMount = document.getElementById('analyticsRegionRows');
    var sectorMount = document.getElementById('analyticsSectorRows');

    if (regionMount) {
      var regions = [
        { name: 'Toshkent shahri',          code: '14', total: 263, active: 241, inactive: 22, fresh: 9,  rate: '91.6%', share: '21.0%', w: 263, tone: 'primary' },
        { name: 'Toshkent viloyati',         code: '11', total: 156, active: 138, inactive: 18, fresh: 5,  rate: '88.5%', share: '12.5%', w: 156, tone: 'primary' },
        { name: 'Samarqand viloyati',        code: '08', total: 143, active: 127, inactive: 16, fresh: 4,  rate: '88.8%', share: '11.4%', w: 143, tone: 'primary' },
        { name: "Farg'ona viloyati",         code: '12', total: 121, active: 108, inactive: 13, fresh: 3,  rate: '89.3%', share: '9.7%',  w: 121, tone: 'primary' },
        { name: 'Buxoro viloyati',           code: '03', total:  98, active:  87, inactive: 11, fresh: 2,  rate: '88.8%', share: '7.8%',  w: 98,  tone: 'primary' },
        { name: 'Namangan viloyati',         code: '07', total:  88, active:  77, inactive: 11, fresh: 2,  rate: '87.5%', share: '7.0%',  w: 88,  tone: 'secondary' },
        { name: 'Andijon viloyati',          code: '02', total:  82, active:  71, inactive: 11, fresh: 1,  rate: '86.6%', share: '6.6%',  w: 82,  tone: 'secondary' },
        { name: 'Qashqadaryo viloyati',      code: '05', total:  67, active:  58, inactive:  9, fresh: 1,  rate: '86.6%', share: '5.4%',  w: 67,  tone: 'secondary' },
        { name: 'Surxondaryo viloyati',      code: '10', total:  51, active:  44, inactive:  7, fresh: 1,  rate: '86.3%', share: '4.1%',  w: 51,  tone: 'secondary' },
        { name: 'Xorazm viloyati',           code: '13', total:  48, active:  41, inactive:  7, fresh: 1,  rate: '85.4%', share: '3.8%',  w: 48,  tone: 'secondary' },
        { name: 'Jizzax viloyati',           code: '04', total:  34, active:  29, inactive:  5, fresh: 0,  rate: '85.3%', share: '2.7%',  w: 34,  tone: 'secondary' },
        { name: 'Sirdaryo viloyati',         code: '09', total:  24, active:  20, inactive:  4, fresh: 0,  rate: '83.3%', share: '1.9%',  w: 24,  tone: 'secondary' },
        { name: 'Navoiy viloyati',           code: '06', total:  22, active:  19, inactive:  3, fresh: 0,  rate: '86.4%', share: '1.8%',  w: 22,  tone: 'secondary' },
        { name: "Qoraqalpog'iston",          code: '01', total:  16, active:  13, inactive:  3, fresh: 0,  rate: '81.3%', share: '1.3%',  w: 16,  tone: 'secondary' },
        { name: 'Respublika miqyosi NNTlar', code: '15', total:  37, active:  37, inactive:  0, fresh: 2,  rate: '100%',  share: '3.0%',  w: 37,  tone: 'secondary' },
      ];

      regionMount.innerHTML = regions.map(function (r) {
        return '<tr>' +
          '<td style="color:#64748b;font-variant-numeric:tabular-nums;">' + esc(r.code) + '</td>' +
          '<th scope="row">' + esc(r.name) + '</th>' +
          '<td>' + esc(r.total) + '</td>' +
          '<td><span style="color:#059669;font-weight:600;">' + esc(r.active) + '</span></td>' +
          '<td><span style="color:#94a3b8;">' + esc(r.inactive) + '</span></td>' +
          '<td>' + esc(r.fresh) + '</td>' +
          '<td>' +
            '<div class="u-bar-row">' +
              '<div class="u-bar-track"><div class="u-bar-fill u-bar-fill-' + esc(r.tone) + ' u-bar-w-' + esc(r.w) + '"></div></div>' +
              '<span class="u-stat-caption">' + esc(r.rate) + '</span>' +
            '</div>' +
          '</td>' +
          '<td>' +
            '<div class="u-bar-row"><span class="u-stat-caption">' + esc(r.share) + '</span></div>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    if (sectorMount) {
      var sectors = [
        { name: 'Ijtimoiy',   count: 312, share: '24.9%', trend: '+3.2%', up: true },
        { name: "Ta'lim",     count: 248, share: '19.8%', trend: '+5.1%', up: true },
        { name: 'Xayriya',    count: 186, share: '14.9%', trend: '+1.8%', up: true },
        { name: 'Ekologiya',  count: 124, share: '9.9%',  trend: '+7.3%', up: true },
        { name: 'Yoshlar',    count:  98, share: '7.8%',  trend: '+2.0%', up: true },
        { name: 'Sog\'liqni saqlash', count: 89, share: '7.1%', trend: '-0.4%', up: false },
        { name: 'Madaniyat',  count:  72, share: '5.8%',  trend: '+0.9%', up: true },
        { name: 'Sport',      count:  55, share: '4.4%',  trend: '+1.1%', up: true },
        { name: 'Boshqa',     count:  66, share: '5.3%',  trend: '+0.5%', up: true },
      ];

      sectorMount.innerHTML = sectors.map(function (s) {
        var trendColor = s.up ? '#059669' : '#dc2626';
        var trendIcon = s.up ? 'ph-arrow-up-right' : 'ph-arrow-down-right';
        return '<tr>' +
          '<th scope="row">' + esc(s.name) + '</th>' +
          '<td><strong>' + esc(s.count) + '</strong></td>' +
          '<td>' + esc(s.share) + '</td>' +
          '<td><span style="color:' + trendColor + ';font-weight:600;display:inline-flex;align-items:center;gap:3px;"><i class="ph ' + trendIcon + '"></i> ' + esc(s.trend) + '</span></td>' +
        '</tr>';
      }).join('');
    }
  }

  /* ── Regions page ── */
  function renderRegionsTable() {
    var mount = document.getElementById('regionsTableRows');
    if (!mount) return;

    var regions = [
      { code: '01', name: "Qoraqalpog'iston Respublikasi", total:  16, active:  13, fresh: 0, share: '1.3%',  w: 16,  tone: 'secondary' },
      { code: '02', name: 'Andijon viloyati',               total:  82, active:  71, fresh: 1, share: '6.6%',  w: 82,  tone: 'primary' },
      { code: '03', name: 'Buxoro viloyati',                total:  98, active:  87, fresh: 2, share: '7.8%',  w: 98,  tone: 'primary' },
      { code: '04', name: 'Jizzax viloyati',                total:  34, active:  29, fresh: 0, share: '2.7%',  w: 34,  tone: 'secondary' },
      { code: '05', name: 'Qashqadaryo viloyati',           total:  67, active:  58, fresh: 1, share: '5.4%',  w: 67,  tone: 'secondary' },
      { code: '06', name: 'Navoiy viloyati',                total:  22, active:  19, fresh: 0, share: '1.8%',  w: 22,  tone: 'secondary' },
      { code: '07', name: 'Namangan viloyati',              total:  88, active:  77, fresh: 2, share: '7.0%',  w: 88,  tone: 'primary' },
      { code: '08', name: 'Samarqand viloyati',             total: 143, active: 127, fresh: 4, share: '11.4%', w: 143, tone: 'primary' },
      { code: '09', name: 'Sirdaryo viloyati',              total:  24, active:  20, fresh: 0, share: '1.9%',  w: 24,  tone: 'secondary' },
      { code: '10', name: 'Surxondaryo viloyati',           total:  51, active:  44, fresh: 1, share: '4.1%',  w: 51,  tone: 'secondary' },
      { code: '11', name: 'Toshkent viloyati',              total: 156, active: 138, fresh: 5, share: '12.5%', w: 156, tone: 'primary' },
      { code: '12', name: "Farg'ona viloyati",              total: 121, active: 108, fresh: 3, share: '9.7%',  w: 121, tone: 'primary' },
      { code: '13', name: 'Xorazm viloyati',                total:  48, active:  41, fresh: 1, share: '3.8%',  w: 48,  tone: 'secondary' },
      { code: '14', name: 'Toshkent shahri',                total: 263, active: 241, fresh: 9, share: '21.0%', w: 263, tone: 'primary' },
      { code: '15', name: 'Respublika miqyosida faoliyat yurituvchi NNTlar', total: 37, active: 37, fresh: 2, share: '3.0%', w: 37, tone: 'secondary' },
    ];

    function rowMenu() {
      return '<div class="row-menu-wrap">' +
        '<button type="button" aria-label="Menyu" data-action="row-menu"><i class="ph ph-dots-three-vertical"></i></button>' +
        '<div class="row-menu">' +
          '<a href="admin-registry.html" class="row-menu__item"><i class="ph ph-buildings"></i> NNTlarni ko\'rish</a>' +
          '<button type="button" class="row-menu__item"><i class="ph ph-download-simple"></i> Eksport</button>' +
          '<button type="button" class="row-menu__item"><i class="ph ph-trend-up"></i> Tahlil</button>' +
        '</div>' +
      '</div>';
    }

    mount.innerHTML = regions.map(function (r) {
      return '<tr>' +
        '<td style="color:#64748b;font-variant-numeric:tabular-nums;font-weight:600;">' + esc(r.code) + '</td>' +
        '<th scope="row">' + esc(r.name) + '</th>' +
        '<td><strong>' + esc(r.total) + '</strong></td>' +
        '<td><span style="color:#059669;font-weight:600;">' + esc(r.active) + '</span></td>' +
        '<td>' + esc(r.fresh) + '</td>' +
        '<td>' +
          '<div class="u-bar-row">' +
            '<div class="u-bar-track"><div class="u-bar-fill u-bar-fill-' + esc(r.tone) + ' u-bar-w-' + esc(r.w) + '"></div></div>' +
            '<span class="u-stat-caption">' + esc(r.share) + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' + rowMenu() + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ── Documents page ── */
  function renderDocuments() {
    var mount = document.getElementById('documentsTableRows');
    if (!mount) return;

    var docs = [
      { name: 'Ustav 2024 tahrir',              type: 'Ustav',                      org: 'Yangi Nafas NNT',    date: '08.04.2026', status: 'pending',  owner: 'Azizova N.' },
      { name: "Ro'yxatga olish guvohnomasi",    type: "Ro'yxatdan o'tish",          org: 'Mehr-Shafqat NNT',  date: '05.04.2026', status: 'approved', owner: 'Toshmatov A.' },
      { name: 'Soliq ma\'lumotnomasi Q1 2026',  type: "Soliq ma'lumotnomasi",       org: 'Umid Istiqbol NNT', date: '03.04.2026', status: 'approved', owner: 'Xolmatova G.' },
      { name: 'Hisobot 2025 yillik',            type: 'Yillik hisobot',             org: 'Yoshlar Ittifoqi',  date: '01.04.2026', status: 'approved', owner: 'Rahimov B.' },
      { name: 'Rahbar pasporti nusxasi',        type: 'Shaxs hujjati',              org: 'Ekologiya Markazi', date: '29.03.2026', status: 'returned', owner: 'Azizova N.' },
      { name: 'Shartnoma №142',                 type: 'Shartnoma',                  org: 'Baxtli Oila Fondi', date: '28.03.2026', status: 'approved', owner: 'Toshmatov A.' },
      { name: 'Ustav yangi tahrir (2023)',       type: 'Ustav',                      org: 'Sport va Rivojlanish', date: '26.03.2026', status: 'pending', owner: 'Xolmatova G.' },
      { name: 'Hisobot 2025 Q4',                type: 'Choraklik hisobot',          org: 'Hayot va Madaniyat', date: '25.03.2026', status: 'approved', owner: 'Rahimov B.' },
    ];

    function statusMeta(key) {
      if (key === 'approved') return { cls: 'badge--success', text: 'Tasdiqlangan' };
      if (key === 'returned') return { cls: 'badge--danger',  text: 'Qaytarilgan' };
      return { cls: 'badge--warning', text: 'Kutilmoqda' };
    }

    function rowMenu() {
      return '<div class="row-menu-wrap">' +
        '<button type="button" aria-label="Menyu" data-action="row-menu"><i class="ph ph-dots-three-vertical"></i></button>' +
        '<div class="row-menu">' +
          '<button type="button" class="row-menu__item"><i class="ph ph-eye"></i> Ko\'rish</button>' +
          '<button type="button" class="row-menu__item"><i class="ph ph-download-simple"></i> Yuklab olish</button>' +
          '<button type="button" class="row-menu__item u-row-menu-item-approve"><i class="ph ph-check-circle"></i> Tasdiqlash</button>' +
          '<div class="row-menu__sep"></div>' +
          '<button type="button" class="row-menu__item row-menu__item--danger"><i class="ph ph-trash"></i> O\'chirish</button>' +
        '</div>' +
      '</div>';
    }

    mount.innerHTML = docs.map(function (d) {
      var s = statusMeta(d.status);
      return '<tr>' +
        '<td><input type="checkbox" /></td>' +
        '<th scope="row"><span style="display:inline-flex;align-items:center;gap:6px;"><i class="ph ph-file-text" style="color:#64748b;"></i>' + esc(d.name) + '</span></th>' +
        '<td>' + esc(d.type) + '</td>' +
        '<td><div class="table__counterparty"><span class="table__company">' + esc(d.org) + '</span></div></td>' +
        '<td>' + esc(d.date) + '</td>' +
        '<td><span class="badge ' + esc(s.cls) + '"><span class="badge__dot"></span>' + esc(s.text) + '</span></td>' +
        '<td>' + esc(d.owner) + '</td>' +
        '<td>' + rowMenu() + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ── Tasks page ── */
  function renderTasks() {
    var mount = document.getElementById('tasksTableRows');
    if (!mount) return;

    var tasks = [
      { title: "Yangi Nafas NNT ustavini ko'rib chiqish",     owner: 'Azizova N.',   deadline: '10.04.2026', priority: 'critical', status: 'progress' },
      { title: 'Mehr-Shafqat shartnomasi imzosini olish',      owner: 'Toshmatov A.', deadline: '12.04.2026', priority: 'high',     status: 'progress' },
      { title: "2026 Q1 hisobotini tayyorlash",                owner: 'Xolmatova G.', deadline: '15.04.2026', priority: 'medium',   status: 'progress' },
      { title: "Yoshlar Ittifoqi hujjatlarini tekshirish",     owner: 'Rahimov B.',   deadline: '08.04.2026', priority: 'high',     status: 'overdue' },
      { title: 'Samarqand viloyati hisobotini yuborish',       owner: 'Azizova N.',   deadline: '01.04.2026', priority: 'medium',   status: 'done' },
      { title: "Ekologiya Markazi arizasini ko'rib chiqish",   owner: 'Toshmatov A.', deadline: '28.03.2026', priority: 'low',      status: 'done' },
      { title: "Yillik tahlil hisoboti",                       owner: 'Xolmatova G.', deadline: '05.04.2026', priority: 'high',     status: 'overdue' },
      { title: 'Foydalanuvchi huquqlarini yangilash',          owner: 'Azizova N.',   deadline: '20.04.2026', priority: 'low',      status: 'progress' },
    ];

    function priorityMeta(key) {
      if (key === 'critical') return { cls: 'badge--danger',   text: 'CRITICAL' };
      if (key === 'high')     return { cls: 'badge--warning',  text: 'Yuqori' };
      if (key === 'medium')   return { cls: 'badge--pending',  text: "O'rta" };
      return                         { cls: '',                text: 'Past' };
    }

    function statusMeta(key) {
      if (key === 'done')    return { cls: 'badge--success', text: 'Bajarilgan' };
      if (key === 'overdue') return { cls: 'badge--danger',  text: "Muddati o'tgan" };
      return                        { cls: 'badge--warning', text: 'Jarayonda' };
    }

    function rowMenu() {
      return '<div class="row-menu-wrap">' +
        '<button type="button" aria-label="Menyu" data-action="row-menu"><i class="ph ph-dots-three-vertical"></i></button>' +
        '<div class="row-menu">' +
          '<button type="button" class="row-menu__item" data-modal-open="addTaskModal"><i class="ph ph-pencil-simple"></i> Tahrirlash</button>' +
          '<button type="button" class="row-menu__item u-row-menu-item-approve"><i class="ph ph-check-circle"></i> Bajarildi</button>' +
          '<div class="row-menu__sep"></div>' +
          '<button type="button" class="row-menu__item row-menu__item--danger"><i class="ph ph-trash"></i> O\'chirish</button>' +
        '</div>' +
      '</div>';
    }

    mount.innerHTML = tasks.map(function (t) {
      var p = priorityMeta(t.priority);
      var s = statusMeta(t.status);
      var deadlineColor = t.status === 'overdue' ? 'color:#dc2626;font-weight:600;' : '';
      return '<tr>' +
        '<td><input type="checkbox" /></td>' +
        '<th scope="row">' + esc(t.title) + '</th>' +
        '<td>' + esc(t.owner) + '</td>' +
        '<td style="' + deadlineColor + '">' + esc(t.deadline) + (t.status === 'overdue' ? ' <i class="ph ph-warning" style="color:#dc2626;"></i>' : '') + '</td>' +
        '<td><span class="badge ' + esc(p.cls) + '"><span class="badge__dot"></span>' + esc(p.text) + '</span></td>' +
        '<td><span class="badge ' + esc(s.cls) + '"><span class="badge__dot"></span>' + esc(s.text) + '</span></td>' +
        '<td>' + rowMenu() + '</td>' +
      '</tr>';
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderDashboard();
      renderDashboardCharts();
      renderMembershipRequests();
      renderReportsCharts();
      renderReports();
      renderUsers();
      renderAnalyticsCharts();
      renderAnalyticsTables();
      renderRegionsTable();
      renderDocuments();
      renderTasks();
    });
  } else {
    renderDashboard();
    renderDashboardCharts();
    renderMembershipRequests();
    renderReportsCharts();
    renderReports();
    renderUsers();
    renderAnalyticsCharts();
    renderAnalyticsTables();
    renderRegionsTable();
    renderDocuments();
    renderTasks();
  }
})();
