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
}

export const chatApi = {
  uploadImage: async (file: File): Promise<{ anonymized_preview: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

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

  sendMessageStream: async (
    conversationId: string, 
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    // Pegando o token diretamente do store
    const { useAuthStore } = await import('../store/authStore');
    const token = useAuthStore.getState().token;
    const { API_URL } = await import('./api');
    
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ content: message })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onChunk(chunk);
      }
    }
  },
};
