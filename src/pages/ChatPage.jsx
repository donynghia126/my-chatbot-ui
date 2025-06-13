// src/pages/ChatPage.jsx
// Trang chính của ứng dụng, chứa Sidebar và Khung Chat chính.

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ConversationList from "../components/ConversationList";
import WelcomeScreen from "../components/WelcomeScreen";
import "../App.css";
import "../styles/ConversationList.css";
import "../styles/WelcomeScreen.css";

function ChatPage() {
  // === Khởi tạo các Hooks ===
  const { t, i18n } = useTranslation();
  // Lấy trạng thái xác thực và theme từ Context toàn cục
  const { user, isAuthenticated, logout, theme, toggleTheme } = useAuth();

  // === State cục bộ của trang Chat ===
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Dùng để "ra lệnh" cho sidebar tải lại
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // === Refs ===
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // === useEffect Hooks ===
  // Tự động cuộn xuống cuối khung chat mỗi khi có tin nhắn mới
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // === Các Hàm Xử Lý Sự Kiện ===
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSelectConversation = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    setChatHistory([]);
    setCurrentConversationId(id);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/conversations/${id}`
      );
      const formattedHistory = response.data.messages.map((msg) => ({
        id: `msg-${msg.id}`,
        sender: msg.role === "user" ? "user" : "ai",
        text: msg.content,
      }));
      setChatHistory(formattedHistory);
    } catch (error) {
      console.error("Lỗi khi tải hội thoại:", error);
      alert(t("error.loadConversation", "Không thể tải cuộc hội thoại này."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setChatHistory([]);
    setMessage("");
  };

  // Hàm được gọi khi một conversation ở sidebar bị xóa
  const handleConversationDeleted = (deletedId) => {
    // Nếu conversation đang mở bị xóa, thì reset lại trang chat về màn hình chào mừng
    if (currentConversationId === deletedId) {
      handleNewChat();
    }
  };

  const handlePromptClick = (prompt) => {
    setMessage(prompt);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const tempMessage = message;
    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: tempMessage,
    };

    setChatHistory((prev) => [...prev, newUserMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/chat`, {
        conversation_id: currentConversationId,
        message: tempMessage,
        targetLanguage: i18n.language, // `i18n` vẫn có thể lấy từ hook `useTranslation`
      });

      const { reply, conversation_id: newConversationId } = response.data;
      const aiReply = { id: `ai-${Date.now()}`, sender: "ai", text: reply };

      setChatHistory((prev) => [...prev, aiReply]);

      if (!currentConversationId && newConversationId) {
        setCurrentConversationId(newConversationId);
        setRefreshKey((prevKey) => prevKey + 1); // Kích hoạt làm mới sidebar
      }
    } catch (error) {
      console.error(t("errorConsoleLog", "Lỗi khi gọi API:"), error);
      let errorMessage = t("errorDefault");
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message?.includes("Network Error")) {
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
    // Giữ nguyên logic class của sếp: isSidebarOpen ? "sidebar-closed" : "sidebar-open"
    <div
      className={`chat-page-layout ${
        isSidebarOpen ? "sidebar-closed" : "sidebar-open"
      }`}
    >
      <aside className="sidebar">
        <ConversationList
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          activeConversationId={currentConversationId}
          refreshKey={refreshKey}
          onConversationDeleted={handleConversationDeleted} // Truyền hàm xử lý xóa xuống
        />
      </aside>

      <main className="main-chat-area">
        <div className="chat-app-container">
          {/* Header giờ đây đã được tinh giản, chỉ còn nút toggle và tiêu đề */}
          <header className="app-header">
            <button
              onClick={toggleSidebar}
              className="sidebar-toggle-button"
              title="Toggle Sidebar"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <a href="/" className="header-link">
              <h1>{t("headerTitle")}</h1>
            </a>
            {/* Toàn bộ cụm điều khiển cũ đã được chuyển sang sidebar, giữ lại comment theo ý sếp */}
            {/* <div className="header-controls"> ... </div> */}
          </header>

          {/* Khu vực nội dung chính */}
          <div className="chat-content-area">
            {/* Nếu chưa có conversation ID và lịch sử chat trống -> Màn hình Chào mừng */}
            {!currentConversationId && chatHistory.length === 0 ? (
              <WelcomeScreen onPromptClick={handlePromptClick} />
            ) : (
              // Ngược lại -> Khung chat
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
                        {chatItem.sender === "user"
                          ? t("userSender")
                          : t("aiSender")}
                        :
                      </strong>
                    </p>
                    <div className="markdown-content">
                      <ReactMarkdown>{chatItem.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message-bubble ai-message">
                    <em>{t("loadingAIMessage")}</em>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form nhập liệu luôn hiển thị */}
          <form onSubmit={handleSendMessage} className="message-input-form">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("inputPlaceholder")}
              rows="3"
            />
            <button type="submit" disabled={isLoading} title={t("sendButton")}>
              {isLoading ? (
                "..."
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
