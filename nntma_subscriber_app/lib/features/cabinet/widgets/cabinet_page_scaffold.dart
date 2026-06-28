import 'package:flutter/material.dart';

import '../../../core/app_tokens.dart';
import '../../../widgets/content_container.dart';

class CabinetPageScaffold extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String? subtitle;
  final List<Widget> children;

  const CabinetPageScaffold({
    super.key,
    required this.eyebrow,
    required this.title,
    this.subtitle,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: ContentContainer(
            padding: const EdgeInsets.fromLTRB(AppSpace.xl, AppSpace.lg, AppSpace.xl, AppSpace.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _EyebrowPill(eyebrow),
                      const SizedBox(height: AppSpace.sm),
                      Text(
                        title,
                        style: const TextStyle(color: AppTokens.text, fontSize: 26, fontWeight: FontWeight.w800, height: 1.15),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: AppSpace.xs),
                        Text(
                          subtitle!,
                          style: const TextStyle(color: AppTokens.textMuted, fontSize: 14, height: 1.45),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: ContentContainer(
            padding: const EdgeInsets.fromLTRB(AppSpace.xl, AppSpace.sm, AppSpace.xl, AppSpace.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
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
      padding: padding ?? const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        border: Border.all(color: AppTokens.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: child,
    );
  }
}

class CabinetCardTitle extends StatelessWidget {
  final String text;

  const CabinetCardTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, height: 1.2),
    );
  }
}

class CabinetSectionTitle extends StatelessWidget {
  final String text;

  const CabinetSectionTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, height: 1.2));
  }
}

class _EyebrowPill extends StatelessWidget {
  final String text;

  const _EyebrowPill(this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppTokens.accentSoft,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppTokens.border),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: AppTokens.primary,
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 0,
        ),
      ),
    );
  }
}
