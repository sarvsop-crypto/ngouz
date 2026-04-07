import 'package:flutter/material.dart';

import '../../core/async_list_controller.dart';
import '../../data/content_models.dart';
import '../../data/content_repository.dart';
import '../../widgets/adaptive_grid.dart';
import '../../widgets/async_card_section.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class EventsPage extends StatefulWidget {
  const EventsPage({super.key});

  @override
  State<EventsPage> createState() => _EventsPageState();
}

class _EventsPageState extends State<EventsPage> {
  late final AsyncListController<CardData> _controller;

  @override
  void initState() {
    super.initState();
    _controller = AsyncListController<CardData>(loader: contentRepository.fetchEventCards)..load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'Tadbirlar',
      heroSub: 'Seminar, trening va ochiq muloqot uchrashuvlari jadvali.',
      children: [
        ResponsiveSection(
          title: 'Yaqin tadbirlar',
          child: AsyncCardSection(controller: _controller),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Asosiy forum va anjumanlar',
          subtitle: 'Yil davomidagi yirik tadbirlar kesimi.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Ochiq',
                title: 'NNTlar uchun ijtimoiy sheriklik forumi',
                description: 'May 2026 - Toshkent - davlat idoralari va NNTlar ishtirokidagi ochiq muloqot.',
              ),
              InfoCard(
                badge: 'Ochiq',
                title: 'Hududiy rivojlanish konferensiyasi',
                description: 'Iyun 2026 - Samarqand - hududiy tashabbuslar va amaliy natijalar muhokamasi.',
              ),
              InfoCard(
                badge: 'Rejada',
                title: 'NNTlar uchun raqamli imkoniyatlar forumi',
                description: 'Iyul 2026 - Toshkent - raqamli platformalar va avtomatlashtirish yechimlari.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Workshop va seminarlar',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Ochiq',
                title: 'Grant arizasini togri tayyorlash workshopi',
                description: 'Amaliy keyslar asosida bosqichma-bosqich ishlash formati.',
              ),
              InfoCard(
                badge: 'Ochiq',
                title: 'Hisobot topshirish va auditga tayyorgarlik seminari',
                description: 'Hisobot sifati va tekshiruvlarga tayyorgarlik boyicha amaliy tavsiyalar.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Alohida dasturlar',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Maxsus',
                title: 'Yoshlar tashabbuslari haftaligi',
                description: 'Yoshlar NNTlari uchun taqdimotlar va mentorlik sessiyalari.',
              ),
              InfoCard(
                badge: 'Maxsus',
                title: 'Ayollar NNTlari liderlik uchrashuvi',
                description: 'Hududlar kesimida tajriba almashish va hamkorlik maydoni.',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
