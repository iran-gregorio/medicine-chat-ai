import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { api } from './lib/api';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { PrivateRoute } from './components/PrivateRoute';
import { Bot, Home, ScanLine, MessageSquare, LogOut } from 'lucide-react';

const navItems = [
  { to: '/', label: 'homeTitle', icon: Home, exact: true },
  { to: '/scan', label: 'scanTitle', icon: ScanLine, exact: false },
  { to: '/chat', label: 'chatTitle', icon: MessageSquare, exact: false },
];

function Sidebar({ isMobile }: { isMobile: boolean }) {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    logout();
  };

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-dashboard-sidebar border-t border-card-border flex justify-around items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 no-underline flex-1 h-full
              ${isActive ? 'text-accent-blue' : 'text-slate-400'}
            `}
          >
            <Icon size={20} />
            <span className="text-[10px] font-semibold">{t(label)}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <aside className="w-64 bg-dashboard-sidebar border-r border-white/5 flex flex-col justify-between py-8 px-6 h-full flex-shrink-0 z-50">
      {/* Top Nav Items */}
      <div className="space-y-8">
        {/* Logo (Optional/Adapted) */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.35)]">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-[15px] text-slate-50">MediCare AI</div>
            <div className="text-[11px] text-slate-400">Assistente Médico</div>
          </div>
        </div>

        <nav className="space-y-6">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center space-x-3 transition-colors group text-sm font-medium
                ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Action */}
      <div className="border-t border-white/5 pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">{t('auth.logout', 'Sair')}</span>
        </button>
      </div>
    </aside>
  );
}

function AuthenticatedLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-main-gradient text-slate-200">
      <Sidebar isMobile={isMobile} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Private Routes with Sidebar Layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
