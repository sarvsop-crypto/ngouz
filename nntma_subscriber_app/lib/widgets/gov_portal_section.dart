import 'package:flutter/material.dart';

import '../core/app_i18n.dart';
import '../core/app_tokens.dart';
import 'content_container.dart';

class LocalizedValue {
  final String uzLatin;
  final String uzCyrillic;
  final String russian;
  final String english;

  const LocalizedValue({
    required this.uzLatin,
    required this.uzCyrillic,
    required this.russian,
    required this.english,
  });

  String resolve(AppI18n i18n) => i18n.pick(
        uzLatin: uzLatin,
        uzCyrillic: uzCyrillic,
        russian: russian,
        english: english,
      );
}

class GovPortalSection extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<LocalizedValue> items;
  final String? actionLabel;
  final VoidCallback? onAction;

  const GovPortalSection({
    super.key,
    required this.title,
    required this.items,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final i18n = context.i18n;
    return Container(
      color: AppTokens.govSectionBg,
      child: ContentContainer(
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.xl, vertical: 48),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
                  ),
                ),
                if (actionLabel != null)
                  TextButton(
                    onPressed: onAction ?? () {},
                    child: Text(actionLabel!, style: const TextStyle(color: AppTokens.primary)),
                  ),
              ],
            ),
            if (subtitle != null) ...[
              const SizedBox(height: AppSpace.sm),
              Text(subtitle!, style: const TextStyle(color: AppTokens.textMuted, fontSize: 16, height: 1.5)),
            ],
            const SizedBox(height: AppSpace.lg),
            Wrap(
              spacing: AppSpace.md,
              runSpacing: AppSpace.md,
              children: items.map((item) {
                return _GovItemCard(text: item.resolve(i18n));
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _GovItemCard extends StatelessWidget {
  final String text;

  const _GovItemCard({required this.text});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTokens.border),
          boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 12, offset: Offset(0, 6))],
        ),
        child: Text(text, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, height: 1.4)),
      ),
    );
  }
}
