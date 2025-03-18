import React, { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../../context/SocketContext';

const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.emit('joinGroup', groupId);

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leaveGroup', groupId);
    };
  }, [groupId, socket]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('sendMessage', { groupId, message: newMessage });
      setNewMessage('');
    }
  };

  return (
    <div className="group-chat">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default GroupChat;