import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/chat_api_service.dart';
import '../../domain/chat_models.dart';

String _extractErrorMessage(DioException e, String defaultMessage) {
  final data = e.response?.data;
  if (data is Map<String, dynamic> && data['detail'] != null) {
    return data['detail'].toString();
  }
  return defaultMessage;
}

// ============================================================
// Conversations State & Notifier
// ============================================================

class ConversationsState {
  final List<Conversation> conversations;
  final List<Conversation> archivedConversations;
  final bool isLoading;
  final String? error;

  const ConversationsState({
    this.conversations = const [],
    this.archivedConversations = const [],
    this.isLoading = false,
    this.error,
  });

  ConversationsState copyWith({
    List<Conversation>? conversations,
    List<Conversation>? archivedConversations,
    bool? isLoading,
    String? error,
  }) {
    return ConversationsState(
      conversations: conversations ?? this.conversations,
      archivedConversations: archivedConversations ?? this.archivedConversations,
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
      final archivedList = await _api.fetchConversations(archived: true);
      state = state.copyWith(
        conversations: list,
        archivedConversations: archivedList,
        isLoading: false,
      );
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _extractErrorMessage(e, 'Erro ao carregar conversas'),
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
        error: _extractErrorMessage(e, 'Erro ao criar conversa'),
      );
      return null;
    }
  }

  Future<void> updateConversation(String id, {String? title, bool? isArchived}) async {
    try {
      final updated = await _api.updateConversation(id, title: title, isArchived: isArchived);
      
      final allConvs = [...state.conversations, ...state.archivedConversations];
      final others = allConvs.where((c) => c.id != id).toList();
      others.add(updated);
      
      final active = others.where((c) => !c.isArchived).toList();
      final archived = others.where((c) => c.isArchived).toList();
      
      active.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
      archived.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
      
      state = state.copyWith(conversations: active, archivedConversations: archived);
    } on DioException catch (e) {
      state = state.copyWith(
        error: _extractErrorMessage(e, 'Erro ao atualizar conversa'),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
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
        error: _extractErrorMessage(e, 'Erro ao carregar mensagens'),
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> send(String text) async {
    if (text.trim().isEmpty) return;

    final tempUserId = 'pending-user-${DateTime.now().millisecondsSinceEpoch}';
    final tempAiId = 'pending-ai-${DateTime.now().millisecondsSinceEpoch}';

    // Otimistic UI: adicionar mensagem do usuário e da IA imediatamente
    final optimisticUserMsg = ChatMessage(
      id: tempUserId,
      conversationId: _conversationId,
      role: 'user',
      content: text,
      createdAt: DateTime.now(),
    );

    final optimisticAiMsg = ChatMessage(
      id: tempAiId,
      conversationId: _conversationId,
      role: 'assistant',
      content: '',
      createdAt: DateTime.now(),
    );

    state = state.copyWith(
      messages: [...state.messages, optimisticUserMsg, optimisticAiMsg],
      isSending: true,
      error: null,
    );

    try {
      await _api.sendMessageStream(_conversationId, text, (chunk) {
        final messages = List<ChatMessage>.from(state.messages);
        final aiIndex = messages.indexWhere((m) => m.id == tempAiId);
        if (aiIndex != -1) {
          final oldMsg = messages[aiIndex];
          messages[aiIndex] = ChatMessage(
            id: oldMsg.id,
            conversationId: oldMsg.conversationId,
            role: oldMsg.role,
            content: oldMsg.content + chunk,
            createdAt: oldMsg.createdAt,
          );
          state = state.copyWith(messages: messages);
        }
      });
      // Após sucesso, a mensagem foi escrita no banco pelo servidor.
      // Recarregamos a lista oficial para pegar os IDs finais do DB e sumários.
      await load();
      // Garantir que isSending volta para false após sucesso
      state = state.copyWith(isSending: false);
    } on DioException catch (e) {
      // Remover mensagem otimista em caso de erro
      state = state.copyWith(
        messages: state.messages.where((m) => m.id != tempUserId && m.id != tempAiId).toList(),
        isSending: false,
        error: _extractErrorMessage(e, 'Erro ao enviar mensagem'),
      );
    } catch (e) {
      state = state.copyWith(
        messages: state.messages.where((m) => m.id != tempUserId && m.id != tempAiId).toList(),
        isSending: false,
        error: e.toString(),
      );
    }
  }
}
