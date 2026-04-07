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
          title: 'Yaqin tadbirlar',
          subtitle: 'Seminar, forum va treninglar taqvimi.',
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
          title: 'Asosiy loyihalar',
          subtitle: 'NNT sektorini rivojlantirishga qaratilgan ustuvor tashabbuslar.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 3,
            spacing: 10,
            children: [
              InfoCard(
                badge: 'Jarayonda',
                title: 'NNT salohiyatini oshirish dasturi',
                description: 'Loyiha boshqaruvi, hisobot va grant yozish boyicha amaliy oquv modullari.',
              ),
              InfoCard(
                badge: 'Yakunlangan',
                title: 'Hududiy konsultatsiya tarmogi',
                description: 'Viloyatlarda NNTlar uchun huquqiy va tashkiliy maslahat xizmatlari kengaytirildi.',
              ),
              InfoCard(
                badge: 'Rejada',
                title: 'Raqamli monitoring platformasi',
                description: 'Azolik, hujjatlar va hisobotlar holatini bir oynada kuzatish imkoniyati.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Yutuqlar va etiroflar',
          subtitle: 'Assotsiatsiya va azolar faoliyati boyicha asosiy etirof yonalishlari.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 3,
            spacing: 10,
            children: [
              InfoCard(title: 'Yilning eng faol NNT tashabbusi', description: 'Ijtimoiy tasir korsatkichlari yuqori bolgan loyihalar etirofi.'),
              InfoCard(title: 'Hududiy hamkorlik mukofoti', description: 'Mahalliy idoralar va NNTlar ortasidagi samarali sheriklik uchun etirof.'),
              InfoCard(title: 'Raqamli tashabbus yutugi', description: 'Raqamli yechimlar orqali fuqarolarga qulaylik yaratgan loyihalar etirofi.'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Azolikdagi NNTlar (siz toldirasiz)',
          subtitle: 'Ushbu bolimga assotsiatsiyaga azo tashkilotlar royxati va logotiplari siz tomondan kiritiladi.',
          child: AdaptiveGrid(
            minCardWidth: 150,
            maxColumns: 4,
            spacing: 10,
            children: [
              InfoCard(title: 'NNT 1', description: 'Tashkilot nomi va qisqa yonalishi (toldiriladi)'),
              InfoCard(title: 'NNT 2', description: 'Tashkilot nomi va qisqa yonalishi (toldiriladi)'),
              InfoCard(title: 'NNT 3', description: 'Tashkilot nomi va qisqa yonalishi (toldiriladi)'),
              InfoCard(title: 'NNT 4', description: 'Tashkilot nomi va qisqa yonalishi (toldiriladi)'),
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
