// ignore_for_file: subtype_of_sealed_class

import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:medicine_chat_mobile/features/chat/data/chat_api_service.dart';
import 'package:medicine_chat_mobile/features/chat/domain/chat_models.dart';

// ─── Mocks ───────────────────────────────────────────────────────────────────

class MockDio extends Mock implements Dio {}

// Helper para criar Response fake do Dio
Response<dynamic> _fakeResponse(dynamic data, {int statusCode = 200}) {
  return Response(
    data: data,
    statusCode: statusCode,
    requestOptions: RequestOptions(path: ''),
  );
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

final _now = DateTime.now().toUtc();

final _convJson = {
  'id': 'conv-1',
  'title': 'Bula do Paracetamol',
  'summary': null,
  'created_at': _now.toIso8601String(),
  'updated_at': _now.toIso8601String(),
};

final _msgJson = {
  'id': 'msg-1',
  'conversation_id': 'conv-1',
  'role': 'assistant',
  'content': 'Olá! Como posso ajudar?',
  'created_at': _now.toIso8601String(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

void main() {
  late MockDio mockDio;
  late ChatApiService service;

  setUp(() {
    mockDio = MockDio();
    service = ChatApiService(mockDio);

    // Registrar fallbacks necessários para o mocktail
    registerFallbackValue(RequestOptions(path: ''));
    registerFallbackValue(Options());
  });

  group('ChatApiService.fetchConversations', () {
    test('retorna lista de Conversation quando o servidor responde 200', () async {
      when(() => mockDio.get(any())).thenAnswer(
        (_) async => _fakeResponse([_convJson]),
      );

      final result = await service.fetchConversations();

      expect(result, hasLength(1));
      expect(result.first.id, 'conv-1');
      expect(result.first.title, 'Bula do Paracetamol');
      verify(() => mockDio.get('/chat/conversations')).called(1);
    });

    test('retorna lista vazia quando o servidor responde com []', () async {
      when(() => mockDio.get(any())).thenAnswer(
        (_) async => _fakeResponse(<dynamic>[]),
      );

      final result = await service.fetchConversations();

      expect(result, isEmpty);
    });

    test('propaga DioException quando o servidor retorna erro', () async {
      when(() => mockDio.get(any())).thenThrow(
        DioException(
          requestOptions: RequestOptions(path: '/chat/conversations'),
          response: _fakeResponse({'detail': 'Unauthorized'}, statusCode: 401),
          type: DioExceptionType.badResponse,
        ),
      );

      expect(service.fetchConversations(), throwsA(isA<DioException>()));
    });
  });

  group('ChatApiService.createConversation', () {
    test('retorna Conversation criada com o título correto', () async {
      when(() => mockDio.post(any(), data: any(named: 'data'))).thenAnswer(
        (_) async => _fakeResponse(_convJson),
      );

      final result = await service.createConversation(title: 'Bula do Paracetamol');

      expect(result.id, 'conv-1');
      expect(result.title, 'Bula do Paracetamol');
      verify(() => mockDio.post(
            '/chat/conversations',
            data: {'title': 'Bula do Paracetamol'},
          )).called(1);
    });
  });

  group('ChatApiService.fetchMessages', () {
    test('retorna lista de ChatMessage quando o servidor responde 200', () async {
      when(() => mockDio.get(any())).thenAnswer(
        (_) async => _fakeResponse([_msgJson]),
      );

      final result = await service.fetchMessages('conv-1');

      expect(result, hasLength(1));
      expect(result.first.id, 'msg-1');
      expect(result.first.role, 'assistant');
      expect(result.first.isUser, isFalse);
      verify(() => mockDio.get('/chat/conversations/conv-1/messages')).called(1);
    });

    test('retorna lista vazia quando não há mensagens', () async {
      when(() => mockDio.get(any())).thenAnswer(
        (_) async => _fakeResponse(<dynamic>[]),
      );

      final result = await service.fetchMessages('conv-1');

      expect(result, isEmpty);
    });
  });

  group('ChatApiService.sendMessage', () {
    test('retorna a mensagem do assistente quando o envio tem sucesso', () async {
      when(() => mockDio.post(any(), data: any(named: 'data'))).thenAnswer(
        (_) async => _fakeResponse(_msgJson),
      );

      final result = await service.sendMessage('conv-1', 'Tenho febre há 2 dias');

      expect(result.role, 'assistant');
      expect(result.content, 'Olá! Como posso ajudar?');
      verify(() => mockDio.post(
            '/chat/conversations/conv-1/messages',
            data: {'message': 'Tenho febre há 2 dias'},
          )).called(1);
    });

    test('propaga DioException quando o envio falha', () async {
      when(() => mockDio.post(any(), data: any(named: 'data'))).thenThrow(
        DioException(
          requestOptions:
              RequestOptions(path: '/chat/conversations/conv-1/messages'),
          response: _fakeResponse({'detail': 'Server error'}, statusCode: 500),
          type: DioExceptionType.badResponse,
        ),
      );

      expect(
        service.sendMessage('conv-1', 'Tenho febre'),
        throwsA(isA<DioException>()),
      );
    });
  });

  group('ChatMessage.fromJson', () {
    test('isUser é true para role=user', () {
      final msg = ChatMessage.fromJson({
        'id': '1',
        'conversation_id': 'conv-1',
        'role': 'user',
        'content': 'Oi',
        'created_at': _now.toIso8601String(),
      });
      expect(msg.isUser, isTrue);
    });

    test('isUser é false para role=assistant', () {
      final msg = ChatMessage.fromJson(_msgJson);
      expect(msg.isUser, isFalse);
    });
  });

  group('Conversation.fromJson', () {
    test('parseia corretamente todos os campos', () {
      final conv = Conversation.fromJson(_convJson);
      expect(conv.id, 'conv-1');
      expect(conv.title, 'Bula do Paracetamol');
      expect(conv.summary, isNull);
      expect(conv.createdAt, isA<DateTime>());
    });
  });
}
