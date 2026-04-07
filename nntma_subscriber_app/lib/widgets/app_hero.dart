import 'package:flutter/material.dart';

import '../core/app_breakpoints.dart';
import '../core/app_tokens.dart';
import 'content_container.dart';

class AppHero extends StatelessWidget {
  final String title;
  final String sub;

  const AppHero({super.key, required this.title, required this.sub});

  @override
  Widget build(BuildContext context) {
    final bp = breakpointOf(MediaQuery.sizeOf(context).width);
    final fs = bp == AppBreakpoint.phone ? 40.0 : 52.0;

    return Container(
      width: double.infinity,
      color: AppTokens.bg,
      child: ContentContainer(
        padding: const EdgeInsets.fromLTRB(AppSpace.xl, 60, AppSpace.xl, 56),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppTokens.text,
                fontSize: fs,
                fontWeight: FontWeight.w700,
                height: 1.2,
              ),
            ),
            const SizedBox(height: AppSpace.sm),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 760),
              child: Text(
                sub,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppTokens.textMuted,
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
