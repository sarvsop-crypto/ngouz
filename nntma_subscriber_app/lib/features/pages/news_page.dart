import 'package:flutter/material.dart';

import '../../core/app_tokens.dart';
import '../../widgets/adaptive_grid.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class NewsPage extends StatefulWidget {
  const NewsPage({super.key});

  @override
  State<NewsPage> createState() => _NewsPageState();
}

class _NewsPageState extends State<NewsPage> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'Yangiliklar va tadbirlar',
      heroSub: "Songgi xabarlar, seminarlar va hududiy uchrashuvlar.",
      children: [
        ResponsiveSection(
          title: _tab == 0 ? 'Songgi elonlar' : 'Yaqin tadbirlar',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _TabRow(active: _tab, onSelect: (i) => setState(() => _tab = i)),
              const SizedBox(height: AppSpace.md),
              if (_tab == 0)
                const AdaptiveGrid(
                  minCardWidth: 240,
                  maxColumns: 2,
                  children: [
                    InfoCard(badge: 'Yangilik', title: 'NNTlar haftaligi dasturi elon qilindi', description: 'Haftalik doirasida forum, seminar va ochiq muloqot tadbirlari rejalashtirildi.'),
                    InfoCard(badge: 'Elon', title: 'Grant hujjatlari boyicha bepul konsultatsiya', description: 'Hududiy bolimlarda loyiha hujjatlarini tayyorlash boyicha amaliy qabul kunlari boshlandi.'),
                    InfoCard(badge: 'Yangilik', title: 'NNTlar uchun raqamli platforma imkoniyatlari kengaydi', description: 'Ariza va hujjatlar holatini kuzatish uchun yangi funksiyalar qoshildi.'),
                  ],
                )
              else
                const AdaptiveGrid(
                  minCardWidth: 240,
                  maxColumns: 2,
                  children: [
                    InfoCard(badge: 'Tadbir', title: 'Toshkent: Grant yozish seminari', description: '24-aprel, 10:00-13:00, OZNNTMA markaziy ofisi.'),
                    InfoCard(badge: 'Tadbir', title: 'Samarqand: Loyiha boshqaruvi treningi', description: '30-aprel, 14:00-17:00, Hududiy bolinma ofisi.'),
                    InfoCard(badge: 'Tadbir', title: 'Andijon: Jamoatchilik nazorati muloqoti', description: '6-may, 11:00-13:30, NNTlar uyi.'),
                  ],
                ),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Media markaz',
          subtitle: 'Press-reliz, intervyu va mavzuli materiallar toplami.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Press reliz',
                title: 'NNTlar haftaligi boyicha rasmiy bayonot',
                description: 'Haftalik doirasidagi tadbirlar, hamkorlar va asosiy natijalar yoritildi.',
              ),
              InfoCard(
                badge: 'Intervyu',
                title: 'Hududiy bolinmalar faoliyati yuzasidan suhbat',
                description: 'Viloyatlardagi konsultatsiya amaliyoti va yechimlar muhokama qilindi.',
              ),
              InfoCard(
                badge: 'Tahlil',
                title: 'NNTlar uchun grant ekotizimidagi ozgarishlar',
                description: 'Yangi tanlovlar, talablardagi ozgarishlar va ariza topshirish tavsiyalari.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Siyosiy-huquqiy yangilanishlar',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Yangilanish',
                title: 'Hisobot topshirish tartibidagi muhim eslatmalar',
                description: 'Muddatlar, shakllar va elektron topshirish talablari boyicha yangilangan korsatma.',
              ),
              InfoCard(
                badge: 'Bildirishnoma',
                title: 'NNTlar uchun navbatdagi konsultatsiya qabul kunlari',
                description: 'Hududiy bolimlarda qabul jadvali va oldindan royxatdan otish tartibi.',
              ),
              InfoCard(
                badge: 'Bildirishnoma',
                title: 'Jamoatchilik eshituvi uchun takliflar qabul qilinmoqda',
                description: 'Mavzular boyicha NNTlardan taklif va ekspert xulosalari yigimoqda.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Muvaffaqiyat hikoyalari',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Amaliy natija',
                title: 'Hududiy tashabbus orqali ijtimoiy xizmat sifati yaxshilandi',
                description: 'NNT va mahalliy idora hamkorligida xizmat qamrovi sezilarli kengaydi.',
              ),
              InfoCard(
                badge: 'Amaliy natija',
                title: 'Kichik grant dasturi yangi ish orinlarini yaratdi',
                description: 'Mahalliy tashabbuslar orqali bandlik va ijtimoiy faollik oshdi.',
              ),
              InfoCard(
                badge: 'Amaliy natija',
                title: 'Mahalla darajasida ochiq muloqot mexanizmi yoga qoyildi',
                description: 'Fuqarolar, NNT va idoralar ortasidagi aloqa kanallari mustahkamlandi.',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _TabRow extends StatelessWidget {
  final int active;
  final ValueChanged<int> onSelect;
  const _TabRow({required this.active, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpace.sm,
      children: [
        _TabChip('Yangiliklar', active == 0, () => onSelect(0)),
        _TabChip('Tadbirlar', active == 1, () => onSelect(1)),
      ],
    );
  }
}

class _TabChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _TabChip(this.label, this.active, this.onTap);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: AppSpace.sm),
        decoration: BoxDecoration(
          color: active ? AppTokens.primaryDark : Colors.white,
          border: Border.all(color: active ? AppTokens.primaryDark : AppTokens.border),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(color: active ? Colors.white : AppTokens.text, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
