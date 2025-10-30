import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/socketContext";
import { getMyConversations, sendMessage, getMessages, startConversation } from "../services/api";
import Alert from "../components/Alert";

function Messages() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // In your Messages component, update the socket effects:

useEffect(() => {
  if (selectedConversation && connected && socket) {
    console.log("Joining room:", selectedConversation._id);
    
    // Join the conversation room
    socket.emit("join", { room: selectedConversation._id });
    
    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log("New message received:", message);
      if (message.conversation === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
      }
      // Refresh conversations to update last message
      loadConversations();
    };

    socket.on("message", handleNewMessage);
    
    return () => {
      console.log("Leaving room:", selectedConversation._id);
      socket.emit("leave", { room: selectedConversation._id });
      socket.off("message", handleNewMessage);
    };
  }
}, [selectedConversation, connected, socket]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewMessage = (message) => {
    if (message.conversation === selectedConversation._id) {
      setMessages(prev => [...prev, message]);
    }
    // Refresh conversations to update last message
    loadConversations();
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await getMyConversations();
      setConversations(response.data || []);
    } catch (err) {
      setError("Failed to load conversations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId);
      setMessages(response.data || []);
    } catch (err) {
      setError("Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    setError("");

    try {
      const messageData = {
        conversationId: selectedConversation._id,
        content: newMessage.trim(),
        receiverId: getOtherUser(selectedConversation)._id
      };

      const response = await sendMessage(messageData);
      
      // Emit the message via socket
      if (connected) {
        socket.emit("message", {
          room: selectedConversation._id,
          ...response.data
        });
      }
      
      setNewMessage("");
      
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p._id !== user._id);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return "No messages yet";
    const content = conversation.lastMessage.content;
    return content.length > 30 ? content.substring(0, 30) + "..." : content;
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-warning">
          <span>Please log in to view messages.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen max-w-6xl">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-success">Messages</h1>
            <p className="text-gray-600 mt-2">Communicate with clients and freelancers</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success' : 'bg-error'}`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {error && <Alert alert={error} type="error" />}

        <div className="flex flex-1 border rounded-lg shadow-lg bg-base-100 overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-full md:w-80 border-r bg-base-200">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-8">
                <div className="text-gray-500 mb-4">No conversations yet</div>
                <p className="text-sm text-gray-600">
                  Start a conversation by contacting someone about a gig
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-base-300 transition-colors ${
                        selectedConversation?._id === conversation._id ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full">
                            <img 
                              src={otherUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                              alt={otherUser?.username}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold truncate">{otherUser?.username}</h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {getLastMessagePreview(conversation)}
                          </p>
                          {conversation.gig && (
                            <div className="text-xs text-primary mt-1 truncate">
                              Re: {conversation.gig.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-base-100">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full">
                        <img 
                          src={getOtherUser(selectedConversation)?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                          alt={getOtherUser(selectedConversation)?.username}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{getOtherUser(selectedConversation)?.username}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {getOtherUser(selectedConversation)?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 bg-base-100">
                  {loading ? (
                    <div className="flex justify-center">
                      <span className="loading loading-spinner"></span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                              message.sender._id === user._id
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-300 text-base-content'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.sender._id === user._id ? 'You' : message.sender.username}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            <div className="text-xs opacity-70 mt-1 text-right">
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-base-100">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="input input-bordered flex-1"
                      disabled={sending || !connected}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!newMessage.trim() || sending || !connected}
                    >
                      {sending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center bg-base-100">
                <div className="text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;