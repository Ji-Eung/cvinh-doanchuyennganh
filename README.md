## OldMarket (MVP)

Backend: Node.js + Express + TypeScript + MongoDB (Mongoose)

Features:

- Đăng ký / đăng nhập / refresh token quay vòng, phát hiện reuse
- Quản lý bài đăng (pending -> approved/rejected -> sold)
- Duyệt bài (admin)
- Yêu thích, báo cáo (report), giao dịch (transaction) với trạng thái initiated/completed/cancelled
- Đánh giá người bán (buyer chấm điểm sau khi hoàn tất giao dịch)
- Thông báo (notification) + realtime SSE
- Upload ảnh (multer) + chuẩn hoá tên file

Frontend: React + Vite + TypeScript

Pages: Posts, PostDetail, CreatePost, MyPosts, Favorites, Transactions, TransactionDetail, Profile, Admin Moderation

Filter: tìm kiếm, giá từ/đến, trạng thái

Realtime: SSE ở `/api/notifications/stream?token=ACCESS_TOKEN`

Chạy nhanh:

1. Cấu hình biến môi trường (.env) cho server (MONGO_URI, JWT_SECRET,...)
2. `npm install` trong `server` và `client`
3. Chạy server: `npm run dev` (thư mục server)
4. Chạy client: `npm run dev` (thư mục client)

Build:

- Server: `npm run build` tạo `dist/`
- Client: `npm run build` xuất static

TODO tương lai:

- WebSocket thay SSE, pagination nâng cao, global modal confirm, phân quyền chi tiết hơn
- Tách service API, unit test kích hoạt lại, CI# Old Market Platform (MVP Skeleton)

## 1. Giới thiệu

Dự án: Website trao đổi & mua bán đồ cũ (MVP). Skeleton này bao gồm:

- Backend: Node.js + Express + TypeScript (chưa triển khai logic, chỉ khung module).
- Frontend: Vite + React + TypeScript sử dụng lại layout từ template Bootstrap hiện có, sẽ dần refactor sang component hóa.
- OpenAPI draft: `openapi.yaml` (phác thảo endpoint chính).

## 2. Cấu trúc thư mục

```
Test 1/
  server/
    src/
      config/
      middlewares/
      modules/
      routes/
      app.ts
      server.ts
    package.json
    tsconfig.json
    .env.example
  client/
    index.html
    package.json
    tsconfig.json
    vite.config.ts
    src/
      main.tsx
      App.tsx
      components/TemplateLayout.tsx
    public/
      css/, js/, img/, lib/ (tối giản ban đầu)
  openapi.yaml
  README.md
```

## 3. Chạy Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Biến môi trường tối thiểu:

```
PORT=8080
MONGODB_URI=mongodb://localhost:27017/oldmarket
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
```

## 4. Chạy Frontend

```bash
cd client
npm install
npm run dev
```

Truy cập: http://localhost:5173

## 5. Hướng phát triển tiếp theo

- Implement từng module (auth → users → posts ...)
- Thay dần template HTML bằng component React + Tailwind (nếu bật Tailwind sau).
- Viết test (Jest / Vitest) cho services backend.
- Thêm OpenAPI schema chi tiết & validator (Zod/Joi).

## 6. Ghi chú

- Chưa tích hợp upload ảnh / Cloudinary.
- Socket.IO sẽ thêm ở Sprint chat.
- Email verification chưa bật (hook chừa sẵn trong auth controller stub).

## 7. License

Academic / Educational use.

## 8. Chuẩn bị Deploy & GitHub

### 8.1. Tạo file môi trường

Server:

```
cp server/.env.example server/.env
# Chỉnh MONGODB_URI (Atlas) + tạo chuỗi ngẫu nhiên dài cho JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

Client:

```
cp client/.env.example client/.env
# Set VITE_API_URL=http://localhost:8080/api (local) hoặc https://your-backend-domain/api
```

### 8.2. Khởi tạo Git (nếu chưa)

```
git init
git remote add origin https://github.com/Ji-Eung/cvinh-doanchuyennganh.git
```

### 8.3. Commit & push lần đầu

```
git add .
git commit -m "chore: initial MVP push"
git push -u origin main
```

(Nếu repo dùng branch `master` hoặc trống: `git branch -M main` trước khi push.)

### 8.4. Build thử trước deploy

```
cd server && npm install && npm run build
cd ../client && npm install && npm run build
```

Sau khi backend deploy (Render / Railway / Fly.io ...) ghi nhớ domain và cập nhật lại `client/.env` rồi build & deploy lên Netlify/Vercel.
