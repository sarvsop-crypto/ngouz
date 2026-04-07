import 'package:flutter/material.dart';

import '../../core/app_tokens.dart';
import 'app_nav_item.dart';

class AppDrawer extends StatelessWidget {
  final List<AppNavItem> items;
  final int activeIndex;
  final ValueChanged<int> onSelect;

  const AppDrawer({
    super.key,
    required this.items,
    required this.activeIndex,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final siteItems = <int>[];
    final cabinetItems = <int>[];
    for (var i = 0; i < items.length; i++) {
      if (items[i].route.startsWith('/cabinet')) {
        cabinetItems.add(i);
      } else {
        siteItems.add(i);
      }
    }

    return Drawer(
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: AppSpace.md),
          children: [
            const ListTile(
              title: Text("NNTMA ilovasi", style: TextStyle(fontWeight: FontWeight.w700)),
              subtitle: Text('OZNNTMA ilovasi'),
            ),
            const Divider(height: AppSpace.xl),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: AppSpace.lg),
              child: Text('Sayt bolimlari', style: TextStyle(fontSize: 12, color: AppTokens.textMuted, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: AppSpace.sm),
            for (final i in siteItems)
              ListTile(
                leading: Icon(items[i].icon),
                title: Text(items[i].title),
                selected: i == activeIndex,
                selectedTileColor: const Color(0xFFE7F7FB),
                onTap: () {
                  Navigator.of(context).pop();
                  onSelect(i);
                },
              ),
            const Divider(height: AppSpace.xl),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: AppSpace.lg),
              child: Text("Azolar kabineti", style: TextStyle(fontSize: 12, color: AppTokens.textMuted, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: AppSpace.sm),
            for (final i in cabinetItems)
              ListTile(
                leading: Icon(items[i].icon),
                title: Text(items[i].title),
                selected: i == activeIndex,
                selectedTileColor: const Color(0xFFE7F7FB),
                onTap: () {
                  Navigator.of(context).pop();
                  onSelect(i);
                },
              ),
          ],
        ),
      ),
    );
  }
}
