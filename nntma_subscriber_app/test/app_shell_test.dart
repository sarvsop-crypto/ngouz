import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nntma_subscriber_app/data/content_repository.dart';
import 'package:nntma_subscriber_app/main.dart';

void main() {
  setUp(() {
    contentRepository = MockContentRepository(delay: Duration.zero);
  });

  testWidgets('renders ngo.uz shell', (tester) async {
    await tester.pumpWidget(const NgoApp());
    await tester.pumpAndSettle();
    expect(find.text('ngo.uz'), findsOneWidget);
    expect(find.byType(AppBar), findsOneWidget);
  });

  testWidgets('uses top-only navigation on wide screens', (tester) async {
    tester.view.physicalSize = const Size(1600, 1000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const NgoApp());
    await tester.pumpAndSettle();

    expect(find.byType(NavigationRail), findsNothing);
    expect(find.byType(NavigationBar), findsNothing);
    expect(find.byType(Drawer), findsNothing);
    expect(find.byIcon(Icons.menu), findsOneWidget);
  });
}
