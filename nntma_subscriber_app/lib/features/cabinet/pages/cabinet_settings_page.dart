import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../../../widgets/cards.dart';
import '../../../widgets/contact_form.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetSettingsPage extends StatefulWidget {
  const CabinetSettingsPage({super.key});

  @override
  State<CabinetSettingsPage> createState() => _CabinetSettingsPageState();
}

class _CabinetSettingsPageState extends State<CabinetSettingsPage> {
  int _tab = 0;

  static const _tabs = [
    (PhosphorIconsRegular.user, 'Profil'),
    (PhosphorIconsRegular.buildings, 'Tashkilot'),
    (PhosphorIconsRegular.shieldCheck, 'Xavfsizlik'),
    (PhosphorIconsRegular.question, 'Yordam'),
  ];

  static const _subtitles = [
    'Shaxsiy malumotlar va hisob sozlamalari.',
    'Tashkilot rekvizitlari va yuridik malumotlar.',
    'Parol va kirish xavfsizligi.',
    "Ko'p so'raladigan savollar, murojaat va aloqa.",
  ];

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Sozlamalar',
      title: _tabs[_tab].$2,
      subtitle: _subtitles[_tab],
      children: [
        AdaptiveGrid(
          minCardWidth: 180,
          maxColumns: 4,
          children: [
            for (var i = 0; i < _tabs.length; i++)
              GestureDetector(
                onTap: () => setState(() => _tab = i),
                child: _SettingsNavItem(_tabs[i].$1, _tabs[i].$2, i == _tab),
              ),
          ],
        ),
        const SizedBox(height: AppSpace.xl),
        if (_tab == 0) ...[
          CabinetCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CabinetCardTitle('Shaxsiy malumotlar'),
                const SizedBox(height: AppSpace.md),
                AdaptiveGrid(
                  minCardWidth: 280,
                  maxColumns: 2,
                  children: const [
                    _LabeledInput('Ism', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Kamolov Sanjar'))),
                    _LabeledInput('Email', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'kamolov@yanginafas.uz'))),
                    _LabeledInput('Telefon', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: '+998 90 123 45 67'))),
                    _LabeledInput('Lavozim', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Tashkilot rahbari'))),
                  ],
                ),
                const SizedBox(height: AppSpace.md),
                Row(
                  children: [
                    FilledButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.floppyDisk), label: const Text('Saqlash')),
                    const SizedBox(width: AppSpace.sm),
                    OutlinedButton(onPressed: () {}, child: const Text('Bekor qilish')),
                  ],
                ),
              ],
            ),
          ),
        ] else if (_tab == 1) ...[
          CabinetCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CabinetCardTitle('Tashkilot malumotlari'),
                const SizedBox(height: AppSpace.md),
                AdaptiveGrid(
                  minCardWidth: 280,
                  maxColumns: 2,
                  children: const [
                    _LabeledInput('Tashkilot nomi', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Yangi Nafas NGO'))),
                    _LabeledInput('Huquqiy maqom', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Nodavlat notijorat tashkilot'))),
                    _LabeledInput('STIR', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: '123456789'))),
                    _LabeledInput('Ro\'yxatdan o\'tish raqami', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'NGO-2024-0042'))),
                    _LabeledInput('Manzil', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Toshkent sh., Yunusobod tumani'))),
                    _LabeledInput('Telefon', TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: '+998 71 000 00 00'))),
                  ],
                ),
                const SizedBox(height: AppSpace.md),
                Row(
                  children: [
                    FilledButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.floppyDisk), label: const Text('Saqlash')),
                    const SizedBox(width: AppSpace.sm),
                    OutlinedButton(onPressed: () {}, child: const Text('Bekor qilish')),
                  ],
                ),
              ],
            ),
          ),
        ] else if (_tab == 2) ...[
          CabinetCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CabinetCardTitle('Parolni o\'zgartirish'),
                const SizedBox(height: AppSpace.md),
                AdaptiveGrid(
                  minCardWidth: 280,
                  maxColumns: 2,
                  children: const [
                    _LabeledInput('Joriy parol', TextField(obscureText: true, decoration: InputDecoration(border: OutlineInputBorder(), hintText: '••••••••'))),
                    _LabeledInput('Yangi parol', TextField(obscureText: true, decoration: InputDecoration(border: OutlineInputBorder(), hintText: '••••••••'))),
                    _LabeledInput('Yangi parolni tasdiqlash', TextField(obscureText: true, decoration: InputDecoration(border: OutlineInputBorder(), hintText: '••••••••'))),
                  ],
                ),
                const SizedBox(height: AppSpace.md),
                FilledButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.lockKey), label: const Text('Parolni yangilash')),
              ],
            ),
          ),
        ] else ...[
          AdaptiveGrid(
            minCardWidth: 360,
            maxColumns: 2,
            children: [
              _FaqPanel(),
              _YordamSidePanel(),
            ],
          ),
        ],
      ],
    );
  }
}

// ─── Settings nav item ────────────────────────────────────────────────────────

class _SettingsNavItem extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool active;
  const _SettingsNavItem(this.icon, this.text, this.active);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.md),
      decoration: BoxDecoration(
        color: active ? AppTokens.primaryDark : AppTokens.surface,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: active ? AppTokens.primaryDark : AppTokens.border),
        boxShadow: active ? AppTokens.cardShadows : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          PhosphorIcon(icon, size: 18, color: active ? Colors.white : AppTokens.textMuted),
          const SizedBox(width: AppSpace.sm),
          Text(text, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: active ? Colors.white : AppTokens.text)),
        ],
      ),
    );
  }
}

// ─── Yordam tab ───────────────────────────────────────────────────────────────

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

class _YordamSidePanel extends StatelessWidget {
  const _YordamSidePanel();

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
        const SizedBox(height: AppSpace.md),
        CabinetCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const CabinetCardTitle('Murojaat yuborish'),
              const SizedBox(height: AppSpace.md),
              _LabeledInput('Mavzu', DropdownButtonFormField<String>(
                items: const [
                  DropdownMenuItem(value: 'h', child: Text('Hujjatlar boyicha')),
                  DropdownMenuItem(value: 'a', child: Text('Ariza holati')),
                  DropdownMenuItem(value: 't', child: Text('Texnik muammo')),
                ],
                onChanged: null,
                hint: const Text('Tanlang'),
              )),
              const SizedBox(height: AppSpace.md),
              _LabeledInput('Muhimlik darajasi', DropdownButtonFormField<String>(
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Oddiy')),
                  DropdownMenuItem(value: '2', child: Text('Orta')),
                  DropdownMenuItem(value: '3', child: Text('Shoshilinch')),
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
        const SizedBox(height: AppSpace.md),
        CabinetCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const CabinetCardTitle('Aloqa'),
              const SizedBox(height: AppSpace.md),
              ContactCards(
                left: const InfoCard(
                  title: 'Aloqa malumotlari',
                  description: 'Telefon: (+998 55) 503-05-12\nEmail: info@nntma.uz\nManzil: Furqat kochasi 1A, Toshkent',
                ),
                right: ContactForm(),
              ),
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

// ─── Shared ───────────────────────────────────────────────────────────────────

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
