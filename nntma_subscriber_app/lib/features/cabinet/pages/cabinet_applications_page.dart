import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetApplicationsPage extends StatefulWidget {
  const CabinetApplicationsPage({super.key});

  @override
  State<CabinetApplicationsPage> createState() => _CabinetApplicationsPageState();
}

class _CabinetApplicationsPageState extends State<CabinetApplicationsPage> {
  int _tab = 0;

  static const _subtitles = [
    'Azolik arizasi jarayoni va hujjatlar holati.',
    'Barcha arizalaringizning joriy holati va tarixi.',
    'Talab qilinadigan hujjatlar, yuklash va tasdiq holati.',
  ];

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Kabinet',
      title: ['Umumiy', 'Ariza', 'Hujjatlar'][_tab],
      subtitle: _subtitles[_tab],
      children: [
        _KabinetTabs(active: _tab, onSelect: (i) => setState(() => _tab = i)),
        const SizedBox(height: AppSpace.xl),
        if (_tab == 0) ...[
          _HeaderActions(onSelectTab: (i) => setState(() => _tab = i)),
          const SizedBox(height: AppSpace.lg),
          const _WarningBanner(),
          const SizedBox(height: AppSpace.xl),
          AdaptiveGrid(
            minCardWidth: 220,
            maxColumns: 4,
            children: const [
              _StatusCard('Ariza holati', 'Korib chiqilmoqda', 'ARZ-2026-0418', Color(0xFFB45309)),
              _StatusCard('Bosqich', '2 / 4', 'Hujjatlar tekshiruvi', AppTokens.primaryDark),
              _StatusCard('Topshirilgan', '02.04.2026', 'Sana', Color(0xFF0F7B4B)),
              _StatusCard('Azolik', 'Kutilmoqda', 'Hali tasdiqlanmagan', AppTokens.textMuted),
            ],
          ),
          const SizedBox(height: AppSpace.xl),
          AdaptiveGrid(
            minCardWidth: 320,
            maxColumns: 2,
            children: const [_StagesCard(), _DocumentStatusCard()],
          ),
          const SizedBox(height: AppSpace.xl),
          AdaptiveGrid(
            minCardWidth: 320,
            maxColumns: 2,
            children: const [_RecentActionsCard(), _NewsCard()],
          ),
        ] else if (_tab == 1) ...[
          const _AppFilterChips(),
          const SizedBox(height: AppSpace.xl),
          AdaptiveGrid(
            minCardWidth: 200,
            maxColumns: 4,
            children: const [
              _MiniMetric('Joriy holat', 'Korib chiqilmoqda', Color(0xFFB45309)),
              _MiniMetric('Bosqich', '2 / 4', AppTokens.primaryDark),
              _MiniMetric('Hujjatlar', '3 / 7', AppTokens.text),
              _MiniMetric('Topshirilgan', '02.04.2026', AppTokens.text),
            ],
          ),
          const SizedBox(height: AppSpace.xl),
          const _ApplicationStages(),
          const SizedBox(height: AppSpace.xl),
          const _HistoryTable(),
        ] else ...[
          AdaptiveGrid(
            minCardWidth: 180,
            maxColumns: 4,
            children: const [
              _KpiCard('Tasdiqlangan', '3', Color(0xFF0F7B4B)),
              _KpiCard('Muddatli', '1', Color(0xFFB45309)),
              _KpiCard('Kutilmoqda', '3', AppTokens.textMuted),
              _KpiCard('Jami', '7', AppTokens.primaryDark),
            ],
          ),
          const SizedBox(height: AppSpace.xl),
          const _ProgressCard(),
          const SizedBox(height: AppSpace.xl),
          const CabinetSectionTitle('Hujjatlar toplami'),
          const SizedBox(height: AppSpace.lg),
          const _DocumentsTable(),
          const SizedBox(height: AppSpace.xl),
          const _UploadPanel(),
        ],
      ],
    );
  }
}

// ─── Tab switcher ────────────────────────────────────────────────────────────

class _KabinetTabs extends StatelessWidget {
  final int active;
  final ValueChanged<int> onSelect;
  const _KabinetTabs({required this.active, required this.onSelect});

  static const _items = [
    (PhosphorIconsRegular.squaresFour, 'Umumiy'),
    (PhosphorIconsRegular.clipboardText, 'Ariza'),
    (PhosphorIconsRegular.folder, 'Hujjatlar'),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpace.sm,
      children: [
        for (var i = 0; i < _items.length; i++)
          _KabinetTab(
            icon: _items[i].$1,
            label: _items[i].$2,
            active: active == i,
            onTap: () => onSelect(i),
          ),
      ],
    );
  }
}

class _KabinetTab extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _KabinetTab({required this.icon, required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: AppSpace.sm),
        decoration: BoxDecoration(
          color: active ? AppTokens.primaryDark : Colors.white,
          border: Border.all(color: active ? AppTokens.primaryDark : AppTokens.border),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            PhosphorIcon(icon, size: 15, color: active ? Colors.white : AppTokens.textMuted),
            const SizedBox(width: AppSpace.xs),
            Text(label, style: TextStyle(color: active ? Colors.white : AppTokens.text, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────

class _HeaderActions extends StatelessWidget {
  final ValueChanged<int> onSelectTab;
  const _HeaderActions({required this.onSelectTab});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Text('Azo arizasi jarayoni va hujjatlar holati', style: TextStyle(fontSize: 15, color: AppTokens.textMuted)),
        ),
        const SizedBox(width: AppSpace.md),
        OutlinedButton.icon(onPressed: () => onSelectTab(2), icon: const PhosphorIcon(PhosphorIconsRegular.folder), label: const Text('Hujjatlar')),
        const SizedBox(width: AppSpace.sm),
        FilledButton.icon(onPressed: () => onSelectTab(1), icon: const PhosphorIcon(PhosphorIconsRegular.clipboardText), label: const Text('Ariza holatim')),
      ],
    );
  }
}

class _WarningBanner extends StatelessWidget {
  const _WarningBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.md),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        border: Border.all(color: const Color(0xFFFDE68A)),
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
      ),
      child: const Row(
        children: [
          PhosphorIcon(PhosphorIconsRegular.warning, color: Color(0xFF92400E)),
          SizedBox(width: AppSpace.sm),
          Expanded(
            child: Text(
              'Muddatli hujjat: Ustav yangi tahrir 10.04.2026 gacha taqdim etilishi kerak.',
              style: TextStyle(color: Color(0xFF92400E), fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final String label;
  final String value;
  final String note;
  final Color valueColor;
  const _StatusCard(this.label, this.value, this.note, this.valueColor);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.sm),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: valueColor, height: 1.1)),
          const SizedBox(height: AppSpace.xs),
          Text(note, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
        ],
      ),
    );
  }
}

class _StagesCard extends StatelessWidget {
  const _StagesCard();

  @override
  Widget build(BuildContext context) {
    const steps = [
      ('Ariza topshirildi', true, false),
      ('Hujjatlar tekshiruvi', false, true),
      ('Shartnoma imzosi', false, false),
      ('Azolik tasdiqlandi', false, false),
    ];

    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Ariza bosqichlari'),
          const SizedBox(height: AppSpace.md),
          for (var i = 0; i < steps.length; i++) ...[
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: steps[i].$2 || steps[i].$3 ? AppTokens.primary : const Color(0xFFE2E8F0),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    steps[i].$2 ? '1' : '${i + 1}',
                    style: TextStyle(color: steps[i].$2 || steps[i].$3 ? Colors.white : AppTokens.textMuted, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: AppSpace.md),
                Expanded(
                  child: Text(
                    steps[i].$1,
                    style: TextStyle(fontWeight: steps[i].$3 ? FontWeight.w700 : FontWeight.w500, color: steps[i].$3 ? AppTokens.primaryDark : AppTokens.text),
                  ),
                ),
                if (steps[i].$3)
                  const Text('Jarayonda', style: TextStyle(fontSize: 12, color: AppTokens.primaryDark, fontWeight: FontWeight.w700)),
              ],
            ),
            if (i != steps.length - 1) const Padding(padding: EdgeInsets.only(left: 14), child: SizedBox(height: 18, child: VerticalDivider(thickness: 2))),
          ],
        ],
      ),
    );
  }
}

class _DocumentStatusCard extends StatelessWidget {
  const _DocumentStatusCard();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          CabinetCardTitle('Hujjatlar holati'),
          SizedBox(height: AppSpace.md),
          _DocLine('NGO Ustavi', 'Tasdiqlangan', Color(0xFF0F7B4B)),
          _DocLine('Guvohnoma', 'Tasdiqlangan', Color(0xFF0F7B4B)),
          _DocLine('Ustav yangi tahrir', 'Muddatli', Color(0xFFB45309)),
          _DocLine('Soliq malumotnoma', 'Kutilmoqda', AppTokens.textMuted),
        ],
      ),
    );
  }
}

class _DocLine extends StatelessWidget {
  final String name;
  final String status;
  final Color color;
  const _DocLine(this.name, this.status, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.sm),
      child: Row(
        children: [
          Expanded(child: Text(name)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.sm, vertical: 4),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(999)),
            child: Text(status, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _RecentActionsCard extends StatelessWidget {
  const _RecentActionsCard();

  @override
  Widget build(BuildContext context) {
    const actions = [
      ('Ariza muvaffaqiyatli yuborildi', '02.04.2026 · ARZ-2026-0418', AppTokens.primary),
      ('Hujjatlar tekshiruv bosqichiga otdi', '03.04.2026 · Admin', AppTokens.primaryDark),
      ('Qoshimcha hujjat soraldi', '04.04.2026 · Muddat: 10.04.2026', Color(0xFFF59E0B)),
      ('Shartnoma loyihasi tayyorlandi', '05.04.2026', Color(0xFF16A34A)),
    ];

    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Songgi harakatlar'),
          const SizedBox(height: AppSpace.md),
          for (final action in actions)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpace.md),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 6), decoration: BoxDecoration(color: action.$3, shape: BoxShape.circle)),
                  const SizedBox(width: AppSpace.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(action.$1, style: const TextStyle(fontWeight: FontWeight.w600)),
                        Text(action.$2, style: const TextStyle(color: AppTokens.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _NewsCard extends StatelessWidget {
  const _NewsCard();

  @override
  Widget build(BuildContext context) {
    const news = [
      ('YANGILIK', 'OzNNTMA 2026-yil azolik shartlari elon qilindi', '05.04.2026', Color(0xFFE0F2FE), AppTokens.primaryDark),
      ('TADBIR', 'NNT vakillari uchun seminar: 15.04.2026', '03.04.2026', Color(0xFFFFF7ED), Color(0xFFB45309)),
      ('MUHIM', 'Yangi azolik tartibi va hujjatlar royxati', '01.04.2026', Color(0xFFFEF3C7), Color(0xFF92400E)),
    ];

    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Yangiliklar'),
          const SizedBox(height: AppSpace.md),
          for (var i = 0; i < news.length; i++) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpace.sm, vertical: 2),
                  decoration: BoxDecoration(color: news[i].$4, borderRadius: BorderRadius.circular(6)),
                  child: Text(news[i].$1, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: news[i].$5)),
                ),
                const SizedBox(width: AppSpace.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(news[i].$2, style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text(news[i].$3, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
            if (i != news.length - 1) const Padding(padding: EdgeInsets.symmetric(vertical: AppSpace.sm), child: Divider(height: 1)),
          ],
        ],
      ),
    );
  }
}

// ─── Ariza tab ────────────────────────────────────────────────────────────────

class _AppFilterChips extends StatelessWidget {
  const _AppFilterChips();

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpace.sm,
      children: const [
        _FilterChip('Faol', '1', true),
        _FilterChip('Tasdiqlangan', '0', false),
        _FilterChip('Arxiv', '0', false),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final String count;
  final bool active;
  const _FilterChip(this.label, this.count, this.active);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: AppSpace.sm),
      decoration: BoxDecoration(
        color: active ? AppTokens.primaryDark : Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: active ? AppTokens.primaryDark : AppTokens.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: TextStyle(color: active ? Colors.white : AppTokens.text, fontWeight: FontWeight.w700)),
          const SizedBox(width: AppSpace.xs),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              color: active ? const Color(0x33000000) : const Color(0xFFEAF2F7),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(count, style: TextStyle(fontSize: 11, color: active ? Colors.white : AppTokens.textMuted, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _MiniMetric extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _MiniMetric(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.sm),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: color, height: 1.1)),
        ],
      ),
    );
  }
}

class _ApplicationStages extends StatelessWidget {
  const _ApplicationStages();

  @override
  Widget build(BuildContext context) {
    const stageLabels = ['Ariza topshirildi', 'Hujjatlar tekshiruvi', 'Shartnoma imzosi', 'Azolik tasdiqlandi'];
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Ariza bosqichlari'),
          const SizedBox(height: AppSpace.md),
          for (var i = 0; i < stageLabels.length; i++) ...[
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: i <= 1 ? AppTokens.primaryDark : const Color(0xFFE2E8F0),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${i + 1}',
                    style: TextStyle(color: i <= 1 ? Colors.white : AppTokens.textMuted, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: AppSpace.md),
                Expanded(
                  child: Text(
                    stageLabels[i],
                    style: TextStyle(color: i == 1 ? AppTokens.primaryDark : AppTokens.text, fontWeight: i == 1 ? FontWeight.w700 : FontWeight.w500),
                  ),
                ),
                if (i == 1) const Text('Jarayonda', style: TextStyle(fontSize: 12, color: AppTokens.primaryDark, fontWeight: FontWeight.w700)),
              ],
            ),
            if (i != stageLabels.length - 1) const Padding(padding: EdgeInsets.only(left: 14), child: SizedBox(height: 16, child: VerticalDivider(thickness: 2))),
          ],
        ],
      ),
    );
  }
}

class _HistoryTable extends StatelessWidget {
  const _HistoryTable();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Ariza tarixi'),
          const SizedBox(height: AppSpace.md),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowHeight: 42,
              dataRowMinHeight: 48,
              dataRowMaxHeight: 56,
              columnSpacing: 24,
              columns: const [
                DataColumn(label: _NoWrap('Tadbir')),
                DataColumn(label: _NoWrap('Tavsif')),
                DataColumn(label: _NoWrap('Sana')),
                DataColumn(label: _NoWrap('Kim')),
                DataColumn(label: _NoWrap('Holat')),
              ],
              rows: const [
                DataRow(cells: [
                  DataCell(_NoWrap('Ariza yuborildi')),
                  DataCell(_NoWrap('Azolik arizasi muvaffaqiyatli yuborildi')),
                  DataCell(_NoWrap('02.04.2026')),
                  DataCell(_NoWrap('Kamolov Sanjar')),
                  DataCell(_StatusPill('Bajarildi', Color(0xFF0F7B4B))),
                ]),
                DataRow(cells: [
                  DataCell(_NoWrap('Tekshiruv boshlandi')),
                  DataCell(_NoWrap('Hujjatlar tekshiruv bosqichiga otkazildi')),
                  DataCell(_NoWrap('03.04.2026')),
                  DataCell(_NoWrap('Admin')),
                  DataCell(_StatusPill('Bajarildi', Color(0xFF0F7B4B))),
                ]),
                DataRow(cells: [
                  DataCell(_NoWrap('Hujjat soraldi')),
                  DataCell(_NoWrap('Ustav yangi tahrir soraldi')),
                  DataCell(_NoWrap('04.04.2026')),
                  DataCell(_NoWrap('Admin')),
                  DataCell(_StatusPill('Kutilmoqda', Color(0xFFB45309))),
                ]),
                DataRow(cells: [
                  DataCell(_NoWrap('Shartnoma loyihasi')),
                  DataCell(_NoWrap('Azolik shartnomasi loyihasi tayyorlandi')),
                  DataCell(_NoWrap('05.04.2026')),
                  DataCell(_NoWrap('Admin')),
                  DataCell(_StatusPill('Imzo kutilmoqda', AppTokens.textMuted)),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Hujjatlar tab ────────────────────────────────────────────────────────────

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  const _KpiCard(this.title, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.sm),
          Text(value, style: TextStyle(fontSize: 28, color: color, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Row(
        children: const [
          SizedBox(
            width: 96,
            height: 96,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(width: 96, height: 96, child: CircularProgressIndicator(value: 0.43, strokeWidth: 10, color: AppTokens.primaryDark, backgroundColor: Color(0xFFE2E8F0))),
                Text('43%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          SizedBox(width: AppSpace.lg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('3 / 7 hujjat qabul qilindi', style: TextStyle(fontWeight: FontWeight.w700)),
                SizedBox(height: AppSpace.xs),
                Text('1 ta muddatli · 3 ta kutilmoqda', style: TextStyle(color: AppTokens.textMuted)),
                SizedBox(height: AppSpace.sm),
                _LegendLine('Tasdiqlangan: 3', Color(0xFF0F7B4B)),
                _LegendLine('Muddatli: 1', Color(0xFFB45309)),
                _LegendLine('Kutilmoqda: 3', AppTokens.textMuted),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendLine extends StatelessWidget {
  final String text;
  final Color color;
  const _LegendLine(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: AppSpace.sm),
          Text(text, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}

class _DocumentsTable extends StatelessWidget {
  const _DocumentsTable();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowHeight: 42,
          dataRowMinHeight: 48,
          dataRowMaxHeight: 56,
          columnSpacing: 24,
          columns: const [
            DataColumn(label: _NoWrap('Hujjat nomi')),
            DataColumn(label: _NoWrap('Turi')),
            DataColumn(label: _NoWrap('Muddat')),
            DataColumn(label: _NoWrap('Holat')),
            DataColumn(label: _NoWrap('Amal')),
          ],
          rows: const [
            DataRow(cells: [
              DataCell(_NoWrap('NGO Ustavi')),
              DataCell(_NoWrap('Majburiy')),
              DataCell(_NoWrap('01.04.2026')),
              DataCell(_StatusPill('Tasdiqlangan', Color(0xFF0F7B4B))),
              DataCell(_NoWrap('Korish')),
            ]),
            DataRow(cells: [
              DataCell(_NoWrap('Davlat royxatidan otish guvohnomasi')),
              DataCell(_NoWrap('Majburiy')),
              DataCell(_NoWrap('01.04.2026')),
              DataCell(_StatusPill('Tasdiqlangan', Color(0xFF0F7B4B))),
              DataCell(_NoWrap('Korish')),
            ]),
            DataRow(cells: [
              DataCell(_NoWrap('Ustav yangi tahrir (2026-yil)')),
              DataCell(_NoWrap('Majburiy')),
              DataCell(_NoWrap('10.04.2026')),
              DataCell(_StatusPill('Muddatli', Color(0xFFB45309))),
              DataCell(_NoWrap('Yuklash')),
            ]),
            DataRow(cells: [
              DataCell(_NoWrap('Soliq organidan malumotnoma')),
              DataCell(_NoWrap('Majburiy')),
              DataCell(_NoWrap('-')),
              DataCell(_StatusPill('Yuklanmagan', AppTokens.textMuted)),
              DataCell(_NoWrap('Yuklash')),
            ]),
          ],
        ),
      ),
    );
  }
}

class _UploadPanel extends StatelessWidget {
  const _UploadPanel();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Yangi hujjat yuklash'),
          const SizedBox(height: AppSpace.md),
          AdaptiveGrid(
            minCardWidth: 280,
            maxColumns: 2,
            children: [
              _LabeledField('Hujjat turi', DropdownButtonFormField<String>(
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Ustav yangi tahrir (2026-yil)')),
                  DropdownMenuItem(value: '2', child: Text('Soliq organidan malumotnoma')),
                  DropdownMenuItem(value: '3', child: Text('Tashkilot nizomi')),
                ],
                onChanged: null,
                hint: const Text('Hujjat turini tanlang'),
              )),
              const _LabeledField('Fayl (PDF, DOC - maks. 10 MB)', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Fayl tanlash'))),
            ],
          ),
          const SizedBox(height: AppSpace.md),
          FilledButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.uploadSimple), label: const Text('Yuklash')),
        ],
      ),
    );
  }
}

class _LabeledField extends StatelessWidget {
  final String label;
  final Widget child;
  const _LabeledField(this.label, this.child);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(height: AppSpace.xs),
        child,
      ],
    );
  }
}

// ─── Shared ───────────────────────────────────────────────────────────────────

class _StatusPill extends StatelessWidget {
  final String text;
  final Color color;
  const _StatusPill(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.sm, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(999)),
      child: Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, softWrap: false, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w700)),
    );
  }
}

class _NoWrap extends StatelessWidget {
  final String text;
  const _NoWrap(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, softWrap: false);
  }
}
