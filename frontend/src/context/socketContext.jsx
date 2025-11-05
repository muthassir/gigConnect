import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  // const HOST = "http://localhost:5000"
    const HOST = "https://gigconnect-jd3a.onrender.com"


  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(HOST, {
        transports: ["websocket", "polling"], 
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to socket server", socketRef.current.id);
        setConnected(true);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("❌ Disconnected from socket server", reason);
        setConnected(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.log("❌ Socket connection error:", error.message);
        setConnected(false);
      });

      socketRef.current.on("reconnect", (attempt) => {
        console.log("🔄 Reconnected to socket server, attempt:", attempt);
        setConnected(true);
      });

      socketRef.current.on("reconnect_attempt", (attempt) => {
        console.log("🔄 Attempting to reconnect:", attempt);
      });

      socketRef.current.on("reconnect_error", (error) => {
        console.log("❌ Reconnection error:", error);
      });

      socketRef.current.on("reconnect_failed", () => {
        console.log("❌ Reconnection failed");
      });
    }

    return () => {
     
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};