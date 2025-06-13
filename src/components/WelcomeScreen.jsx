// src/components/WelcomeScreen.jsx

import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/WelcomeScreen.css"; // Sẽ tạo file này ở bước sau

function WelcomeScreen({ onPromptClick }) {
  const { t } = useTranslation();

  // Danh sách các câu hỏi gợi ý
  const suggestionPrompts = [
    t("welcomeScreen.prompt1"),
    t("welcomeScreen.prompt2"),
    t("welcomeScreen.prompt3"),
    t("welcomeScreen.prompt4"),
  ];

  return (
    <div className="welcome-screen-container">
      <div className="welcome-content">
        <div className="welcome-logo">
          {/* Sếp có thể thay thế bằng logo thật sau này */}
          <span>SD</span>
        </div>
        <h1 className="welcome-title">
          {t("welcomeScreen.title", "Hôm nay tôi có thể giúp gì cho bạn?")}
        </h1>
        <div className="suggestion-chips-container">
          {suggestionPrompts.map((prompt, index) => (
            <button
              key={index}
              className="suggestion-chip"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
