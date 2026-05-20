import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

import 'package:medicine_chat_mobile/features/chat/data/chat_api_service.dart';
import 'package:medicine_chat_mobile/features/chat/domain/chat_models.dart';
import 'package:medicine_chat_mobile/features/chat/presentation/pages/conversation_list_page.dart';
import 'package:medicine_chat_mobile/features/chat/presentation/providers/chat_notifier.dart';

// ─── Mocks ───────────────────────────────────────────────────────────────────

class MockChatApiService extends Mock implements ChatApiService {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

final _now = DateTime.now().toUtc();

List<Conversation> _buildConversations(int count) {
  return List.generate(
    count,
    (i) => Conversation(
      id: 'conv-$i',
      title: 'Conversa $i',
      summary: null,
      createdAt: _now,
      updatedAt: _now,
    ),
  );
}

/// Monta um ProviderScope substituindo [chatApiServiceProvider] pelo mock,
/// e injeta [ConversationListPage] dentro de um MaterialApp para testes.
Widget _buildWidget(MockChatApiService mockService) {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const ConversationListPage(),
      ),
      GoRoute(
        path: '/chat/:conversationId',
        builder: (context, state) => const Scaffold(body: Text('Chat Page')),
      ),
    ],
  );

  return ProviderScope(
    overrides: [
      chatApiServiceProvider.overrideWithValue(mockService),
    ],
    child: MaterialApp.router(
      routerConfig: router,
    ),
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

void main() {
  late MockChatApiService mockService;

  setUp(() {
    mockService = MockChatApiService();
  });

  group('ConversationListPage — estado vazio', () {
    testWidgets('exibe texto de encorajamento quando não há conversas', (tester) async {
      when(() => mockService.fetchConversations())
          .thenAnswer((_) async => []);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Nenhuma conversa ainda'), findsOneWidget);
      expect(find.text('Minhas Conversas'), findsOneWidget);
    });

    testWidgets('exibe botão "Nova Conversa" no estado vazio', (tester) async {
      when(() => mockService.fetchConversations())
          .thenAnswer((_) async => []);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Nova Conversa'), findsOneWidget);
    });
  });

  group('ConversationListPage — lista com itens', () {
    testWidgets('exibe os títulos das conversas quando há itens', (tester) async {
      final convs = _buildConversations(3);
      when(() => mockService.fetchConversations())
          .thenAnswer((_) async => convs);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Conversa 0'), findsOneWidget);
      expect(find.text('Conversa 1'), findsOneWidget);
      expect(find.text('Conversa 2'), findsOneWidget);
    });

    testWidgets('não exibe estado vazio quando há conversas', (tester) async {
      final convs = _buildConversations(2);
      when(() => mockService.fetchConversations())
          .thenAnswer((_) async => convs);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Nenhuma conversa ainda'), findsNothing);
    });

    testWidgets('exibe quantidade correta de itens na lista', (tester) async {
      final convs = _buildConversations(5);
      when(() => mockService.fetchConversations())
          .thenAnswer((_) async => convs);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      // Cada card tem um ícone de chevron que podemos contar
      expect(find.byIcon(Icons.chevron_right_rounded), findsNWidgets(5));
    });
  });

  group('ConversationListPage — estado de loading', () {
    testWidgets('exibe CircularProgressIndicator enquanto carrega', (tester) async {
      final completer = Completer<List<Conversation>>();
      when(() => mockService.fetchConversations())
          .thenAnswer((_) => completer.future);

      await tester.pumpWidget(_buildWidget(mockService));
      // pump sem settle para capturar o estado de loading
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });

  group('ConversationListPage — estado de erro', () {
    testWidgets('exibe mensagem de erro quando fetchConversations lança exceção', (tester) async {
      when(() => mockService.fetchConversations())
          .thenThrow(Exception('Sem conexão'));

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      // O texto de erro deve conter a mensagem da exceção
      expect(find.textContaining('Exception'), findsOneWidget);
    });

    testWidgets('exibe botão "Tentar novamente" no estado de erro', (tester) async {
      when(() => mockService.fetchConversations())
          .thenThrow(Exception('Erro de rede'));

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Tentar novamente'), findsOneWidget);
    });

    testWidgets('recarrega ao clicar em "Tentar novamente"', (tester) async {
      // Primeira chamada falha, segunda retorna dados
      int callCount = 0;
      when(() => mockService.fetchConversations()).thenAnswer((_) async {
        callCount++;
        if (callCount == 1) throw Exception('Erro temporário');
        return _buildConversations(1);
      });

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      // Clicar em "Tentar novamente"
      await tester.tap(find.text('Tentar novamente'));
      await tester.pumpAndSettle();

      expect(find.text('Conversa 0'), findsOneWidget);
      expect(callCount, equals(2));
    });
  });

  group('ConversationListPage — criar nova conversa', () {
    testWidgets('chama createConversation ao tocar no FAB', (tester) async {
      when(() => mockService.fetchConversations())
          .thenAnswer((_) async => []);
      when(() => mockService.createConversation(title: any(named: 'title')))
          .thenAnswer((_) async => Conversation(
                id: 'nova-conv',
                title: 'Nova Conversa',
                createdAt: _now,
                updatedAt: _now,
              ));

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Nova Conversa'));
      await tester.pumpAndSettle();

      verify(() => mockService.createConversation(title: any(named: 'title')))
          .called(1);
    });
  });
}
