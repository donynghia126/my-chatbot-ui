// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  // Lấy trạng thái xác thực từ "trung tâm chỉ huy"
  const { isAuthenticated } = useAuth();

  // Nếu đã đăng nhập (isAuthenticated là true), cho phép truy cập
  // <Outlet /> sẽ render component con (ChatPage)
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Nếu chưa đăng nhập, "hộ tống" về trang login
  return <Navigate to="/login" replace />;
}

export default ProtectedRoute;
