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
          title: 'Get in touch with us',
          subtitle: 'Figma Contact sahifasidagi department cards bolimi qoshildi.',
          child: AdaptiveGrid(
            minCardWidth: 230,
            maxColumns: 3,
            spacing: 10,
            children: [
              InfoCard(
                title: 'Public Services Department',
                description: 'For inquiries related to public services, permits and official requests.',
                badge: 'Department',
              ),
              InfoCard(
                title: 'Health and Safety Department',
                description: 'For health and safety concerns, regulations, and emergency guidance.',
                badge: 'Department',
              ),
              InfoCard(
                title: 'Education Department',
                description: 'For education policies, scholarship and learning initiatives.',
                badge: 'Department',
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
