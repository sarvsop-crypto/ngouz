import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/content_container.dart';
import '../../../widgets/footer_sections.dart';

class CabinetPageScaffold extends StatelessWidget {
  final String eyebrow;
  final String title;
  final List<Widget> children;

  const CabinetPageScaffold({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            color: const Color(0xFF0A1324),
            child: ContentContainer(
              padding: const EdgeInsets.fromLTRB(AppSpace.xl, AppSpace.xl, AppSpace.xl, AppSpace.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    eyebrow,
                    style: const TextStyle(color: Color(0xFFB4DCFF), fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: AppSpace.xs),
                  Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700, height: 1.2),
                  ),
                ],
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: ContentContainer(
            padding: const EdgeInsets.fromLTRB(AppSpace.xl, AppSpace.lg, AppSpace.xl, AppSpace.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ),
        const SliverFillRemaining(
          hasScrollBody: false,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              DarkCta(),
              AppFooter(),
            ],
          ),
        ),
      ],
    );
  }
}

class CabinetCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const CabinetCard({super.key, required this.child, this.padding});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(AppSpace.lg),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        border: Border.all(color: AppTokens.border),
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
      ),
      child: child,
    );
  }
}

class CabinetSectionTitle extends StatelessWidget {
  final String text;

  const CabinetSectionTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700));
  }
}
