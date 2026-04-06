import 'package:flutter/material.dart';

class AdaptiveGrid extends StatelessWidget {
  final List<Widget> children;
  final double minCardWidth;
  final double spacing;
  final int maxColumns;
  final double? maxCardWidth;
  final bool stretchChildren;

  const AdaptiveGrid({
    super.key,
    required this.children,
    this.minCardWidth = 260,
    this.spacing = 12,
    this.maxColumns = 4,
    this.maxCardWidth,
    this.stretchChildren = true,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final cols = (c.maxWidth / minCardWidth).floor().clamp(1, maxColumns);
        final computedWidth = (c.maxWidth - (cols - 1) * spacing) / cols;
        final itemWidth = maxCardWidth == null
            ? computedWidth
            : (computedWidth.clamp(0.0, maxCardWidth!) as num).toDouble();
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final child in children)
              SizedBox(
                width: stretchChildren ? computedWidth : itemWidth,
                child: child,
              ),
          ],
        );
      },
    );
  }
}
