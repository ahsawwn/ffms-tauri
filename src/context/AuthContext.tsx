import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDb } from '../db/client';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface UserSession {
  id: string;
  name: string;
  username: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'KITCHEN';
}

interface AuthContextType {
  user: UserSession | null;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try { const raw = localStorage.getItem('nerve_session'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
  useEffect(() => {
    if (!isTauri) { setIsLoading(false); return; }
    getDb()
      .catch((err) => console.error('Database connection error on boot:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const loginWithPin = async (pin: string): Promise<boolean> => {
    const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    if (!isTauri) {
      const demo: Record<string, UserSession> = {
        '9999': { id: 'usr_owner_1', name: 'Owner', username: 'owner', role: 'OWNER' },
        '8888': { id: 'usr_mgr_1', name: 'Manager', username: 'manager', role: 'MANAGER' },
        '1234': { id: 'usr_cashier_1', name: 'Cashier', username: 'cashier1', role: 'CASHIER' },
        '5555': { id: 'usr_kitchen_1', name: 'Kitchen Staff', username: 'kitchen', role: 'KITCHEN' },
      };
      if (demo[pin]) { setUser(demo[pin]); return true; }
      return false;
    }
    try {
      const db = await getDb();
      const results = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          role: users.role,
        })
        .from(users)
        .where(and(eq(users.pinCode, pin), eq(users.status, 'ACTIVE')));

      if (results.length > 0) {
        setUser(results[0] as UserSession);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login authentication error:', err);
      return false;
    }
  };

  useEffect(() => { try { if (user) localStorage.setItem('nerve_session', JSON.stringify(user)); else localStorage.removeItem('nerve_session'); } catch {} }, [user]);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginWithPin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
