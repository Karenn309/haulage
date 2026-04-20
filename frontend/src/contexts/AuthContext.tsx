import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check expiry
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("auth_token");
        } else {
          setUser({
            id: payload.id || payload.user_id || "",
            username: payload.username || "",
            role: payload.role || "dispatcher",
          });
        }
      } catch (e) {
        localStorage.removeItem("auth_token");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("auth_token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
