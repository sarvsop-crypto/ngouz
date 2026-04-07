import 'package:flutter/material.dart';

import '../core/app_breakpoints.dart';
import '../core/app_tokens.dart';
import 'content_container.dart';

class ResponsiveSection extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget child;
  final bool light;

  const ResponsiveSection({
    super.key,
    required this.title,
    this.subtitle,
    required this.child,
    this.light = true,
  });

  @override
  Widget build(BuildContext context) {
    final bp = breakpointOf(MediaQuery.sizeOf(context).width);
    final hPad = bp == AppBreakpoint.phone ? AppSpace.lg : AppSpace.xl;
    final sectionSubtitle = subtitle;

    return Container(
      color: light ? AppTokens.surface : AppTokens.bg,
      child: ContentContainer(
        padding: EdgeInsets.fromLTRB(hPad, 60, hPad, 60),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(fontSize: bp == AppBreakpoint.phone ? 28 : 34, fontWeight: FontWeight.w700, height: 1.2),
            ),
            if (sectionSubtitle != null) ...[
              const SizedBox(height: AppSpace.sm),
              Text(sectionSubtitle, style: const TextStyle(color: AppTokens.textMuted, fontSize: 16, height: 1.6)),
            ],
            const SizedBox(height: 24),
            child,
          ],
        ),
      ),
    );
  }
}
