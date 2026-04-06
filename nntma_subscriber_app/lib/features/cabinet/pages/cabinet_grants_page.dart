import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetGrantsPage extends StatelessWidget {
  const CabinetGrantsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Grantlar',
      title: 'Faol grant dasturlari va ariza topshirish oynasi',
      children: [
        const CabinetSectionTitle('Ochiq grantlar'),
        const SizedBox(height: AppSpace.md),
        AdaptiveGrid(
          minCardWidth: 260,
          maxColumns: 3,
          children: const [
            _GrantCard('Fuqarolik tashabbuslari-2026', 'Ariza tugash sanasi: 2026-05-10', '40 mln somgacha'),
            _GrantCard('Yoshlar loyihalari', 'Ariza tugash sanasi: 2026-04-24', '25 mln somgacha'),
            _GrantCard('Ijtimoiy sheriklik mini-grant', 'Ariza tugash sanasi: 2026-06-02', '15 mln somgacha'),
          ],
        ),
      ],
    );
  }
}

class _GrantCard extends StatelessWidget {
  final String title;
  final String meta;
  final String budget;

  const _GrantCard(this.title, this.meta, this.budget);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.sm),
          Text(meta, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.xs),
          Text(budget, style: const TextStyle(fontSize: 13, color: AppTokens.primaryDark, fontWeight: FontWeight.w600)),
          const SizedBox(height: AppSpace.md),
          SizedBox(
            width: double.infinity,
            child: FilledButton(onPressed: () {}, child: const Text('Ariza topshirish')),
          ),
        ],
      ),
    );
  }
}
