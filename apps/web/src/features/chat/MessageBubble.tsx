import React from 'react';
import { User, Bot } from 'lucide-react';
import type { ChatMessage } from '../../lib/chatApi';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '12px',
        width: '100%',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          flexShrink: 0,
          background: isUser
            ? 'rgba(59,130,246,0.12)'
            : 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isUser ? 'none' : '0 4px 10px rgba(59,130,246,0.25)',
        }}
      >
        {isUser ? (
          <User size={18} color="#3B82F6" />
        ) : (
          <Bot size={18} color="white" />
        )}
      </div>

      {/* Bubble Container */}
      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column' }}>
        {/* Author Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
            flexDirection: isUser ? 'row-reverse' : 'row',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '12px', color: '#334155' }}>
            {isUser ? 'Você' : 'MediCare AI'}
          </span>
          <span style={{ fontSize: '10px', color: '#94A3B8' }}>
            {formatTime(message.created_at)}
          </span>
        </div>

        {/* Bubble Text */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? '#DBEAFE' : 'white',
            border: isUser ? 'none' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            fontSize: '14px',
            color: '#1E293B',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};
