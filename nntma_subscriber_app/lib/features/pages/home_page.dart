import 'package:flutter/material.dart';

import '../../core/async_list_controller.dart';
import '../../core/load_state.dart';
import '../../data/content_models.dart';
import '../../data/content_repository.dart';
import '../../widgets/adaptive_grid.dart';
import '../../widgets/async_card_section.dart';
import '../../widgets/cards.dart';
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

  @override
  void initState() {
    super.initState();
    _kpiController = AsyncListController<KpiData>(loader: contentRepository.fetchKpis)..load();
    _newsController = AsyncListController<CardData>(loader: contentRepository.fetchHomeNews)..load();
  }

  @override
  void dispose() {
    _kpiController.dispose();
    _newsController.dispose();
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
            maxColumns: 6,
            maxCardWidth: 220,
            stretchChildren: false,
            spacing: 10,
            children: [
              for (final item in controller.items)
                KpiCard(
                  value: item.value,
                  label: item.label,
                  compact: true,
                ),
            ],
          ),
        );
      },
    );
  }
}
