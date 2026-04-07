import 'package:flutter/material.dart';

import '../../core/async_list_controller.dart';
import '../../data/content_models.dart';
import '../../data/content_repository.dart';
import '../../widgets/adaptive_grid.dart';
import '../../widgets/async_card_section.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class AboutPage extends StatefulWidget {
  const AboutPage({super.key});

  @override
  State<AboutPage> createState() => _AboutPageState();
}

class _AboutPageState extends State<AboutPage> {
  late final AsyncListController<CardData> _controller;

  @override
  void initState() {
    super.initState();
    _controller = AsyncListController<CardData>(loader: contentRepository.fetchAboutCards)..load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'Biz haqimizda',
      heroSub: 'OZNNTMA fuqarolik jamiyati institutlari uchun milliy hamkorlik platformasi.',
      children: [
        ResponsiveSection(
          title: 'Ichki bolimlar',
          child: AsyncCardSection(controller: _controller),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Missiya va qadriyatlar',
          subtitle: 'Assotsiatsiyaning strategik yonalishi va ish tamoyillari.',
          child: InfoCard(
            title: 'Bizning missiya - NNTlar salohiyatini oshirish va fuqarolik jamiyatini mustahkamlash.',
            description:
                'Ochiqlik, sheriklik va masuliyat tamoyillari asosida NNTlar uchun qulay ekotizim yaratish, ijtimoiy tashabbuslarni kengaytirish va davlat-jamiyat muloqotini rivojlantirish.',
          ),
        ),
        const ResponsiveSection(
          title: 'Asosiy tarixiy bosqichlar',
          child: AdaptiveGrid(
            minCardWidth: 220,
            maxColumns: 2,
            children: [
              InfoCard(badge: '2026', title: 'Hududiy hamkorlikni kengaytirish', description: 'Viloyat bolinmalari orqali NNTlarga metodik va amaliy yordam koLami oshirildi.'),
              InfoCard(badge: '2025', title: 'Raqamli jarayonlarga otish', description: 'Azolik arizalari va hujjatlar aylanishining asosiy bosqichlari raqamlashtirildi.'),
              InfoCard(badge: '2024', title: 'Malaka oshirish dasturlari', description: 'NNT rahbarlari uchun tizimli treninglar va ekspert seminarlar yoga qoyildi.'),
              InfoCard(badge: '2005', title: 'Assotsiatsiya tashkil etildi', description: 'Fuqarolik jamiyati institutlari tashabbusi bilan milliy hamkorlik platformasi yaratildi.'),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Shaffoflik va hisobdorlik',
          child: AdaptiveGrid(
            minCardWidth: 220,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Ochiq malumotlar', description: 'Asosiy hisobotlar va meyoriy hujjatlar bilan tanishish imkoniyati.'),
              InfoCard(title: 'Ichki nazorat', description: 'Jarayonlar sifatini va meyorlarga muvofiqligini doimiy monitoring qilish.'),
              InfoCard(title: 'Jamoatchilik ishtiroki', description: 'Muhokamalar, forumlar va fikr-mulohaza kanallari orqali muloqotni kuchaytirish.'),
              InfoCard(title: 'Etika tamoyillari', description: 'Halollik, manfaatlar toqnashuvini oldini olish va ochiq boshqaruv standartlari.'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Bizning jamoa (siz toldirasiz)',
          child: AdaptiveGrid(
            minCardWidth: 220,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Rais', badge: 'Toldiriladi', description: 'Ism-familiya, lavozim va qisqa bio malumot shu yerga joylanadi.'),
              InfoCard(title: 'Rais orinbosari', badge: 'Toldiriladi', description: 'Ism-familiya, masul yonalish va aloqa malumotlari shu yerga joylanadi.'),
              InfoCard(title: 'Ijro apparati rahbari', badge: 'Toldiriladi', description: 'Ijro faoliyati va koordinatsiya boyicha malumot shu yerga joylanadi.'),
              InfoCard(title: 'Hududiy bolinma koordinatori', badge: 'Toldiriladi', description: 'Hududiy ishlarga masul vakil malumotlari shu yerga joylanadi.'),
            ],
          ),
        ),
      ],
    );
  }
}
