import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Đọc .env từ thư mục root repo (một cấp trên frontend/)
  // Cho phép frontend truy cập VITE_* vars được định nghĩa tập trung ở root .env
  envDir: '..',
})
