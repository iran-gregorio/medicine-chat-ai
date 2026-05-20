import { useNavigate } from 'react-router-dom';
import { ChevronRight, Pill, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useEffect } from 'react';

const actionCards = [
  {
    icon: '🤖',
    title: 'Falar com IA',
    subtitle: 'Tire dúvidas sobre medicamentos',
    to: '/chat',
    highlighted: true,
  },
  {
    icon: '📷',
    title: 'Escanear Caixa',
    subtitle: 'Analise detalhes e instruções do medicamento',
    to: '/scan',
    highlighted: false,
  },
  {
    icon: '📋',
    title: 'Enviar Receita',
    subtitle: 'Digitalize e armazene com segurança',
    to: '/scan',
    highlighted: false,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { conversations, loadConversations, selectConversation } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSelectConversation = async (id: string) => {
    await selectConversation(id);
    navigate('/chat');
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'agora mesmo';
      if (diffMins < 60) return `há ${diffMins} min`;
      if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      if (diffDays === 1) return 'ontem';
      return `há ${diffDays} dias`;
    } catch {
      return '';
    }
  };

  const recentConversations = conversations.slice(0, 3);

  return (
    <div style={{ padding: '40px 48px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '6px',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(59,130,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '22px' }}>👤</span>
          </div>
          <span style={{ fontSize: '15px', color: '#64748B', fontWeight: 500 }}>Olá! 👋</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.2 }}>
          Como posso ajudar<br />com seus medicamentos?
        </h1>
      </div>

      {/* Action cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
        {actionCards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.to)}
            style={{
              display: 'flex', alignItems: 'center', gap: '20px',
              padding: '20px 24px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'transform 0.15s, box-shadow 0.15s',
              background: card.highlighted
                ? 'linear-gradient(135deg, #6BAED6, #3B82F6)'
                : 'white',
              boxShadow: card.highlighted
                ? '0 8px 32px rgba(59,130,246,0.25)'
                : '0 2px 12px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = card.highlighted
                ? '0 12px 40px rgba(59,130,246,0.35)'
                : '0 8px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = card.highlighted
                ? '0 8px 32px rgba(59,130,246,0.25)'
                : '0 2px 12px rgba(0,0,0,0.06)';
            }}
          >
            <span style={{ fontSize: '44px', lineHeight: 1 }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 700, fontSize: '17px',
                color: card.highlighted ? 'white' : '#0F172A',
                marginBottom: '3px',
              }}>
                {card.title}
              </div>
              <div style={{
                fontSize: '13px',
                color: card.highlighted ? 'rgba(255,255,255,0.85)' : '#64748B',
              }}>
                {card.subtitle}
              </div>
            </div>
            <ChevronRight size={20} color={card.highlighted ? 'rgba(255,255,255,0.8)' : '#94A3B8'} />
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '36px' }}>
        {[
          { icon: <Pill size={20} color="#3B82F6" />, label: 'Medicamentos', value: '3', bg: '#EFF6FF' },
          { icon: <Clock size={20} color="#14B8A6" />, label: 'Consultas', value: '7', bg: '#F0FDFA' },
          { icon: <TrendingUp size={20} color="#F59E0B" />, label: 'Receitas', value: '2', bg: '#FFFBEB' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'white', borderRadius: '16px', padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '12px',
              background: stat.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '22px', color: '#0F172A' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent conversations */}
      <div>
        <h2 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
          Conversas Recentes
        </h2>
        {recentConversations.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: '30px 20px',
            textAlign: 'center',
            color: '#64748B',
            fontSize: '14px',
          }}>
            Nenhuma conversa recente encontrada.{' '}
            <button
              onClick={() => navigate('/chat')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3B82F6',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Iniciar uma conversa
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {recentConversations.map((item, i) => (
              <div
                key={item.id}
                onClick={() => handleSelectConversation(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: i < recentConversations.length - 1 ? '1px solid #F1F5F9' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'rgba(59,130,246,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3B82F6',
                }}>
                  <MessageSquare size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    {formatTime(item.updated_at)}
                  </div>
                </div>
                <ChevronRight size={18} color="#94A3B8" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
