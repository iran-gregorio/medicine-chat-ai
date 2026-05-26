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
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'white',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              textDecoration: 'none',
              color: isActive ? '#3B82F6' : '#94A3B8',
              flex: 1,
              height: '100%',
            })}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>{t(label)}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F8FF', flexDirection: isMobile ? 'column' : 'row' }}>
      <Sidebar isMobile={isMobile} />
      <main style={{ 
        marginLeft: isMobile ? '0' : '240px', 
        paddingBottom: isMobile ? '60px' : '0', 
        flex: 1, 
        height: '100vh', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
