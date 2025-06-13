// src/context/AuthContext.jsx
// Phiên bản cuối cùng, đã ổn định lại quy trình cập nhật state

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // === STATE QUẢN LÝ ===

  // Khởi tạo user một cách an toàn từ localStorage chỉ MỘT LẦN DUY NHẤT khi app tải
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      // Chỉ parse nếu storedUser tồn tại và không phải là chuỗi "undefined"
      if (storedUser && storedUser !== "undefined") {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error(
        "Lỗi khi parse user từ localStorage, đang xóa dữ liệu cũ:",
        error
      );
      localStorage.removeItem("currentUser"); // Xóa dữ liệu bị lỗi
      return null;
    }
  });

  // Khởi tạo token từ localStorage
  const [token, setToken] = useState(
    () => localStorage.getItem("authToken") || null
  );

  // Khởi tạo theme từ localStorage
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const navigate = useNavigate();

  // === useEffect Hooks ===

  // Hook này CHỈ CÓ MỘT NHIỆM VỤ: cập nhật header cho axios khi token thay đổi
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]); // Hook này chạy khi app tải (nếu có token) và sau khi login/logout

  // Hook xử lý theme (giữ nguyên)
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // === CÁC HÀM XỬ LÝ LOGIC ===

  // Hàm login là nguồn duy nhất để CẬP NHẬT state sau khi đăng nhập
  const login = (data) => {
    // Backend trả về: { token, user: { id, email, first_name, last_name, admin } }
    // Hoặc phiên bản cũ hơn: { token, user_id, email, ... }
    // Mình sẽ xử lý cả hai cho an toàn
    const {
      token,
      user: userData,
      user_id,
      email,
      first_name,
      last_name,
      admin,
    } = data;

    if (token) {
      // Ưu tiên object user lồng nhau, nếu không có thì tự tạo từ các trường phẳng
      const currentUser = userData || {
        id: user_id,
        email: email,
        firstName: first_name,
        lastName: last_name,
        admin: admin,
      };

      // Kiểm tra lại lần nữa để chắc chắn currentUser không phải object rỗng hoặc undefined
      if (currentUser && currentUser.id) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        setToken(token);
        setUser(currentUser);
      } else {
        console.error(
          "Dữ liệu đăng nhập không hợp lệ từ server (thiếu thông tin user):",
          data
        );
      }
    } else {
      console.error(
        "Dữ liệu đăng nhập không hợp lệ từ server (thiếu token):",
        data
      );
    }
  };

  // Hàm logout là nguồn duy nhất để XÓA state khi đăng xuất
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // "Gói hàng" cung cấp cho toàn bộ ứng dụng
  const value = {
    token,
    user,
    theme,
    isAuthenticated: !!token,
    login,
    logout,
    toggleTheme,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để dễ dàng sử dụng Context
export const useAuth = () => {
  return useContext(AuthContext);
};
