import 'package:flutter/material.dart';

import '../core/app_tokens.dart';

class KpiCard extends StatelessWidget {
  final String value;
  final String label;
  final bool compact;

  const KpiCard({
    super.key,
    required this.value,
    required this.label,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: '$label: $value',
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: compact ? AppSpace.sm : AppSpace.md,
          vertical: compact ? 10 : AppSpace.md,
        ),
        decoration: BoxDecoration(
          color: AppTokens.surface,
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          border: Border.all(color: AppTokens.border),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: compact ? 21 : 24,
                fontWeight: FontWeight.w700,
                color: AppTokens.primary,
                height: 1.1,
              ),
            ),
            SizedBox(height: compact ? 2 : 4),
            Text(
              label,
              maxLines: compact ? 1 : 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: compact ? 12.5 : 13,
                color: AppTokens.textMuted,
                height: 1.25,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class InfoCard extends StatelessWidget {
  final String title;
  final String description;
  final String? badge;

  const InfoCard({
    super.key,
    required this.title,
    required this.description,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: badge == null ? title : '$title, $badge',
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: 14),
        decoration: BoxDecoration(
          color: AppTokens.surface,
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          border: Border.all(color: AppTokens.border),
          boxShadow: const [AppTokens.cardShadow],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDFF5FB),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  badge!,
                  style: const TextStyle(fontSize: 12, color: AppTokens.primaryDark, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(height: AppSpace.sm),
            ],
            Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, height: 1.3)),
            const SizedBox(height: 5),
            Text(
              description,
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 13.5, color: AppTokens.textMuted, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}
