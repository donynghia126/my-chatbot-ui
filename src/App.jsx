// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next"; // Hook để sử dụng i18n
import "./App.css";

function App() {
  // Khởi tạo hook i18n để lấy hàm dịch (t) và đối tượng i18n (để đổi ngôn ngữ)
  const { t, i18n } = useTranslation();

  const [theme, setTheme] = useState("light");

  // === Khai báo State ===
  // message: Nội dung tin nhắn người dùng đang gõ
  const [message, setMessage] = useState("");
  // chatHistory: Mảng lưu trữ lịch sử cuộc trò chuyện
  const [chatHistory, setChatHistory] = useState([]);
  // isLoading: Cờ báo hiệu đang chờ phản hồi từ AI
  const [isLoading, setIsLoading] = useState(false);

  // Ref để tự động cuộn xuống tin nhắn mới nhất
  const chatContainerRef = useRef(null);
  // Lấy API URL từ biến môi trường, nếu không có thì dùng localhost (cho development)
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // === Hàm Thay Đổi Ngôn Ngữ ===
  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage); // i18next sẽ tự động tải file dịch và cập nhật UI
  };
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Lát nữa mình sẽ lưu newTheme này vào localStorage ở một bước nâng cao hơn
  };

  // === useEffect Hook ===
  // Tự động cuộn xuống cuối khung chat mỗi khi chatHistory thay đổi
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Khi theme thay đổi, mình đặt attribute 'data-theme' trên thẻ <html>
    // CSS của mình (trong index.css) sẽ dựa vào attribute này để áp dụng đúng bộ màu
    // Ví dụ: html[data-theme="dark"] { ...các biến màu dark... }
    //        :root { ...các biến màu light... } (mặc định khi không có data-theme="dark")
    // Để light theme là mặc định khi data-theme không phải là "dark",
    // mình có thể đảm bảo xóa attribute nếu là light, hoặc để CSS :root xử lý.
    // Cách đơn giản là luôn set data-theme:
    // document.documentElement.setAttribute('data-theme', theme);
    // Và trong index.css, mình sẽ có:
    // html[data-theme="light"] { /* ... light vars ... */ }
    // html[data-theme="dark"] { /* ... dark vars ... */ }
    // Hoặc, như mình làm: :root cho light, html[data-theme="dark"] cho dark.
    // Vậy thì khi theme là 'light', mình có thể xóa attribute 'data-theme'
    // hoặc đảm bảo CSS :root được ưu tiên khi không có data-theme="dark".

    // Cách hiện tại của mình với :root cho light và html[data-theme="dark"] cho dark là:
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      // Khi là 'light', mình xóa attribute 'data-theme' đi để các biến trong :root (light theme) được áp dụng
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]); // Hook này sẽ chạy mỗi khi state 'theme' thay đổi

  // === Hàm Xử Lý Gửi Tin Nhắn ===
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault(); // Ngăn form submit làm reload trang
    if (!message.trim()) return; // Không gửi tin nhắn rỗng

    // Tạo object tin nhắn mới của người dùng với ID duy nhất
    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: message,
    };

    // Chuẩn bị dữ liệu gửi cho API: bao gồm lịch sử chat và tin nhắn mới của người dùng.
    // 'role' phải là "user" hoặc "model" theo yêu cầu của Gemini API.
    const apiChatSession = [
      ...chatHistory.map((chatItem) => ({
        role: chatItem.sender === "user" ? "user" : "model", // 'user' cho người dùng, 'model' cho AI
        text: chatItem.text,
      })),
      { role: "user", text: newUserMessage.text }, // Tin nhắn mới nhất từ người dùng
    ];

    // Cập nhật UI ngay lập tức với tin nhắn của người dùng (Optimistic Update)
    setChatHistory((prev) => [...prev, newUserMessage]);
    setMessage(""); // Xóa nội dung trong ô input
    setIsLoading(true); // Bật trạng thái đang tải

    try {
      // Gọi API backend
      const response = await axios.post(`${API_BASE_URL}/api/v1/chat`, {
        chatSession: apiChatSession,
        targetLanguage: i18n.language, // Gửi ngôn ngữ hiện tại để AI trả lời đúng ngôn ngữ
      });

      // Xử lý và hiển thị phản hồi từ AI
      const aiReply = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.data.reply,
      };
      setChatHistory((prev) => [...prev, aiReply]);
    } catch (error) {
      // Log lỗi ra console (có thể dịch key 'errorConsoleLog')
      console.error(t("errorConsoleLog", "Lỗi khi gọi API:"), error);
      let errorMessage = t("errorDefault"); // Thông báo lỗi mặc định (đã dịch)

      // Xử lý các loại lỗi cụ thể hơn để có thông báo thân thiện
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error; // Lỗi trả về từ server
      } else if (error.message && error.message.includes("Network Error")) {
        errorMessage = t("errorNetwork"); // Lỗi mạng (đã dịch)
      } else if (error.message) {
        errorMessage = error.message; // Các lỗi khác (hiển thị lỗi gốc từ JS)
      }

      const errorReply = {
        id: `error-${Date.now()}`,
        sender: "ai", // Hiển thị như một tin nhắn từ AI
        text: errorMessage,
      };
      setChatHistory((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false); // Tắt trạng thái đang tải dù thành công hay thất bại
    }
  };

  // === Hàm Xử Lý Gửi Tin Nhắn Khi Nhấn Phím Enter ===
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Chỉ gửi khi nhấn Enter (không phải Shift+Enter để xuống dòng)
      e.preventDefault(); // Ngăn hành vi mặc định của Enter là xuống dòng trong textarea
      handleSendMessage();
    }
  };

  // === Phần Render JSX ===
  return (
    <div className="chat-app-container">
      {/* Header của ứng dụng */}
      <header className="app-header">
        <h1>{t("headerTitle")}</h1>
        <div className="header-controls">
          {" "}
          {/* Bọc cả language switcher và theme toggle cho dễ layout */}
          <div className="language-switcher">
            <select
              value={i18n.language}
              onChange={changeLanguage}
              className="language-select"
            >
              <option value="vi">{t("languages.vi")}</option>
              <option value="en">{t("languages.en")}</option>
              <option value="ja">{t("languages.ja")}</option>
            </select>
          </div>
          {/* === NÚT CHUYỂN THEME MỚI === */}
          <button onClick={toggleTheme} className="theme-toggle-button">
            {/* Hiển thị icon hoặc text tùy theo theme hiện tại */}
            {theme === "light" ? "🌙 " : "☀️ "}
            {/* Sếp có thể dùng icon thật sau này cho đẹp hơn */}
          </button>
        </div>
      </header>

      {/* Khung hiển thị cuộc trò chuyện */}
      <div className="chat-window" ref={chatContainerRef}>
        {chatHistory.map((chatItem) => (
          <div
            key={chatItem.id} // Key duy nhất cho React quản lý list hiệu quả
            className={`message-bubble ${
              chatItem.sender === "user" ? "user-message" : "ai-message"
            }`}
          >
            {/* Tên người gửi (dịch theo ngôn ngữ đã chọn) */}
            <p className="sender-name">
              <strong>
                {chatItem.sender === "user" ? t("userSender") : t("aiSender")}:
              </strong>
            </p>
            {/* Nội dung tin nhắn, được render dưới dạng Markdown */}
            <div className="markdown-content">
              <ReactMarkdown>{chatItem.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {/* Hiển thị thông báo đang tải khi đang chờ AI trả lời */}
        {isLoading && (
          <div className="message-bubble ai-message">
            <em>{t("loadingAIMessage")}</em>{" "}
            {/* Thông báo tải (dịch theo ngôn ngữ đã chọn) */}
          </div>
        )}
      </div>

      {/* Form nhập liệu và gửi tin nhắn */}
      <form onSubmit={handleSendMessage} className="message-input-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress} // Cho phép gửi bằng phím Enter
          placeholder={t("inputPlaceholder")} // Chữ gợi ý (dịch theo ngôn ngữ đã chọn)
          rows="3"
        />
        <button type="submit" disabled={isLoading}>
          {/* Chữ trên nút gửi, thay đổi tùy trạng thái và ngôn ngữ */}
          {isLoading ? t("sendingButton") : t("sendButton")}
        </button>
      </form>
    </div>
  );
}

export default App;
