import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';
import type { Conversation, ChatMessage } from '../../lib/chatApi';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWindow', () => {
  const mockConversation: Conversation = {
    id: '1',
    title: 'Doutor Especialista',
    summary: 'Orientacao medica',
    is_archived: false,
    created_at: '2026-05-19T10:00:00Z',
    updated_at: '2026-05-19T10:00:00Z',
  };

  const mockMessages: ChatMessage[] = [
    { id: 'm1', conversation_id: '1', role: 'user', content: 'Ola assistente', created_at: '2026-05-19T10:01:00Z' },
    { id: 'm2', conversation_id: '1', role: 'assistant', content: 'Como posso ajudar?', created_at: '2026-05-19T10:01:30Z' },
  ];

  it('deve renderizar tela de boas-vindas quando nenhuma conversa estiver ativa', () => {
    render(
      <ChatWindow
        activeConversation={null}
        messages={[]}
        isLoading={false}
        isSending={false}
        error={null}
        onSendMessage={vi.fn()}
        onRefresh={vi.fn()}
        onClearError={vi.fn()}
      />
    );

    expect(screen.getByText('Olá! Eu sou o MediCare AI')).toBeInTheDocument();
    expect(screen.getByText(/Selecione uma conversa existente ao lado/)).toBeInTheDocument();
  });

  it('deve renderizar historico de mensagens e o cabecalho da conversa', () => {
    render(
      <ChatWindow
        activeConversation={mockConversation}
        messages={mockMessages}
        isLoading={false}
        isSending={false}
        error={null}
        onSendMessage={vi.fn()}
        onRefresh={vi.fn()}
        onClearError={vi.fn()}
      />
    );

    expect(screen.getByText('Doutor Especialista')).toBeInTheDocument();
    expect(screen.getByText('Ola assistente')).toBeInTheDocument();
    expect(screen.getByText('Como posso ajudar?')).toBeInTheDocument();
  });

  it('deve exibir indicador de carregamento de historico', () => {
    render(
      <ChatWindow
        activeConversation={mockConversation}
        messages={[]}
        isLoading={true}
        isSending={false}
        error={null}
        onSendMessage={vi.fn()}
        onRefresh={vi.fn()}
        onClearError={vi.fn()}
      />
    );

    expect(screen.getByText('Carregando histórico...')).toBeInTheDocument();
  });

  it('deve exibir indicador de digitacao quando isSending for true', () => {
    render(
      <ChatWindow
        activeConversation={mockConversation}
        messages={mockMessages}
        isLoading={false}
        isSending={true}
        error={null}
        onSendMessage={vi.fn()}
        onRefresh={vi.fn()}
        onClearError={vi.fn()}
      />
    );

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('deve renderizar erro e disparar onClearError ao dispensar', () => {
    const handleClearError = vi.fn();
    render(
      <ChatWindow
        activeConversation={mockConversation}
        messages={mockMessages}
        isLoading={false}
        isSending={false}
        error="Falha na comunicacao com o servidor"
        onSendMessage={vi.fn()}
        onRefresh={vi.fn()}
        onClearError={handleClearError}
      />
    );

    expect(screen.getByText('Falha na comunicacao com o servidor')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dispensar'));
    expect(handleClearError).toHaveBeenCalled();
  });

  it('deve disparar onSendMessage ao enviar mensagem atraves do ChatInput', () => {
    const handleSendMessage = vi.fn();
    render(
      <ChatWindow
        activeConversation={mockConversation}
        messages={mockMessages}
        isLoading={false}
        isSending={false}
        error={null}
        onSendMessage={handleSendMessage}
        onRefresh={vi.fn()}
        onClearError={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Descreva seus sintomas ou dúvida...');
    fireEvent.change(input, { target: { value: 'Minha nova pergunta' } });
    
    // Submeter form
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(handleSendMessage).toHaveBeenCalledWith('Minha nova pergunta');
  });
});
