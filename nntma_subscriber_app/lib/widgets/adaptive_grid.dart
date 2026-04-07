import 'package:flutter/material.dart';

class AdaptiveGrid extends StatelessWidget {
  final List<Widget> children;
  final double minCardWidth;
  final double spacing;
  final int maxColumns;
  final double? maxCardWidth;
  final bool stretchChildren;
  final WrapAlignment alignment;
  final double? itemHeight;

  const AdaptiveGrid({
    super.key,
    required this.children,
    this.minCardWidth = 260,
    this.spacing = 12,
    this.maxColumns = 4,
    this.maxCardWidth,
    this.stretchChildren = true,
    this.alignment = WrapAlignment.start,
    this.itemHeight,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        if (children.isEmpty) return const SizedBox.shrink();
        final cols = (c.maxWidth / minCardWidth).floor().clamp(1, maxColumns);
        final computedWidth = (c.maxWidth - (cols - 1) * spacing) / cols;
        final itemWidth = maxCardWidth == null
            ? computedWidth
            : (computedWidth.clamp(0.0, maxCardWidth!) as num).toDouble();

        // Root fix for uneven card heights:
        // build explicit rows so each row can stretch its children to equal height.
        if (stretchChildren) {
          final rows = <List<Widget>>[];
          for (var i = 0; i < children.length; i += cols) {
            final end = (i + cols > children.length) ? children.length : i + cols;
            rows.add(children.sublist(i, end));
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var r = 0; r < rows.length; r++) ...[
                IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      for (var i = 0; i < cols; i++) ...[
                        if (i < rows[r].length)
                          Expanded(
                            child: SizedBox(
                              height: itemHeight,
                              child: rows[r][i],
                            ),
                          )
                        else
                          const Expanded(child: SizedBox.shrink()),
                        if (i != cols - 1) SizedBox(width: spacing),
                      ],
                    ],
                  ),
                ),
                if (r != rows.length - 1) SizedBox(height: spacing),
              ],
            ],
          );
        }

        return Wrap(
          alignment: alignment,
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final child in children)
              SizedBox(
                width: itemWidth,
                height: itemHeight,
                child: child,
              ),
          ],
        );
      },
    );
  }
}
