// Smoke test: verifica que o app sobe sem erros.
// A navegação real requer backend, portanto este teste apenas valida
// que o widget MyApp pode ser construído com um ProviderScope.
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';

import 'package:medicine_chat_mobile/main.dart';

void main() {
  testWidgets('MyApp constrói sem erros', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MyApp(),
      ),
    );
    // A primeira tela deve ser construída sem exceções
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
