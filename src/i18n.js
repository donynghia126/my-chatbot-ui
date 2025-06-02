// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpApi) // Cho phép tải file dịch qua HTTP (từ thư mục public/locales)
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ người dùng
  .use(initReactI18next) // Kết nối i18next với react-i18next
  .init({
    supportedLngs: ["vi", "ja", "en"], // Các ngôn ngữ mình hỗ trợ: Việt, Nhật, Anh
    fallbackLng: "vi", // Ngôn ngữ mặc định nếu không phát hiện được hoặc ngôn ngữ không được hỗ trợ
    debug: process.env.NODE_ENV === "development", // Bật log debug khi ở môi trường dev (rất hữu ích!)

    // Cấu hình cho LanguageDetector
    detection: {
      order: [
        "queryString",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
      caches: ["cookie", "localStorage"], // Lưu ngôn ngữ đã chọn vào cookie/localStorage
    },

    // Cấu hình cho HttpApi (backend để tải file dịch)
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // Đường dẫn đến file dịch
      // Ví dụ: /locales/vi/translation.json
      //        /locales/ja/translation.json
    },

    // Cấu hình cho react-i18next
    react: {
      useSuspense: true, // Dùng React Suspense để xử lý việc tải file dịch (giao diện sẽ chờ đến khi file dịch được tải xong)
    },
  });

export default i18n;
