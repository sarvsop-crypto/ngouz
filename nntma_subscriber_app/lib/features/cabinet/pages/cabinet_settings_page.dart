import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetSettingsPage extends StatelessWidget {
  const CabinetSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Profil sozlamalari',
      title: 'Tashkilot malumotlari va hisob sozlamalari',
      children: const [
        CabinetSectionTitle('Asosiy malumotlar'),
        SizedBox(height: AppSpace.md),
        CabinetCard(
          child: Column(
            children: [
              _SettingRow('Tashkilot nomi', 'Yangi Nafas NNT'),
              Divider(height: AppSpace.lg),
              _SettingRow('Masul shaxs', 'Kamolov Sanjar'),
              Divider(height: AppSpace.lg),
              _SettingRow('Email', 'kamolov@yanginafas.uz'),
              Divider(height: AppSpace.lg),
              _SettingRow('Telefon', '+998 90 123 45 67'),
            ],
          ),
        ),
      ],
    );
  }
}

class _SettingRow extends StatelessWidget {
  final String label;
  final String value;

  const _SettingRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(label, style: const TextStyle(color: AppTokens.textMuted, fontWeight: FontWeight.w600)),
        ),
        Expanded(
          child: Text(value, textAlign: TextAlign.end, style: const TextStyle(fontWeight: FontWeight.w700)),
        ),
      ],
    );
  }
}
