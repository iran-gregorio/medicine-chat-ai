import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Camera, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
}

const initialMessages: Message[] = [
  { id: 1, text: 'Olá! Tenho tosse e febre há dois dias.', isUser: true, time: '14:32' },
  {
    id: 2,
    text: 'Olá! Sinto muito por isso. Pode descrever sua tosse (seca ou com catarro) e tem outros sintomas?',
    isUser: false,
    time: '14:32',
  },
  { id: 3, text: 'É uma tosse seca, e tenho dor de cabeça.', isUser: true, time: '14:33' },
  {
    id: 4,
    text: 'Entendido. Você tomou algum medicamento e esteve em contato com alguém doente recentemente?',
    isUser: false,
    time: '14:33',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Simulated AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Analisando sua pergunta com base nos dados da ANVISA... Em breve terei uma resposta completa para você.',
          isUser: false,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
        }}>
          <Bot size={22} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>MediCare AI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: '12px', color: '#64748B' }}>Online — Responde em segundos</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{
              background: 'white', borderRadius: '18px',
              padding: '12px 18px', display: 'flex', gap: '5px', alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1',
                  animation: `bounce 1.2s ${delay}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        background: 'white', borderTop: '1px solid #E2E8F0',
        padding: '16px 24px 20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#F4F8FF', borderRadius: '28px',
          border: '1px solid #E2E8F0', padding: '10px 10px 10px 20px',
          marginBottom: '10px',
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Descreva seus sintomas ou dúvida..."
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '15px', color: '#0F172A', outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <button style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#F97316', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Camera size={17} color="white" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {[Mic, Paperclip].map((Icon, i) => (
            <button key={i} style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#F4F8FF', border: '1px solid #E2E8F0',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color="#64748B" />
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#3B82F6', cursor: 'pointer' }}
            onClick={sendMessage}>
            Enviar
          </span>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: input.trim()
                ? 'linear-gradient(135deg, #60A5FA, #3B82F6)'
                : '#E2E8F0',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: input.trim() ? '0 4px 14px rgba(59,130,246,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Send size={18} color={input.trim() ? 'white' : '#94A3B8'} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const { isUser } = message;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '12px',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: isUser
          ? 'rgba(59,130,246,0.12)'
          : 'linear-gradient(135deg, #60A5FA, #3B82F6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isUser ? 'none' : '0 4px 10px rgba(59,130,246,0.25)',
      }}>
        {isUser
          ? <User size={18} color="#3B82F6" />
          : <Bot size={18} color="white" />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '65%' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '5px',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}>
          <span style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
            {isUser ? 'Você' : 'MediCare AI'}
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>{message.time}</span>
        </div>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? '#DBEAFE' : 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          fontSize: '15px', color: '#0F172A', lineHeight: 1.5,
        }}>
          {message.text}
        </div>
      </div>
    </div>
  );
}
