import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserDTO } from '@shared/types';
import { setAccessTokenGetter } from '../services/api';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (user: UserDTO, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null });

  // Expose current token to axios via module-level getter
  useEffect(() => {
    setAccessTokenGetter(() => state.accessToken);
  }, [state.accessToken]);

  const login = useCallback((user: UserDTO, token: string) => {
    setState({ user, accessToken: token });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, accessToken: null });
  }, []);

  const setToken = useCallback((token: string) => {
    setState((prev) => ({ ...prev, accessToken: token }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
