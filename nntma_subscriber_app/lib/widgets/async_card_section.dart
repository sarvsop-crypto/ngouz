import 'package:flutter/material.dart';

import '../core/async_list_controller.dart';
import '../core/load_state.dart';
import '../data/content_models.dart';
import 'adaptive_grid.dart';
import 'cards.dart';
import 'state_views.dart';

class AsyncCardSection extends StatelessWidget {
  final AsyncListController<CardData> controller;
  final double minCardWidth;

  const AsyncCardSection({
    super.key,
    required this.controller,
    this.minCardWidth = 220,
  });

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
            minCardWidth: minCardWidth,
            spacing: 10,
            children: [
              for (final item in controller.items)
                InfoCard(
                  title: item.title,
                  description: item.description,
                  badge: item.badge,
                ),
            ],
          ),
        );
      },
    );
  }
}
