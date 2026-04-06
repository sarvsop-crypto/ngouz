import 'package:flutter/material.dart';

import 'core/app_routes.dart';
import 'core/app_theme.dart';
import 'features/cabinet/cabinet_shell.dart';
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
        AppRoutes.news: (_) => const MainShell(initialRoute: AppRoutes.news),
        AppRoutes.events: (_) => const MainShell(initialRoute: AppRoutes.events),
        AppRoutes.services: (_) => const MainShell(initialRoute: AppRoutes.services),
        AppRoutes.contact: (_) => const MainShell(initialRoute: AppRoutes.contact),
        AppRoutes.cabinetShell: (_) => const CabinetShell(initialRoute: AppRoutes.cabinetDashboard),
        AppRoutes.cabinetDashboard: (_) => const CabinetShell(initialRoute: AppRoutes.cabinetDashboard),
        AppRoutes.cabinetApplications: (_) => const CabinetShell(initialRoute: AppRoutes.cabinetApplications),
        AppRoutes.cabinetDocuments: (_) => const CabinetShell(initialRoute: AppRoutes.cabinetDocuments),
        AppRoutes.cabinetGrants: (_) => const CabinetShell(initialRoute: AppRoutes.cabinetGrants),
        AppRoutes.cabinetSupport: (_) => const CabinetShell(initialRoute: AppRoutes.cabinetSupport),
        AppRoutes.cabinetSettings: (_) => const CabinetShell(initialRoute: AppRoutes.cabinetSettings),
      },
      onUnknownRoute: (_) => MaterialPageRoute(
        builder: (_) => const MainShell(initialRoute: AppRoutes.home),
      ),
    );
  }
}
