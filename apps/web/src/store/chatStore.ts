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
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversation_id: activeConversationId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    set({ 
      messages: [...messages, optimisticMessage],
      isSending: true,
      error: null
    });

    try {
      const aiReply = await chatApi.sendMessage(activeConversationId, text);
      
      // Substituir a lista de mensagens completa para garantir consistência e ordenação correta
      set((state) => {
        // Remove a mensagem otimista temporária e adiciona a oficial do usuário e a resposta da IA
        const cleanMessages = state.messages.filter(m => m.id !== tempId);
        
        // Também vamos atualizar o updatedAt da conversa ativa na lista de conversas
        const updatedConversations = state.conversations.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              updated_at: new Date().toISOString(),
              // Atualiza o título se for o primeiro turno
              title: c.title === 'Nova Conversa' ? text.substring(0, 50) : c.title,
            };
          }
          return c;
        }).sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        return {
          messages: [...cleanMessages, optimisticMessage, aiReply],
          conversations: updatedConversations,
          isSending: false,
        };
      });
    } catch (err: any) {
      // Em caso de erro, reverte a mensagem otimista
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
        error: err.response?.data?.detail || 'Falha ao enviar mensagem. Verifique sua conexão.',
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
