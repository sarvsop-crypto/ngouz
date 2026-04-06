import 'package:flutter/material.dart';

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
      icon: Icons.dashboard_outlined,
      page: CabinetDashboardPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetApplications,
      title: 'Arizalar',
      shortTitle: 'Ariza',
      icon: Icons.assignment_outlined,
      page: CabinetApplicationsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetDocuments,
      title: 'Hujjatlar',
      shortTitle: 'Docs',
      icon: Icons.folder_outlined,
      page: CabinetDocumentsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetGrants,
      title: 'Grantlar',
      shortTitle: 'Grant',
      icon: Icons.workspace_premium_outlined,
      page: CabinetGrantsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetSupport,
      title: 'Murojaat',
      shortTitle: 'Help',
      icon: Icons.support_agent_outlined,
      page: CabinetSupportPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetSettings,
      title: 'Sozlamalar',
      shortTitle: 'Set',
      icon: Icons.settings_outlined,
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
      appBar: AppBar(
        title: const Text('A\'zo Kabinet', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.of(context).pushReplacementNamed(AppRoutes.home),
            icon: const Icon(Icons.public, color: Colors.white),
            label: const Text('Sayt', style: TextStyle(color: Colors.white)),
          ),
          const SizedBox(width: AppSpace.sm),
        ],
      ),
      drawer: phone
          ? Drawer(
              child: SafeArea(
                child: ListView(
                  children: [
                    const ListTile(title: Text('Kabinet bo\'limlari', style: TextStyle(fontWeight: FontWeight.w700))),
                    const Divider(),
                    for (var i = 0; i < pages.length; i++)
                      ListTile(
                        leading: Icon(pages[i].icon),
                        title: Text(pages[i].title),
                        selected: i == _index,
                        onTap: () {
                          _selectIndex(i);
                          Navigator.pop(context);
                        },
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
