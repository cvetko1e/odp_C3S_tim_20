import React, { createContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthContextType } from "../../types/auth/AuthContext";
import type { AuthUser } from "../../types/auth/AuthUser";
import type { JwtTokenClaims } from "../../types/auth/JwtTokenClaims";
import { authApi } from "../../api_services/auth/AuthAPIService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const KEY = "authToken";

const decode = (token: string): JwtTokenClaims => {
  try {
    const d = jwtDecode<JwtTokenClaims>(token);
    return d?.id ? d : { id: 0, username: "", role: "user", exp: 0 };
  } catch {
    return { id: 0, username: "", role: "user", exp: 0 };
  }
};

const expired = (token: string): boolean => {
  try {
    const d = jwtDecode<{ exp?: number }>(token);
    return !d?.exp || d.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const getInitialAuth = () => {
  const saved = localStorage.getItem(KEY);

  if (saved && !expired(saved)) {
    const claims = decode(saved);
    if (claims.id !== 0) {
      return {
        token: saved,
        user: { id: claims.id, username: claims.username, role: claims.role, } as AuthUser,
      };
    }
  }

  if (saved) localStorage.removeItem(KEY);

  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = getInitialAuth();

  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [isLoading] = useState(false);

  const login = (t: string) => {
    const claims = decode(t);
    if (claims.id === 0 || expired(t)) return;

    setToken(t);
    setUser({ id: claims.id, username: claims.username, role: claims.role });
    localStorage.setItem(KEY, t);
  };

  const logout = async () => {
  try {
    if (token) {
      await authApi.logout(token);
    }
  } catch (error) {
    console.error("Logout API failed", error);
  }

  setToken(null);
  setUser(null);
  localStorage.removeItem(KEY);
};

  const role = user?.role ?? "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
