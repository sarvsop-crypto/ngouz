import 'package:flutter/material.dart';

import '../../core/app_breakpoints.dart';
import '../../core/app_routes.dart';
import '../../core/app_tokens.dart';
import '../pages/about_page.dart';
import '../pages/contact_page.dart';
import '../pages/events_page.dart';
import '../pages/home_page.dart';
import '../pages/news_page.dart';
import '../pages/services_page.dart';
import 'app_drawer.dart';
import 'app_nav_item.dart';

class MainShell extends StatefulWidget {
  final String initialRoute;

  const MainShell({super.key, this.initialRoute = AppRoutes.home});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  static const pages = <AppNavItem>[
    AppNavItem(
      route: AppRoutes.home,
      title: 'Bosh sahifa',
      shortTitle: 'Bosh',
      icon: Icons.home_outlined,
      page: HomePage(),
    ),
    AppNavItem(
      route: AppRoutes.about,
      title: 'Biz haqimizda',
      shortTitle: 'Haqida',
      icon: Icons.info_outline,
      page: AboutPage(),
    ),
    AppNavItem(
      route: AppRoutes.news,
      title: 'Yangiliklar',
      shortTitle: 'News',
      icon: Icons.newspaper_outlined,
      page: NewsPage(),
    ),
    AppNavItem(
      route: AppRoutes.events,
      title: 'Tadbirlar',
      shortTitle: 'Event',
      icon: Icons.event_outlined,
      page: EventsPage(),
    ),
    AppNavItem(
      route: AppRoutes.services,
      title: 'Xizmatlar',
      shortTitle: 'Xizmat',
      icon: Icons.build_outlined,
      page: ServicesPage(),
    ),
    AppNavItem(
      route: AppRoutes.contact,
      title: 'Boglanish',
      shortTitle: 'Aloqa',
      icon: Icons.call_outlined,
      page: ContactPage(),
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
      appBar: AppBar(
        title: const Row(
          children: [
            _BrandDot(),
            SizedBox(width: AppSpace.sm),
            Text('ngo.uz', style: TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.of(context).pushReplacementNamed(AppRoutes.cabinetDashboard),
            icon: const Icon(Icons.dashboard_customize_outlined, color: Colors.white),
            label: const Text('Kabinet', style: TextStyle(color: Colors.white)),
          ),
          const SizedBox(width: AppSpace.sm),
        ],
      ),
      drawer: phone
          ? AppDrawer(
              items: pages,
              activeIndex: _index,
              onSelect: (i) {
                _selectIndex(i);
                Navigator.pop(context);
              },
            )
          : null,
      body: phone
          ? pages[_index].page
          : Row(
              children: [
                NavigationRail(
                  selectedIndex: _index,
                  extended: desktop,
                  minExtendedWidth: 220,
                  onDestinationSelected: _selectIndex,
                  labelType: desktop ? null : NavigationRailLabelType.selected,
                  destinations: [
                    for (final p in pages)
                      NavigationRailDestination(
                        icon: Icon(p.icon),
                        label: Text(p.title),
                      ),
                  ],
                ),
                const VerticalDivider(width: 1),
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
                    icon: Icon(p.icon),
                    label: p.shortTitle,
                  ),
              ],
            )
          : null,
    );
  }
}

class _BrandDot extends StatelessWidget {
  const _BrandDot();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      decoration: const BoxDecoration(color: AppTokens.primary, shape: BoxShape.circle),
      alignment: Alignment.center,
      child: const Text('NGO', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
    );
  }
}
