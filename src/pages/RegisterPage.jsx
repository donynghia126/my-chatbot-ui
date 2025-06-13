// src/pages/RegisterPage.jsx
// Trang này chịu trách nhiệm cho giao diện và logic của form Đăng Ký người dùng mới.

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AuthHeader from "../components/AuthHeader"; // <<-- Import Header chung
import "../styles/Auth.css"; // <<-- Import CSS cho form
import "../styles/AuthHeader.css"; // <<-- Import CSS cho Header

function RegisterPage() {
  // === Khởi tạo các Hooks ===
  const { t } = useTranslation();
  const navigate = useNavigate();

  // === Khai báo State của Component ===
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // === Các Hàm Xử Lý Sự Kiện ===
  // Cập nhật state formData mỗi khi người dùng gõ chữ
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm changeLanguage đã được chuyển vào component AuthHeader, không cần ở đây nữa.

  // Hàm chính xử lý logic khi người dùng nhấn nút "Đăng ký"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      // Gửi request POST đến API đăng ký của Rails
      await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/v1/users`,
        {
          user: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.passwordConfirmation,
          },
        }
      );

      // Nếu đăng ký thành công
      toast.success(
        t(
          "registerPage.successMessage",
          "Tài khoản đã được tạo! Vui lòng đăng nhập."
        )
      );
      navigate("/login"); // Tự động điều hướng người dùng đến trang đăng nhập
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response?.data);
      if (error.response?.data?.errors) {
        // Nếu backend trả về một mảng các lỗi validation
        setErrors(error.response.data.errors);
      } else {
        // Các lỗi khác
        setErrors([t("errorDefault")]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // === Phần Render Giao Diện (JSX) ===
  return (
    // Bọc tất cả trong một Fragment <> ... </> để có một element gốc duy nhất
    <>
      {/* Sử dụng Header chung cho các trang xác thực */}
      <AuthHeader />

      {/* Container chính để căn giữa form */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Tiêu đề form */}
          <h1 className="auth-title">{t("registerPage.title")}</h1>

          {/* Khu vực hiển thị lỗi */}
          {errors.length > 0 && (
            <div className="error-box">
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form đăng ký */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">{t("form.firstName")}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">{t("form.lastName")}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
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
            <div className="form-group">
              <label htmlFor="passwordConfirmation">
                {t("form.passwordConfirmation")}
              </label>
              <input
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
                value={formData.passwordConfirmation}
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
                ? t("registerPage.registeringButton")
                : t("registerPage.registerButton")}
            </button>
          </form>

          {/* Link chuyển sang trang Đăng nhập */}
          <p className="auth-switch-link">
            {t("registerPage.alreadyHaveAccount")}
            <Link to="/login">{t("registerPage.loginLink")}</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
