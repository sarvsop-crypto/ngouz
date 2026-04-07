import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../core/app_breakpoints.dart';
import '../../core/app_routes.dart';
import '../../core/app_tokens.dart';
import '../shell/app_nav_item.dart';
import 'pages/cabinet_applications_page.dart';
import 'pages/cabinet_dashboard_page.dart';
import 'pages/cabinet_documents_page.dart';
import 'pages/cabinet_grants_page.dart';
import 'pages/cabinet_settings_page.dart';
import 'pages/cabinet_support_page.dart';

class CabinetShell extends StatefulWidget {
  final String initialRoute;
  const CabinetShell({super.key, this.initialRoute = AppRoutes.cabinetDashboard});

  @override
  State<CabinetShell> createState() => _CabinetShellState();
}

class _CabinetShellState extends State<CabinetShell> {
  static const pages = <AppNavItem>[
    AppNavItem(
      route: AppRoutes.cabinetDashboard,
      title: 'Dashboard',
      shortTitle: 'Dash',
      icon: PhosphorIconsRegular.squaresFour,
      page: CabinetDashboardPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetApplications,
      title: 'Arizalar',
      shortTitle: 'Ariza',
      icon: PhosphorIconsRegular.clipboardText,
      page: CabinetApplicationsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetDocuments,
      title: 'Hujjatlar',
      shortTitle: 'Docs',
      icon: PhosphorIconsRegular.folder,
      page: CabinetDocumentsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetGrants,
      title: 'Grantlar',
      shortTitle: 'Grant',
      icon: PhosphorIconsRegular.medal,
      page: CabinetGrantsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetSupport,
      title: 'Murojaat',
      shortTitle: 'Help',
      icon: PhosphorIconsRegular.headset,
      page: CabinetSupportPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetSettings,
      title: 'Sozlamalar',
      shortTitle: 'Set',
      icon: PhosphorIconsRegular.gear,
      page: CabinetSettingsPage(),
    ),
  ];

  late int _index;

  @override
  void initState() {
    super.initState();
    _index = _routeToIndex(widget.initialRoute);
  }

  int _routeToIndex(String route) {
    final idx = pages.indexWhere((p) => p.route == route);
    return idx == -1 ? 0 : idx;
  }

  void _selectIndex(int i) {
    if (i == _index) return;
    setState(() => _index = i);

    final target = pages[i].route;
    final current = ModalRoute.of(context)?.settings.name;
    if (current != target) {
      Navigator.of(context).pushReplacementNamed(target);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bp = breakpointOf(MediaQuery.sizeOf(context).width);
    final phone = bp == AppBreakpoint.phone;
    final desktop = bp == AppBreakpoint.desktop;

    return Scaffold(
      appBar: _CabinetTopBar(
        onGoToSite: () => Navigator.of(context).pushReplacementNamed(AppRoutes.home),
      ),
      drawer: phone
          ? Drawer(
              child: SafeArea(
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      color: AppTokens.navy,
                      padding: const EdgeInsets.fromLTRB(AppSpace.lg, AppSpace.md, AppSpace.lg, AppSpace.md),
                      child: const Row(
                        children: [
                          PhosphorIcon(PhosphorIconsRegular.squaresFour, color: AppTokens.primary, size: 18),
                          SizedBox(width: AppSpace.sm),
                          Text(
                            "A'zo Kabinet",
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.only(top: AppSpace.sm),
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(AppSpace.lg, AppSpace.sm, AppSpace.lg, AppSpace.xs),
                            child: Text(
                              'MENYU',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTokens.textMuted,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                          for (var i = 0; i < pages.length; i++)
                            ListTile(
                              dense: true,
                              selected: i == _index,
                              selectedTileColor: const Color(0xFFE0F7FC),
                              selectedColor: AppTokens.primaryDark,
                              leading: PhosphorIcon(pages[i].icon, size: 18),
                              title: Text(
                                pages[i].title,
                                style: TextStyle(
                                  fontWeight: i == _index ? FontWeight.w700 : FontWeight.w500,
                                ),
                              ),
                              onTap: () {
                                _selectIndex(i);
                                Navigator.pop(context);
                              },
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            )
          : null,
      body: phone
          ? pages[_index].page
          : Row(
              children: [
                NavigationRail(
                  backgroundColor: AppTokens.navy,
                  selectedIndex: _index,
                  extended: desktop,
                  minExtendedWidth: 220,
                  onDestinationSelected: _selectIndex,
                  labelType: desktop ? null : NavigationRailLabelType.selected,
                  selectedIconTheme: const IconThemeData(color: Colors.white),
                  unselectedIconTheme: const IconThemeData(color: Color(0xFF7CA1B5)),
                  selectedLabelTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                  unselectedLabelTextStyle: const TextStyle(color: Color(0xFF7CA1B5), fontSize: 13),
                  indicatorColor: const Color(0x4000B4D8),
                  destinations: [
                    for (final p in pages)
                      NavigationRailDestination(
                        icon: PhosphorIcon(p.icon),
                        label: Text(p.title),
                      ),
                  ],
                ),
                const VerticalDivider(width: 1, color: Color(0xFF1A3045)),
                Expanded(child: pages[_index].page),
              ],
            ),
      bottomNavigationBar: phone
          ? NavigationBar(
              selectedIndex: _index,
              onDestinationSelected: _selectIndex,
              destinations: [
                for (final p in pages)
                  NavigationDestination(
                    icon: PhosphorIcon(p.icon),
                    label: p.shortTitle,
                  ),
              ],
            )
          : null,
    );
  }
}

class _CabinetTopBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback onGoToSite;
  const _CabinetTopBar({required this.onGoToSite});

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56 + MediaQuery.paddingOf(context).top,
      decoration: const BoxDecoration(
        color: AppTokens.navy,
        border: Border(bottom: BorderSide(color: Color(0xFF1A3045))),
      ),
      padding: EdgeInsets.only(top: MediaQuery.paddingOf(context).top),
      child: Row(
        children: [
          const SizedBox(width: AppSpace.lg),
          // Brand
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTokens.primary, AppTokens.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: const Text('N', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800, height: 1)),
          ),
          const SizedBox(width: AppSpace.sm),
          const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("A'zo Kabinet", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14, height: 1.1)),
              Text('nntma.uz', style: TextStyle(color: Color(0xFF4A7A90), fontSize: 11, height: 1.1)),
            ],
          ),
          const Spacer(),
          // Notification bell
          _NotifButton(),
          const SizedBox(width: AppSpace.xs),
          // User avatar
          const _UserAvatar(initials: 'SK', name: 'Sanjar Kamolov'),
          const SizedBox(width: AppSpace.md),
          // Divider
          Container(width: 1, height: 24, color: const Color(0xFF1A3045)),
          const SizedBox(width: AppSpace.md),
          // Back to site
          GestureDetector(
            onTap: onGoToSite,
            child: const Row(
              children: [
                PhosphorIcon(PhosphorIconsRegular.arrowLeft, size: 14, color: Color(0xFF4A7A90)),
                SizedBox(width: 4),
                Text('Saytga', style: TextStyle(color: Color(0xFF4A7A90), fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(width: AppSpace.lg),
        ],
      ),
    );
  }
}

class _NotifButton extends StatefulWidget {
  const _NotifButton();

  @override
  State<_NotifButton> createState() => _NotifButtonState();
}

class _NotifButtonState extends State<_NotifButton> {
  final _key = GlobalKey();
  bool _open = false;

  static const _notifs = [
    ('Hujjat tekshiruvdan otdi', '2 daqiqa oldin'),
    ('Yangi ariza holati', '1 soat oldin'),
    ('Muddat eslatmasi: 10.04.2026', 'Bugun'),
  ];

  void _toggle() {
    if (_open) {
      setState(() => _open = false);
      return;
    }
    final box = _key.currentContext?.findRenderObject() as RenderBox?;
    if (box == null) return;
    final offset = box.localToGlobal(Offset.zero);
    setState(() => _open = true);

    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: '',
      barrierColor: Colors.transparent,
      transitionDuration: const Duration(milliseconds: 160),
      transitionBuilder: (ctx, a1, a2, child) => FadeTransition(
        opacity: CurvedAnimation(parent: a1, curve: Curves.easeOut),
        child: SlideTransition(
          position: Tween<Offset>(begin: const Offset(0, -0.04), end: Offset.zero).animate(CurvedAnimation(parent: a1, curve: Curves.easeOut)),
          child: child,
        ),
      ),
      pageBuilder: (ctx, a, b) {
        return Stack(
          children: [
            Positioned(
              top: offset.dy + box.size.height + 6,
              right: MediaQuery.sizeOf(ctx).width - offset.dx - box.size.width,
              child: Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                elevation: 0,
                child: Container(
                  width: 300,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                    border: Border.all(color: AppTokens.border),
                    boxShadow: AppTokens.cardShadows,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(AppSpace.lg, AppSpace.md, AppSpace.lg, AppSpace.sm),
                        child: Row(
                          children: [
                            const Text('Bildirishnomalar', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(color: AppTokens.primary.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                              child: const Text('3 yangi', style: TextStyle(fontSize: 11, color: AppTokens.primaryDark, fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      for (final n in _notifs) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg, vertical: AppSpace.md),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                margin: const EdgeInsets.only(top: 5),
                                decoration: const BoxDecoration(color: AppTokens.primary, shape: BoxShape.circle),
                              ),
                              const SizedBox(width: AppSpace.sm),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(n.$1, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, height: 1.3)),
                                    const SizedBox(height: 2),
                                    Text(n.$2, style: const TextStyle(fontSize: 11, color: AppTokens.textMuted)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (n != _notifs.last) const Divider(height: 1, indent: AppSpace.lg + AppSpace.sm + 7),
                      ],
                      const Divider(height: 1),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: AppSpace.sm),
                        child: Center(
                          child: TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Barchasini korish', style: TextStyle(fontSize: 13)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    ).then((_) => setState(() => _open = false));
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      key: _key,
      onTap: _toggle,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: _open ? const Color(0xFF0E2035) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            const PhosphorIcon(PhosphorIconsRegular.bell, size: 18, color: Color(0xFF8AAFC4)),
            Positioned(
              top: -3,
              right: -3,
              child: Container(
                width: 14,
                height: 14,
                decoration: const BoxDecoration(color: AppTokens.primary, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: const Text('3', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800, height: 1)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UserAvatar extends StatelessWidget {
  final String initials;
  final String name;
  const _UserAvatar({required this.initials, required this.name});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0EA5C9), AppTokens.primaryDark],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF1A3045), width: 2),
          ),
          alignment: Alignment.center,
          child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800, height: 1)),
        ),
        const SizedBox(width: AppSpace.sm),
        Text(name, style: const TextStyle(color: Color(0xFF8AAFC4), fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
