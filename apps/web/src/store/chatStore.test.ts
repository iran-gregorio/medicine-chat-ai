import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatStore } from './chatStore';
import { chatApi } from '../lib/chatApi';

// Mock chatApi
vi.mock('../lib/chatApi', () => {
  return {
    chatApi: {
      fetchConversations: vi.fn(),
      createConversation: vi.fn(),
      fetchMessages: vi.fn(),
      sendMessage: vi.fn(),
    },
  };
});

describe('chatStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reinicia o estado do store antes de cada teste
    useChatStore.setState({
      conversations: [],
      activeConversationId: null,
      messages: [],
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSending: false,
      error: null,
    });
  });

  describe('loadConversations', () => {
    it('deve carregar e ordenar conversas por data de atualizacao decrescente', async () => {
      const mockConvs = [
        { id: '1', title: 'Conversa 1', summary: 'Resumo 1', created_at: '2026-05-19T10:00:00Z', updated_at: '2026-05-19T10:00:00Z' },
        { id: '2', title: 'Conversa 2', summary: 'Resumo 2', created_at: '2026-05-19T11:00:00Z', updated_at: '2026-05-19T11:00:00Z' },
      ];
      vi.mocked(chatApi.fetchConversations).mockResolvedValue(mockConvs);

      await useChatStore.getState().loadConversations();

      const state = useChatStore.getState();
      expect(state.isLoadingConversations).toBe(false);
      expect(state.error).toBeNull();
      expect(state.conversations).toHaveLength(2);
      // Conversa 2 (updated_at mais recente) deve vir primeiro
      expect(state.conversations[0].id).toBe('2');
      expect(state.conversations[1].id).toBe('1');
    });

    it('deve lidar com erro ao carregar conversas', async () => {
      vi.mocked(chatApi.fetchConversations).mockRejectedValue({
        response: { data: { detail: 'Erro no servidor' } },
      });

      await useChatStore.getState().loadConversations();

      const state = useChatStore.getState();
      expect(state.isLoadingConversations).toBe(false);
      expect(state.error).toBe('Erro no servidor');
      expect(state.conversations).toEqual([]);
    });
  });

  describe('selectConversation', () => {
    it('deve selecionar conversa e carregar suas mensagens', async () => {
      const mockMsgs = [
        { id: 'm1', conversation_id: '1', role: 'user' as const, content: 'Oi', created_at: '2026-05-19T10:00:00Z' },
      ];
      vi.mocked(chatApi.fetchMessages).mockResolvedValue(mockMsgs);

      await useChatStore.getState().selectConversation('1');

      const state = useChatStore.getState();
      expect(state.activeConversationId).toBe('1');
      expect(state.isLoadingMessages).toBe(false);
      expect(state.messages).toEqual(mockMsgs);
    });

    it('deve lidar com erro ao carregar mensagens', async () => {
      vi.mocked(chatApi.fetchMessages).mockRejectedValue(new Error('Falha de conexao'));

      await useChatStore.getState().selectConversation('1');

      const state = useChatStore.getState();
      expect(state.isLoadingMessages).toBe(false);
      expect(state.error).toBeDefined();
      expect(state.messages).toEqual([]);
    });
  });

  describe('createConversation', () => {
    it('deve criar conversa e adiciona-la ao topo da lista', async () => {
      const newConv = { id: '3', title: 'Nova Conversa', summary: null, created_at: '2026-05-19T12:00:00Z', updated_at: '2026-05-19T12:00:00Z' };
      vi.mocked(chatApi.createConversation).mockResolvedValue(newConv);

      const id = await useChatStore.getState().createConversation();

      expect(id).toBe('3');
      const state = useChatStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.conversations[0].id).toBe('3');
      expect(state.activeConversationId).toBe('3');
      expect(state.messages).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      useChatStore.setState({
        activeConversationId: '1',
        conversations: [
          { id: '1', title: 'Nova Conversa', summary: null, created_at: '2026-05-19T10:00:00Z', updated_at: '2026-05-19T10:00:00Z' },
        ],
        messages: [],
      });
    });

    it('deve enviar mensagem com sucesso (envio otimista e atualizacao)', async () => {
      const aiReply = { id: 'm2', conversation_id: '1', role: 'assistant' as const, content: 'Resposta da IA', created_at: '2026-05-19T10:01:00Z' };
      
      // Criamos uma promise controlada para simular o delay do envio e testar o estado intermediario otimista
      let resolveSend: any;
      const sendPromise = new Promise<any>((resolve) => {
        resolveSend = () => resolve(aiReply);
      });
      vi.mocked(chatApi.sendMessage).mockReturnValue(sendPromise);

      // Dispara o envio
      const promise = useChatStore.getState().sendMessage('Minha mensagem');

      // Verifica estado otimista intermediario
      let state = useChatStore.getState();
      expect(state.isSending).toBe(true);
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[0].content).toBe('Minha mensagem');
      expect(state.messages[0].id).toContain('temp-');

      // Resolve a chamada da API
      resolveSend();
      await promise;

      // Verifica estado final com mensagem oficial do user e IA
      state = useChatStore.getState();
      expect(state.isSending).toBe(false);
      expect(state.messages).toHaveLength(2);
      expect(state.messages[1].role).toBe('assistant');
      expect(state.messages[1].content).toBe('Resposta da IA');
      
      // O titulo da conversa deve ser atualizado para os primeiros 50 caracteres se era "Nova Conversa"
      expect(state.conversations[0].title).toBe('Minha mensagem');
    });

    it('deve reverter envio otimista e expor erro em caso de falha', async () => {
      vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error('Erro de conexao'));

      await useChatStore.getState().sendMessage('Mensagem falha');

      const state = useChatStore.getState();
      expect(state.isSending).toBe(false);
      expect(state.messages).toHaveLength(0); // Revertida
      expect(state.error).toBeDefined();
    });
  });
});
