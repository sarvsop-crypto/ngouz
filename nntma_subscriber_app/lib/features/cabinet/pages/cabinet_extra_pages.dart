import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/adaptive_grid.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetOrganizationPage extends StatelessWidget {
  const CabinetOrganizationPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Tashkilot',
      title: 'Mening tashkilotim',
      children: [
        const CabinetSectionTitle('Tashkilot kartasi'),
        const SizedBox(height: AppSpace.md),
        const CabinetCard(
          child: Column(
            children: [
              _InfoRow(label: 'Nomi', value: 'Yangi Nafas NNT'),
              Divider(height: AppSpace.lg),
              _InfoRow(label: 'STIR', value: '309001223'),
              Divider(height: AppSpace.lg),
              _InfoRow(label: 'Royxatga olingan sana', value: '14.09.2021'),
              Divider(height: AppSpace.lg),
              _InfoRow(label: 'Rahbar', value: 'Kamolov Sanjar'),
              Divider(height: AppSpace.lg),
              _InfoRow(label: 'Holat', value: 'Faol'),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.lg),
        AdaptiveGrid(
          minCardWidth: 280,
          maxColumns: 2,
          children: const [
            CabinetCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Huquqiy hujjatlar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  SizedBox(height: AppSpace.md),
                  _DocStatusLine('NNT Ustavi', 'Tasdiqlangan', Color(0xFF0F7B4B)),
                  _DocStatusLine('Guvohnoma', 'Tasdiqlangan', Color(0xFF0F7B4B)),
                  _DocStatusLine('Ustav yangi tahrir', 'Muddatli', Color(0xFFB45309)),
                ],
              ),
            ),
            CabinetCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Yangilash muddatlari', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  SizedBox(height: AppSpace.md),
                  _DocStatusLine('Ustav yangi tahrir', '10.04.2026', Color(0xFFB45309)),
                  _DocStatusLine('Yillik tasdiq', '20.12.2026', AppTokens.textMuted),
                  _DocStatusLine('Hisobot topshirish', '25.04.2026', AppTokens.primaryDark),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class CabinetReportsPage extends StatelessWidget {
  const CabinetReportsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Hisobotlar',
      title: 'Yillik va choraklik hisobotlarni yuborish',
      children: [
        const CabinetSectionTitle('Hisobot topshirish'),
        const SizedBox(height: AppSpace.md),
        AdaptiveGrid(
          minCardWidth: 260,
          maxColumns: 3,
          children: const [
            _ActionCard('Yangi hisobot', 'Draft yaratish va bosqichma-bosqich toldirish'),
            _ActionCard('Qaytarilganlar', 'Izoh asosida tuzatib qayta yuborish'),
            _ActionCard('Arxiv', 'Oldingi topshirilgan hisobotlarni korish'),
          ],
        ),
        const SizedBox(height: AppSpace.lg),
        const CabinetCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Songgi hisobotlar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              SizedBox(height: AppSpace.md),
              _DocStatusLine('2026-Q1 faoliyat hisoboti', 'Korib chiqilmoqda', Color(0xFFB45309)),
              _DocStatusLine('2025-yil yillik hisoboti', 'Tasdiqlangan', Color(0xFF0F7B4B)),
              _DocStatusLine('2025-Q4 moliyaviy ilova', 'Qaytarilgan', Color(0xFFBE123C)),
            ],
          ),
        ),
      ],
    );
  }
}

class CabinetEventsPage extends StatelessWidget {
  const CabinetEventsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleListPage(
      eyebrow: 'Yopiq tadbirlar',
      title: 'Azo NNTlar uchun maxsus tadbirlar',
      section: 'Tadbirlar taqvimi',
      items: [
        'Strategik rejalash seminari - 2026-04-20',
        'Grant yozish workshop - 2026-04-28',
        'Monitoring va baholash treningi - 2026-05-06',
      ],
    );
  }
}

class CabinetNotificationsPage extends StatelessWidget {
  const CabinetNotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Bildirishnomalar',
      title: 'Segmentlangan xabarlar markazi',
      children: [
        const Wrap(
          spacing: AppSpace.sm,
          children: [
            _NotificationFilter('Barchasi', true),
            _NotificationFilter('Yangi', false),
            _NotificationFilter('Muhim', false),
          ],
        ),
        const SizedBox(height: AppSpace.md),
        const CabinetCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _NotificationRow('Yangi ariza kelib tushdi', 'Yangi Nafas NNT - ARZ-2026-0418', '2 daqiqa oldin', true),
              Divider(height: 1),
              _NotificationRow('Hujjat yuklandi', 'Umid Istiqbol NNT yangi hujjat yukladi', '15 daqiqa oldin', true),
              Divider(height: 1),
              _NotificationRow('Ariza tasdiqlandi', 'Mehr-Shafqat NNT arizasi tasdiqlandi', '1 soat oldin', false),
            ],
          ),
        ),
      ],
    );
  }
}

class _DocStatusLine extends StatelessWidget {
  final String title;
  final String status;
  final Color color;

  const _DocStatusLine(this.title, this.status, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.sm),
      child: Row(
        children: [
          Expanded(child: Text(title)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.sm, vertical: 4),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
            child: Text(status, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _NotificationFilter extends StatelessWidget {
  final String label;
  final bool active;

  const _NotificationFilter(this.label, this.active);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: AppSpace.sm),
      decoration: BoxDecoration(
        color: active ? AppTokens.primaryDark : Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: active ? AppTokens.primaryDark : AppTokens.border),
      ),
      child: Text(label, style: TextStyle(color: active ? Colors.white : AppTokens.text, fontWeight: FontWeight.w700)),
    );
  }
}

class _NotificationRow extends StatelessWidget {
  final String title;
  final String body;
  final String time;
  final bool unread;

  const _NotificationRow(this.title, this.body, this.time, this.unread);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.xs),
      title: Row(
        children: [
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700))),
          if (unread) Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTokens.primary)),
        ],
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(body),
            const SizedBox(height: 2),
            Text(time, style: const TextStyle(fontSize: 12, color: AppTokens.textMuted)),
          ],
        ),
      ),
    );
  }
}

class CabinetApprovalsPage extends StatelessWidget {
  const CabinetApprovalsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleListPage(
      eyebrow: 'Tasdiqlar',
      title: 'Rahbar tasdigini talab qiladigan amallar',
      section: 'Kutilayotgan tasdiqlar',
      items: [
        'Hisobot 2026-Q1 - imzo kutilmoqda',
        'Hujjat yangilash - rahbar tasdigi',
      ],
    );
  }
}

class CabinetStatisticsPage extends StatelessWidget {
  const CabinetStatisticsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Statistika',
      title: 'Arizalar, hisobotlar va hujjatlar analitikasi',
      children: [
        const CabinetSectionTitle('Korsatkichlar'),
        const SizedBox(height: AppSpace.md),
        AdaptiveGrid(
          minCardWidth: 200,
          maxColumns: 4,
          children: const [
            _StatCard('Topshirilgan hisobotlar', '18'),
            _StatCard('Tasdiqlangan hujjatlar', '27'),
            _StatCard('Faol arizalar', '6'),
            _StatCard('Yangi xabarlar', '9'),
          ],
        ),
      ],
    );
  }
}

class CabinetSubscriptionPage extends StatelessWidget {
  const CabinetSubscriptionPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleInfoPage(
      eyebrow: 'Obuna',
      title: 'Azo holati va amal qilish muddati',
      section: 'Obuna holati',
      rows: [
        ('Tarif', 'NNT azo paketi'),
        ('Holat', 'Faol'),
        ('Tugash sanasi', '2026-12-31'),
      ],
    );
  }
}

class CabinetApiPage extends StatelessWidget {
  const CabinetApiPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleInfoPage(
      eyebrow: 'API',
      title: 'Mobil va integratsiya kalitlari',
      section: 'API sozlamalari',
      rows: [
        ('Client ID', 'ngo_mobile_client'),
        ('Token holati', 'Faol'),
        ('Oxirgi yangilash', '2026-04-02'),
      ],
    );
  }
}

class CabinetAuditPage extends StatelessWidget {
  const CabinetAuditPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleListPage(
      eyebrow: 'Audit log',
      title: 'Muhim amallar tarixi',
      section: 'Oxirgi faoliyatlar',
      items: [
        '2026-04-05 14:40 - Hisobot yuborildi',
        '2026-04-05 11:18 - Profil yangilandi',
        '2026-04-04 17:03 - Hujjat yuklandi',
      ],
    );
  }
}

class CabinetEsignaturePage extends StatelessWidget {
  const CabinetEsignaturePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleInfoPage(
      eyebrow: 'E-imzo',
      title: 'ERI bilan hujjatlarni imzolash',
      section: 'ERI holati',
      rows: [
        ('Provider', 'ERI xizmat'),
        ('Ulangan', 'Ha'),
        ('Oxirgi imzo', '2026-03-30'),
      ],
    );
  }
}

class CabinetFeedbackPage extends StatelessWidget {
  const CabinetFeedbackPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleListPage(
      eyebrow: 'Fikr-mulohaza',
      title: 'Portal boyicha takliflar va baholar',
      section: 'Songgi fikrlar',
      items: [
        'Dashboard tez ishlayapti',
        'Hujjat yuklash oqimi qulayroq bolsin',
      ],
    );
  }
}

class CabinetKnowledgePage extends StatelessWidget {
  const CabinetKnowledgePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleListPage(
      eyebrow: 'Bilim bazasi',
      title: 'Qollanmalar va savol-javoblar',
      section: 'Mashhur mavzular',
      items: [
        'Hisobotni togri topshirish boyicha qollanma',
        'Grant arizasi uchun shablonlar',
        'Azo profilini yangilash tartibi',
      ],
    );
  }
}

class CabinetNntDataPage extends StatelessWidget {
  const CabinetNntDataPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleInfoPage(
      eyebrow: 'NNT malumotlari',
      title: 'Reyestrga boglangan tashkiliy korsatkichlar',
      section: 'Asosiy maydonlar',
      rows: [
        ('Reyestr ID', 'NNT-9981'),
        ('Hudud', 'Toshkent shahri'),
        ('Yonaltirish', 'Ijtimoiy himoya'),
      ],
    );
  }
}

class CabinetNewsPage extends StatelessWidget {
  const CabinetNewsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _SimpleListPage(
      eyebrow: 'Kabinet yangiliklari',
      title: 'Azo portaliga tegishli yangilanishlar',
      section: 'Portal yangiliklari',
      items: [
        'Yangi hisobot formasi ishga tushdi',
        'Imzo oqimi optimallashtirildi',
        'Murojaat markazida statuslar qoshildi',
      ],
    );
  }
}

class _SimpleInfoPage extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String section;
  final List<(String, String)> rows;

  const _SimpleInfoPage({
    required this.eyebrow,
    required this.title,
    required this.section,
    required this.rows,
  });

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: eyebrow,
      title: title,
      children: [
        CabinetSectionTitle(section),
        const SizedBox(height: AppSpace.md),
        CabinetCard(
          child: Column(
            children: [
              for (var i = 0; i < rows.length; i++) ...[
                _InfoRow(label: rows[i].$1, value: rows[i].$2),
                if (i != rows.length - 1) const Divider(height: AppSpace.lg),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SimpleListPage extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String section;
  final List<String> items;

  const _SimpleListPage({
    required this.eyebrow,
    required this.title,
    required this.section,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: eyebrow,
      title: title,
      children: [
        CabinetSectionTitle(section),
        const SizedBox(height: AppSpace.md),
        CabinetCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              for (var i = 0; i < items.length; i++) ...[
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.xs),
                  title: Text(items[i]),
                  trailing: const Icon(Icons.chevron_right),
                ),
                if (i != items.length - 1) const Divider(height: 1),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: const TextStyle(color: AppTokens.textMuted, fontWeight: FontWeight.w600))),
        Expanded(child: Text(value, textAlign: TextAlign.end, style: const TextStyle(fontWeight: FontWeight.w700))),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String title;
  final String subtitle;

  const _ActionCard(this.title, this.subtitle);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpace.sm),
          Text(subtitle, style: const TextStyle(color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.md),
          SizedBox(width: double.infinity, child: FilledButton(onPressed: () {}, child: const Text('Ochish'))),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;

  const _StatCard(this.title, this.value);

  @override
  Widget build(BuildContext context) {
    return CabinetCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, color: AppTokens.textMuted)),
          const SizedBox(height: AppSpace.sm),
          Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppTokens.primaryDark)),
        ],
      ),
    );
  }
}

