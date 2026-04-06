import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetApplicationsPage extends StatelessWidget {
  const CabinetApplicationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Arizalar',
      title: 'Barcha yuborilgan arizalar holatini kuzating',
      children: const [
        CabinetSectionTitle('Ariza holati'),
        SizedBox(height: AppSpace.md),
        CabinetCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _ApplicationRow('ARZ-2026-0418', 'Azolik arizasi', 'Korib chiqilmoqda', AppTokens.primaryDark),
              Divider(height: 1),
              _ApplicationRow('ARZ-2026-0412', 'Grant arizasi', 'Tasdiqlangan', Color(0xFF0F7B4B)),
              Divider(height: 1),
              _ApplicationRow('ARZ-2026-0399', 'Hisobot yuborish', 'Qayta ishlash kerak', Color(0xFFB45309)),
            ],
          ),
        ),
      ],
    );
  }
}

class _ApplicationRow extends StatelessWidget {
  final String id;
  final String title;
  final String status;
  final Color statusColor;

  const _ApplicationRow(this.id, this.title, this.status, this.statusColor);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.xs),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(id, style: const TextStyle(color: AppTokens.textMuted)),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: 6),
        decoration: BoxDecoration(
          color: statusColor.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(status, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: statusColor)),
      ),
    );
  }
}
