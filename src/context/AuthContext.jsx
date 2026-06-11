/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);
const STORAGE_KEY = "currentUser";

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  const login = useCallback(async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    const data = response.data || {};

    if (!data.success || !data.user) {
      return {
        success: false,
        message: data.message || "Identifiants incorrects",
      };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    setCurrentUser(data.user);
    return { success: true, user: data.user };
  }, []);

  const changePassword = useCallback(async (username, newPassword) => {
    const response = await api.put("/auth/change-password", {
      username,
      new_password: newPassword,
    });
    const data = response.data || {};

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Erreur lors du changement de mot de passe",
      };
    }

    const updatedUser = { ...currentUser, force_password_change: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    return { success: true };
  }, [currentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      login,
      changePassword,
      logout,
      isAuthenticated: Boolean(currentUser),
    }),
    [currentUser, login, changePassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
