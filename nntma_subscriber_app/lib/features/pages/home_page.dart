import 'package:flutter/material.dart';

import '../../core/async_list_controller.dart';
import '../../core/load_state.dart';
import '../../data/content_models.dart';
import '../../data/content_repository.dart';
import '../../widgets/adaptive_grid.dart';
import '../../widgets/async_card_section.dart';
import '../../widgets/cards.dart';
import '../../widgets/contact_form.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';
import '../../widgets/state_views.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final AsyncListController<KpiData> _kpiController;
  late final AsyncListController<CardData> _newsController;
  late final AsyncListController<CardData> _eventsController;
  late final AsyncListController<CardData> _aboutController;
  late final AsyncListController<CardData> _servicesController;

  @override
  void initState() {
    super.initState();
    _kpiController = AsyncListController<KpiData>(loader: contentRepository.fetchKpis)..load();
    _newsController = AsyncListController<CardData>(loader: contentRepository.fetchHomeNews)..load();
    _eventsController = AsyncListController<CardData>(loader: contentRepository.fetchEventCards)..load();
    _aboutController = AsyncListController<CardData>(loader: contentRepository.fetchAboutCards)..load();
    _servicesController = AsyncListController<CardData>(loader: contentRepository.fetchServiceCards)..load();
  }

  @override
  void dispose() {
    _kpiController.dispose();
    _newsController.dispose();
    _eventsController.dispose();
    _aboutController.dispose();
    _servicesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'OZNNTMA rasmiy platformasi',
      heroSub: 'NNTlar uchun yangiliklar, tadbirlar, xizmatlar va hamkorlik imkoniyatlari bir joyda.',
      children: [
        ResponsiveSection(
          title: 'Asosiy korsatkichlar',
          subtitle: 'Tashkilot faoliyatining qisqa statistik korinishi.',
          child: _KpiGrid(controller: _kpiController),
        ),
        ResponsiveSection(
          light: false,
          title: 'Yangiliklar',
          child: AsyncCardSection(controller: _newsController),
        ),
        ResponsiveSection(
          title: 'What’s happening',
          subtitle: 'Figma Home sahifasidagi tadbirlar blokiga mos qoshimcha royxat.',
          child: AsyncCardSection(controller: _eventsController),
        ),
        ResponsiveSection(
          title: 'Biz haqimizda',
          subtitle: 'OZNNTMA fuqarolik jamiyati institutlari uchun milliy hamkorlik platformasi.',
          child: AsyncCardSection(controller: _aboutController),
        ),
        ResponsiveSection(
          light: false,
          title: 'Xizmatlar',
          subtitle: 'NNTlar uchun hujjatlar, hisobot, maslahat va murojaat xizmatlari.',
          child: AsyncCardSection(controller: _servicesController),
        ),
        const ResponsiveSection(
          title: 'Driving progress through key projects',
          subtitle: 'Figma Home dizaynidagi Project blokini qamrab oluvchi qoshimcha section.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 3,
            spacing: 10,
            children: [
              InfoCard(
                badge: 'Ongoing',
                title: 'Digital Governance Enhancement',
                description: 'Raqamli boshqaruv xizmatlarini modernizatsiya qilish loyihasi.',
              ),
              InfoCard(
                badge: 'Completed',
                title: 'Public Health Data Integration',
                description: 'Sogliqni saqlash malumotlarini integratsiyalash orqali tezkor qarorlar.',
              ),
              InfoCard(
                badge: 'Upcoming',
                title: 'Renewable Energy Development',
                description: 'Yashil energetika infratuzilmasini kengaytirish.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Awards and recognition',
          subtitle: 'Figma sahifasidagi Awards preview sectioniga mos.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 3,
            spacing: 10,
            children: [
              InfoCard(title: 'Government Excellence Awards', description: 'Yillik davlat xizmatlari samaradorligi mukofoti.'),
              InfoCard(title: 'Public Sector Digital Innovation', description: 'Raqamli transformatsiya va innovatsiya uchun etirof.'),
              InfoCard(title: 'Sustainability Leadership', description: 'Ekologik barqarorlik va yashil tashabbuslar bo yicha yutuqlar.'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Partners',
          subtitle: 'Figma Home logo wall bolimiga mos hamkorlar sectioni.',
          child: AdaptiveGrid(
            minCardWidth: 150,
            maxColumns: 4,
            spacing: 10,
            children: [
              InfoCard(title: 'Microsoft', description: 'Digital ecosystem partner'),
              InfoCard(title: 'Meta', description: 'Communication and outreach partner'),
              InfoCard(title: 'Vodafone', description: 'Connectivity partner'),
              InfoCard(title: 'SpaceX', description: 'Innovation partner'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Boglanish',
          subtitle: 'Murojaat, hamkorlik yoki savollar uchun biz bilan boglaning.',
          child: ContactCards(
            left: InfoCard(
              title: 'Aloqa malumotlari',
              description: 'Telefon: (+998 55) 503-05-12\nEmail: info@ngo.uz\nManzil: Furqat kochasi 1A, Shayxontohur tumani, Toshkent',
            ),
            right: ContactForm(),
          ),
        ),
      ],
    );
  }
}

class _KpiGrid extends StatelessWidget {
  final AsyncListController<KpiData> controller;

  const _KpiGrid({required this.controller});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final state = controller.state == LoadState.idle ? LoadState.loading : controller.state;
        return SectionStateView(
          state: state,
          onRetry: controller.load,
          readyChild: AdaptiveGrid(
            minCardWidth: 150,
            maxColumns: 4,
            spacing: 10,
            children: [
              for (final item in controller.items)
                KpiCard(value: item.value, label: item.label, compact: true),
            ],
          ),
        );
      },
    );
  }
}
