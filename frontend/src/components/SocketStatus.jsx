// components/SocketStatus.jsx
import React from "react";
import { useSocket } from "../context/socketContext";

function SocketStatus() {
  const { connected } = useSocket();
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        connected ? 'bg-success text-success-content' : 'bg-error text-error-content'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          connected ? 'bg-success-content' : 'bg-error-content'
        }`}></div>
        {connected ? 'Live' : 'Disconnected'}
      </div>
    </div>
  );
}

export default SocketStatus;