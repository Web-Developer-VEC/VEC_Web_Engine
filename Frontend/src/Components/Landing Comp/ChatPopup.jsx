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
  const popupRef = useRef(null);

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

  useEffect(() => {
  if (isChatOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto"; // Reset when component unmounts
  };
}, [isChatOpen]);


  const handlePhoneSubmit = () => {
    if (phoneNumber.trim() !== "" && phoneNumber.length === 10) {
      sessionStorage.setItem("phoneNumber", phoneNumber);
      setIsPhoneSubmitted(true);
    } else {
      setPhoneMessages( "Enter the valid phone number");
    }
  };

  function formatBotResponse(text) {
  // Convert markdown-like links to <a> tags
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const formatted = text
    .replace(linkRegex, `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\n/g, "<br/>"); // line breaks

  return formatted;
}

useEffect(() => {
  function handleClickOutside(event) {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setIsChatOpen(false);
    }
  }

  if (isChatOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  // Cleanup on unmount
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isChatOpen]);

useEffect(() => {
  const storedPhone = sessionStorage.getItem("phoneNumber");
  if (storedPhone) {
    setPhoneNumber(storedPhone);
    setIsPhoneSubmitted(true);
  }

  const storedMessages = localStorage.getItem("chatMessages");
  if (storedMessages) {
    setMessages(JSON.parse(storedMessages));
  }
}, []);

useEffect(() => {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}, [messages]);

const clearChat = () => {
  setMessages([]);
  localStorage.removeItem("chatMessages");
};

  const sendMessage = async () => {

    if (newMessage.trim() !== "" && phoneNumber) {
      const userMessage = { sender: "User", text: newMessage };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await axios.post("/ask", {
          query: newMessage,
          phone: phoneNumber,
        });

        // Typing effect
        let botMessage = { sender: "Assistant", text: "" };
        setMessages((prev) => [...prev, botMessage]);

        let responseText = formatBotResponse(response.data.response);
        // let responseText = response.data.response;

        let index = 0;
        const typingEffect = setInterval(() => {
          if (index < responseText.length) {
            botMessage.text += responseText[index];
            setMessages((prev) => [...prev.slice(0, -1), botMessage]); // Update last message
            index++;
          } else {
            clearInterval(typingEffect);
          }
        }, 30); 
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
        <div className="chat-popup" ref={popupRef}>
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
              <div className="messages"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onScroll={(e) => e.stopPropagation()}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.sender.toLowerCase()}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: message.text }} />
                    {/* {message.text} */}
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