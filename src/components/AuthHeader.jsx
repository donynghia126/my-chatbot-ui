// src/components/AuthHeader.jsx
// Header chuyên dụng cho các trang xác thực (Login, Register).

import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
// import '../styles/AuthHeader.css'; // Sẽ tạo file này

function AuthHeader() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useAuth(); // Lấy theme và hàm toggle từ context

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <header className="auth-header-container">
      {/* Logo liên kết đến trang chủ yêu cầu */}
      <a
        href="https://example.com"
        className="auth-logo-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* Sếp có thể thay thế text bằng thẻ <img> cho logo thật */}
        <span className="auth-logo-text">StudyDony AI</span>
      </a>

      {/* Cụm điều khiển */}
      <div className="auth-header-controls">
        <div className="language-switcher">
          <select
            value={i18n.language}
            onChange={changeLanguage}
            className="language-select"
            title={t("languageSelectorTitle")}
          >
            <option value="en">{t("languages.en")}</option>
            <option value="vi">{t("languages.vi")}</option>
            <option value="ja">{t("languages.ja")}</option>
          </select>
        </div>
        <button
          onClick={toggleTheme}
          className="theme-toggle-button"
          title={t("themeToggleButtonTitle")}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
}

export default AuthHeader;
