import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../../../widgets/content_container.dart';

class CabinetGrantsPage extends StatelessWidget {
  const CabinetGrantsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentContainer(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Grantlar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.md),
          AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 3,
            children: const [
              _GrantCard('Fuqarolik tashabbuslari-2026', 'Ariza tugash sanasi: 2026-05-10'),
              _GrantCard('Yoshlar loyihalari', 'Ariza tugash sanasi: 2026-04-24'),
              _GrantCard('Ijtimoiy sheriklik mini-grant', 'Ariza tugash sanasi: 2026-06-02'),
            ],
          ),
        ],
      ),
    );
  }
}

class _GrantCard extends StatelessWidget {
  final String title;
  final String meta;
  const _GrantCard(this.title, this.meta);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpace.lg),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        border: Border.all(color: AppTokens.border),
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.sm),
          Text(meta, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.md),
          FilledButton(onPressed: () {}, child: const Text('Ariza topshirish')),
        ],
      ),
    );
  }
}
