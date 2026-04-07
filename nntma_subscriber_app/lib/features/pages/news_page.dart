import 'package:flutter/material.dart';

import '../../core/app_tokens.dart';
import '../../core/async_list_controller.dart';
import '../../data/content_models.dart';
import '../../data/content_repository.dart';
import '../../widgets/adaptive_grid.dart';
import '../../widgets/async_card_section.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class NewsPage extends StatefulWidget {
  const NewsPage({super.key});

  @override
  State<NewsPage> createState() => _NewsPageState();
}

class _NewsPageState extends State<NewsPage> {
  late final AsyncListController<CardData> _newsController;
  late final AsyncListController<CardData> _eventsController;
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    _newsController = AsyncListController<CardData>(loader: contentRepository.fetchNewsCards)..load();
    _eventsController = AsyncListController<CardData>(loader: contentRepository.fetchEventCards)..load();
  }

  @override
  void dispose() {
    _newsController.dispose();
    _eventsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'Yangiliklar va Tadbirlar',
      heroSub: "So'nggi xabarlar, seminar va tadbir jadvallari.",
      children: [
        ResponsiveSection(
          title: _tab == 0 ? "So'nggi e'lonlar" : 'Yaqin tadbirlar',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _TabRow(active: _tab, onSelect: (i) => setState(() => _tab = i)),
              const SizedBox(height: AppSpace.md),
              if (_tab == 0)
                AsyncCardSection(controller: _newsController)
              else
                AsyncCardSection(controller: _eventsController),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Media center',
          subtitle: 'Figma News dizaynidagi media center blokiga mos.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'News • Feb 10, 2025',
                title: 'Cybersecurity policies announced globally',
                description: 'Governments announced updated cybersecurity policy frameworks.',
              ),
              InfoCard(
                badge: 'News • Dec 19, 2025',
                title: 'New trade agreements and policy changes',
                description: 'International relations and business outcomes expected to improve.',
              ),
              InfoCard(
                badge: 'News • Dec 18, 2025',
                title: 'Additional healthcare infrastructure funding',
                description: 'Budget and delivery expansion for public health services.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Policy updates',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Update • Feb 13, 2025',
                title: 'New healthcare policy updates announced',
                description: 'Expanded access and service quality measures in current policy package.',
              ),
              InfoCard(
                badge: 'Notice • Feb 11, 2025',
                title: 'Property tax payment deadline reminder',
                description: 'Deadline is February 28, 2025.',
              ),
              InfoCard(
                badge: 'Notice • Jan 29, 2025',
                title: 'Scheduled water service interruption',
                description: 'Temporary interruption for maintenance work on February 5, 2025.',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Success stories',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'News • Feb 18, 2025',
                title: 'Community recycling program achieved record success',
                description: 'Recycling rates improved significantly with measurable landfill reduction.',
              ),
              InfoCard(
                badge: 'News • Feb 10, 2025',
                title: 'Local business grant program boosted economic growth',
                description: 'Small business support created new jobs and local momentum.',
              ),
              InfoCard(
                badge: 'News • Jan 30, 2024',
                title: 'Public health campaign improved vaccination rates',
                description: 'Better immunization coverage and disease-prevention outcomes.',
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
