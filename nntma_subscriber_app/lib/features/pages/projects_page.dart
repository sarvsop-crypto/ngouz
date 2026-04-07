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
      heroSub: 'NNT sektorini rivojlantirish, malaka oshirish va hududiy hamkorlik boyicha ustuvor loyihalar.',
      children: [
        ResponsiveSection(
          title: 'Faol loyihalar',
          subtitle: 'Hozirda amalga oshirilayotgan asosiy tashabbuslar royxati.',
          child: AdaptiveGrid(
            minCardWidth: 260,
            maxColumns: 2,
            children: const [
              InfoCard(
                badge: 'Jarayonda',
                title: 'NNTlar uchun amaliy oquv dasturi',
                description: 'Grant yozish, hisobot topshirish va loyiha boshqaruvi boyicha modulli treninglar.',
              ),
              InfoCard(
                badge: 'Jarayonda',
                title: 'Hududiy konsultatsiya markazlari',
                description: 'Viloyatlarda huquqiy, tashkiliy va metodik yordamni tizimli yoga qoyish.',
              ),
              InfoCard(
                badge: 'Yakunlangan',
                title: 'NNTlar uchun ochiq eshiklar marafoni',
                description: 'Maslahat, hujjat ekspertizasi va ariza boyicha amaliy support tadbirlari.',
              ),
              InfoCard(
                badge: 'Rejada',
                title: 'NNTlar monitoring paneli',
                description: 'Azolik, hujjatlar va hisobotlar holatini markazlashgan kuzatish platformasi.',
              ),
            ],
          ),
        ),
        ResponsiveSection(
          light: false,
          title: 'Yaqin tadbirlar',
          subtitle: 'Loyihalar bilan bogliq forum, seminar va ochiq uchrashuvlar.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: const [
              InfoCard(
                badge: 'Ochiq',
                title: 'Toshkent: NNTlar uchun grant yozish seminari',
                description: '24-aprel, 10:00-13:00, OZNNTMA markaziy ofisi',
              ),
              InfoCard(
                badge: 'Ochiq',
                title: 'Samarqand: Loyiha menejmenti amaliyoti',
                description: '30-aprel, 14:00-17:00, Hududiy bolinma',
              ),
              InfoCard(
                badge: 'Rejalashtirilgan',
                title: 'Andijon: Jamoatchilik nazorati muloqoti',
                description: '6-may, 11:00-13:30, NNTlar uyi',
              ),
              InfoCard(
                badge: 'Rejalashtirilgan',
                title: 'Buxoro: Hisobot topshirish boyicha workshop',
                description: '15-may, 10:00-12:30, Hududiy ofis',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
