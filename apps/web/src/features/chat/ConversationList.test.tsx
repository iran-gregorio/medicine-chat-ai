import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from './ConversationList';
import type { Conversation } from '../../lib/chatApi';

describe('ConversationList', () => {
  const mockConversations: Conversation[] = [
    { id: '1', title: 'Dor de cabeca', summary: 'Usuario com dor de cabeca leve', is_archived: false, created_at: '2026-05-19T10:00:00Z', updated_at: '2026-05-19T10:00:00Z' },
    { id: '2', title: 'Tosse persistente', summary: 'Tosse seca a 2 dias', is_archived: false, created_at: '2026-05-19T11:00:00Z', updated_at: '2026-05-19T11:00:00Z' },
  ];

  it('deve renderizar estado de carregamento inicial', () => {
    render(
      <ConversationList
        conversations={[]}
        archivedConversations={[]}
        activeId={null}
        isLoading={true}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
      />
    );
    expect(screen.getByText('Carregando conversas...')).toBeInTheDocument();
  });

  it('deve renderizar estado vazio quando nao ha conversas', () => {
    render(
      <ConversationList
        conversations={[]}
        archivedConversations={[]}
        activeId={null}
        isLoading={false}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
      />
    );
    expect(screen.getByText('Nenhuma conversa ainda.')).toBeInTheDocument();
  });

  it('deve listar todas as conversas disponiveis', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        archivedConversations={[]}
        activeId={null}
        isLoading={false}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
      />
    );
    expect(screen.getByText('Dor de cabeca')).toBeInTheDocument();
    expect(screen.getByText('Usuario com dor de cabeca leve')).toBeInTheDocument();
    expect(screen.getByText('Tosse persistente')).toBeInTheDocument();
    expect(screen.getByText('Tosse seca a 2 dias')).toBeInTheDocument();
  });

  it('deve disparar onSelect ao clicar em uma conversa', () => {
    const handleSelect = vi.fn();
    render(
      <ConversationList
        conversations={mockConversations}
        archivedConversations={[]}
        activeId={null}
        isLoading={false}
        onSelect={handleSelect}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Dor de cabeca'));
    expect(handleSelect).toHaveBeenCalledWith('1');
  });

  it('deve disparar onCreate ao clicar no botao Nova Conversa', () => {
    const handleCreate = vi.fn();
    render(
      <ConversationList
        conversations={mockConversations}
        archivedConversations={[]}
        activeId={null}
        isLoading={false}
        onSelect={vi.fn()}
        onCreate={handleCreate}
        onRename={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Nova Conversa'));
    expect(handleCreate).toHaveBeenCalled();
  });
});
