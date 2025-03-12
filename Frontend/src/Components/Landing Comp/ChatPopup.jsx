import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie-player';
import './ChatPopup.css';

function ChatPopup() {
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const storedPhone = localStorage.getItem('phoneNumber');
    if (storedPhone) setPhoneNumber(storedPhone);
  }, []);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const handlePhoneSubmit = () => {
    if (phoneNumber.trim().length === 10) { 
      localStorage.setItem('phoneNumber', phoneNumber); 
    } else {
      alert('Please enter a valid 10-digit phone number.');
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() !== '' && phoneNumber) {
      const userMessage = { sender: 'User', text: newMessage };
      setMessages([...messages, userMessage]);

      try {
        const response = await axios.post('http://localhost:8080/ask', {
          query: newMessage,
          phone: phoneNumber,
        });

        if (response.data.response) {
          const botMessage = { sender: 'Assistant', text: response.data.response };
          setMessages(prevMessages => [...prevMessages, botMessage]);
        }
      } catch (error) {
        console.error('API Error:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'Assistant', text: 'Error: Unable to fetch response.' },
        ]);
      }

      setNewMessage('');
    }
  };

  return (
    <div>
      {/* Chat Icon Button */}
      <div className="chat-icon" onClick={toggleChat}>
        <Lottie loop animationData={require('../Assets/Chatbot.json')} play />
      </div>

      {/* Chat Popup */}
      {isChatOpen && (
        <div className="chat-popup">
          <h2>Chat with us!</h2>

          {/* Ask for Phone Number First */}
          {!phoneNumber ? (
            <div className="phone-input">
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button onClick={handlePhoneSubmit}>Submit</button>
            </div>
          ) : (
            <>
              <div className="messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.sender === 'User' ? 'user' : 'assistant'}`}>
                    <strong>{message.sender}:</strong> {message.text}
                  </div>
                ))}
              </div>

              {/* Chat Input Field */}
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatPopup;
