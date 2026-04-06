import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/content_container.dart';

class CabinetSupportPage extends StatelessWidget {
  const CabinetSupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentContainer(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Container(
        padding: const EdgeInsets.all(AppSpace.lg),
        decoration: BoxDecoration(
          color: AppTokens.surface,
          border: Border.all(color: AppTokens.border),
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Murojaat', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: AppSpace.md),
            const TextField(
              decoration: InputDecoration(labelText: 'Mavzu', border: OutlineInputBorder()),
            ),
            const SizedBox(height: AppSpace.md),
            const TextField(
              maxLines: 4,
              decoration: InputDecoration(labelText: 'Xabar', border: OutlineInputBorder()),
            ),
            const SizedBox(height: AppSpace.md),
            FilledButton(onPressed: null, child: const Text('Yuborish (tez orada)')),
          ],
        ),
      ),
    );
  }
}
