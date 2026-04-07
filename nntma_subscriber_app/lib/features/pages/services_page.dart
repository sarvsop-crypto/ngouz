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
          title: 'E-government and digital services',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Online Portals', description: 'Applications, renewals and requests through one unified portal.'),
              InfoCard(title: 'E-Payments', description: 'Secure tax, fine and service payment workflows.'),
              InfoCard(title: 'Digital Identity', description: 'Trusted identity and authentication for e-services.'),
              InfoCard(title: 'Smart City Solutions', description: 'Traffic, lighting and waste-management automation.'),
              InfoCard(title: 'Mobile Apps', description: 'Government services accessible on the go.'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Public safety and security',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Emergency Response', description: 'Coordinated fire, ambulance and disaster response.'),
              InfoCard(title: 'Community Policing', description: 'Safe neighborhoods through local partnership.'),
              InfoCard(title: 'Cybersecurity', description: 'Protection against digital threats and fraud.'),
              InfoCard(title: 'Crisis Preparedness', description: 'Preparedness plans and rapid communication channels.'),
            ],
          ),
        ),
        const ResponsiveSection(
          light: false,
          title: 'Healthcare and social services',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Healthcare Access', description: 'Primary care, public clinics and support programs.'),
              InfoCard(title: 'Insurance Support', description: 'Guidance on insurance and welfare eligibility.'),
              InfoCard(title: 'Mental Health', description: 'Counseling and public mental health outreach.'),
              InfoCard(title: 'Disability Services', description: 'Accessible services and inclusive support programs.'),
            ],
          ),
        ),
        const ResponsiveSection(
          title: 'Education and innovation',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: [
              InfoCard(title: 'Public Education', description: 'Quality public learning resources and access.'),
              InfoCard(title: 'Scholarship Programs', description: 'Financial aid and merit opportunities.'),
              InfoCard(title: 'Vocational Training', description: 'Practical skills for modern labor markets.'),
              InfoCard(title: 'Research and Development', description: 'Innovation grants and partnership opportunities.'),
            ],
          ),
        ),
      ],
    );
  }
}
