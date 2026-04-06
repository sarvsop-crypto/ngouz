import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/content_container.dart';

class CabinetDocumentsPage extends StatelessWidget {
  const CabinetDocumentsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentContainer(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Hujjatlar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.md),
          Container(
            padding: const EdgeInsets.all(AppSpace.lg),
            decoration: BoxDecoration(
              color: AppTokens.surface,
              border: Border.all(color: AppTokens.border),
              borderRadius: BorderRadius.circular(AppTokens.radiusMd),
            ),
            child: Column(
              children: const [
                _DocRow('NNT Ustavi', 'Tasdiqlangan'),
                _DocRow('Ro\'yxatdan o\'tish guvohnomasi', 'Tasdiqlangan'),
                _DocRow('Soliq organidan ma\'lumotnoma', 'Yuklanmagan'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DocRow extends StatelessWidget {
  final String name;
  final String status;
  const _DocRow(this.name, this.status);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(name),
      subtitle: Text(status, style: const TextStyle(color: AppTokens.textMuted)),
      trailing: FilledButton(
        onPressed: () {},
        child: const Text('Yuklash'),
      ),
    );
  }
}
