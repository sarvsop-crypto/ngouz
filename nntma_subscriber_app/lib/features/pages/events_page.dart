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
          title: 'Featured upcoming events',
          subtitle: 'Figma Events dizaynidagi featured bolimiga mos.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Open',
                title: 'International Summit on Digital Governance',
                description: 'March 15, 2025 • 10:00 AM - 4:00 PM • International Convention Center',
              ),
              InfoCard(
                badge: 'Open',
                title: 'Global Climate Action Conference 2025',
                description: 'April 22, 2025 • 10:00 AM - 4:00 PM • Town City Hall Space',
              ),
              InfoCard(
                badge: 'Open',
                title: 'Public Safety and Cybersecurity Forum',
                description: 'May 5, 2025 • 9:00 AM - 11:30 AM • Town Exhibition Center',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Workshops and seminars',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Open',
                title: 'Digital Literacy Workshop',
                description: 'March 20, 2025 • 1:00 PM - 4:00 PM • Town Environmental Center',
              ),
              InfoCard(
                badge: 'Open',
                title: 'Sustainable Development Seminar',
                description: 'June 18, 2025 • Register now',
              ),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Festivals and celebrations',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(
                badge: 'Open',
                title: 'Independence Day Celebration',
                description: 'August 17, 2025 • 10:00 AM - 9:00 PM',
              ),
              InfoCard(
                badge: 'Open',
                title: 'Cultural Heritage Festival',
                description: 'October 25, 2025 • 11:00 AM - 6:00 PM',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
