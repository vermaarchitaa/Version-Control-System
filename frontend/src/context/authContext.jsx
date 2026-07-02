import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (userId && token) {
      setCurrentUser({ id: userId, username });
    }
    setLoading(false);
  }, []);

  const login = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username);
    setCurrentUser({ id: data.userId, username: data.username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
