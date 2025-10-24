import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer"; 
import Dashboard from "./components/Dashboard"; 
import Login from "./pages/Login"; 
import Register from "./pages/Register"; 
import GigFeed from "./pages/GigFeed"; 
import Messages from "./pages/Messages"; 
import { AuthProvider, useAuth } from "./context/AuthContext"; 

// route protection component
const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return element;
};

const App = () => {
  return (
    <div>
      <Router>
        <AuthProvider>
          <Navbar />
          <div className="pt-16 min-h-screen"> 
            <Routes>
              {/* Default route */}
              <Route path="/" element={<Dashboard />} />

              {/* Auth routes protected by ProtectedRoute */}
              <Route 
                path="/login" 
                element={<ProtectedRoute element={<Login />} />} 
              />
              <Route 
                path="/register" 
                element={<ProtectedRoute element={<Register />} />} 
              />

              {/* General Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/gigfeeds" element={<GigFeed />} />
              <Route path="/messages" element={<Messages />} />
            </Routes>
          </div>
          <Footer />
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
