<div align="center">
  <img src="public/pwa-192.png" width="96" alt="VibeLedger logo"/>

  # VibeLedger

  **Sổ cái cho dân vibe code: biết ngay tài khoản Google nào đang xử lý dự án nào.**

  ![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-11-ffca28?logo=firebase&logoColor=black)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

## Giới thiệu
Khi vibe code nhiều dự án cùng lúc, mỗi dự án lại gắn với một tài khoản Google khác nhau và rất dễ nhầm lẫn. **VibeLedger** giúp bạn quản lý danh sách dự án, danh sách tài khoản và quan hệ giữa chúng ở một nơi duy nhất, dùng được trên máy tính lẫn điện thoại (PWA).

## Screenshot
> Thêm ảnh chụp màn hình vào `docs/screenshots/` rồi cập nhật các đường dẫn bên dưới.

| Dự án | Tài khoản | Thống kê |
| :---: | :---: | :---: |
| ![Dự án](docs/screenshots/projects.png) | ![Tài khoản](docs/screenshots/accounts.png) | ![Thống kê](docs/screenshots/stats.png) |

## Tính năng
- **Quản lý dự án**: tên, mô tả, trạng thái (Đang làm / Tạm dừng / Hoàn thành / Huỷ), danh mục (Web app, Desktop app, Mobile app, Tool...), hashtag công nghệ (`#react #css`), công cụ AI vibe code chọn từ danh sách sẵn, gán nhiều tài khoản
- **Quản lý tài khoản**: tên, email Google, ghi chú; xem tài khoản đang tham gia dự án nào
- **Tìm kiếm, lọc và sắp xếp** ở cả hai trang quản lý
- **Nhập / xuất dữ liệu**: nhập CSV, JSON, Excel; xuất CSV (UTF-8 BOM), JSON, Excel có định dạng, PDF, PNG; xuất báo cáo thống kê PNG / PDF
- **Command palette** `Ctrl + K` để chuyển trang, tìm dự án / tài khoản, đổi giao diện
- **Trang thống kê chi tiết**: tổng quan, dự án theo trạng thái / danh mục, công cụ AI và công nghệ phổ biến, tài khoản tham gia và đang làm nhiều dự án nhất
- **Responsive**: thanh điều hướng dưới trên điện thoại, navigation rail và lưới nhiều cột trên laptop / PC
- **Xác nhận trước khi xoá** bằng hộp thoại
- Đăng nhập Google, đồng bộ realtime với Firestore, dữ liệu tách riêng theo từng người dùng
- Giao diện Material Design 3: sáng / tối / hệ thống, đổi màu chủ đề, chỉnh cỡ chữ
- PWA cài được trên điện thoại, toast thông báo, skeleton loading, animation mượt

## Download
Tải bản build sẵn tại trang [Releases](../../releases) hoặc truy cập bản web đã triển khai, sau đó chọn **Cài đặt ứng dụng / Thêm vào màn hình chính** trên trình duyệt để dùng như app.

## Cài đặt
Yêu cầu: Node.js 18+ và một project Firebase.

```bash
git clone <repo-url> vibeledger
cd vibeledger
npm install
```

1. Tạo project tại [Firebase Console](https://console.firebase.google.com), thêm Web app và chép config vào `.env`.
2. Authentication → Sign-in method → bật **Google**.
3. Tạo **Firestore Database** và dùng rules sau:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Tech stack
React 18 · Vite 6 · Tailwind CSS 4 · Firebase (Auth, Firestore) · ExcelJS · jsPDF · html-to-image · vite-plugin-pwa · Material Design 3

## Development
```bash
npm run dev       # chạy dev server tại http://localhost:5173
npm run preview   # xem thử bản build
```

## Build
```bash
npm run build     # output trong dist/
```
Triển khai thư mục `dist/` lên Firebase Hosting, Vercel hoặc Netlify. Cần HTTPS để PWA cài đặt được, và nhớ thêm domain vào *Authorized domains* của Firebase Auth.

## Cấu trúc project
```
vibeledger/
├── public/            # icon PWA, favicon
├── docs/screenshots/  # ảnh chụp màn hình cho README
├── src/
│   ├── App.jsx        # đăng nhập, trang Dự án / Tài khoản / Thống kê / Cài đặt
│   ├── ui.jsx         # Button, Dialog, Toast, Skeleton, theme hook
│   ├── io.js          # nhập / xuất CSV, JSON, XLSX, PDF, PNG
│   ├── firebase.js    # khởi tạo Firebase từ .env
│   ├── index.css      # token màu M3, animation
│   └── main.jsx
├── .env               # Firebase config (không commit)
├── vite.config.js     # Vite + PWA manifest
└── LICENSE
```

## License
Phát hành theo giấy phép [MIT](LICENSE).

---
Tác giả **minhtrong67** · Có sự hỗ trợ của Claude (Anthropic)
