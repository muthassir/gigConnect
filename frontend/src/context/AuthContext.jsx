import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for stored token and user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
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

  // Login function using API
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);
      
      const { token, user: userData } = response; 

      if (!token || !userData) {
          throw new Error("Server response did not contain token or user data.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData); 
      
      if (userData.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function using API
  const register = async (username, email, password, role) => {
    try {
      setLoading(true);
      const response = await apiRegister(username, email, password, role);

      const { token, user: userData } = response;

      if (!token || !userData) {
          throw new Error("Server response did not contain token or user data.");
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      if(userData.role === "client"){
        navigate("/client/dashboard");
      } else {
        navigate("/freelancer/dashboard");
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error("Register error:", error);
      const message =
        error?.response?.data?.message ||
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
    setUser(null);
    navigate('/login');
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};