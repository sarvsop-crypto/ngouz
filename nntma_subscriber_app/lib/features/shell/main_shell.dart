import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../core/app_routes.dart';
import '../../core/app_tokens.dart';
import '../cabinet/pages/cabinet_applications_page.dart';
import '../cabinet/pages/cabinet_grants_page.dart';
import '../cabinet/pages/cabinet_settings_page.dart';
import '../pages/about_page.dart';
import '../pages/awards_page.dart';
import '../pages/contact_page.dart';
import '../pages/events_page.dart';
import '../pages/home_page.dart';
import '../pages/news_page.dart';
import '../pages/projects_page.dart';
import '../pages/services_page.dart';
import 'app_nav_item.dart';

class MainShell extends StatefulWidget {
  final String initialRoute;

  const MainShell({super.key, this.initialRoute = AppRoutes.home});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  static const pages = <AppNavItem>[
    AppNavItem(route: AppRoutes.home, title: 'Bosh sahifa', shortTitle: 'Bosh', icon: PhosphorIconsRegular.house, page: HomePage()),
    AppNavItem(route: AppRoutes.about, title: 'Biz haqimizda', shortTitle: 'About', icon: PhosphorIconsRegular.info, page: AboutPage()),
    AppNavItem(route: AppRoutes.projects, title: 'Loyihalar', shortTitle: 'Loyiha', icon: PhosphorIconsRegular.kanban, page: ProjectsPage()),
    AppNavItem(route: AppRoutes.news, title: 'Yangiliklar', shortTitle: 'Yangi', icon: PhosphorIconsRegular.newspaper, page: NewsPage()),
    AppNavItem(route: AppRoutes.events, title: 'Tadbirlar', shortTitle: 'Tadbir', icon: PhosphorIconsRegular.calendarDots, page: EventsPage()),
    AppNavItem(route: AppRoutes.services, title: 'Xizmatlar', shortTitle: 'Xizmat', icon: PhosphorIconsRegular.stack, page: ServicesPage()),
    AppNavItem(route: AppRoutes.awards, title: 'Mukofotlar', shortTitle: 'Award', icon: PhosphorIconsRegular.trophy, page: AwardsPage()),
    AppNavItem(route: AppRoutes.contact, title: 'Boglanish', shortTitle: 'Aloqa', icon: PhosphorIconsRegular.phoneCall, page: ContactPage()),
    AppNavItem(route: AppRoutes.cabinetApplications, title: 'Kabinet', shortTitle: 'Kabinet', icon: PhosphorIconsRegular.squaresFour, page: CabinetApplicationsPage()),
    AppNavItem(route: AppRoutes.cabinetGrants, title: 'Grantlar', shortTitle: 'Grant', icon: PhosphorIconsRegular.medal, page: CabinetGrantsPage()),
    AppNavItem(route: AppRoutes.cabinetSettings, title: 'Sozlamalar', shortTitle: 'Sozla', icon: PhosphorIconsRegular.gear, page: CabinetSettingsPage()),
  ];

  late int _index;
  bool _menuOpen = false;

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
    setState(() {
      _menuOpen = false;
      if (i != _index) {
        _index = i;
      }
    });

    final target = pages[i].route;
    final current = ModalRoute.of(context)?.settings.name;
    if (current != target) {
      Navigator.of(context).pushReplacementNamed(target);
    }
  }

  @override
  Widget build(BuildContext context) {
    final mobileNav = MediaQuery.sizeOf(context).width <= 900;

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            _BrandDot(),
            SizedBox(width: AppSpace.sm),
            Text('ngo.uz', style: TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        actions: mobileNav
            ? [
                IconButton(
                  onPressed: () => setState(() => _menuOpen = !_menuOpen),
                  icon: PhosphorIcon(_menuOpen ? PhosphorIconsRegular.x : PhosphorIconsRegular.list),
                  tooltip: 'Menu',
                ),
              ]
            : null,
        bottom: mobileNav
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(48),
                child: Container(
                  alignment: Alignment.centerLeft,
                  height: 48,
                  padding: const EdgeInsets.only(left: AppSpace.sm, right: AppSpace.sm, bottom: AppSpace.xs),
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: pages.length,
                    separatorBuilder: (_, index) => const SizedBox(width: AppSpace.xs),
                    itemBuilder: (context, i) {
                      final selected = i == _index;
                      final isCabinet = pages[i].route.startsWith('/cabinet');
                      return TextButton.icon(
                        onPressed: () => _selectIndex(i),
                        icon: PhosphorIcon(pages[i].icon, size: 16, color: selected ? Colors.white : AppTokens.textMuted),
                        label: Text(
                          isCabinet ? 'Kabinet - ${pages[i].shortTitle}' : pages[i].shortTitle,
                          style: TextStyle(color: selected ? Colors.white : AppTokens.textMuted, fontWeight: selected ? FontWeight.w700 : FontWeight.w500),
                        ),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
                          backgroundColor: selected ? AppTokens.primary : Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                      );
                    },
                  ),
                ),
              ),
      ),
      body: Stack(
        children: [
          pages[_index].page,
          if (mobileNav)
            _MobileOverlayMenu(
              open: _menuOpen,
              items: pages,
              activeIndex: _index,
              onClose: () => setState(() => _menuOpen = false),
              onSelect: _selectIndex,
            ),
        ],
      ),
    );
  }
}

class _MobileOverlayMenu extends StatelessWidget {
  final bool open;
  final List<AppNavItem> items;
  final int activeIndex;
  final VoidCallback onClose;
  final ValueChanged<int> onSelect;

  const _MobileOverlayMenu({
    required this.open,
    required this.items,
    required this.activeIndex,
    required this.onClose,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final panelWidth = width.clamp(280.0, 390.0) * 0.9;

    final siteItems = <int>[];
    final cabinetItems = <int>[];
    for (var i = 0; i < items.length; i++) {
      if (items[i].route.startsWith('/cabinet')) {
        cabinetItems.add(i);
      } else {
        siteItems.add(i);
      }
    }

    return IgnorePointer(
      ignoring: !open,
      child: Stack(
        children: [
          AnimatedOpacity(
            opacity: open ? 1 : 0,
            duration: const Duration(milliseconds: 180),
            child: GestureDetector(
              onTap: onClose,
              child: Container(color: const Color(0x66000000)),
            ),
          ),
          AnimatedPositioned(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            top: 0,
            bottom: 0,
            right: open ? 0 : -panelWidth - 24,
            child: Container(
              width: panelWidth,
              decoration: const BoxDecoration(
                color: AppTokens.bg,
                border: Border(left: BorderSide(color: AppTokens.border)),
                boxShadow: [BoxShadow(color: Color(0x22000000), blurRadius: 24, offset: Offset(-2, 0))],
              ),
              child: SafeArea(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(AppSpace.lg, AppSpace.lg, AppSpace.lg, AppSpace.xl),
                  children: [
                    const Text(
                      'Navigation',
                      style: TextStyle(color: AppTokens.textMuted, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: AppSpace.md),
                    for (final i in siteItems)
                      _OverlayMenuTile(
                        item: items[i],
                        selected: i == activeIndex,
                        onTap: () => onSelect(i),
                      ),
                    const SizedBox(height: AppSpace.lg),
                    const Divider(height: 1, color: AppTokens.border),
                    const SizedBox(height: AppSpace.lg),
                    const Text(
                      'Cabinet',
                      style: TextStyle(color: AppTokens.textMuted, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: AppSpace.md),
                    for (final i in cabinetItems)
                      _OverlayMenuTile(
                        item: items[i],
                        selected: i == activeIndex,
                        onTap: () => onSelect(i),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OverlayMenuTile extends StatelessWidget {
  final AppNavItem item;
  final bool selected;
  final VoidCallback onTap;

  const _OverlayMenuTile({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: selected ? AppTokens.primary : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: selected ? AppTokens.primary : AppTokens.border),
          ),
          child: Row(
            children: [
              Icon(
                item.icon,
                size: 18,
                color: selected ? Colors.white : AppTokens.primaryDark,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  item.title,
                  style: TextStyle(
                    color: selected ? Colors.white : AppTokens.text,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrandDot extends StatelessWidget {
  const _BrandDot();

  @override
  Widget build(BuildContext context) {
    return Container(
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
      child: const Text(
        'N',
        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800, height: 1),
      ),
    );
  }
}
