import 'package:flutter/material.dart';

import '../../widgets/adaptive_grid.dart';
import '../../widgets/cards.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class AwardsPage extends StatelessWidget {
  const AwardsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: 'Mukofotlar',
      heroSub: 'Boshqaruv, innovatsiya va jamiyatga taʼsir yonalishidagi yutuqlarni etirof etamiz.',
      children: [
        ResponsiveSection(
          title: 'Awards categories',
          subtitle: 'Figma Awards sahifasidagi kategoriya bloklari asosida.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: const [
              InfoCard(title: 'Government Excellence Award', description: 'Public service excellence and measurable civic impact.'),
              InfoCard(title: 'Digital Innovation Award', description: 'Technology-led transformation and service improvements.'),
              InfoCard(title: 'Sustainability Award', description: 'Environmental leadership and long-term impact initiatives.'),
              InfoCard(title: 'Community Impact Award', description: 'Programs that significantly improve local communities.'),
              InfoCard(title: 'Best AI Communication', description: 'Responsible AI use in public communication and outreach.'),
            ],
          ),
        ),
        ResponsiveSection(
          light: false,
          title: 'Previous winners',
          child: AdaptiveGrid(
            minCardWidth: 260,
            maxColumns: 2,
            children: const [
              InfoCard(
                badge: '2024',
                title: 'Government Excellence Award',
                description: 'Recognized for nationwide service digitization and transparency metrics.',
              ),
              InfoCard(
                badge: '2023',
                title: 'Digital Innovation Award',
                description: 'Honored for end-to-end e-service delivery model and user adoption.',
              ),
            ],
          ),
        ),
        ResponsiveSection(
          title: 'Frequently asked question',
          subtitle: 'Figma sahifasidagi FAQ bolimiga mos asosiy savollar.',
          child: const Column(
            children: [
              _FaqTile(
                question: 'Who can participate in the awards?',
                answer: 'Davlat idoralari, hamkor tashkilotlar va ijtimoiy tashabbus jamoalari ishtirok etishi mumkin.',
              ),
              SizedBox(height: 12),
              _FaqTile(
                question: 'What are the submission requirements?',
                answer: 'Loyiha tavsifi, natijalar korsatkichlari va dalillovchi materiallar yuklanadi.',
              ),
              SizedBox(height: 12),
              _FaqTile(
                question: 'How are winners selected?',
                answer: 'Mustaqil hayʼat baholash mezonlari asosida bir necha bosqichli saralash olib boradi.',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _FaqTile extends StatelessWidget {
  final String question;
  final String answer;

  const _FaqTile({required this.question, required this.answer});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4E7E7)),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        title: Text(question, style: const TextStyle(fontWeight: FontWeight.w600)),
        children: [Text(answer, style: const TextStyle(color: Color(0xFF798384), height: 1.5))],
      ),
    );
  }
}
