import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/chat_models.dart';
import '../../auth/data/auth_repository.dart';

/// Provider do ChatApiService, reutilizando o Dio já configurado com interceptors de auth.
final chatApiServiceProvider = Provider<ChatApiService>((ref) {
  return ChatApiService(ref.watch(dioProvider));
});

/// Serviço responsável por toda comunicação com os endpoints de chat do backend.
class ChatApiService {
  final Dio _dio;

  ChatApiService(this._dio);

  /// Busca a lista de conversas do usuário autenticado.
  Future<List<Conversation>> fetchConversations() async {
    final response = await _dio.get('/chat/conversations');
    final List<dynamic> data = response.data as List<dynamic>;
    return data
        .map((json) => Conversation.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Cria uma nova conversa com o título fornecido.
  Future<Conversation> createConversation({String title = 'Nova Conversa'}) async {
    final response = await _dio.post(
      '/chat/conversations',
      data: {'title': title},
    );
    return Conversation.fromJson(response.data as Map<String, dynamic>);
  }

  /// Busca as mensagens de uma conversa específica pelo ID.
  Future<List<ChatMessage>> fetchMessages(String conversationId) async {
    final response = await _dio.get('/chat/conversations/$conversationId/messages');
    final List<dynamic> data = response.data as List<dynamic>;
    return data
        .map((json) => ChatMessage.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Envia uma mensagem para uma conversa e retorna a resposta da IA.
  Future<ChatMessage> sendMessage(String conversationId, String message) async {
    final response = await _dio.post(
      '/chat/conversations/$conversationId/messages',
      data: {'content': message},
    );
    return ChatMessage.fromJson(response.data as Map<String, dynamic>);
  }
}
