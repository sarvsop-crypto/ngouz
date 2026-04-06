import 'package:flutter_test/flutter_test.dart';
import 'package:nntma_subscriber_app/core/async_list_controller.dart';
import 'package:nntma_subscriber_app/core/load_state.dart';

void main() {
  test('loads data into ready state', () async {
    final controller = AsyncListController<int>(loader: () async => [1, 2, 3]);

    await controller.load();

    expect(controller.state, LoadState.ready);
    expect(controller.items, [1, 2, 3]);
    expect(controller.error, isNull);
  });

  test('sets empty state on empty list', () async {
    final controller = AsyncListController<int>(loader: () async => []);

    await controller.load();

    expect(controller.state, LoadState.empty);
    expect(controller.items, isEmpty);
    expect(controller.error, isNull);
  });

  test('sets error state when loader throws', () async {
    final controller = AsyncListController<int>(loader: () async {
      throw Exception('failed');
    });

    await controller.load();

    expect(controller.state, LoadState.error);
    expect(controller.items, isEmpty);
    expect(controller.error, isA<Exception>());
  });
}
