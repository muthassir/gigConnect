import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import Login from "./pages/login";
import Register from "./pages/Register";
import GigFeed from "./pages/GigFeed";
import Messages from "./pages/Messages";
import { AuthProvider } from "./context/AuthContext.jsx";

const App = () => {
  return (
    <div>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Dashboard />} />

            {/* Auth routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Gig Feed and Messaging routes */}
            <Route path="/gigfeeds" element={<GigFeed />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
          <Footer />
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
