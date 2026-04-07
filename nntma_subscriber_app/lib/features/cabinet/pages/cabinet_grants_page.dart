import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetGrantsPage extends StatefulWidget {
  const CabinetGrantsPage({super.key});

  @override
  State<CabinetGrantsPage> createState() => _CabinetGrantsPageState();
}

class _CabinetGrantsPageState extends State<CabinetGrantsPage> {
  bool _showApplied = true;

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Grantlar',
      title: 'Ariza yuborilgan va erishilgan grantlar',
      subtitle: "Ariza yuborilgan va qo'lga kiritilgan grantlar ro'yxati.",
      children: [
        Row(
          children: [
            _TabChip(label: 'Ariza yuborilgan', count: '3', active: _showApplied, onTap: () => setState(() => _showApplied = true)),
            const SizedBox(width: AppSpace.sm),
            _TabChip(label: 'Erishilgan', count: '2', active: !_showApplied, onTap: () => setState(() => _showApplied = false)),
          ],
        ),
        const SizedBox(height: AppSpace.xl),
        if (_showApplied) ...[
          AdaptiveGrid(
            minCardWidth: 200,
            maxColumns: 4,
            children: const [
              _MetricCard('Jami ariza', '3', AppTokens.primaryDark),
              _MetricCard('Korib chiqilmoqda', '1', Color(0xFFB45309)),
              _MetricCard('Tasdiqlangan', '1', Color(0xFF0F7B4B)),
              _MetricCard('Rad etildi', '1', Color(0xFFBE123C)),
            ],
          ),
          const SizedBox(height: AppSpace.xl),
          const _GrantsTable(
            title: 'Ariza yuborilgan grantlar',
            rows: [
              ('Fuqarolik jamiyatini mustahkamlash granti', 'USAID Uzbekistan', '\$15,000', '10.01.2026', 'Korib chiqilmoqda', Color(0xFFB45309)),
              ('Yoshlar faolligini oshirish loyihasi', 'UNDP Ozbekiston', '\$8,500', '15.02.2026', 'Tasdiqlandi', Color(0xFF0F7B4B)),
              ('NNTlar salohiyatini rivojlantirish', 'EU Delegation', '\$12,000', '20.03.2026', 'Rad etildi', Color(0xFFBE123C)),
            ],
          ),
        ] else ...[
          AdaptiveGrid(
            minCardWidth: 200,
            maxColumns: 4,
            children: const [
              _MetricCard('Jami erishilgan', '2', Color(0xFF0F7B4B)),
              _MetricCard('Faol loyihalar', '1', AppTokens.primaryDark),
              _MetricCard('Yakunlangan', '1', AppTokens.textMuted),
              _MetricCard('Jami jalb etilgan', '\$18,500', AppTokens.primaryDark),
            ],
          ),
          const SizedBox(height: AppSpace.xl),
          const _GrantsTable(
            title: 'Erishilgan grantlar',
            rows: [
              ('Yoshlar faolligini oshirish loyihasi', 'UNDP Ozbekiston', '\$8,500', '01.03.2026', 'Faol', Color(0xFF0F7B4B)),
              ('Jamoat nazorati va hisobdorlik', 'NED', '\$10,000', '01.09.2025', 'Yakunlangan', AppTokens.textMuted),
            ],
          ),
        ],
      ],
    );
  }
}

class _TabChip extends StatelessWidget {
  final String label;
  final String count;
  final bool active;
  final VoidCallback onTap;

  const _TabChip({required this.label, required this.count, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onTap,
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
            Text(label, style: TextStyle(color: active ? Colors.white : AppTokens.text, fontWeight: FontWeight.w700)),
            const SizedBox(width: AppSpace.xs),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(color: active ? const Color(0x33000000) : const Color(0xFFEAF2F7), borderRadius: BorderRadius.circular(999)),
              child: Text(count, style: TextStyle(fontSize: 11, color: active ? Colors.white : AppTokens.textMuted, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;

  const _MetricCard(this.title, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.sm),
          Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }
}

class _GrantsTable extends StatelessWidget {
  final String title;
  final List<(String, String, String, String, String, Color)> rows;

  const _GrantsTable({required this.title, required this.rows});

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CabinetCardTitle(title),
          const SizedBox(height: AppSpace.md),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowHeight: 42,
              dataRowMaxHeight: 56,
              columnSpacing: 24,
              columns: const [
                DataColumn(label: _NoWrap('Grant nomi')),
                DataColumn(label: _NoWrap('Donor')),
                DataColumn(label: _NoWrap('Summa')),
                DataColumn(label: _NoWrap('Sana')),
                DataColumn(label: _NoWrap('Holat')),
              ],
              rows: [
                for (final row in rows)
                  DataRow(cells: [
                    DataCell(_NoWrap(row.$1)),
                    DataCell(_NoWrap(row.$2)),
                    DataCell(_NoWrap(row.$3)),
                    DataCell(_NoWrap(row.$4)),
                    DataCell(_StatusPill(row.$5, row.$6)),
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


