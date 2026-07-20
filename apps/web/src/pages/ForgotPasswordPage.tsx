import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { Bot, ArrowLeft, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      // Even if email is not found, we might want to show success to prevent email enumeration,
      // but for this implementation we'll show the actual error if available.
      setError(err.response?.data?.detail || t('auth.forgotError', 'Erro ao solicitar redefinição.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-gradient py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card-bg p-8 rounded-2xl shadow-sm border border-white/10 backdrop-blur text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <MailCheck size={32} className="text-green-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            {t('auth.emailSent', 'E-mail Enviado!')}
          </h2>
          <p className="mt-2 text-slate-400">
            {t('auth.emailSentDesc', 'Verifique sua caixa de entrada. Enviamos um link para você redefinir sua senha.')}
          </p>
          <div className="mt-8">
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
              {t('auth.backToLogin', 'Voltar para o login')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card-bg p-8 rounded-2xl shadow-sm border border-white/10 backdrop-blur">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Bot size={28} className="text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            {t('auth.resetPassword', 'Redefinir Senha')}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            {t('auth.enterEmailToReset', 'Digite seu e-mail para receber um link de redefinição.')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div 
              role="alert" 
              aria-live="assertive"
              className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20"
            >
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              {t('auth.email', 'E-mail')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="seu@email.com"
              autoComplete="email"
              aria-invalid={!!error}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              {loading ? t('auth.sending', 'Enviando...') : t('auth.sendResetLink', 'Enviar Link')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            {t('auth.backToLogin', 'Voltar para o login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
