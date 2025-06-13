// src/components/ConversationList.jsx
// Component này chịu trách nhiệm hiển thị toàn bộ nội dung của sidebar:
// 1. Nút "Cuộc trò chuyện mới".
// 2. Danh sách các cuộc hội thoại đã có (với menu "..." để Xóa/Sửa).
// 3. Panel người dùng và menu Cài đặt ở dưới cùng.

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// --- Component con cho menu "..." ---
// Component này được tách riêng cho gọn, chỉ lo việc hiển thị menu Xóa/Sửa cho mỗi item.
function ConversationOptions({ conversation, onDelete, onRename }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Hook để đóng menu khi người dùng nhấn chuột ra bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // Hàm xử lý khi nhấn nút Đổi tên
  const handleRenameClick = (e) => {
    e.stopPropagation();
    const newTitle = window.prompt(
      t("prompts.renameConversation", "Nhập tiêu đề mới:"),
      conversation.title
    );
    if (newTitle && newTitle.trim() !== "") {
      onRename(conversation.id, newTitle.trim());
    }
    setIsOpen(false);
  };

  // Hàm xử lý khi nhấn nút Xóa
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Ngăn việc chọn cả conversation item khi chỉ muốn nhấn xóa
    if (
      window.confirm(
        t(
          "confirmations.deleteConversation",
          "Bạn có chắc chắn muốn xóa cuộc hội thoại này? Thao tác này không thể hoàn tác."
        )
      )
    ) {
      onDelete(conversation.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="conversation-options" ref={menuRef}>
      <button
        className="options-button"
        title={t("conversation.options", "Tùy chọn")}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        ...
      </button>
      {isOpen && (
        <div className="options-menu">
          <button className="menu-item" onClick={handleRenameClick}>
            {t("conversation.rename", "Đổi tên")}
          </button>
          <button className="menu-item danger" onClick={handleDeleteClick}>
            {t("conversation.delete", "Xóa")}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Component chính của Sidebar ---
function ConversationList({
  onSelectConversation,
  onNewChat,
  activeConversationId,
  refreshKey,
  onConversationDeleted,
}) {
  // === Khởi tạo các Hooks ===
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, theme, toggleTheme, token } =
    useAuth();

  // === State cục bộ của component ===
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Ref để theo dõi toàn bộ panel cài đặt (giúp xử lý click ra ngoài)
  const settingsRef = useRef(null);

  // === Các Hàm Xử Lý Sự Kiện ===
  const toggleSettingsMenu = () => {
    setIsSettingsOpen((prev) => !prev);
    if (isLangMenuOpen) setIsLangMenuOpen(false); // Đóng menu con khi menu chính thay đổi
  };

  const toggleLangMenu = (e) => {
    e.stopPropagation(); // Ngăn menu chính bị đóng khi chỉ muốn mở menu ngôn ngữ
    setIsLangMenuOpen((prev) => !prev);
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false); // Đóng menu con sau khi chọn
  };

  const handleRenameConversation = async (id, newTitle) => {
    try {
      // Gọi API PUT để cập nhật title
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/v1/conversations/${id}`,
        { conversation: { title: newTitle } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Cập nhật lại UI ngay lập tức với tên mới
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: response.data.title } : c
        )
      );
      toast.success(t("confirmations.renameSuccess", "Đã đổi tên hội thoại."));
    } catch (error) {
      console.error("Lỗi khi đổi tên hội thoại:", error);
      toast.error(
        t("error.renameConversation", "Không thể đổi tên cuộc hội thoại này.")
      );
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/v1/conversations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (onConversationDeleted) {
        onConversationDeleted(id);
        toast.success(t("confirmations.deleteSuccess", "Đã xóa hội thoại."));
      }
    } catch (error) {
      console.error("Lỗi khi xóa hội thoại:", error);
      toast.error(
        t("error.deleteConversation", "Không thể xóa cuộc hội thoại này.")
      );
    }
  };

  // === useEffect Hooks ===
  // 1. Tự động đóng các menu khi người dùng nhấn chuột ra bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsRef]);

  // 2. Tải danh sách các cuộc hội thoại từ backend
  useEffect(() => {
    // Chỉ thực hiện tải khi người dùng đã đăng nhập VÀ token đã có sẵn.
    if (isAuthenticated && token) {
      const fetchConversations = async () => {
        setIsLoading(true);
        try {
          // Luôn gửi token trong header của mỗi request để đảm bảo xác thực thành công.
          // Cách này an toàn hơn là phụ thuộc vào cấu hình mặc định của axios.
          const response = await axios.get(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:3000"
            }/api/v1/conversations`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setConversations(response.data);
        } catch (error) {
          console.error(
            t("error.consoleLog", "Lỗi khi tải danh sách hội thoại:"),
            error
          );
          // Nếu nhận lỗi 401 (Unauthorized), có nghĩa là token đã hết hạn hoặc không hợp lệ.
          // Tự động đăng xuất người dùng để họ đăng nhập lại.
          if (error.response?.status === 401) {
            logout();
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchConversations();
    } else {
      // Nếu không có token hoặc chưa đăng nhập, đảm bảo danh sách trống.
      setConversations([]);
    }
    // Thêm `token` và `logout` vào dependency array để component tự động
    // tải lại dữ liệu khi người dùng đăng nhập/đăng xuất (khi token thay đổi).
  }, [refreshKey, isAuthenticated, token, logout, t]);

  // Mảng dữ liệu cho menu chọn ngôn ngữ
  const languageOptions = [
    { code: "en", name: t("languages.en"), flag: "🇬🇧" },
    { code: "vi", name: t("languages.vi"), flag: "🇻🇳" },
    { code: "ja", name: t("languages.ja"), flag: "🇯🇵" },
  ];
  const currentLanguage =
    languageOptions.find((lang) => lang.code === i18n.language) ||
    languageOptions[0];

  return (
    <div className="conversation-list-container">
      {/* Phần trên của Sidebar: Nút chat mới và danh sách hội thoại */}
      <div className="sidebar-top">
        <button onClick={onNewChat} className="new-chat-button">
          + <span className="sidebar-text">{t("sidebar.newChat")}</span>
        </button>
        <div className="conversation-items">
          {isLoading && <p className="loading-text">{t("sidebar.loading")}</p>}
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`conversation-item ${
                activeConversationId === convo.id ? "active" : ""
              }`}
              onClick={() => onSelectConversation(convo.id)}
            >
              <p className="conversation-title">{convo.title}</p>
              <ConversationOptions
                conversation={convo}
                onDelete={handleDeleteConversation}
                onRename={handleRenameConversation}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Phần dưới của Sidebar: Panel người dùng và cài đặt */}
      <div className="sidebar-bottom" ref={settingsRef}>
        {isAuthenticated ? (
          <div className="user-panel">
            <button
              onClick={toggleSettingsMenu}
              className="settings-toggle-button"
            >
              <div className="user-info">
                <span className="user-avatar">
                  {user?.firstName?.charAt(0)}
                </span>
                <span className="sidebar-text user-welcome-text">
                  {user?.firstName}
                </span>
              </div>
              <span className="kebab-icon">...</span>
            </button>

            {isSettingsOpen && (
              <div className="settings-popup">
                <div className="popup-user-info">
                  <span className="user-avatar">
                    {user?.firstName?.charAt(0)}
                  </span>
                  <div className="user-details">
                    <span className="user-name">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                </div>
                <hr className="divider" />
                <div className="setting-item">
                  <span className="setting-item-label">
                    {t("settings.theme")}
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span className="setting-item-label">
                    {t("settings.language")}
                  </span>
                  <div className="language-select-custom">
                    <button
                      className="language-selected-option"
                      onClick={toggleLangMenu}
                    >
                      <span>{currentLanguage.flag}</span>
                      <span className="sidebar-text">
                        {currentLanguage.name}
                      </span>
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {isLangMenuOpen && (
                      <ul className="language-dropdown-menu">
                        {languageOptions.map((lang) => (
                          <li
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                          >
                            <span>{lang.flag}</span>
                            <span className="sidebar-text">{lang.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <hr className="divider" />
                <div className="setting-item logout-item" onClick={logout}>
                  <span className="setting-item-label">
                    {t("logoutButton")}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links-sidebar">
            <Link to="/login" className="auth-link login-link">
              {t("loginButton")}
            </Link>
            <Link to="/register" className="auth-link register-link">
              {t("registerButton")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationList;
