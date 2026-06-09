import { useContext } from "react";
import AuthContext from "../../contexts/auth/AuthContext";
import type { AuthContextType } from "../../types/auth/AuthContext";

const guestAuthContext: AuthContextType = {
  user: null,
  token: null,
  role: "guest",
  login: () => {},
  logout: async () => {},
  isAuthenticated: false,
  isLoading: false,
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  return ctx ?? guestAuthContext;
};
