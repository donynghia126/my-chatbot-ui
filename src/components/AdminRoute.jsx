// src/components/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const { isAuthenticated, user, token } = useAuth();

  // Nếu đang chờ xác thực hoặc lấy thông tin user, có thể hiển thị loading
  if (!token) {
    // Nếu không có token, chắc chắn chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    // Đã có token nhưng đang chờ lấy thông tin user từ localStorage/API
    // Có thể hiển thị một màn hình loading ở đây
    return <div>Verifying access...</div>;
  }

  // Nếu đã xác thực và user là admin, cho phép truy cập
  if (isAuthenticated && user.admin) {
    return <Outlet />;
  }

  // Nếu đã đăng nhập nhưng không phải admin, "hộ tống" về trang chủ
  return <Navigate to="/" replace />;
}

export default AdminRoute;
