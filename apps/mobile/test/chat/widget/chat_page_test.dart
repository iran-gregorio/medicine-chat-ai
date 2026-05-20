import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

import 'package:medicine_chat_mobile/features/chat/data/chat_api_service.dart';
import 'package:medicine_chat_mobile/features/chat/domain/chat_models.dart';
import 'package:medicine_chat_mobile/features/chat/presentation/pages/chat_page.dart';
import 'package:medicine_chat_mobile/features/chat/presentation/providers/chat_notifier.dart';

// ─── Mocks ───────────────────────────────────────────────────────────────────

class MockChatApiService extends Mock implements ChatApiService {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const _convId = 'conv-abc';
final _now = DateTime.now().toUtc();

ChatMessage _userMsg(String text) => ChatMessage(
      id: 'u-${text.hashCode}',
      conversationId: _convId,
      role: 'user',
      content: text,
      createdAt: _now,
    );

ChatMessage _aiMsg(String text) => ChatMessage(
      id: 'a-${text.hashCode}',
      conversationId: _convId,
      role: 'assistant',
      content: text,
      createdAt: _now,
    );

/// Monta um ProviderScope substituindo [chatApiServiceProvider] pelo mock,
/// e injeta [ChatPage] dentro de um MaterialApp para testes.
Widget _buildWidget(MockChatApiService mockService) {
  final router = GoRouter(
    initialLocation: '/chat/$_convId',
    routes: [
      GoRoute(
        path: '/conversations',
        builder: (context, state) => const Scaffold(body: Text('Conversations Page')),
      ),
      GoRoute(
        path: '/chat/:conversationId',
        builder: (context, state) {
          final id = state.pathParameters['conversationId'] ?? '';
          return ChatPage(conversationId: id);
        },
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

  group('ChatPage — estado vazio (sem mensagens)', () {
    testWidgets('exibe mensagem encorajadora quando não há histórico', (tester) async {
      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => []);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Comece a conversa!'), findsOneWidget);
    });

    testWidgets('exibe campo de texto e botão de envio', (tester) async {
      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => []);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.byType(TextField), findsOneWidget);
      expect(find.byIcon(Icons.arrow_upward_rounded), findsOneWidget);
    });
  });

  group('ChatPage — exibição de mensagens', () {
    testWidgets('renderiza mensagens do usuário e da IA', (tester) async {
      when(() => mockService.fetchMessages(_convId)).thenAnswer(
        (_) async => [
          _userMsg('Tenho febre alta'),
          _aiMsg('Entendo. Há quanto tempo você tem febre?'),
        ],
      );

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Tenho febre alta'), findsOneWidget);
      expect(find.text('Entendo. Há quanto tempo você tem febre?'), findsOneWidget);
    });

    testWidgets('exibe rótulo "Você" para mensagens do usuário', (tester) async {
      when(() => mockService.fetchMessages(_convId)).thenAnswer(
        (_) async => [_userMsg('Olá')],
      );

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('Você'), findsOneWidget);
    });

    testWidgets('exibe rótulo "MediCare AI" para mensagens da IA', (tester) async {
      when(() => mockService.fetchMessages(_convId)).thenAnswer(
        (_) async => [_aiMsg('Como posso ajudar?')],
      );

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      expect(find.text('MediCare AI'), findsAtLeastNWidgets(1));
    });
  });

  group('ChatPage — estado de loading', () {
    testWidgets('exibe CircularProgressIndicator ao carregar histórico', (tester) async {
      final completer = Completer<List<ChatMessage>>();
      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) => completer.future);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pump(); // sem settle para capturar loading

      expect(find.byType(CircularProgressIndicator), findsAtLeastNWidgets(1));
    });
  });

  group('ChatPage — envio de mensagem', () {
    testWidgets('envia mensagem e exibe resposta da IA', (tester) async {
      final messages = <ChatMessage>[];

      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => List.from(messages));

      when(() => mockService.sendMessage(_convId, any())).thenAnswer((inv) async {
        final text = inv.positionalArguments[1] as String;
        messages
          ..add(_userMsg(text))
          ..add(_aiMsg('Resposta da IA para: $text'));
        return _aiMsg('Resposta da IA para: $text');
      });

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      // Digitar mensagem
      await tester.enterText(find.byType(TextField), 'Tenho dor de cabeça');
      await tester.pumpAndSettle();

      // Enviar tocando no botão
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pumpAndSettle();

      verify(() => mockService.sendMessage(_convId, 'Tenho dor de cabeça')).called(1);
    });

    testWidgets('campo de texto fica habilitado após envio bem-sucedido', (tester) async {
      final messages = [_aiMsg('Olá! Como posso ajudar?')];

      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => List.from(messages));

      when(() => mockService.sendMessage(_convId, any())).thenAnswer((inv) async {
        return _aiMsg('Resposta');
      });

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'Oi');
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pumpAndSettle();

      final tf = tester.widget<TextField>(find.byType(TextField));
      expect(tf.enabled, isTrue, reason: 'TextField deve estar habilitado após envio');
    });

    testWidgets('não envia mensagem vazia', (tester) async {
      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => []);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      // Tentar enviar sem texto
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pumpAndSettle();

      verifyNever(() => mockService.sendMessage(any(), any()));
    });
  });

  group('ChatPage — erro de rede', () {
    testWidgets('exibe banner de erro quando o envio falha', (tester) async {
      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => []);

      when(() => mockService.sendMessage(_convId, any()))
          .thenThrow(Exception('Sem conexão com o servidor'));

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'Mensagem de teste');
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pumpAndSettle();

      // O banner de erro deve aparecer no topo
      expect(find.byIcon(Icons.error_outline_rounded), findsOneWidget);
    });

    testWidgets('remove mensagem otimista do estado quando o envio falha', (tester) async {
      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => []);

      when(() => mockService.sendMessage(_convId, any()))
          .thenThrow(Exception('Erro de rede'));

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'Mensagem que vai falhar');
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pumpAndSettle();

      // A mensagem otimista deve ter sido removida do display
      expect(find.text('Mensagem que vai falhar'), findsNothing);
    });
  });

  group('ChatPage — appBar', () {
    testWidgets('exibe título "MediCare AI" na AppBar', (tester) async {
      when(() => mockService.fetchMessages(_convId))
          .thenAnswer((_) async => []);

      await tester.pumpWidget(_buildWidget(mockService));
      await tester.pumpAndSettle();

      // AppBar tem título MediCare AI e indicador Online
      expect(find.text('MediCare AI'), findsAtLeastNWidgets(1));
      expect(find.text('Online'), findsOneWidget);
    });
  });
}
