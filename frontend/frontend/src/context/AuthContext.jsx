import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("ai_ecms_user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored user:", e);
    }
    // Default initial user profile (Alex)
    return {
      id: 1,
      name: "Alex",
      email: "alex@college.edu",
      role: "Student",
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ai_ecms_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ai_ecms_user");
    }
  }, [user]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || "Login failed." };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Login failed. Please check your credentials.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await registerUser(name, email, password, role);
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || "Registration failed." };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Registration failed. Please try again.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("ai_ecms_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
