// src/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function AdminUsersPage() {
  const { token, user: currentUser } = useAuth(); // Lấy token để gửi kèm request
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return; // Không gọi API nếu không có token
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/v1/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách người dùng:", err);
        setError(
          err.response?.data?.error ||
            "Không thể tải dữ liệu người dùng. Bạn có quyền admin không?"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);
  // === HÀM MỚI: Xử lý việc thay đổi quyền admin ===
  const handleToggleAdmin = async (userToUpdate) => {
    if (userToUpdate.id === currentUser.id) {
      alert("Bạn không thể thay đổi quyền của chính mình.");
      return;
    }

    const newAdminStatus = !userToUpdate.admin;
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/v1/admin/users/${userToUpdate.id}`,
        { user: { admin: newAdminStatus } }, // Gửi payload đúng định dạng
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Cập nhật lại danh sách user trên UI ngay lập tức
      setUsers(
        users.map((u) => (u.id === userToUpdate.id ? response.data : u))
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật quyền admin:", err);
      alert(err.response?.data?.error || "Cập nhật thất bại.");
    }
  };

  // === HÀM MỚI: Xử lý việc xóa user ===
  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert("Bạn không thể xóa chính mình.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa user có ID: ${userId}?`)) {
      try {
        await axios.delete(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/v1/admin/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Cập nhật lại danh sách user trên UI
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        console.error("Lỗi khi xóa người dùng:", err);
        alert(err.response?.data?.error || "Xóa thất bại.");
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Trang Quản Lý Người Dùng</h1>
      {isLoading && <p>Đang tải danh sách...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}
      {!isLoading && !error && (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Tên</th>
              <th>Họ</th>
              <th>Admin?</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.admin ? "Có" : "Không"}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleToggleAdmin(user)}
                    disabled={user.id === currentUser.id}
                  >
                    {user.admin ? "Tước Quyền" : "Phong Admin"}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === currentUser.id}
                    style={{ marginLeft: "10px", color: "red" }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsersPage;
