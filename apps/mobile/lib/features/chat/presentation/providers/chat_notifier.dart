import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/chat_api_service.dart';
import '../../domain/chat_models.dart';

// ============================================================
// Conversations State & Notifier
// ============================================================

class ConversationsState {
  final List<Conversation> conversations;
  final bool isLoading;
  final String? error;

  const ConversationsState({
    this.conversations = const [],
    this.isLoading = false,
    this.error,
  });

  ConversationsState copyWith({
    List<Conversation>? conversations,
    bool? isLoading,
    String? error,
  }) {
    return ConversationsState(
      conversations: conversations ?? this.conversations,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

final conversationsProvider =
    StateNotifierProvider<ConversationsNotifier, ConversationsState>((ref) {
  return ConversationsNotifier(ref.watch(chatApiServiceProvider));
});

class ConversationsNotifier extends StateNotifier<ConversationsState> {
  final ChatApiService _api;

  ConversationsNotifier(this._api) : super(const ConversationsState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await _api.fetchConversations();
      state = state.copyWith(conversations: list, isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['detail']?.toString() ??
            'Erro ao carregar conversas',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<Conversation?> create({String title = 'Nova Conversa'}) async {
    try {
      final conv = await _api.createConversation(title: title);
      state = state.copyWith(
        conversations: [conv, ...state.conversations],
      );
      return conv;
    } on DioException catch (e) {
      state = state.copyWith(
        error: e.response?.data?['detail']?.toString() ??
            'Erro ao criar conversa',
      );
      return null;
    }
  }
}

// ============================================================
// Messages State & Notifier
// ============================================================

class MessagesState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final bool isSending;
  final String? error;

  const MessagesState({
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
    this.error,
  });

  MessagesState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? isSending,
    String? error,
  }) {
    return MessagesState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      error: error,
    );
  }
}

/// Provider parametrizado por conversation ID.
final messagesProvider = StateNotifierProvider.family<MessagesNotifier,
    MessagesState, String>((ref, conversationId) {
  return MessagesNotifier(ref.watch(chatApiServiceProvider), conversationId);
});

class MessagesNotifier extends StateNotifier<MessagesState> {
  final ChatApiService _api;
  final String _conversationId;

  MessagesNotifier(this._api, this._conversationId)
      : super(const MessagesState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final msgs = await _api.fetchMessages(_conversationId);
      state = state.copyWith(messages: msgs, isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['detail']?.toString() ??
            'Erro ao carregar mensagens',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> send(String text) async {
    if (text.trim().isEmpty) return;

    // Otimistic UI: adicionar mensagem do usuário imediatamente
    final optimisticMsg = ChatMessage(
      id: 'pending-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: _conversationId,
      role: 'user',
      content: text,
      createdAt: DateTime.now(),
    );

    state = state.copyWith(
      messages: [...state.messages, optimisticMsg],
      isSending: true,
      error: null,
    );

    try {
      // O backend persiste a msg do usuário e retorna a resposta da IA.
      // Recarregamos o histórico completo para refletir exatamente o que o servidor gravou.
      await _api.sendMessage(_conversationId, text);
      await load();
      // Garantir que isSending volta para false após sucesso
      state = state.copyWith(isSending: false);
    } on DioException catch (e) {
      // Remover mensagem otimista em caso de erro
      state = state.copyWith(
        messages:
            state.messages.where((m) => m.id != optimisticMsg.id).toList(),
        isSending: false,
        error: e.response?.data?['detail']?.toString() ??
            'Erro ao enviar mensagem',
      );
    } catch (e) {
      state = state.copyWith(
        messages:
            state.messages.where((m) => m.id != optimisticMsg.id).toList(),
        isSending: false,
        error: e.toString(),
      );
    }
  }
}
