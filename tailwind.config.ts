import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Sử dụng class để toggle Dark/Light mode
  theme: {
    extend: {
      colors: {
        acca: {
          DEFAULT: '#E31B23',
          light: '#FEF2F2', // Nền đỏ nhạt khi active tab
          dark: '#CC181F',  // Đỏ đậm hơn cho hiệu ứng hover
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',  // Slate 900 cho dark mode
        },
        surface: {
          DEFAULT: '#F8F9FA', // Xám rất nhạt cho nền ứng dụng
          dark: '#1E293B',    // Slate 800 cho nền card dark mode
        },
        text: {
          primary: '#1E293B', // Xám đen Slate 800
          secondary: '#64748B', // Xám nhạt Slate 500
          darkPrimary: '#F8FAFC',
          darkSecondary: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#334155',
        }
      },
      borderRadius: {
        DEFAULT: '0.5rem', // Bo góc tiêu chuẩn
        md: '0.75rem',     // Bo góc lớn hơn cho các card chính
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  // Tìm phần plugins ở cuối file và sửa thành như sau:
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;