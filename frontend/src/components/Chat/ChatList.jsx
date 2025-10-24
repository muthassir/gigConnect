
import React from 'react';

export default function ChatList({ chats, onSelect }) {
  return (
    <div className="border h-full overflow-auto">
      <div className="p-2 border-b">Conversations</div>
      <ul>
        {chats.map(c => (
          <li key={c._id} className="p-2 border-b cursor-pointer" onClick={() => onSelect(c)}>
            <div className="font-semibold">{c.title || c.name}</div>
            <div className="text-sm text-gray-600">{c.lastMessage?.text?.slice(0,40)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
