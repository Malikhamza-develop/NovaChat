import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { defaultCurrentUser } from '../../services/storage';
import { X, Sparkles, UserPlus, LogIn, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  onClose?: () => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, canDismiss = false }) => {
  const { login, register, isAuthenticated, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!loginPassword.trim()) {
      setError('Please enter your password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(loginEmail.trim(), loginPassword.trim());
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(regName.trim(), regEmail.trim(), regPassword);
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email: string, name: string) => {
    try {
      setError('');
      setLoading(true);
      await login(email, 'Password123!', name);
      setSuccessMsg(`Welcome, ${name}!`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } catch (err: any) {
      setError('Failed to switch account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {(canDismiss || isAuthenticated) && onClose && (
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isAuthenticated ? 'Switch Account' : mode === 'login' ? 'Welcome Back' : 'Create NovaChat Account'}
          </h2>
          <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
            {isAuthenticated
              ? `Currently signed in as ${user?.name || 'User'}. Log into another account below.`
              : mode === 'login'
              ? 'Log into your NovaChat account to sync messages in real time.'
              : 'Join NovaChat today for instant P2P, Cellular, and Cloud messaging.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-white/10 p-1 rounded-2xl mt-5 backdrop-blur-xs border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register New
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In to Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="new.user@domain.com"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat pass"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              >
                {loading ? 'Creating Account...' : 'Create Account & Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Demo Accounts Quick Switch */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 text-center">
              Or Quick Switch / Test Account
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex.vance@novachat.app', 'Alex Vance')}
                className="p-2 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition-all"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Alex Vance</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Default Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('test999@novachat.app', 'Test User 999')}
                className="p-2 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition-all"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Test User 999</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Test Account</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
