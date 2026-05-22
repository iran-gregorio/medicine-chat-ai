import { api } from './api';

export interface Conversation {
  id: string;
  title: string;
  summary: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const chatApi = {
  fetchConversations: async (archived = false): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/chat/conversations', { params: { archived } });
    return response.data;
  },

  updateConversation: async (
    conversationId: string,
    updates: { title?: string; is_archived?: boolean }
  ): Promise<Conversation> => {
    const response = await api.patch<Conversation>(`/chat/conversations/${conversationId}`, updates);
    return response.data;
  },

  createConversation: async (title?: string): Promise<Conversation> => {
    const response = await api.post<Conversation>('/chat/conversations', { title });
    return response.data;
  },

  fetchMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: string, message: string): Promise<ChatMessage> => {
    const response = await api.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
      content: message,
    });
    return response.data;
  },
};
