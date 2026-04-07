import 'package:flutter/material.dart';

import '../../widgets/adaptive_grid.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class ExtraPageConfig {
  final String route;
  final String title;
  final String heroSub;
  final List<ExtraCard> cards;

  const ExtraPageConfig({
    required this.route,
    required this.title,
    required this.heroSub,
    required this.cards,
  });
}

class ExtraCard {
  final String title;
  final String description;
  final String? badge;

  const ExtraCard({
    required this.title,
    required this.description,
    this.badge,
  });
}

class WebsiteExtraPage extends StatelessWidget {
  final ExtraPageConfig config;

  const WebsiteExtraPage({super.key, required this.config});

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: config.title,
      heroSub: config.heroSub,
      children: [
        ResponsiveSection(
          title: config.title,
          subtitle: 'Ushbu bolim main website bilan Flutter app ortasida kontent pariteti uchun qoshildi.',
          child: AdaptiveGrid(
            children: [
              for (final card in config.cards)
                InfoCard(
                  title: card.title,
                  description: card.description,
                  badge: card.badge,
                ),
            ],
          ),
        ),
      ],
    );
  }
}
