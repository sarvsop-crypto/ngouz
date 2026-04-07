import 'package:flutter/material.dart';

import '../../widgets/adaptive_grid.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'Loyihalar',
      heroSub: 'Boshqaruv, ijtimoiy rivojlanish va raqamli transformatsiya yonalishidagi asosiy loyihalar.',
      children: [
        ResponsiveSection(
          title: 'Transformative projects underway',
          subtitle: 'Figma loyihasidagi Projects sahifasiga mos ravishda faol loyihalar royxati.',
          child: AdaptiveGrid(
            minCardWidth: 260,
            maxColumns: 2,
            children: const [
              InfoCard(
                badge: 'Ongoing',
                title: 'Digital Governance Enhancement',
                description: 'Scope: Digital governance framework. Outcomes: better efficiency and citizen satisfaction.',
              ),
              InfoCard(
                badge: 'Completed',
                title: 'Public Health Data Integration',
                description: 'Centralized health data repository and analytics for policy decisions and better care.',
              ),
              InfoCard(
                badge: 'Upcoming',
                title: 'Renewable Energy Development',
                description: 'Scaling clean-energy infrastructure for long-term sustainability.',
              ),
              InfoCard(
                badge: 'Onhold',
                title: 'Rural Education Access Initiative',
                description: 'Regional learning centers and teacher support in remote districts.',
              ),
            ],
          ),
        ),
        ResponsiveSection(
          light: false,
          title: 'What’s happening',
          subtitle: 'Loyihalar bilan bogliq yaqin forum va tadbirlar.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: const [
              InfoCard(
                badge: 'Open',
                title: 'International Summit on Digital Governance',
                description: 'March 10, 2025 • Register now',
              ),
              InfoCard(
                badge: 'Open',
                title: 'Global Climate Action Conference 2025',
                description: 'March 25, 2025 • Register now',
              ),
              InfoCard(
                badge: 'Open',
                title: 'Public Safety and Cybersecurity Forum',
                description: 'April 5, 2025 • Register now',
              ),
              InfoCard(
                badge: 'Open',
                title: 'Sustainable Agriculture Workshop',
                description: 'June 18, 2025 • Register now',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
