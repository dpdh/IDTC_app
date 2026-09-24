import { createClient } from '@supabase/supabase-js';

export type UserRole = 'Super admin' | 'Admin' | 'Membership' | 'Free Member';
export type AppUser = {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google';
  role: UserRole;
};

export const ROLE_OPTIONS: UserRole[] = ['Super admin', 'Admin', 'Membership', 'Free Member'];

const DEMO_SUPER_ADMIN_EMAILS = ['dani@idtc.org', 'ihsan@idtc.org'];
const DEMO_SUPER_ADMIN_PASSWORD = 'Admin123';
const AUTH_KEY = 'twinlearn-auth-user';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getRoleFromEmail(email: string): UserRole {
  const normalized = normalizeEmail(email);
  if (DEMO_SUPER_ADMIN_EMAILS.includes(normalized)) return 'Super admin';
  if (normalized.includes('admin')) return 'Admin';
  if (normalized.includes('super') || normalized.includes('twinlearn')) return 'Super admin';
  if (normalized.includes('member') || normalized.includes('membership')) return 'Membership';
  return 'Free Member';
}

export function getRolePermissions(role: UserRole): string[] {
  switch (role) {
    case 'Super admin':
      return ['Manage users', 'Billing', 'System settings', 'Access all content'];
    case 'Admin':
      return ['Create courses', 'Moderate content', 'Reports', 'Manage users'];
    case 'Membership':
      return ['Access premium classes', 'Download material', 'Community access'];
    case 'Free Member':
    default:
      return ['Basic course access', 'Watch public content'];
  }
}

function saveUser(user: AppUser) {
  if (typeof window === 'undefined') return user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function getCurrentUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) as AppUser : null;
  } catch {
    return null;
  }
}

export function setCurrentUserRole(role: UserRole) {
  const current = getCurrentUser();
  if (!current) return null;
  const next = { ...current, role };
  saveUser(next);
  return next;
}

export function signOut() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
  if (supabaseClient) {
    supabaseClient.auth.signOut();
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<AppUser> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password.trim()) {
    throw new Error('Email dan password wajib diisi.');
  }

  const defaultRole = DEMO_SUPER_ADMIN_EMAILS.includes(normalizedEmail) ? 'Super admin' : getRoleFromEmail(normalizedEmail);

  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.signUp({ email: normalizedEmail, password });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error('Registrasi gagal.');
    return saveUser({
      id: user.id,
      email: user.email ?? normalizedEmail,
      name: user.user_metadata?.full_name || normalizedEmail.split('@')[0],
      provider: 'email',
      role: defaultRole,
    });
  }

  const existing = getCurrentUser();
  if (existing && existing.email === normalizedEmail) {
    return existing;
  }

  const user: AppUser = {
    id: `local-${Date.now()}`,
    email: normalizedEmail,
    name: normalizedEmail.split('@')[0],
    provider: 'email',
    role: defaultRole,
  };

  return saveUser(user);
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password.trim()) {
    throw new Error('Email dan password wajib diisi.');
  }

  if (DEMO_SUPER_ADMIN_EMAILS.includes(normalizedEmail) && password === DEMO_SUPER_ADMIN_PASSWORD) {
    const user: AppUser = {
      id: `demo-super-admin-${Date.now()}`,
      email: normalizedEmail,
      name: normalizedEmail === 'dani@idtc.org' ? 'Dani Hamdani' : normalizedEmail === 'ihsan@idtc.org' ? 'Muhammad Ihsan' : normalizedEmail.split('@')[0].replace(/\b\w/g, (char) => char.toUpperCase()),
      provider: 'email',
      role: 'Super admin',
    };
    return saveUser(user);
  }

  const defaultRole = getRoleFromEmail(normalizedEmail);

  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error('Login gagal.');
    return saveUser({
      id: user.id,
      email: user.email ?? normalizedEmail,
      name: user.user_metadata?.full_name || normalizedEmail.split('@')[0],
      provider: 'email',
      role: defaultRole,
    });
  }

  const user: AppUser = {
    id: `local-${Date.now()}`,
    email: normalizedEmail,
    name: normalizedEmail.split('@')[0],
    provider: 'email',
    role: defaultRole,
  };

  return saveUser(user);
}

export async function signInWithGoogle(): Promise<AppUser> {
  if (supabaseClient) {
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
    return getCurrentUser() ?? {
      id: 'google-demo',
      email: 'user@gmail.com',
      name: 'Google User',
      provider: 'google',
      role: 'Membership',
    };
  }

  const fallbackUser: AppUser = {
    id: `google-${Date.now()}`,
    email: 'user@gmail.com',
    name: 'Google User',
    provider: 'google',
    role: 'Membership',
  };

  return saveUser(fallbackUser);
}
