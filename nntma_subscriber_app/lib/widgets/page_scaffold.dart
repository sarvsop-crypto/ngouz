import 'package:flutter/material.dart';

import 'app_hero.dart';
import 'footer_sections.dart';

class PageScaffold extends StatelessWidget {
  final String heroTitle;
  final String heroSub;
  final List<Widget> children;

  const PageScaffold({
    super.key,
    required this.heroTitle,
    required this.heroSub,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: AppHero(title: heroTitle, sub: heroSub)),
        SliverList(delegate: SliverChildListDelegate(children)),
        const SliverToBoxAdapter(
          child: Column(
            mainAxisSize: MainAxisSize.min,
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
