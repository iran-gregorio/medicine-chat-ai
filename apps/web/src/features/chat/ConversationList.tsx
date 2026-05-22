import React, { useState } from 'react';
import { Plus, MessageSquare, Bot, MoreVertical, Edit2, Archive, ArchiveRestore, Check, X } from 'lucide-react';
import type { Conversation } from '../../lib/chatApi';

interface ConversationListProps {
  conversations: Conversation[];
  archivedConversations: Conversation[];
  activeId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, newTitle: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  archivedConversations,
  activeId,
  isLoading,
  onSelect,
  onCreate,
  onRename,
  onArchive,
  onUnarchive,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleConfirmRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (renamingId && editTitle.trim()) {
      onRename(renamingId, editTitle.trim());
    }
    setRenamingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(null);
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  const currentList = activeTab === 'active' ? conversations : archivedConversations;

  return (
    <div
      style={{
        width: '280px',
        borderRight: '1px solid #E2E8F0',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <button
          onClick={onCreate}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,130,246,0.35)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={18} />
          Nova Conversa
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', marginTop: '16px', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '6px 0',
              border: 'none',
              background: activeTab === 'active' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'active' ? '#3B82F6' : '#64748B',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Ativas
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            style={{
              flex: 1,
              padding: '6px 0',
              border: 'none',
              background: activeTab === 'archived' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'archived' ? '#3B82F6' : '#64748B',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Arquivadas
          </button>
        </div>
      </div>

      {/* List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
        onClick={() => setMenuOpenId(null)}
      >
        {isLoading && currentList.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 16px',
              gap: '12px',
              color: '#94A3B8',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #EFF6FF',
                borderTop: '3px solid #3B82F6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ fontSize: '13px' }}>Carregando conversas...</span>
          </div>
        ) : currentList.length === 0 ? (
          <div
            style={{
              padding: '40px 16px',
              textAlign: 'center',
              color: '#94A3B8',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <MessageSquare size={24} style={{ opacity: 0.6 }} />
            <span>Nenhuma conversa {activeTab === 'active' ? 'ainda' : 'arquivada'}.</span>
          </div>
        ) : (
          currentList.map((conv) => {
            const isActive = conv.id === activeId;
            const isRenaming = conv.id === renamingId;
            const isMenuOpen = conv.id === menuOpenId;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  if (!isRenaming) onSelect(conv.id);
                }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                  transition: 'all 0.15s',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isActive ? '#3B82F6' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? 'white' : '#64748B',
                    flexShrink: 0,
                  }}
                >
                  {isActive ? <Bot size={18} /> : <MessageSquare size={18} />}
                </div>
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  {isRenaming ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          fontSize: '13px',
                          padding: '2px 4px',
                          border: '1px solid #3B82F6',
                          borderRadius: '4px',
                          outline: 'none',
                          width: '100%',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename(e as any);
                          if (e.key === 'Escape') handleCancelRename(e as any);
                        }}
                      />
                      <button
                        onClick={handleConfirmRename}
                        style={{ background: 'none', border: 'none', color: '#22C55E', cursor: 'pointer', padding: '2px' }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '14px',
                        color: isActive ? '#1E3A8A' : '#334155',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        paddingRight: '20px'
                      }}
                    >
                      {conv.title}
                    </div>
                  )}
                  {!isRenaming && conv.summary && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px',
                        paddingRight: '20px'
                      }}
                    >
                      {conv.summary}
                    </div>
                  )}
                  {!isRenaming && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: isActive ? '#60A5FA' : '#94A3B8',
                        marginTop: '4px',
                      }}
                    >
                      {formatDate(conv.updated_at)}
                    </div>
                  )}

                  {/* Actions Menu Toggle */}
                  {!isRenaming && (
                    <button
                      onClick={(e) => toggleMenu(conv.id, e)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '2px',
                        opacity: isMenuOpen ? 1 : 0.5,
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}

                  {/* Actions Dropdown */}
                  {isMenuOpen && !isRenaming && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '20px',
                        right: 0,
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '120px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activeTab === 'active' && (
                        <button
                          onClick={(e) => handleStartRename(conv, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            fontSize: '12px',
                            color: '#334155',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: '4px',
                            width: '100%'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <Edit2 size={14} /> Renomear
                        </button>
                      )}
                      
                      {activeTab === 'active' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            onArchive(conv.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            fontSize: '12px',
                            color: '#334155',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: '4px',
                            width: '100%'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <Archive size={14} /> Arquivar
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            onUnarchive(conv.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            fontSize: '12px',
                            color: '#334155',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: '4px',
                            width: '100%'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <ArchiveRestore size={14} /> Desarquivar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
