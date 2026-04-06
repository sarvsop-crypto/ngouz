import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetDashboardPage extends StatelessWidget {
  const CabinetDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Azo kabineti',
      title: 'NNT hujjatlari, arizalar, grantlar va murojaatlar boshqaruvi',
      children: [
        const CabinetSectionTitle('Kabinet korsatkichlari'),
        const SizedBox(height: AppSpace.md),
        AdaptiveGrid(
          minCardWidth: 180,
          maxColumns: 4,
          children: const [
            _MetricCard('Arizalar', '12', '4 tasi korib chiqilmoqda'),
            _MetricCard('Hujjatlar', '7', '3 tasi tasdiqlangan'),
            _MetricCard('Grantlar', '5', '2 tasi ochiq'),
            _MetricCard('Murojaatlar', '3', '1 tasi yangi'),
          ],
        ),
        const SizedBox(height: AppSpace.lg),
        const CabinetCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Songgi faoliyat', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              SizedBox(height: AppSpace.md),
              _Activity('ARZ-2026-0418', 'Ariza qabul qilindi', '2 daqiqa oldin'),
              _Activity('DOC-2026-1102', 'Hujjat tasdiqlandi', '14 daqiqa oldin'),
              _Activity('GRT-2026-0009', 'Grant eloni yangilandi', '1 soat oldin'),
            ],
          ),
        ),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String note;
  const _MetricCard(this.title, this.value, this.note);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.sm),
          Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppTokens.primaryDark)),
          const SizedBox(height: AppSpace.xs),
          Text(note, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
        ],
      ),
    );
  }
}

class _Activity extends StatelessWidget {
  final String id;
  final String text;
  final String time;
  const _Activity(this.id, this.text, this.time);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 6), decoration: const BoxDecoration(color: AppTokens.primary, shape: BoxShape.circle)),
          const SizedBox(width: AppSpace.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$id - $text', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                Text(time, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
