import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetApplicationsPage extends StatelessWidget {
  const CabinetApplicationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Arizalar',
      title: 'Ariza holati',
      children: [
        const Text('Azolik arizangizning joriy holati va bosqichlari.', style: TextStyle(color: AppTokens.textMuted)),
        const SizedBox(height: AppSpace.md),
        const _TabsRow(),
        const SizedBox(height: AppSpace.md),
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
        const SizedBox(height: AppSpace.lg),
        const _ApplicationStages(),
        const SizedBox(height: AppSpace.lg),
        const _HistoryTable(),
      ],
    );
  }
}

class _TabsRow extends StatelessWidget {
  const _TabsRow();

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpace.sm,
      children: const [
        _TabChip('Faol', '1', true),
        _TabChip('Tasdiqlangan', '0', false),
        _TabChip('Arxiv', '0', false),
      ],
    );
  }
}

class _TabChip extends StatelessWidget {
  final String label;
  final String count;
  final bool active;

  const _TabChip(this.label, this.count, this.active);

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
          Text(value, style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: color)),
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
          const Text('Ariza bosqichlari', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
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
                    i == 0 ? '?' : '${i + 1}',
                    style: TextStyle(color: i <= 1 ? Colors.white : AppTokens.textMuted, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: AppSpace.md),
                Expanded(
                  child: Text(
                    stageLabels[i],
                    style: TextStyle(
                      color: i == 1 ? AppTokens.primaryDark : AppTokens.text,
                      fontWeight: i == 1 ? FontWeight.w700 : FontWeight.w500,
                    ),
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
          const Text('Ariza tarixi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.md),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowHeight: 42,
              dataRowMinHeight: 48,
              columns: const [
                DataColumn(label: Text('Tadbir')),
                DataColumn(label: Text('Tavsif')),
                DataColumn(label: Text('Sana')),
                DataColumn(label: Text('Kim')),
                DataColumn(label: Text('Holat')),
              ],
              rows: const [
                DataRow(cells: [
                  DataCell(Text('Ariza yuborildi')),
                  DataCell(Text('Azolik arizasi muvaffaqiyatli yuborildi')),
                  DataCell(Text('02.04.2026')),
                  DataCell(Text('Kamolov Sanjar')),
                  DataCell(_StatusPill('Bajarildi', Color(0xFF0F7B4B))),
                ]),
                DataRow(cells: [
                  DataCell(Text('Tekshiruv boshlandi')),
                  DataCell(Text('Hujjatlar tekshiruv bosqichiga otkazildi')),
                  DataCell(Text('03.04.2026')),
                  DataCell(Text('Admin')),
                  DataCell(_StatusPill('Bajarildi', Color(0xFF0F7B4B))),
                ]),
                DataRow(cells: [
                  DataCell(Text('Hujjat soraldi')),
                  DataCell(Text('Ustav yangi tahrir soraldi')),
                  DataCell(Text('04.04.2026')),
                  DataCell(Text('Admin')),
                  DataCell(_StatusPill('Kutilmoqda', Color(0xFFB45309))),
                ]),
                DataRow(cells: [
                  DataCell(Text('Shartnoma loyihasi')),
                  DataCell(Text('Azolik shartnomasi loyihasi tayyorlandi')),
                  DataCell(Text('05.04.2026')),
                  DataCell(Text('Admin')),
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

class _StatusPill extends StatelessWidget {
  final String text;
  final Color color;

  const _StatusPill(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.sm, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(999)),
      child: Text(text, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w700)),
    );
  }
}

