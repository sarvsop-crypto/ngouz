import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/content_container.dart';

class CabinetSettingsPage extends StatelessWidget {
  const CabinetSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentContainer(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Container(
        padding: const EdgeInsets.all(AppSpace.lg),
        decoration: BoxDecoration(
          color: AppTokens.surface,
          border: Border.all(color: AppTokens.border),
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Sozlamalar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            SizedBox(height: AppSpace.md),
            _SettingRow('Profil', 'Kamolov Sanjar'),
            _SettingRow('Email', 'kamolov@yanginafas.uz'),
            _SettingRow('Telefon', '+998 90 123 45 67'),
          ],
        ),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final String label;
  final String value;
  const _SettingRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.md),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: AppTokens.textMuted))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}
