import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { client } from '../lib/api/client';
import { refreshClient } from '../lib/api/refreshClient';
import { tokenStore } from './tokenStore';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  class?: string;
  board?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: try to restore session on app load
  useEffect(() => {
    // Skip refresh if no refresh token cookie exists
    const hasCookie = document.cookie.includes('refreshToken');
    if (!hasCookie) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data: refresh } = await refreshClient.post('/auth/refresh');
        tokenStore.set(refresh.data.accessToken);
        const { data: me } = await client.get('/auth/me');
        setUser(me.data);
      } catch {
        // No valid session — stay logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } finally {
      tokenStore.clear();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
