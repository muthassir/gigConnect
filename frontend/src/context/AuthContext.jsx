import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //API 
  const API = axios.create({
    baseURL: "http://localhost:5000",
  });

  //  API headers
  const setAuthHeader = (token) => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  };

  // check if user exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setAuthHeader(token);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // login 
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await API.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthHeader(token);
      setUser(user);
      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // register
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await API.post("/api/auth/register", {
        name,
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthHeader(token);
      setUser(user);
      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // logout
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
  };

  return <AuthContext.Provider value={value}>
            {children}
          </AuthContext.Provider>;
};
