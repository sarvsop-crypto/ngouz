import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetDocumentsPage extends StatelessWidget {
  const CabinetDocumentsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Hujjatlar',
      title: 'Tashkilot hujjatlarini boshqarish va yuborish',
      children: const [
        CabinetSectionTitle('Majburiy hujjatlar'),
        SizedBox(height: AppSpace.md),
        CabinetCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _DocRow('NNT Ustavi', 'Tasdiqlangan', true),
              Divider(height: 1),
              _DocRow('Royxatdan otish guvohnomasi', 'Tasdiqlangan', true),
              Divider(height: 1),
              _DocRow('Soliq organidan malumotnoma', 'Yuklanmagan', false),
            ],
          ),
        ),
      ],
    );
  }
}

class _DocRow extends StatelessWidget {
  final String name;
  final String status;
  final bool uploaded;

  const _DocRow(this.name, this.status, this.uploaded);

  @override
  Widget build(BuildContext context) {
    final color = uploaded ? const Color(0xFF0F7B4B) : const Color(0xFFB45309);
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.xs),
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
      trailing: FilledButton.tonal(
        onPressed: () {},
        child: Text(uploaded ? 'Korish' : 'Yuklash'),
      ),
    );
  }
}
