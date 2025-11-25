import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ArrowLeft, CheckCircle, UserPlus } from 'lucide-react';
import { authService, User } from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

type ViewState = 'LOGIN' | 'SIGNUP' | 'FORGOT' | 'RESET_SENT';

const LOGO_URL = "https://placehold.co/400x400/000000/FACC15?text=K&font=roboto";

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [viewState, setViewState] = useState<ViewState>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await authService.signUp(email, password);
      // If successful without error throw, but user object returned might imply immediate login
      // However, authService might throw if email confirmation is needed
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
        // Check if it's the confirmation message
        if (err.message && err.message.includes('confirmar')) {
            setSuccessMessage(err.message);
            setViewState('LOGIN');
            setPassword('');
        } else {
            setError(err.message || 'Error al registrarse');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      setViewState('RESET_SENT');
    } catch (err: any) {
      setError(err.message || 'Error al enviar solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header / Logo */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4 overflow-hidden p-1">
                    <img src={LOGO_URL} alt="Komputer SAC" className="w-full h-full object-cover rounded-lg" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-wide">KOMPUTER SAC</h1>
                <p className="text-indigo-100 text-sm mt-1">Gestión de Inventario & Ventas</p>
            </div>
        </div>

        <div className="p-8 flex-1">
            {/* Tabs for Login/Signup */}
            {(viewState === 'LOGIN' || viewState === 'SIGNUP') && (
                <div className="flex mb-6 border-b border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => { setViewState('LOGIN'); setError(null); setSuccessMessage(null); }}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${viewState === 'LOGIN' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button 
                         onClick={() => { setViewState('SIGNUP'); setError(null); setSuccessMessage(null); }}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${viewState === 'SIGNUP' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        Crear Cuenta
                    </button>
                </div>
            )}

            {viewState === 'LOGIN' && (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Bienvenido de nuevo</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ingresa tus credenciales para acceder</p>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end pt-1">
                                <button 
                                    type="button"
                                    onClick={() => setViewState('FORGOT')}
                                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Iniciar Sesión <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {viewState === 'SIGNUP' && (
                <form onSubmit={handleSignUp} className="space-y-6 animate-in fade-in duration-300">
                     <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Crear Nueva Cuenta</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Regístrate para administrar el sistema</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nuevo@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Registrarse <UserPlus className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {viewState === 'FORGOT' && (
                 <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                    <button 
                        type="button" 
                        onClick={() => {
                            setViewState('LOGIN');
                            setError(null);
                        }}
                        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al login
                    </button>

                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recuperar Cuenta</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Te enviaremos las instrucciones a tu correo</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email Registrado</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Enviar Instrucciones'
                        )}
                    </button>
                 </form>
            )}

            {viewState === 'RESET_SENT' && (
                <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">¡Correo Enviado!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Si existe una cuenta asociada a <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>, recibirás un enlace para restablecer tu contraseña.
                    </p>
                    <button 
                        onClick={() => {
                            setEmail('');
                            setPassword('');
                            setViewState('LOGIN');
                        }}
                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Volver a Iniciar Sesión
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;