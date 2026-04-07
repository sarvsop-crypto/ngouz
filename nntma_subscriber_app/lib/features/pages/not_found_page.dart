import 'package:flutter/material.dart';

import '../../core/app_routes.dart';
import '../../core/app_tokens.dart';
import '../../widgets/page_scaffold.dart';
import '../../widgets/responsive_section.dart';

class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      heroTitle: '404',
      heroSub: 'Page not found. Looks like something is broken. It is not you, it is us.',
      children: [
        ResponsiveSection(
          title: 'Page not found',
          subtitle: 'Siz qidirgan sahifa mavjud emas yoki boshqa manzilga kochirilgan.',
          child: Center(
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppTokens.primaryDark),
              onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.home, (route) => false),
              child: const Text('Back home'),
            ),
          ),
        ),
      ],
    );
  }
}
