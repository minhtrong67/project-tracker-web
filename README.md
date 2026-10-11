<div align="center">
  <img src="public/pwa-192.png" width="88" alt="VibeLedger logo"/>

  # VibeLedger

  **Sổ cái cho dân vibe code: biết ngay tài khoản Google nào đang xử lý dự án nào.**

  ![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-11-ffca28?logo=firebase&logoColor=black)
  ![PWA](https://img.shields.io/badge/PWA-ready-4f46e5)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

## Giới thiệu
Khi vibe code nhiều dự án cùng lúc, mỗi dự án lại gắn với một tài khoản Google khác nhau và rất dễ nhầm lẫn. **VibeLedger** gom danh sách dự án, tài khoản và mối quan hệ giữa chúng vào một nơi, dùng mượt trên cả máy tính lẫn điện thoại (PWA), hỗ trợ tiếng Việt và tiếng Anh.

## Screenshot
| Dự án | Tài khoản | Thống kê |
| :---: | :---: | :---: |
| ![Dự án](screenshots/image01.png) | ![Tài khoản](screenshots/image02.png) | ![Thống kê](screenshots/image03.png) |

## Tính năng
- **Quản lý dự án**: tên, mô tả, trạng thái (Đang làm / Tạm dừng / Hoàn thành / Huỷ), danh mục, hashtag công nghệ, công cụ AI vibe code, gán nhiều tài khoản
- **Quản lý tài khoản**: tên, email Google, ghi chú; xem tài khoản đang tham gia dự án nào
- **Tìm kiếm, lọc, sắp xếp, xoá lọc**; bộ lọc từng trang được nhớ bằng `sessionStorage`
- **Dạng danh sách / lưới** cho mọi danh sách dữ liệu
- **Nhập / xuất** (trong Cài đặt, cho cả Dự án và Tài khoản): nhập CSV, JSON, XLSX (trùng dữ liệu thì ghi đè, không nhân đôi); xuất CSV, JSON, XLSX, PDF, PNG với định dạng chuẩn, không lỗi font
- **Thống kê**: thẻ số liệu, biểu đồ cột dọc và biểu đồ tròn có đầy đủ nhãn, lọc theo ngày / tuần / tháng / năm, xuất báo cáo PDF / PNG theo bộ lọc
- **Cài đặt**: giao diện sáng / tối / hệ thống, ngôn ngữ, cỡ chữ, màu chủ đề, trang mở mặc định, sao lưu / khôi phục dữ liệu, khôi phục mặc định
- **PWA** cài được trên điện thoại, có thẻ cài đặt nổi bật trong Cài đặt
- Đăng nhập Google, đồng bộ realtime với Firestore, dữ liệu tách riêng theo từng người dùng
- **Hiệu năng**: tách bundle theo trang, Firestore chỉ nạp sau khi đăng nhập, thư viện xuất file nạp khi cần, cache IndexedDB để mở lại là có dữ liệu ngay, danh sách dùng `memo` và tìm kiếm có `useDeferredValue`
- Command palette `Ctrl + K`, bottom bar và sidebar trên mobile, form kiểm tra dữ liệu chặt chẽ với toast lỗi, skeleton loading, animation mượt

## Cài đặt
Yêu cầu: Node.js 18+ và một project Firebase.

```bash
git clone <repo-url> vibeledger
cd vibeledger
npm install
cp .env.example .env   # rồi điền Firebase config
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
React 18 · Vite 6 · Tailwind CSS 4 · Firebase (Auth, Firestore) · Lucide Icons · ExcelJS · jsPDF · html-to-image · vite-plugin-pwa

## Development
```bash
npm run dev       # http://localhost:5173
npm run preview   # xem thử bản build
```

## Build
```bash
npm run build     # output trong dist/
```
Triển khai `dist/` lên Firebase Hosting, Vercel hoặc Netlify. Cần HTTPS để PWA cài đặt được, và thêm domain vào *Authorized domains* của Firebase Auth.

## Cấu trúc project
```
vibeledger/
├── public/              # favicon, app icon PWA
├── screenshots/         # ảnh README: image01, image02, image03
├── src/
│   ├── pages/           # Projects, Accounts, Stats, Settings
│   ├── components/      # Toolbar, forms, charts
│   ├── App.jsx          # đăng nhập, header, sidebar, bottom bar, Ctrl+K
│   ├── data.jsx         # Firestore realtime + CRUD + import upsert
│   ├── transfer.js      # chuẩn hoá dữ liệu nhập / xuất
│   ├── io.js            # CSV, XLSX, PDF, PNG
│   ├── i18n.js          # từ điển vi / en
│   ├── hooks.js         # cài đặt, sessionStorage, PWA install
│   ├── ui.jsx           # Button, Dialog, Toast, Skeleton...
│   ├── firebase.js
│   └── index.css        # Tailwind + design tokens
├── .env.example
├── vite.config.js
└── LICENSE
```

## License
Phát hành theo giấy phép [MIT](LICENSE).

---
<div align="center">Tác giả <b>minhtrong67</b> · Có sự hỗ trợ của <b>Claude</b> (Anthropic)</div>
