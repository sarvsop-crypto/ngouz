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
    final shellRoutes = <String, WidgetBuilder>{
      for (final route in AppRoutes.shellRoutes)
        route: (_) => MainShell(initialRoute: route),
    };

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'ngo.uz',
      theme: buildAppTheme(),
      initialRoute: AppRoutes.home,
      routes: {
        AppRoutes.shell: (_) => const MainShell(initialRoute: AppRoutes.home),
        ...shellRoutes,
        AppRoutes.notFound: (_) => const NotFoundPage(),
        AppRoutes.cabinetShell: (_) => const MainShell(initialRoute: AppRoutes.cabinetDashboard),
      },
      onUnknownRoute: (_) => MaterialPageRoute(
        builder: (_) => const NotFoundPage(),
      ),
    );
  }
}
