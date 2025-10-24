
import React, { useEffect, useState } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import api from '../services/api';

export default function MessagesPage({ currentUser }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(()=>{
  
    const load = async () => {
      const res = await api.get('/conversations'); 
      setChats(res.data.conversations || []);
      if (res.data.conversations?.length) setActiveChat(res.data.conversations[0]);
    };
    load().catch(console.error);
  }, []);

  return (
    <div className="flex gap-4 h-[80vh]">
      <div className="w-1/3">
        <ChatList chats={chats} onSelect={setActiveChat} />
      </div>
      <div className="flex-1">
        {activeChat ? (
          <ChatWindow roomId={`room_${activeChat._id}`} user={currentUser} />
        ) : (
          <div className="p-4">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
