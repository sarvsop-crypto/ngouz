import 'package:flutter/material.dart';

import '../../widgets/adaptive_grid.dart';
import '../../widgets/cards.dart';
import '../../widgets/contact_form.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class ContactPage extends StatelessWidget {
  const ContactPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const PageScaffold(
      heroTitle: 'Boglanish',
      heroSub: 'Murojaat, hamkorlik yoki savollar uchun biz bilan boglaning.',
      children: [
        ResponsiveSection(
          title: 'Boglanish yonalishlari',
          subtitle: 'Savol va murojaatingizga qarab tegishli yonalishni tanlang.',
          child: AdaptiveGrid(
            minCardWidth: 230,
            maxColumns: 3,
            spacing: 10,
            children: [
              InfoCard(
                title: 'Azolik va arizalar bolimi',
                description: 'Azolik jarayoni, ariza statusi va hujjatlar boyicha savollar.',
                badge: 'Bolim',
              ),
              InfoCard(
                title: 'Huquqiy maslahat bolimi',
                description: 'NNT faoliyati, meyoriy hujjatlar va amaliy huquqiy tushuntirishlar.',
                badge: 'Bolim',
              ),
              InfoCard(
                title: 'Loyiha va grantlar bolimi',
                description: 'Grant tanlovlari, loyiha hujjatlari va hamkorlik masalalari.',
                badge: 'Bolim',
              ),
            ],
          ),
        ),
        ResponsiveSection(
          title: 'Kontaktlar va murojaat',
          child: ContactCards(
            left: InfoCard(
              title: 'Aloqa malumotlari',
              description: 'Telefon: (+998 55) 503-05-12\nEmail: info@ngo.uz\nManzil: Furqat kochasi 1A, Shayxontohur tumani, Toshkent',
            ),
            right: ContactForm(),
          ),
        ),
      ],
    );
  }
}
