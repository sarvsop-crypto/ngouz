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
      heroSub: 'NNTlar faoliyati, hamkorlik va ijtimoiy tasir yonalishidagi yutuqlar etirof etiladi.',
      children: [
        ResponsiveSection(
          title: 'Mukofot kategoriyalari',
          subtitle: 'Yillik natijalar va amaliy tasir korsatkichlari asosida baholanadi.',
          child: AdaptiveGrid(
            minCardWidth: 240,
            maxColumns: 2,
            children: const [
              InfoCard(title: 'Yilning eng faol NNT tashabbusi', description: 'Jamoa uchun aniq natija bergan ijtimoiy loyiha.'),
              InfoCard(title: 'Hududiy hamkorlik yutugi', description: 'Mahalliy hamkorlik va sheriklik modelini samarali yoga qoygan tashabbus.'),
              InfoCard(title: 'Raqamli yechim mukofoti', description: 'Jarayonlarni soddalashtirgan va qamrovni oshirgan raqamli loyiha.'),
              InfoCard(title: 'Ijtimoiy inklyuziya mukofoti', description: 'Zaif qatlamlar bilan ishlashda barqaror natija korsatgan amaliyot.'),
              InfoCard(title: 'Yoshlar tashabbusi mukofoti', description: 'Yoshlar yetakchiligidagi muvaffaqiyatli NNT loyihalari etirofi.'),
            ],
          ),
        ),
        ResponsiveSection(
          light: false,
          title: 'Avvalgi gOliblar (siz toldirasiz)',
          child: AdaptiveGrid(
            minCardWidth: 260,
            maxColumns: 2,
            children: const [
              InfoCard(
                badge: '2025',
                title: 'NNT nomi - toldiriladi',
                description: 'Loyiha natijalari va erishilgan korsatkichlar shu yerga kiritiladi.',
              ),
              InfoCard(
                badge: '2024',
                title: 'NNT nomi - toldiriladi',
                description: 'Loyiha natijalari va erishilgan korsatkichlar shu yerga kiritiladi.',
              ),
            ],
          ),
        ),
        ResponsiveSection(
          title: 'Kop soraladigan savollar',
          subtitle: 'Mukofot dasturi boyicha asosiy savollar.',
          child: const Column(
            children: [
              _FaqTile(
                question: 'Mukofotlarda kimlar ishtirok etishi mumkin?',
                answer: 'Assotsiatsiya azolari va hamkor NNTlar belgilangan mezonlar asosida ishtirok etadi.',
              ),
              SizedBox(height: 12),
              _FaqTile(
                question: 'Ariza uchun qanday materiallar kerak?',
                answer: 'Loyiha tavsifi, natija korsatkichlari va tasdiqlovchi ilovalar talab etiladi.',
              ),
              SizedBox(height: 12),
              _FaqTile(
                question: 'Goliblar qanday aniqlanadi?',
                answer: 'Mustaqil ekspertlar hayati baholash mezonlari asosida koP bosqichli tanlov otkazadi.',
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
