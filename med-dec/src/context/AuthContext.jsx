import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken as removeToken, getToken, setToken as saveToken } from "../utils/auth";
import { API_BASE_URL } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setInitialized(true);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          removeToken();
          setTokenState(null);
          setUser(null);
          setInitialized(true);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
      } finally {
        setInitialized(true);
      }
    }

    loadUser();
  }, [token]);

  const login = (newToken, userData) => {
    if (!newToken) return;
    saveToken(newToken);
    setTokenState(newToken);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      initialized,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, user, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
