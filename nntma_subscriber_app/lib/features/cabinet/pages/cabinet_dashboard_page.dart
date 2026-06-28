import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetDashboardPage extends StatelessWidget {
  const CabinetDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'A’zo kabineti',
      title: 'A’zolik jarayoni',
      subtitle: 'Ariza, to‘lov, hujjatlar va imzo holati.',
      children: const [
        _MembershipStatusPanel(),
        SizedBox(height: AppSpace.lg),
        _WorkflowTracker(),
        SizedBox(height: AppSpace.lg),
        AdaptiveGrid(
          minCardWidth: 360,
          maxColumns: 2,
          children: [
            _NextActionsCard(),
            _DocumentTableCard(),
          ],
        ),
        SizedBox(height: AppSpace.lg),
        _ActivityCard(),
      ],
    );
  }
}

class _MembershipStatusPanel extends StatelessWidget {
  const _MembershipStatusPanel();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(color: const Color(0xFFEAF4FF), borderRadius: BorderRadius.circular(8)),
                child: const PhosphorIcon(PhosphorIconsRegular.sealCheck, color: AppTokens.primaryDark),
              ),
              const SizedBox(width: AppSpace.md),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Ariza holati', style: TextStyle(fontSize: 13, color: AppTokens.textMuted, fontWeight: FontWeight.w700)),
                    SizedBox(height: AppSpace.xs),
                    Text('Rahbar tasdig‘ida', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppTokens.text)),
                    SizedBox(height: AppSpace.xs),
                    Text('Keyingi qadam: shartnoma va sertifikat ERI orqali imzolanadi.', style: TextStyle(color: AppTokens.textMuted, height: 1.45)),
                  ],
                ),
              ),
              SizedBox(width: AppSpace.md),
              _StatusPill('Jarayonda', Color(0xFFB45309)),
            ],
          ),
          const SizedBox(height: AppSpace.lg),
          const Divider(height: 1),
          const SizedBox(height: AppSpace.lg),
          const AdaptiveGrid(
            minCardWidth: 180,
            maxColumns: 4,
            children: [
              _MetaTile('Keyingi qadam', 'Rahbar imzosi'),
              _MetaTile('Kim ko‘rib chiqmoqda', 'Assotsiatsiya rahbari'),
              _MetaTile('Oxirgi yangilanish', '28.06.2026 17:05'),
              _MetaTile('Ariza raqami', 'ARZ-2026-0418'),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetaTile extends StatelessWidget {
  final String label;
  final String value;
  const _MetaTile(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpace.md),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), border: Border.all(color: AppTokens.border), borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.xs),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700, color: AppTokens.text)),
        ],
      ),
    );
  }
}

class _WorkflowTracker extends StatelessWidget {
  const _WorkflowTracker();

  @override
  Widget build(BuildContext context) {
    const steps = [
      ('Yuborildi', true),
      ('To‘lov kutilmoqda', true),
      ('To‘landi', true),
      ('Hududiy bo‘linmada', true),
      ('Superadmin', true),
      ('Rahbar tasdig‘ida', false),
      ('A’zolikka qabul qilindi', false),
      ('Rad/Qaytarildi', false),
    ];
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Jarayon bosqichlari'),
          const SizedBox(height: AppSpace.md),
          Wrap(
            spacing: AppSpace.sm,
            runSpacing: AppSpace.sm,
            children: [
              for (var i = 0; i < steps.length; i++)
                _WorkflowChip(index: i + 1, label: steps[i].$1, done: steps[i].$2, active: i == 5),
            ],
          ),
        ],
      ),
    );
  }
}

class _WorkflowChip extends StatelessWidget {
  final int index;
  final String label;
  final bool done;
  final bool active;
  const _WorkflowChip({required this.index, required this.label, required this.done, required this.active});

  @override
  Widget build(BuildContext context) {
    final color = done ? const Color(0xFF0F7B4B) : (active ? const Color(0xFFB45309) : AppTokens.textMuted);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: AppSpace.sm),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        border: Border.all(color: color.withValues(alpha: 0.25)),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('$index', style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w800)),
          const SizedBox(width: AppSpace.xs),
          Text(label, style: TextStyle(color: color, fontWeight: active ? FontWeight.w800 : FontWeight.w700)),
        ],
      ),
    );
  }
}

class _NextActionsCard extends StatelessWidget {
  const _NextActionsCard();

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Keyingi amallar'),
          const SizedBox(height: AppSpace.md),
          FilledButton.icon(onPressed: null, icon: const PhosphorIcon(PhosphorIconsRegular.creditCard), label: const Text('A’zolik badalini to‘lash')),
          const SizedBox(height: AppSpace.sm),
          OutlinedButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.warningCircle), label: const Text('Kamchiliklarni ko‘rish')),
          const SizedBox(height: AppSpace.sm),
          OutlinedButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.uploadSimple), label: const Text('Qayta yuborish')),
          const SizedBox(height: AppSpace.sm),
          OutlinedButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.downloadSimple), label: const Text('Shartnomani yuklab olish')),
          const SizedBox(height: AppSpace.sm),
          OutlinedButton.icon(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.medal), label: const Text('Sertifikatni yuklab olish')),
        ],
      ),
    );
  }
}

class _DocumentTableCard extends StatelessWidget {
  const _DocumentTableCard();

  @override
  Widget build(BuildContext context) {
    const rows = [
      ('Ariza', 'Tasdiqlangan', '28.06.2026', '240 KB', false),
      ('NNT ustavi', 'Tasdiqlangan', '28.06.2026', '1.2 MB', false),
      ('Shartnoma', 'Imzolangan, tahrirlab bo‘lmaydi', '28.06.2026', '620 KB', true),
      ('Sertifikat', 'Rahbar imzosida', '—', '—', false),
    ];
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Hujjatlar'),
          const SizedBox(height: AppSpace.md),
          for (final row in rows) _DocumentRow(row.$1, row.$2, row.$3, row.$4, row.$5),
        ],
      ),
    );
  }
}

class _DocumentRow extends StatelessWidget {
  final String name;
  final String status;
  final String date;
  final String size;
  final bool locked;
  const _DocumentRow(this.name, this.status, this.date, this.size, this.locked);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpace.sm),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTokens.border))),
      child: Row(
        children: [
          PhosphorIcon(locked ? PhosphorIconsRegular.lockKey : PhosphorIconsRegular.fileText, size: 18, color: AppTokens.primaryDark),
          const SizedBox(width: AppSpace.sm),
          Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w700))),
          Expanded(child: Text(status, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted))),
          SizedBox(width: 92, child: Text(date, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted))),
          SizedBox(width: 68, child: Text(size, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted))),
          IconButton(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.eye, size: 18), tooltip: 'Ko‘rish'),
          IconButton(onPressed: () {}, icon: const PhosphorIcon(PhosphorIconsRegular.downloadSimple, size: 18), tooltip: 'Yuklab olish'),
        ],
      ),
    );
  }
}

class _ActivityCard extends StatelessWidget {
  const _ActivityCard();

  @override
  Widget build(BuildContext context) {
    const rows = [
      ('Ariza rahbar tasdig‘iga yuborildi', '28.06.2026 17:05 · Superadmin'),
      ('To‘lov Payme orqali tasdiqlandi', '28.06.2026 16:40 · Payme'),
      ('Hududiy bo‘linma hujjatlarni tasdiqladi', '28.06.2026 15:10 · Hududiy admin'),
      ('Ariza yuborildi', '27.06.2026 11:24 · Foydalanuvchi'),
    ];
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CabinetCardTitle('Harakatlar tarixi'),
          const SizedBox(height: AppSpace.md),
          for (final row in rows)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpace.md),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 6), decoration: const BoxDecoration(color: AppTokens.primary, shape: BoxShape.circle)),
                  const SizedBox(width: AppSpace.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(row.$1, style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text(row.$2, style: const TextStyle(color: AppTokens.textMuted, fontSize: 12)),
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

class _StatusPill extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusPill(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: AppSpace.sm),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
      child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w800)),
    );
  }
}
