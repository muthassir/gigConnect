import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // API instance
  const API = axios.create({
    baseURL: "http://localhost:5000",
  });

  // API headers function
  const setAuthHeader = (token) => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  };

  // Check for stored token and user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setAuthHeader(token);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        // Clear invalid storage if parsing fails
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await API.post("/api/auth/login", { email, password });
      
      // CRITICAL FIX: Destructure both token and the user object from the backend response.
      const { token, user: userData } = response.data; 

      if (!token || !userData) {
          throw new Error("Server response did not contain token or user data.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthHeader(token);
      setUser(userData); // Set state with the received user data

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error?.response?.data ?? error.message ?? error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Login failed";
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password, role) => {
    try {
      setLoading(true);
      const response = await API.post("/api/auth/register", {
        username,
        email,
        password,
        role,
      });

      // CRITICAL FIX: Destructure both token and the user object from the backend response.
      const { token, user: userData } = response.data;

      if (!token || !userData) {
          throw new Error("Server response did not contain token or user data.");
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthHeader(token);
      setUser(userData); // Set state with the received user data

      return { success: true, user: userData };
    } catch (error) {
      console.error("Register error:", error?.response?.data ?? error.message ?? error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Registration failed";

      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthHeader(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    API, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};