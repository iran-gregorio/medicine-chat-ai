import { api } from './api';

export interface Conversation {
  id: string;
  title: string;
  summary: string | null;
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
  fetchConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/chat/conversations');
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
      message,
    });
    return response.data;
  },
};
