import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate()

  // API
  const API = axios.create({
    baseURL: "http://localhost:5000",
    // baseURL:  "https://gigconnect-jd3a.onrender.com",
  });

  // API headers function
  const setAuthHeader = (token) => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  };

  // Check for stored token and user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setAuthHeader(token);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
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
      
      const { token, user: userData } = response.data; 

      if (!token || !userData) {
          throw new Error("Server response did not contain token or user data.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthHeader(token);
      setUser(userData); 
      
      if (userData.role === 'client') {
      navigate('/client/dashboard');
    } else {
      navigate('/freelancer/dashboard');
    }

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

      const { token, user: userData } = response.data;

      if (!token || !userData) {
          throw new Error("Server response did not contain token or user data.");
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthHeader(token);
      setUser(userData)

      if(userData.role === "client"){
        navigate("/client/dashboard")
      }else{
        navigate("/client/dashboard")
      }
           


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