import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/content_container.dart';

class CabinetApplicationsPage extends StatelessWidget {
  const CabinetApplicationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentContainer(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Container(
        decoration: BoxDecoration(
          color: AppTokens.surface,
          border: Border.all(color: AppTokens.border),
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Padding(
              padding: EdgeInsets.all(AppSpace.lg),
              child: Text('Ariza holati', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            ),
            Divider(height: 1),
            _Row('ARZ-2026-0418', 'A\'zolik arizasi', 'Ko\'rib chiqilmoqda'),
            _Row('ARZ-2026-0412', 'Grant arizasi', 'Tasdiqlangan'),
            _Row('ARZ-2026-0399', 'Hisobot yuborish', 'Qayta ishlash kerak'),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String id;
  final String title;
  final String status;
  const _Row(this.id, this.title, this.status);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text('$id - $title'),
      subtitle: Text(status),
      trailing: const Icon(Icons.chevron_right),
    );
  }
}
