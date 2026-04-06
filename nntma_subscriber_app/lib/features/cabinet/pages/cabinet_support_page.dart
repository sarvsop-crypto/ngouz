import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../widgets/cabinet_page_scaffold.dart';

class CabinetSupportPage extends StatelessWidget {
  const CabinetSupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CabinetPageScaffold(
      eyebrow: 'Murojaat va yordam',
      title: 'Savol yuborish va javoblar holatini kuzatish',
      children: [
        const CabinetSectionTitle('Yangi murojaat'),
        const SizedBox(height: AppSpace.md),
        CabinetCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Mavzu', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: AppSpace.xs),
              const TextField(decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Murojaat mavzusini kiriting')),
              const SizedBox(height: AppSpace.md),
              const Text('Xabar', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: AppSpace.xs),
              const TextField(
                maxLines: 5,
                decoration: InputDecoration(border: OutlineInputBorder(), hintText: 'Batafsil yozing'),
              ),
              const SizedBox(height: AppSpace.md),
              SizedBox(
                width: double.infinity,
                child: FilledButton(onPressed: () {}, child: const Text('Murojaat yuborish')),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
