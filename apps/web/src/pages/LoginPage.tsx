import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { Bot } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      setAuth(data.access_token, data.refresh_token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.loginError', 'Erro ao fazer login. Verifique suas credenciais.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Bot size={28} className="text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">MediCare AI</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {t('auth.loginToAccount', 'Faça login na sua conta')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div 
              role="alert" 
              aria-live="assertive" 
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100"
            >
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
                {t('auth.identifier', 'E-mail ou Telefone')}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="seu@email.com ou +5511999999999"
                autoComplete="username"
                aria-invalid={!!error}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                {t('auth.password', 'Senha')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!error}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                {t('auth.forgotPassword', 'Esqueceu a senha?')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              {loading ? t('auth.loading', 'Entrando...') : t('auth.loginBtn', 'Entrar')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-600">{t('auth.noAccount', 'Não tem uma conta?')} </span>
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            {t('auth.createAccount', 'Criar conta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
