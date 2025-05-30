// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // Đã import, tuyệt vời!
import "./App.css";
// import "./index.css"; // File index.css thường được import ở main.jsx, sếp kiểm tra lại nhé. Nếu đã import ở main.jsx thì dòng này không cần thiết ở App.jsx

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Dọn dẹp state không dùng đến từ phần streaming
  // const [streamingAiMessage, setStreamingAiMessage] = useState(""); // Bỏ
  // const [currentAiMessageId, setCurrentAiMessageId] = useState(null); // Bỏ

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    // Thêm id cho tin nhắn để React quản lý key tốt hơn
    const newUserMessage = {
      id: `user-${Date.now()}`, // Tạo id duy nhất
      sender: "user",
      text: message,
    };

    const currentChatSession = [
      ...chatHistory.map((chatItem) => ({
        role: chatItem.sender === "user" ? "user" : "model",
        text: chatItem.text,
      })),
      { role: "user", text: newUserMessage.text },
    ];

    setChatHistory((prev) => [...prev, newUserMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/v1/chat", {
        chatSession: currentChatSession,
      });

      // Thêm id cho tin nhắn của AI
      const aiReply = {
        id: `ai-${Date.now()}`, // Tạo id duy nhất
        sender: "ai",
        text: response.data.reply,
      };
      setChatHistory((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      let errorMessage = "Ối, Gemini gặp chút trục trặc rồi sếp ơi!";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = `Lỗi kết nối: ${error.message}. Sếp kiểm tra lại backend xem sao.`;
      }
      // Thêm id cho tin nhắn lỗi
      const errorReply = {
        id: `error-${Date.now()}`, // Tạo id duy nhất
        sender: "ai", // Hiển thị như tin nhắn của AI
        text: errorMessage,
      };
      setChatHistory((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-app-container">
      <header className="app-header">
        <h1>Gemini Chatbot "Vip Pro"</h1>
      </header>
      <div className="chat-window" ref={chatContainerRef}>
        {chatHistory.map(
          (
            chatItem // Bỏ 'index' nếu dùng chatItem.id làm key
          ) => (
            <div
              key={chatItem.id} // Dùng id duy nhất làm key
              className={`message-bubble ${
                chatItem.sender === "user" ? "user-message" : "ai-message"
              }`}
            >
              {/* Tách riêng tên người gửi và nội dung markdown */}
              <p className="sender-name">
                {" "}
                {/* Thêm class để có thể ẩn nếu không muốn lặp lại tên */}
                <strong>
                  {chatItem.sender === "user" ? "Sếp" : "Gemini"}:
                </strong>
              </p>
              <div className="markdown-content">
                {" "}
                {/* Class này để style riêng cho nội dung markdown */}
                <ReactMarkdown>{chatItem.text}</ReactMarkdown>
              </div>
            </div>
          )
        )}
        {isLoading && (
          <div className="message-bubble ai-message">
            {/* Không cần thẻ <p> bọc <em> nữa nếu CSS đã xử lý .ai-message em */}
            <em>Gemini đang "loading" ý tưởng...</em> 🤔
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="message-input-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Sếp muốn hỏi gì Gemini nè..."
          rows="3" // Số dòng mặc định, CSS có thể cho phép co giãn
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Đang Gửi..." : "Gửi Đi Sếp! 🚀"}
        </button>
      </form>
    </div>
  );
}

export default App;
