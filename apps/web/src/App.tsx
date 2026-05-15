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

function Sidebar() {
  const { t, i18n } = useTranslation();
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

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'white',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
      boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A' }}>MediCare AI</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Assistente Médico</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '12px',
              marginBottom: '4px',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: '14px',
              background: isActive ? '#EFF6FF' : 'transparent',
              color: isActive ? '#3B82F6' : '#64748B',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={18} />
            {t(label)}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt')}
          style={{
            width: '100%', padding: '8px 14px',
            borderRadius: '10px', border: '1px solid #E2E8F0',
            background: '#F8FAFC', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500, color: '#64748B',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          🌐 {i18n.language === 'pt' ? 'English' : 'Português'}
        </button>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px 14px',
            borderRadius: '10px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500, color: '#EF4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <LogOut size={16} />
          {t('auth.logout', 'Sair')}
        </button>
      </div>
    </aside>
  );
}

function AuthenticatedLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F8FF' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
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
