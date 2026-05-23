import { create } from 'zustand';
import { chatApi } from '../lib/chatApi';
import type { Conversation, ChatMessage } from '../lib/chatApi';

interface ChatState {
  conversations: Conversation[];
  archivedConversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  
  loadConversations: () => Promise<void>;
  loadArchivedConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createConversation: (title?: string) => Promise<string | null>;
  sendMessage: (text: string) => Promise<void>;
  updateConversationDetails: (id: string, updates: { title?: string; is_archived?: boolean }) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  archivedConversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,

  loadConversations: async () => {
    set({ isLoadingConversations: true, error: null });
    try {
      const convs = await chatApi.fetchConversations();
      // Ordena por updatedAt decrescente
      const sorted = [...convs].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      set({ conversations: sorted, isLoadingConversations: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || 'Erro ao carregar conversas', 
        isLoadingConversations: false 
      });
    }
  },

  loadArchivedConversations: async () => {
    try {
      const convs = await chatApi.fetchConversations(true);
      const sorted = [...convs].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      set({ archivedConversations: sorted });
    } catch (err: any) {
      console.error('Erro ao carregar conversas arquivadas', err);
    }
  },

  selectConversation: async (id: string) => {
    set({ activeConversationId: id, isLoadingMessages: true, error: null, messages: [] });
    try {
      const msgs = await chatApi.fetchMessages(id);
      set({ messages: msgs, isLoadingMessages: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || 'Erro ao carregar histórico de mensagens', 
        isLoadingMessages: false 
      });
    }
  },

  createConversation: async (title?: string) => {
    set({ isLoadingConversations: true, error: null });
    try {
      const newConv = await chatApi.createConversation(title || 'Nova Conversa');
      set((state) => ({
        conversations: [newConv, ...state.conversations],
        activeConversationId: newConv.id,
        messages: [],
        isLoadingConversations: false,
      }));
      return newConv.id;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || 'Erro ao criar nova conversa', 
        isLoadingConversations: false 
      });
      return null;
    }
  },

  sendMessage: async (text: string) => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId) return;

    // Criar mensagem otimista do usuário
    const tempUserId = `temp-user-${Date.now()}`;
    const optimisticUserMessage: ChatMessage = {
      id: tempUserId,
      conversation_id: activeConversationId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    // Criar mensagem otimista do assistente (vazia no início)
    const tempAiId = `temp-ai-${Date.now()}`;
    const optimisticAiMessage: ChatMessage = {
      id: tempAiId,
      conversation_id: activeConversationId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    set({ 
      messages: [...messages, optimisticUserMessage, optimisticAiMessage],
      isSending: true,
      error: null
    });

    try {
      await chatApi.sendMessageStream(activeConversationId, text, (chunk) => {
        set((state) => {
          const newMessages = [...state.messages];
          const aiMessageIndex = newMessages.findIndex(m => m.id === tempAiId);
          if (aiMessageIndex !== -1) {
            newMessages[aiMessageIndex] = {
              ...newMessages[aiMessageIndex],
              content: newMessages[aiMessageIndex].content + chunk
            };
          }
          return { messages: newMessages };
        });
      });
      
      set((state) => {
        const updatedConversations = state.conversations.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              updated_at: new Date().toISOString(),
              title: c.title === 'Nova Conversa' ? text.substring(0, 50) : c.title,
            };
          }
          return c;
        }).sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        return {
          conversations: updatedConversations,
          isSending: false,
        };
      });
    } catch (err: any) {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempUserId && m.id !== tempAiId),
        error: err.message || 'Falha ao enviar mensagem. Verifique sua conexão.',
        isSending: false,
      }));
    }
  },

  updateConversationDetails: async (id: string, updates: { title?: string; is_archived?: boolean }) => {
    try {
      const updated = await chatApi.updateConversation(id, updates);
      
      set((state) => {
        let newConversations = [...state.conversations];
        let newArchived = [...state.archivedConversations];
        
        // Remove from both lists first
        newConversations = newConversations.filter(c => c.id !== id);
        newArchived = newArchived.filter(c => c.id !== id);
        
        // Add to the correct list
        if (updated.is_archived) {
          newArchived.push(updated);
        } else {
          newConversations.push(updated);
        }
        
        // Re-sort
        newConversations.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        newArchived.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        
        // If archived active conversation, unselect it
        let activeId = state.activeConversationId;
        if (id === activeId && updated.is_archived) {
            activeId = null;
        }

        return {
          conversations: newConversations,
          archivedConversations: newArchived,
          activeConversationId: activeId,
          ...(activeId === null ? { messages: [] } : {})
        };
      });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao atualizar conversa' });
    }
  },

  clearError: () => set({ error: null }),
}));
