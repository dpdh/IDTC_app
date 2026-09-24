"use client";

import { useEffect, useState } from 'react';
import { Mail, Lock, ArrowRight, Globe, Sparkles } from 'lucide-react';
import { getCurrentUser, signInWithEmail, signInWithGoogle, signOut, signUpWithEmail, type AppUser } from '@/lib/auth';

export default function AuthGate({ onAuthenticated }: { onAuthenticated?: (user: AppUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    if (current && onAuthenticated) onAuthenticated(current);
  }, [onAuthenticated]);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const nextUser = mode === 'login' ? await signInWithEmail(email, password) : await signUpWithEmail(email, password);
      setUser(nextUser);
      onAuthenticated?.(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autentikasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const nextUser = await signInWithGoogle();
      setUser(nextUser);
      onAuthenticated?.(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    signOut();
    setUser(null);
    setError('');
  };

  if (user) {
    return (
      <div className="auth-panel auth-success">
        <Sparkles size={24} />
        <h2>Selamat datang, {user.name}</h2>
        <p>{user.email}</p>
        <button className="button primary" onClick={logout}>Keluar</button>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-header">
        <span className="eyebrow">TWINLEARN ACCESS</span>
        <h2>{mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}</h2>
      </div>

      <button className="auth-google" onClick={googleLogin}>
        <Globe size={16} /> Continue with Google
      </button>

      <div className="auth-divider"><span>atau lanjutkan dengan email</span></div>

      <label className="auth-field">
        <Mail size={15} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label className="auth-field">
        <Lock size={15} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>

      {error && <div className="auth-error">{error}</div>}

      <button className="button primary auth-submit" onClick={submit} disabled={loading}>
        {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'} <ArrowRight size={15} />
      </button>

      <button className="auth-toggle" onClick={() => setMode((val) => (val === 'login' ? 'signup' : 'login'))}>
        {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
      </button>
    </div>
  );
}
