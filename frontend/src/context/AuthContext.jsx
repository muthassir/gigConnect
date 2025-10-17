import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = axios.create({
    baseURL: "http://localhost:5000",
  });

  // checking if user exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      // API call to login
      const response = await API.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setLoading(false);
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }

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
        setUser(user);
        setLoading(false);
      } catch (error) {
        const message = error.response?.data?.message || "Registration failed";
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    };


    // logout
    const logout = () =>{
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      setUser(null)
    }

    // value
    const value = {
      user,
      login,
      register,
      logout,
      loading,
    };
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  };
};
