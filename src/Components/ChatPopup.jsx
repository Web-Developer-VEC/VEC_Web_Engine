import React, { useState } from 'react';
import Lottie from 'react-lottie-player';
import './ChatPopup.css';

function ChatPopup() {
  const [isChatOpen, setIsChatOpen] = useState(false); // State to open/close chat
  const [messages, setMessages] = useState([]); // State for storing messages
  const [newMessage, setNewMessage] = useState(''); // State for the new message input

  // Function to toggle the chat popup
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Function to handle message sending
  const sendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, newMessage]); // Add new message to the list
      setNewMessage(''); // Clear the input field
    }
  };

  return (
    <div>
      {/* Chat Icon Button */}
      <div className="chat-icon" onClick={toggleChat}>
        <Lottie
              loop
              animationData={require('./Assets/Chatbot.json')}
              play
         />
      </div>

      {/* Conditionally render chat popup based on isChatOpen */}
      {isChatOpen && (
        <div className="chat-popup">
          <h2>Chat with us!</h2>
          
          {/* Display messages */}
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className="message">
                {message}
              </div>
            ))}
          </div>

          {/* Input field and send button */}
          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPopup;
