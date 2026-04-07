import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetSupportPage extends StatelessWidget {
  const CabinetSupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Murojaat',
      title: 'Murojaat va Yordam',
      subtitle: "Ko'p so'raladigan savollarga javob toping yoki bizga yozing.",
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: FilledButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.plus), label: const Text('Yangi murojaat')),
        ),
        const SizedBox(height: AppSpace.xl),
        AdaptiveGrid(
          minCardWidth: 360,
          maxColumns: 2,
          children: [
            _FaqPanel(),
            _SupportSidePanel(),
          ],
        ),
      ],
    );
  }
}

class _FaqPanel extends StatelessWidget {
  const _FaqPanel();

  @override
  Widget build(BuildContext context) {
    const faqs = [
      ('Azolik arizasi qancha vaqt korib chiqiladi?', 'Ariza odatda 10-15 ish kuni ichida korib chiqiladi.'),
      ('Qanday hujjatlar talab qilinadi?', 'NGO Ustavi, guvohnoma, rahbar malumotnomasi, soliq malumotnomasi talab qilinadi.'),
      ('Hujjat qaytarilsa nima qilish kerak?', 'Admin izohiga asosan tuzatib qayta yuklash kerak.'),
      ('Shartnoma qanday imzolanadi?', 'Shartnoma kabinet ichida elektron korinishda imzolanadi.'),
      ('Parolni unutsam nima qilaman?', 'Kirish sahifasida Parolni unutdim havolasidan foydalaning.'),
    ];

    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Kop soraladigan savollar'),
          const SizedBox(height: AppSpace.md),
          for (var i = 0; i < faqs.length; i++) ...[
            ExpansionTile(
              tilePadding: EdgeInsets.zero,
              childrenPadding: const EdgeInsets.only(bottom: AppSpace.sm),
              title: Text(faqs[i].$1, style: const TextStyle(fontWeight: FontWeight.w600)),
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(faqs[i].$2, style: const TextStyle(color: AppTokens.textMuted)),
                ),
              ],
            ),
            if (i != faqs.length - 1) const Divider(height: 1),
          ],
        ],
      ),
    );
  }
}

class _SupportSidePanel extends StatelessWidget {
  const _SupportSidePanel();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const CabinetCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CabinetCardTitle('Boglanish'),
              SizedBox(height: AppSpace.md),
              _ContactRow(PhosphorIconsRegular.phone, 'Telefon', '(+998 55) 503-05-12'),
              _ContactRow(PhosphorIconsRegular.envelope, 'Email', 'info@uznntma.uz'),
              _ContactRow(PhosphorIconsRegular.mapPin, 'Manzil', '1A, Furqat kochasi, Toshkent'),
            ],
          ),
        ),
        SizedBox(height: AppSpace.md),
        CabinetCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const CabinetCardTitle('Murojaat yuborish'),
              const SizedBox(height: AppSpace.md),
              _LabeledInput('Mavzu', DropdownButtonFormField<String>(
                items: [
                  const DropdownMenuItem(value: 'h', child: Text('Hujjatlar boyicha')),
                  const DropdownMenuItem(value: 'a', child: Text('Ariza holati')),
                  const DropdownMenuItem(value: 't', child: Text('Texnik muammo')),
                ],
                onChanged: null,
                hint: const Text('Tanlang'),
              )),
              const SizedBox(height: AppSpace.md),
              _LabeledInput('Muhimlik darajasi', DropdownButtonFormField<String>(
                items: [
                  const DropdownMenuItem(value: '1', child: Text('Oddiy')),
                  const DropdownMenuItem(value: '2', child: Text('Orta')),
                  const DropdownMenuItem(value: '3', child: Text('Shoshilinch')),
                ],
                onChanged: null,
                hint: const Text('Tanlang'),
              )),
              const SizedBox(height: AppSpace.md),
              const _LabeledInput('Xabar', TextField(
                maxLines: 4,
                decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Muammoingizni batafsil yozing...'),
              )),
              const SizedBox(height: AppSpace.md),
              SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: null, icon: const PhosphorIcon(PhosphorIconsRegular.paperPlaneTilt), label: const Text('Yuborish'))),
            ],
          ),
        ),
      ],
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ContactRow(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.md),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: const BoxDecoration(color: Color(0xFFEAF2F7), shape: BoxShape.circle),
            alignment: Alignment.center,
            child: PhosphorIcon(icon, size: 18, color: AppTokens.primaryDark),
          ),
          const SizedBox(width: AppSpace.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
                Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LabeledInput extends StatelessWidget {
  final String label;
  final Widget child;

  const _LabeledInput(this.label, this.child);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(height: AppSpace.xs),
        child,
      ],
    );
  }
}
