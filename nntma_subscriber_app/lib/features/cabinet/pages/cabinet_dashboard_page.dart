import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetDashboardPage extends StatelessWidget {
  const CabinetDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Azo kabineti',
      title: 'Bosh sahifa',
      children: [
        const _HeaderActions(),
        const SizedBox(height: AppSpace.md),
        const _WarningBanner(),
        const SizedBox(height: AppSpace.md),
        AdaptiveGrid(
          minCardWidth: 220,
          maxColumns: 4,
          children: const [
            _StatusCard('Ariza holati', 'Korib chiqilmoqda', 'ARZ-2026-0418', Color(0xFFB45309)),
            _StatusCard('Bosqich', '2 / 4', 'Hujjatlar tekshiruvi', AppTokens.primaryDark),
            _StatusCard('Topshirilgan', '02.04.2026', 'Sana', Color(0xFF0F7B4B)),
            _StatusCard('Azolik', 'Kutilmoqda', 'Hali tasdiqlanmagan', AppTokens.textMuted),
          ],
        ),
        const SizedBox(height: AppSpace.lg),
        AdaptiveGrid(
          minCardWidth: 320,
          maxColumns: 2,
          children: const [
            _StagesCard(),
            _DocumentStatusCard(),
          ],
        ),
        const SizedBox(height: AppSpace.lg),
        AdaptiveGrid(
          minCardWidth: 320,
          maxColumns: 2,
          children: const [
            _RecentActionsCard(),
            _NewsCard(),
          ],
        ),
      ],
    );
  }
}

class _HeaderActions extends StatelessWidget {
  const _HeaderActions();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Text('Azo arizasi jarayoni va hujjatlar holati', style: TextStyle(fontSize: 15, color: AppTokens.textMuted)),
        ),
        const SizedBox(width: AppSpace.md),
        OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.folder_outlined), label: const Text('Hujjatlar')),
        const SizedBox(width: AppSpace.sm),
        FilledButton.icon(onPressed: () {}, icon: const Icon(Icons.assignment_outlined), label: const Text('Ariza holatim')),
      ],
    );
  }
}

class _WarningBanner extends StatelessWidget {
  const _WarningBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.md),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        border: Border.all(color: const Color(0xFFFDE68A)),
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
      ),
      child: const Row(
        children: [
          Icon(Icons.warning_amber_rounded, color: Color(0xFF92400E)),
          SizedBox(width: AppSpace.sm),
          Expanded(
            child: Text(
              'Muddatli hujjat: Ustav yangi tahrir 10.04.2026 gacha taqdim etilishi kerak.',
              style: TextStyle(color: Color(0xFF92400E), fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final String label;
  final String value;
  final String note;
  final Color valueColor;

  const _StatusCard(this.label, this.value, this.note, this.valueColor);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.sm),
          Text(value, style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700, color: valueColor)),
          const SizedBox(height: AppSpace.xs),
          Text(note, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
        ],
      ),
    );
  }
}

class _StagesCard extends StatelessWidget {
  const _StagesCard();

  @override
  Widget build(BuildContext context) {
    const steps = [
      ('Ariza topshirildi', true, false),
      ('Hujjatlar tekshiruvi', false, true),
      ('Shartnoma imzosi', false, false),
      ('Azolik tasdiqlandi', false, false),
    ];

    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Ariza bosqichlari', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.md),
          for (var i = 0; i < steps.length; i++) ...[
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: steps[i].$2 || steps[i].$3 ? AppTokens.primary : const Color(0xFFE2E8F0),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    steps[i].$2 ? '?' : '${i + 1}',
                    style: TextStyle(color: steps[i].$2 || steps[i].$3 ? Colors.white : AppTokens.textMuted, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: AppSpace.md),
                Expanded(
                  child: Text(
                    steps[i].$1,
                    style: TextStyle(
                      fontWeight: steps[i].$3 ? FontWeight.w700 : FontWeight.w500,
                      color: steps[i].$3 ? AppTokens.primaryDark : AppTokens.text,
                    ),
                  ),
                ),
                if (steps[i].$3)
                  const Text('Jarayonda', style: TextStyle(fontSize: 12, color: AppTokens.primaryDark, fontWeight: FontWeight.w700)),
              ],
            ),
            if (i != steps.length - 1) const Padding(padding: EdgeInsets.only(left: 14), child: SizedBox(height: 18, child: VerticalDivider(thickness: 2))),
          ],
        ],
      ),
    );
  }
}

class _DocumentStatusCard extends StatelessWidget {
  const _DocumentStatusCard();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text('Hujjatlar holati', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          SizedBox(height: AppSpace.md),
          _DocLine('NGO Ustavi', 'Tasdiqlangan', Color(0xFF0F7B4B)),
          _DocLine('Guvohnoma', 'Tasdiqlangan', Color(0xFF0F7B4B)),
          _DocLine('Ustav yangi tahrir', 'Muddatli', Color(0xFFB45309)),
          _DocLine('Soliq malumotnoma', 'Kutilmoqda', AppTokens.textMuted),
        ],
      ),
    );
  }
}

class _DocLine extends StatelessWidget {
  final String name;
  final String status;
  final Color color;

  const _DocLine(this.name, this.status, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.sm),
      child: Row(
        children: [
          Expanded(child: Text(name)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.sm, vertical: 4),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(999)),
            child: Text(status, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _RecentActionsCard extends StatelessWidget {
  const _RecentActionsCard();

  @override
  Widget build(BuildContext context) {
    const actions = [
      ('Ariza muvaffaqiyatli yuborildi', '02.04.2026 · ARZ-2026-0418', AppTokens.primary),
      ('Hujjatlar tekshiruv bosqichiga otdi', '03.04.2026 · Admin', AppTokens.primaryDark),
      ('Qoshimcha hujjat soraldi', '04.04.2026 · Muddat: 10.04.2026', Color(0xFFF59E0B)),
      ('Shartnoma loyihasi tayyorlandi', '05.04.2026', Color(0xFF16A34A)),
    ];

    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Songgi harakatlar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.md),
          for (final action in actions)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpace.md),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 6), decoration: BoxDecoration(color: action.$3, shape: BoxShape.circle)),
                  const SizedBox(width: AppSpace.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(action.$1, style: const TextStyle(fontWeight: FontWeight.w600)),
                        Text(action.$2, style: const TextStyle(color: AppTokens.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _NewsCard extends StatelessWidget {
  const _NewsCard();

  @override
  Widget build(BuildContext context) {
    const news = [
      ('YANGILIK', 'OzNNTMA 2026-yil azolik shartlari elon qilindi', '05.04.2026', Color(0xFFE0F2FE), AppTokens.primaryDark),
      ('TADBIR', 'NNT vakillari uchun seminar: 15.04.2026', '03.04.2026', Color(0xFFFFF7ED), Color(0xFFB45309)),
      ('MUHIM', 'Yangi azolik tartibi va hujjatlar royxati', '01.04.2026', Color(0xFFFEF3C7), Color(0xFF92400E)),
    ];

    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Yangiliklar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.md),
          for (var i = 0; i < news.length; i++) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpace.sm, vertical: 2),
                  decoration: BoxDecoration(color: news[i].$4, borderRadius: BorderRadius.circular(6)),
                  child: Text(news[i].$1, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: news[i].$5)),
                ),
                const SizedBox(width: AppSpace.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(news[i].$2, style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text(news[i].$3, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
            if (i != news.length - 1) const Padding(padding: EdgeInsets.symmetric(vertical: AppSpace.sm), child: Divider(height: 1)),
          ],
        ],
      ),
    );
  }
}

