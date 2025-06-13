// src/pages/LoginPage.jsx
// Trang này chịu trách nhiệm cho giao diện và logic của form Đăng Nhập.

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import AuthHeader from "../components/AuthHeader"; // <<-- Import Header chung, rất tốt!
import "../styles/Auth.css"; // <<-- Import CSS cho form
import "../styles/AuthHeader.css"; // <<-- Nhớ import CSS cho Header mới

function LoginPage() {
  // === Khởi tạo các Hooks ===
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // === Khai báo State của Component ===
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // === Các Hàm Xử Lý Sự Kiện ===
  // Cập nhật state formData mỗi khi người dùng gõ chữ
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm changeLanguage đã được chuyển vào AuthHeader.jsx, không cần ở đây nữa.

  // Hàm chính xử lý logic khi người dùng nhấn nút "Đăng nhập"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/v1/login`,
        { email: formData.email, password: formData.password }
      );

      // Báo cáo lên AuthContext để xử lý việc lưu token và cập nhật state toàn app.
      login(response.data);

      toast.success(t("loginPage.successMessage", "Đăng nhập thành công!"));
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.response?.data);
      if (error.response?.data?.error) {
        // Nếu backend trả về lỗi cụ thể (ví dụ: "Invalid email or password")
        setError(error.response.data.error);
      } else {
        // Các lỗi khác (mạng, server sập...)
        setError(t("errorDefault"));
      }
    } finally {
      setIsLoading(false); // Luôn tắt loading sau khi request hoàn tất
    }
  };

  // === Phần Render Giao Diện (JSX) ===
  return (
    // <<-- SỬA LỖI 1: Bọc tất cả trong một Fragment <> ... </> -->>
    <>
      {/* Sử dụng Header chung cho các trang xác thực */}
      <AuthHeader />

      {/* Container chính để căn giữa form */}
      <div className="auth-container">
        <div className="auth-card">
          {/* <<-- SỬA LỖI 2: Đã xóa bộ chọn ngôn ngữ bị trùng lặp ở đây -->> */}

          {/* Tiêu đề form */}
          <h1 className="auth-title">{t("loginPage.title")}</h1>

          {/* Khu vực hiển thị lỗi */}
          {error && (
            <div className="error-box">
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Form đăng nhập */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">{t("form.email")}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t("form.password")}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading
                ? t("loginPage.loggingInButton")
                : t("loginPage.loginButton")}
            </button>
          </form>

          {/* Link chuyển sang trang Đăng ký */}
          <p className="auth-switch-link">
            {t("loginPage.noAccountYet")}
            <Link to="/register">{t("loginPage.registerLink")}</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
