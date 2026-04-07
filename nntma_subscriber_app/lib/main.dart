import 'package:flutter/material.dart';

import 'core/app_routes.dart';
import 'core/app_theme.dart';
import 'features/pages/not_found_page.dart';
import 'features/shell/main_shell.dart';

void main() => runApp(const NgoApp());

class NgoApp extends StatelessWidget {
  const NgoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'ngo.uz',
      theme: buildAppTheme(),
      initialRoute: AppRoutes.home,
      routes: {
        AppRoutes.shell: (_) => const MainShell(initialRoute: AppRoutes.home),
        AppRoutes.home: (_) => const MainShell(initialRoute: AppRoutes.home),
        AppRoutes.about: (_) => const MainShell(initialRoute: AppRoutes.about),
        AppRoutes.projects: (_) => const MainShell(initialRoute: AppRoutes.projects),
        AppRoutes.news: (_) => const MainShell(initialRoute: AppRoutes.news),
        AppRoutes.events: (_) => const MainShell(initialRoute: AppRoutes.events),
        AppRoutes.services: (_) => const MainShell(initialRoute: AppRoutes.services),
        AppRoutes.awards: (_) => const MainShell(initialRoute: AppRoutes.awards),
        AppRoutes.contact: (_) => const MainShell(initialRoute: AppRoutes.contact),
        AppRoutes.notFound: (_) => const NotFoundPage(),
        AppRoutes.cabinetShell: (_) => const MainShell(initialRoute: AppRoutes.cabinetDashboard),
        AppRoutes.cabinetDashboard: (_) => const MainShell(initialRoute: AppRoutes.cabinetDashboard),
        AppRoutes.cabinetApplications: (_) => const MainShell(initialRoute: AppRoutes.cabinetApplications),
        AppRoutes.cabinetDocuments: (_) => const MainShell(initialRoute: AppRoutes.cabinetDocuments),
        AppRoutes.cabinetGrants: (_) => const MainShell(initialRoute: AppRoutes.cabinetGrants),
        AppRoutes.cabinetSupport: (_) => const MainShell(initialRoute: AppRoutes.cabinetSupport),
        AppRoutes.cabinetSettings: (_) => const MainShell(initialRoute: AppRoutes.cabinetSettings),
      },
      onUnknownRoute: (_) => MaterialPageRoute(
        builder: (_) => const NotFoundPage(),
      ),
    );
  }
}
