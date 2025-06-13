// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // <<-- IMPORT COMPONENT
import "react-toastify/dist/ReactToastify.css"; // <<-- IMPORT CSS CỦA NÓ
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute"; // <<-- IMPORT "VỆ SĨ TỐI CAO"
import AdminUsersPage from "./pages/AdminUsersPage"; // <<-- IMPORT TRANG ADMIN

function App() {
  return (
    <>
      {/* "Sân khấu" cho các thông báo, đặt ở đây để nó tồn tại trên mọi trang */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // "colored" sẽ tự đổi màu theo type (success, error...)
      />
      <Routes>
        {/* === CÁC ROUTE CẦN ĐĂNG NHẬP === */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* === CÁC ROUTE CẦN QUYỀN ADMIN === */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          {/* Các trang admin khác sẽ đặt ở đây */}
        </Route>

        {/* === CÁC ROUTE CÔNG KHAI === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
