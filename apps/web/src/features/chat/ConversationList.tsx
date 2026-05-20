import React from 'react';
import { Plus, MessageSquare, Bot } from 'lucide-react';
import type { Conversation } from '../../lib/chatApi';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onCreate,
}) => {
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
      >
        {isLoading && conversations.length === 0 ? (
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
        ) : conversations.length === 0 ? (
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
            <span>Nenhuma conversa ainda.</span>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '14px',
                      color: isActive ? '#1E3A8A' : '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {conv.title}
                  </div>
                  {conv.summary && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px',
                      }}
                    >
                      {conv.summary}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: '10px',
                      color: isActive ? '#60A5FA' : '#94A3B8',
                      marginTop: '4px',
                    }}
                  >
                    {formatDate(conv.updated_at)}
                  </div>
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
