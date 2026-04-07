import 'package:flutter/material.dart';

import '../../core/async_list_controller.dart';
import '../../data/content_models.dart';
import '../../data/content_repository.dart';
import '../../widgets/adaptive_grid.dart';
import '../../widgets/async_card_section.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class ServicesPage extends StatefulWidget {
  const ServicesPage({super.key});

  @override
  State<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage> {
  late final AsyncListController<CardData> _controller;

  @override
  void initState() {
    super.initState();
    _controller = AsyncListController<CardData>(loader: contentRepository.fetchServiceCards)..load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'Xizmatlar',
      heroSub: 'NNTlar uchun hujjatlar, hisobot, maslahat va murojaat xizmatlari.',
      children: [
        ResponsiveSection(
          title: 'Asosiy xizmatlar',
          child: AsyncCardSection(controller: _controller),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Raqamli xizmatlar',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Onlayn ariza platformasi', description: 'Azolik arizasi, hujjatlar va holat kuzatuvini yagona oynada boshqarish.'),
              InfoCard(title: 'Elektron hujjat almashinuvi', description: 'Hujjatlarni xavfsiz yuklash, tekshiruv izohlarini olish va yangilash.'),
              InfoCard(title: 'Hisobot topshirish moduli', description: 'Yillik va choraklik hisobotlarni standart shakllarda yuborish.'),
              InfoCard(title: 'Bildirishnoma markazi', description: 'Muddatlar, yangiliklar va tizim xabarnomalarini tezkor qabul qilish.'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Huquqiy va metodik yordam',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Huquqiy konsultatsiya', description: 'NNT faoliyatiga doir huquqiy savollar boyicha ekspert yordami.'),
              InfoCard(title: 'Meyoriy hujjatlar bilan ishlash', description: 'Qonun va qarorlar asosida amaliy yol-yoriq berish.'),
              InfoCard(title: 'Loyiha hujjatlari ekspertizasi', description: 'Ariza, byudjet va loyiha pasportlarini sifatli tayyorlashga komak.'),
              InfoCard(title: 'Metodik qollanmalar', description: 'Tashkiliy boshqaruv va hisobot yuritish boyicha tayyor materiallar.'),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Salohiyatni oshirish xizmatlari',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Trening va seminarlar', description: 'Rahbarlar va mutaxassislar uchun mavzuli amaliy oquvlar.'),
              InfoCard(title: 'Mentorlik dasturi', description: 'Yangi NNTlar uchun tajribali ekspertlar bilan hamkorlik formati.'),
              InfoCard(title: 'Hududiy uchrashuvlar', description: 'Viloyatlarda joyida konsultatsiya va muloqot sessiyalari.'),
              InfoCard(title: 'Tajriba almashish platformasi', description: 'Muvaffaqiyatli amaliyotlarni ulashish va replikatsiya qilish mexanizmi.'),
            ],
          ),
        ),
      ],
    );
  }
}
