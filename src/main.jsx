// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n"; // <<--- THÊM DÒNG NÀY VÀO SẾP ƠI! ĐỂ KÍCH HOẠT i18next

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* React.Suspense là cần thiết khi useSuspense: true trong i18n.js 
        Nó sẽ hiển thị fallback UI (ví dụ: "Đang tải...") trong khi chờ file dịch được tải
        Sếp có thể bọc App trong Suspense ở đây hoặc trong App.jsx */}
    <React.Suspense fallback="Đang tải ngôn ngữ...">
      <App />
    </React.Suspense>
  </React.StrictMode>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
