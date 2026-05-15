import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { Bot, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!token) {
      setError(t('auth.invalidToken', 'Token de redefinição inválido ou ausente.'));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('auth.invalidToken', 'Token de redefinição inválido ou ausente.'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch', 'As senhas não coincidem.'));
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.resetError', 'Erro ao redefinir a senha. O link pode ter expirado.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {t('auth.passwordResetSuccess', 'Senha Redefinida!')}
          </h2>
          <p className="mt-2 text-slate-600">
            {t('auth.redirectingToLogin', 'Sua senha foi alterada com sucesso. Redirecionando para o login...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Bot size={28} className="text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            {t('auth.createNewPassword', 'Criar Nova Senha')}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {t('auth.enterNewPassword', 'Digite sua nova senha abaixo.')}
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
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                {t('auth.newPassword', 'Nova Senha')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={!token}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!error}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                {t('auth.confirmNewPassword', 'Confirmar Nova Senha')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={!token}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!error || (password !== confirmPassword && confirmPassword.length > 0)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !token}
              aria-busy={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              {loading ? t('auth.saving', 'Salvando...') : t('auth.savePassword', 'Salvar Senha')}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            {t('auth.cancelAndReturnToLogin', 'Cancelar e voltar ao login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
