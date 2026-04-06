import 'package:flutter/material.dart';

import '../../core/app_routes.dart';
import '../../core/app_tokens.dart';
import '../cabinet/pages/cabinet_applications_page.dart';
import '../cabinet/pages/cabinet_dashboard_page.dart';
import '../cabinet/pages/cabinet_documents_page.dart';
import '../cabinet/pages/cabinet_grants_page.dart';
import '../cabinet/pages/cabinet_settings_page.dart';
import '../cabinet/pages/cabinet_support_page.dart';
import '../pages/about_page.dart';
import '../pages/contact_page.dart';
import '../pages/events_page.dart';
import '../pages/home_page.dart';
import '../pages/news_page.dart';
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
    AppNavItem(
      route: AppRoutes.cabinetDashboard,
      title: 'Kabinet boshqaruvi',
      shortTitle: 'Kabinet',
      icon: Icons.dashboard_customize_outlined,
      page: CabinetDashboardPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetApplications,
      title: 'Murojaatlarim',
      shortTitle: 'Ariza',
      icon: Icons.assignment_outlined,
      page: CabinetApplicationsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetDocuments,
      title: 'Hujjatlar',
      shortTitle: 'Hujjat',
      icon: Icons.folder_open_outlined,
      page: CabinetDocumentsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetGrants,
      title: 'Grantlar',
      shortTitle: 'Grant',
      icon: Icons.volunteer_activism_outlined,
      page: CabinetGrantsPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetSupport,
      title: 'Boglanish va murojaat',
      shortTitle: 'Yordam',
      icon: Icons.support_agent_outlined,
      page: CabinetSupportPage(),
    ),
    AppNavItem(
      route: AppRoutes.cabinetSettings,
      title: 'Profil sozlamalari',
      shortTitle: 'Profil',
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
    final wide = MediaQuery.sizeOf(context).width >= 1080;

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
          if (wide)
            for (var i = 0; i < pages.length; i++)
              if (!pages[i].route.startsWith('/cabinet') && i < 6)
                TextButton(
                  onPressed: () => _selectIndex(i),
                  child: Text(
                    pages[i].shortTitle,
                    style: TextStyle(
                      color: i == _index ? Colors.white : const Color(0xFFB8CCD8),
                      fontWeight: i == _index ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
          PopupMenuButton<int>(
            tooltip: 'Bolimlar',
            icon: const Icon(Icons.menu),
            onSelected: _selectIndex,
            itemBuilder: (context) => [
              const PopupMenuItem<int>(enabled: false, value: -1, child: Text('Sayt bolimlari')),
              for (var i = 0; i < pages.length; i++)
                if (!pages[i].route.startsWith('/cabinet'))
                  PopupMenuItem<int>(
                    value: i,
                    child: Row(
                      children: [
                        Icon(pages[i].icon, size: 18),
                        const SizedBox(width: AppSpace.sm),
                        Expanded(child: Text(pages[i].title)),
                        if (i == _index) const Icon(Icons.check, size: 16, color: AppTokens.primaryDark),
                      ],
                    ),
                  ),
              const PopupMenuDivider(),
              const PopupMenuItem<int>(enabled: false, value: -2, child: Text("Azolar kabineti")),
              for (var i = 0; i < pages.length; i++)
                if (pages[i].route.startsWith('/cabinet'))
                  PopupMenuItem<int>(
                    value: i,
                    child: Row(
                      children: [
                        Icon(pages[i].icon, size: 18),
                        const SizedBox(width: AppSpace.sm),
                        Expanded(child: Text(pages[i].title)),
                        if (i == _index) const Icon(Icons.check, size: 16, color: AppTokens.primaryDark),
                      ],
                    ),
                  ),
            ],
          ),
          const SizedBox(width: AppSpace.sm),
        ],
      ),
      body: pages[_index].page,
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
