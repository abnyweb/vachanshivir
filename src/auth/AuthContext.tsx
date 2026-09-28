import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser, AdminRole } from '../types';
import { ROLE_PERMISSIONS } from './roles';

export interface GoogleAuthPayload {
  email: string;
  name?: string;
  picture?: string | null;
  captchaToken: string;
  credential?: string;
}

export interface PasswordAuthPayload {
  email: string;
  password: string;
  captchaToken: string;
}

interface AuthValue {
  user: AdminUser | null;
  token: string | null;
  isSuperAdmin: boolean;
  isContentAdmin: boolean;
  isParticipant: boolean;
  signInWithPassword(payload: PasswordAuthPayload): Promise<{ ok: boolean; message?: string; code?: string; user?: AdminUser }>;
  signInWithGoogle(payload: GoogleAuthPayload): Promise<{ ok: boolean; message?: string; notRegistered?: boolean; user?: AdminUser }>;
  requestPasswordReset(email: string, captchaToken: string): Promise<{ ok: boolean; message?: string }>;
  resetPassword(token: string, password: string): Promise<{ ok: boolean; message?: string }>;
  signOut(): void;
  can(area: string): boolean;
}

const AuthContext = createContext<AuthValue | null>(null);
const SESSION_KEY = 'vachanshivir.google.session';
const TOKEN_KEY = 'vachanshivir_auth_token';

export const AUTHORIZED_ADMIN_EMAILS = [
  'david.abnyweb@gmail.com',
  'support@abnyweb.in',
  'support@abny.in',
  'ashish@abny.in',
  'contactabny@gmail.com',
  'enquirymsj@gmail.com',
];

export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    AUTHORIZED_ADMIN_EMAILS.includes(normalized) ||
    normalized.endsWith('@vachanshivir.in')
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  });

  const saveAuthSession = (newUser: AdminUser, newToken?: string) => {
    setUser(newUser);
    if (newToken) {
      setToken(newToken);
      try {
        sessionStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(TOKEN_KEY, newToken);
      } catch {
        /* storage restricted */
      }
    }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      localStorage.setItem('vachanshivir_verified_email', newUser.email);
      localStorage.setItem('vachanshivir_verified_name', newUser.name);
    } catch {
      /* storage restricted */
    }
  };

  const signInWithPassword = useCallback(
    async ({ email, password, captchaToken }: PasswordAuthPayload): Promise<{ ok: boolean; message?: string; code?: string; user?: AdminUser }> => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return { ok: false, message: 'Email address is required.' };
      }
      if (!password) {
        return { ok: false, message: 'Password is required.' };
      }
      if (!captchaToken) {
        return { ok: false, message: 'Please complete the Captcha security challenge.' };
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            captchaToken,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          return {
            ok: false,
            message: data.error || 'Login failed. Please check your credentials.',
            code: data.code,
          };
        }

        const safeUser: AdminUser = {
          id: data.user?.id || `usr_${Date.now()}`,
          name: data.user?.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          role: (data.user?.role as AdminRole) || 'PARTICIPANT',
          authProvider: 'email',
          permissions: ROLE_PERMISSIONS[(data.user?.role as AdminRole) || 'PARTICIPANT'],
          registrationId: data.registration?.id,
        };

        saveAuthSession(safeUser, data.token);
        return { ok: true, user: safeUser };
      } catch (err: any) {
        return { ok: false, message: 'Unable to connect to login server. Please try again.' };
      }
    },
    []
  );

  const signInWithGoogle = useCallback(
    async ({ email, name, picture, captchaToken, credential }: GoogleAuthPayload): Promise<{ ok: boolean; message?: string; notRegistered?: boolean; user?: AdminUser }> => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return { ok: false, message: 'Google account email is required.' };
      }
      if (!captchaToken && !credential) {
        return { ok: false, message: 'Please complete the security Captcha challenge before continuing.' };
      }

      const userName = name || normalizedEmail.split('@')[0];

      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            name: userName,
            picture,
            captchaToken: captchaToken || 'google-oauth-token',
            credential,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          return {
            ok: false,
            message: data.error || 'Google authentication failed.',
            notRegistered: data.notRegistered === true,
          };
        }

        let userRole: AdminRole = (data.user?.role as AdminRole) || 'PARTICIPANT';
        if (isAuthorizedAdminEmail(normalizedEmail)) {
          userRole = 'SUPER_ADMIN';
        }

        const safeUser: AdminUser = {
          id: data.user?.id || `gusr_${Date.now()}`,
          name: data.user?.name || userName,
          email: normalizedEmail,
          role: userRole,
          picture: picture || data.user?.picture || null,
          authProvider: 'google',
          permissions: ROLE_PERMISSIONS[userRole] || [],
          registrationId: data.registration?.id,
        };

        saveAuthSession(safeUser, data.token);
        return { ok: true, user: safeUser };
      } catch (err: any) {
        return { ok: false, message: 'Network error during Google sign-in. Please try again.' };
      }
    },
    []
  );

  const requestPasswordReset = useCallback(
    async (email: string, captchaToken: string): Promise<{ ok: boolean; message?: string }> => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return { ok: false, message: 'Email address is required.' };
      }
      if (!captchaToken) {
        return { ok: false, message: 'Security verification (Captcha) is required.' };
      }

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, captchaToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          return { ok: true, message: data.message };
        }
        return { ok: false, message: data.error || 'Failed to submit password reset request.' };
      } catch (err) {
        return { ok: false, message: 'Network error. Please try again.' };
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (resetToken: string, password: string): Promise<{ ok: boolean; message?: string }> => {
      if (!resetToken) {
        return { ok: false, message: 'Invalid or missing reset token.' };
      }
      if (!password || password.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters.' };
      }

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          return { ok: true, message: data.message };
        }
        return { ok: false, message: data.error || 'Failed to reset password.' };
      } catch (err) {
        return { ok: false, message: 'Network error. Please try again.' };
      }
    },
    []
  );

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('vachanshivir_verified_email');
      localStorage.removeItem('vachanshivir_verified_name');
      localStorage.removeItem('vachanshivir_verified_ref');
      localStorage.removeItem('vachanshivir_registration_id');
    } catch {
      /* ignore */
    }
  }, []);

  const can = useCallback(
    (area: string) => {
      if (!user) return false;
      const perms = ROLE_PERMISSIONS[user.role] || [];
      return perms.includes('*') || perms.includes(area);
    },
    [user]
  );

  const isSuperAdmin = useMemo(() => user?.role === 'SUPER_ADMIN', [user]);
  const isContentAdmin = useMemo(() => user?.role === 'CONTENT_ADMIN', [user]);
  const isParticipant = useMemo(() => user?.role === 'PARTICIPANT', [user]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      token,
      isSuperAdmin,
      isContentAdmin,
      isParticipant,
      signInWithPassword,
      signInWithGoogle,
      requestPasswordReset,
      resetPassword,
      signOut,
      can,
    }),
    [
      user,
      token,
      isSuperAdmin,
      isContentAdmin,
      isParticipant,
      signInWithPassword,
      signInWithGoogle,
      requestPasswordReset,
      resetPassword,
      signOut,
      can,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
