
import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/socketContext';

export default function ChatWindow({ roomId, user }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    if (!socket || !roomId) return;
   
    socket.emit('join', { room: roomId });

    const handleIncoming = (msg) => {
      if (msg.room === roomId) setMessages(m => [...m, msg]);
    };
    socket.on('message', handleIncoming);


    return () => {
      socket.off('message', handleIncoming);
      socket.emit('leave', { room: roomId });
    };
  }, [socket, roomId]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = () => {
    if (!text.trim()) return;
    const msg = {
      room: roomId,
      from: user._id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
   
    socket.emit('message', msg);
   
    setMessages(m => [...m, msg]);
    setText('');
  };

  return (
    <div className="flex flex-col h-full border">
      <div className="p-2 border-b">Chat</div>
      <div className="flex-1 p-2 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === user._id ? 'text-right' : 'text-left'}`}>
            <div className="inline-block p-2 rounded" style={{background: m.from === user._id ? '#DCF8C6' : '#FFF'}}>
              <div className="text-sm">{m.text}</div>
              <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type..." className="flex-1 p-2 border rounded"/>
        <button onClick={send} className="px-4 py-2 border rounded">Send</button>
      </div>
    </div>
  );
}
