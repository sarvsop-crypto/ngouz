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
          title: 'Mission statement',
          subtitle: 'Discover our mission and values bolimiga mos qoshimcha section.',
          child: InfoCard(
            title: 'Our mission is to serve the community with integrity and dedication.',
            description:
                'Bizning maqsadimiz ochiq boshqaruv, inklyuziv xizmatlar va barqaror rivojlanish orqali fuqarolar farovonligini oshirishdir.',
          ),
        ),
        const ResponsiveSection(
          title: 'Key history milestones',
          child: AdaptiveGrid(
            minCardWidth: 220,
            maxColumns: 2,
            children: [
              InfoCard(badge: '2025', title: 'Sustainable Development Initiatives', description: 'Renewable programs and eco-friendly city planning.'),
              InfoCard(badge: '2024', title: 'Digital Transformation', description: 'Public services digitization and stronger cybersecurity.'),
              InfoCard(badge: '2023', title: 'Infrastructure Growth', description: 'New schools, hospitals and smart city initiatives.'),
              InfoCard(badge: '2022', title: 'Local Governance Expansion', description: 'Regional service offices and stronger local collaboration.'),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Transparency and accountability',
          child: AdaptiveGrid(
            minCardWidth: 220,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Public Records', description: 'Open access to official documents and reports.'),
              InfoCard(title: 'Audits', description: 'Regular compliance and spending audits.'),
              InfoCard(title: 'Public Participation', description: 'Consultations, forums and citizen feedback channels.'),
              InfoCard(title: 'Ethics Policies', description: 'Integrity rules and anti-corruption standards.'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Leadership',
          child: AdaptiveGrid(
            minCardWidth: 220,
            maxColumns: 2,
            children: [
              InfoCard(title: 'John Doe', badge: 'Prime Minister', description: 'Strategic governance leadership.'),
              InfoCard(title: 'Jane Smith', badge: 'Deputy Prime Minister', description: 'Public sector transformation leadership.'),
              InfoCard(title: 'Roland Sanders', badge: 'Minister of Digital Transformation', description: 'Technology and e-service programs.'),
              InfoCard(title: 'Sabrina Carpenter', badge: 'Minister of Innovation', description: 'Innovation policy and investment programs.'),
            ],
          ),
        ),
      ],
    );
  }
}
