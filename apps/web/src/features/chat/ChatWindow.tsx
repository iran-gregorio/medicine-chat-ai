import React, { useEffect, useRef } from 'react';
import { Bot, RefreshCw, AlertCircle, Menu } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { ChatMessage, Conversation } from '../../lib/chatApi';

interface ChatWindowProps {
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  onSendMessage: (text: string, file?: File) => void;
  onRefresh: () => void;
  onClearError: () => void;
  onToggleSidebar?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeConversation,
  messages,
  isLoading,
  isSending,
  error,
  onSendMessage,
  onRefresh,
  onClearError,
  onToggleSidebar,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Tela de boas-vindas / seleção
  if (!activeConversation) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F0F4FF, #E0E7FF)',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', padding: '8px',
              color: '#64748B', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            marginBottom: '20px',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <Bot size={40} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
          Olá! Eu sou o MediCare AI
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '360px', lineHeight: 1.6 }}>
          Selecione uma conversa existente ao lado ou clique em <strong>"Nova Conversa"</strong> para
          iniciar uma nova consulta médica inteligente.
        </p>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#F8FAFC',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 24px',
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: '#64748B', display: 'flex', alignItems: 'center'
              }}
            >
              <Menu size={24} />
            </button>
          )}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#1E293B',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '300px',
              }}
            >
              {activeConversation.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontSize: '11px', color: '#64748B' }}>Online — Medicare AI</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
        >
          <RefreshCw size={18} className={isLoading ? 'spin-anim' : ''} />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: '#FEF2F2',
            borderBottom: '1px solid #FEE2E2',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{error}</span>
          </div>
          <button
            onClick={onClearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#991B1B',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {isLoading && messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              gap: '8px',
              fontSize: '14px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '2px solid #E2E8F0',
                borderTop: '2px solid #3B82F6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Carregando histórico...</span>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              gap: '8px',
            }}
          >
            <Bot size={32} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '13px' }}>Nenhuma mensagem. Comece a conversa!</span>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </>
        )}

        {/* Typing indicator */}
        {isSending && (
          <div data-testid="typing-indicator" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Bot size={18} />
            </div>
            <div
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '18px',
                padding: '12px 18px',
                display: 'flex',
                gap: '5px',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#94A3B8',
                    animation: `bounce 1.2s ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          background: 'white',
          borderTop: '1px solid #E2E8F0',
          padding: '16px 24px',
        }}
      >
        <ChatInput onSend={onSendMessage} disabled={isSending || isLoading} />
      </div>

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
