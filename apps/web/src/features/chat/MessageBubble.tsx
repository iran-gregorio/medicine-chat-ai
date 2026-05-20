import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

        {/* Bubble */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? '#DBEAFE' : 'white',
            border: isUser ? 'none' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            fontSize: '14px',
            color: '#1E293B',
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}
        >
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p style={{ margin: '0 0 8px 0', lineHeight: 1.65 }}>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul style={{ margin: '4px 0 8px 0', paddingLeft: '20px' }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ margin: '4px 0 8px 0', paddingLeft: '20px' }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '4px', lineHeight: 1.6 }}>{children}</li>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 700, color: '#0F172A' }}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em style={{ fontStyle: 'italic', color: '#334155' }}>{children}</em>
                ),
                code: ({ children, className }) => {
                  const isBlock = !!className;
                  return isBlock ? (
                    <code
                      style={{
                        display: 'block',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontFamily: '"Fira Code", "Courier New", monospace',
                        overflowX: 'auto',
                        whiteSpace: 'pre',
                        color: '#334155',
                        lineHeight: 1.6,
                        marginBottom: '8px',
                      }}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRadius: '4px',
                        padding: '1px 5px',
                        fontSize: '12.5px',
                        fontFamily: '"Fira Code", "Courier New", monospace',
                        color: '#3B82F6',
                      }}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre style={{ margin: '4px 0 8px 0', background: 'transparent', padding: 0 }}>
                    {children}
                  </pre>
                ),
                h1: ({ children }) => (
                  <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '8px 0 6px 0', lineHeight: 1.3 }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '8px 0 4px 0', lineHeight: 1.35 }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B', margin: '6px 0 4px 0', lineHeight: 1.4 }}>
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    style={{
                      borderLeft: '3px solid #3B82F6',
                      paddingLeft: '12px',
                      margin: '4px 0 8px 0',
                      color: '#475569',
                      fontStyle: 'italic',
                    }}
                  >
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '10px 0' }} />
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3B82F6', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};
