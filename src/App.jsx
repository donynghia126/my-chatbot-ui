// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next"; // Hook để sử dụng i18n
import "./App.css"; // Import CSS cho component App

function App() {
  // Khởi tạo hook i18n để lấy hàm dịch (t) và đối tượng i18n (để đổi ngôn ngữ, lấy ngôn ngữ hiện tại)
  const { t, i18n } = useTranslation();

  // === Khai Báo State ===
  const [theme, setTheme] = useState("light"); // State cho theme hiện tại (light/dark), mặc định là 'light'
  const [message, setMessage] = useState(""); // Nội dung tin nhắn người dùng đang gõ
  const [chatHistory, setChatHistory] = useState([]); // Mảng lưu trữ lịch sử cuộc trò chuyện
  const [isLoading, setIsLoading] = useState(false); // Cờ báo hiệu đang chờ phản hồi từ AI

  // Ref để tự động cuộn khung chat xuống tin nhắn mới nhất
  const chatContainerRef = useRef(null);
  // Lấy API URL từ biến môi trường Vite, nếu không có thì dùng localhost (cho development)
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // === useEffect Hooks ===

  // 1. Thiết lập ngôn ngữ mặc định khi app tải lần đầu (nếu chưa có trong localStorage)
  useEffect(() => {
    const savedLanguage = localStorage.getItem("i18nextLng"); // i18next-browser-languagedetector lưu vào đây
    if (!savedLanguage && i18n.language !== "en") {
      // Nếu chưa có ngôn ngữ lưu và ngôn ngữ hiện tại không phải 'en'
      i18n.changeLanguage("en"); // Thì đặt mặc định là tiếng Anh
    }
    // Nếu đã có savedLanguage, LanguageDetector sẽ tự động áp dụng nó từ các lần tải sau.
    // i18n.language !== 'en' để tránh gọi changeLanguage không cần thiết nếu detector đã set đúng.
  }, [i18n]); // Chạy khi i18n object sẵn sàng

  // 2. Tự động cuộn xuống cuối khung chat mỗi khi chatHistory thay đổi
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // 3. Áp dụng theme (light/dark) vào thẻ <html> mỗi khi state 'theme' thay đổi
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme"); // :root (light theme) sẽ được áp dụng
    }
    // Optional: Lưu theme vào localStorage để ghi nhớ lựa chọn của người dùng
    // localStorage.setItem('theme', theme);
  }, [theme]);

  // === Hàm Xử Lý Logic ===

  // Hàm thay đổi ngôn ngữ giao diện
  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage); // i18next tự động tải file dịch và cập nhật UI
  };

  // Hàm chuyển đổi giữa light theme và dark theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Hàm xử lý gửi tin nhắn
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault(); // Ngăn form submit làm reload trang
    if (!message.trim()) return; // Không gửi tin nhắn rỗng

    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: message,
    };

    // Chuẩn bị session chat gửi cho API (bao gồm lịch sử và tin nhắn mới)
    // 'role' phải là "user" hoặc "model" theo chuẩn Gemini API
    const apiChatSession = [
      ...chatHistory.map((chatItem) => ({
        role: chatItem.sender === "user" ? "user" : "model",
        text: chatItem.text,
      })),
      { role: "user", text: newUserMessage.text },
    ];

    setChatHistory((prev) => [...prev, newUserMessage]); // Cập nhật UI với tin nhắn mới của người dùng
    setMessage(""); // Xóa nội dung ô input
    setIsLoading(true); // Bật trạng thái đang tải

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/chat`, {
        chatSession: apiChatSession,
        targetLanguage: i18n.language, // Gửi ngôn ngữ hiện tại để AI trả lời đúng ngôn ngữ
      });

      const aiReply = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.data.reply,
      };
      setChatHistory((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error(t("errorConsoleLog", "Lỗi khi gọi API:"), error);
      let errorMessage = t("errorDefault");
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message && error.message.includes("Network Error")) {
        errorMessage = t("errorNetwork");
      } else if (error.message) {
        errorMessage = error.message;
      }
      const errorReply = {
        id: `error-${Date.now()}`,
        sender: "ai",
        text: errorMessage,
      };
      setChatHistory((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false); // Tắt trạng thái đang tải
    }
  };

  // Hàm xử lý gửi tin nhắn khi nhấn phím Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // === Phần Render Giao Diện JSX ===
  return (
    <div className="chat-app-container">
      <header className="app-header">
        {/* Tiêu đề ứng dụng, có link về trang chủ */}
        <a href="/" className="header-link">
          <h1>{t("headerTitle")}</h1>
        </a>
        {/* Cụm điều khiển ngôn ngữ và theme */}
        <div className="header-controls">
          <div className="language-switcher">
            <select
              value={i18n.language}
              onChange={changeLanguage}
              className="language-select"
              title={t("languageSelectorTitle", "Chọn ngôn ngữ hiển thị")} // Thêm title cho dễ hiểu
            >
              <option value="en">{t("languages.en")}</option>
              <option value="vi">{t("languages.vi")}</option>
              <option value="ja">{t("languages.ja")}</option>
            </select>
          </div>
          {/* Nút chuyển đổi Sáng/Tối */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-button"
            title={t("themeToggleButtonTitle", "Chuyển đổi giao diện Sáng/Tối")} // Thêm title
          >
            {theme === "light" ? "🌙" : "☀️"}{" "}
            {/* Icon emoji thay đổi theo theme */}
          </button>
        </div>
      </header>

      {/* Khung hiển thị cuộc trò chuyện */}
      <div className="chat-window" ref={chatContainerRef}>
        {chatHistory.map((chatItem) => (
          <div
            key={chatItem.id}
            className={`message-bubble ${
              chatItem.sender === "user" ? "user-message" : "ai-message"
            }`}
          >
            <p className="sender-name">
              <strong>
                {chatItem.sender === "user" ? t("userSender") : t("aiSender")}:
              </strong>
            </p>
            <div className="markdown-content">
              <ReactMarkdown>{chatItem.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {/* Thông báo đang tải */}
        {isLoading && (
          <div className="message-bubble ai-message">
            <em>{t("loadingAIMessage")}</em>
          </div>
        )}
      </div>

      {/* Form nhập liệu và gửi tin nhắn */}
      <form onSubmit={handleSendMessage} className="message-input-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t("inputPlaceholder")}
          rows="3"
        />
        <button type="submit" disabled={isLoading} title={t("sendButton")}>
          {/* Icon cho nút gửi, thay đổi tùy trạng thái */}
          {isLoading ? "..." : "➢"}{" "}
          {/* "..." khi đang tải, "➢" (hoặc ✈️) khi bình thường */}
        </button>
      </form>
    </div>
  );
}

export default App;
