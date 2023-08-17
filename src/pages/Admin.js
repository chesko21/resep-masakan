import React, { useState, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage'; // Komponen untuk pesan
import ChatInput from '../components/ChatInput'; // Komponen untuk input pesan
import { fetchChatMessages, sendChatMessage } from '../services/chatService'; // Fungsi untuk mengambil dan mengirim pesan

const Admin = () => {
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // Panggil fungsi untuk mengambil daftar pesan saat komponen dimuat
    const messages = fetchChatMessages();
    setChatMessages(messages);
  }, []);

  const handleSendMessage = (message) => {
    // Panggil fungsi untuk mengirim pesan baru ke backend
    sendChatMessage(message);
    // Update daftar pesan setelah pengiriman pesan
    setChatMessages([...chatMessages, message]);
  };

  return (
    <div>
      <h1>Admin Chat</h1>
      <div className="chat-list">
        {chatMessages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Admin;
