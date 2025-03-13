import React, { useState, useEffect, useRef } from "react";
import Lottie from "react-lottie-player";
import axios from "axios";
import "./ChatPopup.css";
import { p } from "framer-motion/m";

function ChatPopup() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState(""); 
  const [phoneNumber, setPhoneNumber] = useState(""); 
  const [isPhoneSubmitted, setIsPhoneSubmitted] = useState(false); 
  const [phoneMessage, setPhoneMessages] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedPhone = sessionStorage.getItem("phoneNumber");
    if (storedPhone) {
      setPhoneNumber(storedPhone);
      setIsPhoneSubmitted(true);
    }
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.trim() !== "" && phoneNumber.length === 10) {
      sessionStorage.setItem("phoneNumber", phoneNumber);
      setIsPhoneSubmitted(true);
    } else {
      setPhoneMessages( "Enter the valid phone number");
    }
  };

  const sendMessage = async () => {

    if (newMessage.trim() !== "" && phoneNumber) {
      const userMessage = { sender: "User", text: newMessage };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await axios.post("http://localhost:8080/ask", {
          query: newMessage,
          phone: phoneNumber,
        });

        // Typing effect
        let botMessage = { sender: "Assistant", text: "" };
        setMessages((prev) => [...prev, botMessage]);

        let responseText = response.data.response;
        let index = 0;
        const typingEffect = setInterval(() => {
          if (index < responseText.length) {
            botMessage.text += responseText[index];
            setMessages((prev) => [...prev.slice(0, -1), botMessage]); // Update last message
            index++;
          } else {
            clearInterval(typingEffect);
          }
        }, 30); // Adjust speed (30ms per letter)
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: "Assistant", text: "Error: Unable to fetch response." },
        ]);
      }

      setNewMessage("");
    }
  };

  return (
    <div>
      {/* Chat Icon */}
      <div className="chat-icon" onClick={toggleChat}>
        <Lottie loop animationData={require("../Assets/Chatbot.json")} play />
      </div>

      {/* Chat Popup */}
      {isChatOpen && (
        <div className="chat-popup">
          <h2 className="mb-2">Chat with us!</h2>

          {/* Phone Number Input */}
          {!isPhoneSubmitted ? (
            <div className="phone-input">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setPhoneMessages("")
                }}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Enter your phone number"
              />
              <button onClick={handlePhoneSubmit}>Submit</button>
              {phoneMessage && (
                <p className="error-message">{phoneMessage}</p>
              )}
            </div>
          ) : (
            <>
              {/* Messages Display */}
              <div className="messages">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.sender.toLowerCase()}`}
                  >
                    {message.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Field & Send Button */}
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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