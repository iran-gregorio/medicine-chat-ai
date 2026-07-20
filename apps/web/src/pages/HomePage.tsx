import { useNavigate } from 'react-router-dom';
import { ChevronRight, MessageSquare } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-12 py-16">
      {/* Greeting Section */}
      <section className="mb-16">
        <h1 className="text-4xl font-semibold mb-2 text-slate-50">
          Olá 👋
        </h1>
        <p className="text-gray-400 text-lg">Como podemos te ajudar hoje?</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
        {/* Action Cards */}
        <div className="space-y-6">
          {actionCards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.to)}
              className="glow-card w-full p-8 rounded-2xl flex items-center justify-between group"
              style={{
                boxShadow: '0 0 50px 10px rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
              }}
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{card.icon}</span>
                <span className="text-xl font-medium text-gray-200">{card.title}</span>
              </div>
              <ChevronRight className="h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>

        {/* Recent Conversations */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-100">Conversas Recentes</h2>
          {recentConversations.length === 0 ? (
            <div className="bg-card-bg border border-card-border p-8 rounded-xl text-center text-slate-400 text-sm">
              Nenhuma conversa recente encontrada.{' '}
              <button
                onClick={() => navigate('/chat')}
                className="text-accent-blue font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Iniciar uma conversa
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConversations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectConversation(item.id)}
                  className="bg-card-bg border border-card-border p-5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-accent-blue shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 font-medium truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatTime(item.updated_at)}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
