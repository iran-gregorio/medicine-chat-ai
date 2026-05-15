import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { Bot, CheckCircle2, XCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatPhone = (value: string) => {
    // Strip all non-digits
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone_number: formatted });
  };

  const getRawPhone = () => formData.phone_number.replace(/\D/g, '');

  const checkComplexity = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const comp = checkComplexity(formData.password);
  const isValid = comp.length && comp.uppercase && comp.lowercase && comp.number && comp.special;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      setError(t('auth.weakPassword', 'A senha não atende aos requisitos de complexidade.'));
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError(t('auth.passwordsDoNotMatch', 'As senhas não coincidem.'));
      return;
    }

    setLoading(true);

    try {
      const rawPhone = getRawPhone();
      if (rawPhone && rawPhone.length !== 11) {
        setError(t('auth.invalidPhone', 'Informe um celular válido com DDD (11 dígitos).'));
        setLoading(false);
        return;
      }

      const { data } = await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        phone: rawPhone || undefined,
        password: formData.password,
      });
      
      if (data.access_token) {
        setAuth(data.access_token, data.refresh_token, data.user);
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.registerError', 'Erro ao criar conta. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const Requirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-slate-500'}`}>
      {met ? <CheckCircle2 size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Bot size={28} className="text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">MediCare AI</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {t('auth.createYourAccount', 'Crie sua conta gratuitamente')}
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div 
              role="alert" 
              aria-live="assertive"
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100"
            >
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
              {t('auth.fullName', 'Nome Completo')}
            </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="João da Silva"
                autoComplete="name"
                aria-invalid={!!error}
              />
            </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              {t('auth.email', 'E-mail')}
            </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="joao@exemplo.com"
                autoComplete="email"
                aria-invalid={!!error}
              />
            </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-slate-700">
              {t('auth.phoneOptional', 'Telefone (Opcional)')}
            </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                inputMode="numeric"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="(11) 99999-9999"
                autoComplete="tel"
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
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!error || (formData.password.length > 0 && !isValid)}
                aria-describedby="password-requirements"
              />
              
              <div id="password-requirements" className="mt-2 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Requirement met={comp.length} text="Pelo menos 8 caracteres" />
              <Requirement met={comp.uppercase} text="Uma letra maiúscula" />
              <Requirement met={comp.lowercase} text="Uma letra minúscula" />
              <Requirement met={comp.number} text="Um número" />
              <Requirement met={comp.special} text="Um caractere especial (!@#$%...)" />
            </div>
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700">
              {t('auth.confirmPassword', 'Confirmar Senha')}
            </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!error || (formData.password !== formData.confirm_password && formData.confirm_password.length > 0)}
              />
            </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (formData.password.length > 0 && !isValid)}
              aria-busy={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              {loading ? t('auth.loading', 'Criando...') : t('auth.registerBtn', 'Criar Conta')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-600">{t('auth.alreadyHaveAccount', 'Já tem uma conta?')} </span>
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            {t('auth.loginHere', 'Entrar aqui')}
          </Link>
        </div>
      </div>
    </div>
  );
}
