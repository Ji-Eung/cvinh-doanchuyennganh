# OldMarket API

Backend dịch vụ mua bán đồ cũ (Node.js + Express + TypeScript + MongoDB).

## Tính năng chính

- Đăng ký / đăng nhập / refresh token với phát hiện reuse.
- Quản lý bài đăng: tạo, cập nhật, thêm / xóa ảnh, đánh dấu đã bán, xóa bài.
- Duyệt / từ chối bài (admin) với lý do.
- Yêu thích, báo cáo, giao dịch, đánh giá người bán.
- Chat đơn giản (REST: gửi & xem hội thoại), báo cáo có quản trị xử lý, xem danh sách đánh giá.
- Upload ảnh (multer) + chuẩn hóa lưu filename.
- OpenAPI spec (`/openapi.yaml`).
- Logging: pino + pino-http.

## 1. Chạy local (development)

```bash
npm install
npm run dev
```

Tạo file `.env` (xem `.env.example`). Ví dụ dùng Atlas:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/oldmarket?retryWrites=true&w=majority
JWT_ACCESS_SECRET=dev_access
JWT_REFRESH_SECRET=dev_refresh
PORT=8080
CORS_ORIGINS=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Seed dữ liệu (categories + admin):

```bash
npm run build
npm run seed
```

Start prod build local:

```bash
npm start
```

## 2. Chạy bằng Docker (Atlas)

Đảm bảo đã sửa `MONGODB_URI` nếu cần trong `.env.docker`.

```bash
docker compose build
docker compose up -d
```

Xem log:

```bash
docker logs -f oldmarket-api
```

Dừng:

```bash
docker compose down
```

### Dùng Mongo cục bộ trong docker-compose

Mở comment block `mongo:` trong `docker-compose.yml` và chỉnh:

```
MONGODB_URI=mongodb://root:example@mongo:27017/oldmarket?authSource=admin
```

Rồi:

```bash
docker compose up -d --build
```

## 3. Cấu trúc thư mục

```
src/
  app.ts
  server.ts
  config/
  modules/
  utils/
  middlewares/
  scripts/seed.ts
openapi.yaml
```

## 4. Scripts

- `npm run dev` : Chạy development với ts-node.
- `npm run build` : Compile TypeScript vào `dist/`.
- `npm start` : Chạy bản build.
- `npm run seed` : Seed categories + admin.

## 5. Các route tiêu biểu

- `GET /` Thông tin API.
- `GET /health` Health check.
- `POST /api/auth/login` / `register` / `refresh` / `logout`.
- `POST /api/posts` tạo bài.
- `POST /api/posts/:id/mark-sold` đánh dấu đã bán.
- `POST /api/posts/:id/images` thêm ảnh.
- `POST /api/posts/:id/images/delete` xóa ảnh.
- `DELETE /api/posts/:id` xóa bài.
- `PATCH /api/admin/posts/:id/reject` từ chối.
- `POST /api/uploads/image` upload ảnh.
- `GET /api/chat/with/:userId` lịch sử hội thoại, `POST /api/chat/send` gửi tin.
- `GET /api/ratings/user/:userId` danh sách đánh giá người dùng.
- `GET /api/reports` (admin) & `PATCH /api/reports/:id/status` cập nhật trạng thái báo cáo.

## 6. Ghi chú bảo mật

- Refresh token hash + revoke all khi reuse nghi ngờ.
- Nên đổi secret trong môi trường production.
- Thêm CDN / object storage (S3, Cloudinary…) cho ảnh trong giai đoạn mở rộng.

## 7. Nâng cấp & tối ưu (hiện tại / tương lai)

ĐÃ THỰC HIỆN:

- Composite indexes: posts (status/categoryId/sellerId + createdAt), transactions, favorites, notifications.
- `.lean()` áp dụng cho hầu hết list/detail trả về DTO nhẹ.
- Cursor pagination cho posts (trả `meta.cursor`).
- SSE real-time notifications + mark-all-read.
- In-memory cache + ETag (If-None-Match) cho categories.
- HTTP compression (gzip/deflate) với ngưỡng 1KB.
- Chuẩn hóa id phía client (interceptor map `_id` -> `id`).
- Infinite scroll + debounce tìm kiếm (posts list).
- Modal xác nhận UI thay `window.confirm` ở thao tác quan trọng.

SẮP / TƯƠNG LAI:

- Kiểm tra magic bytes sau upload (helper đã có: `verifyImageMagic`).
- Test tự động (Jest) & tích hợp CI.
- Pagination / cursor cho favorites, reports, ratings khi dữ liệu lớn.
- Redis layer cho cache categories / notifications snapshot.
- Tự động sinh client types từ OpenAPI.
- Rate limiting chi tiết hơn cho báo cáo, rating, uploads.
- Logging tracing (request-id propagate).
- Phân quyền nâng cao (RBAC nhiều vai trò).

## 8. Giấy phép

Nội bộ đồ án. Chưa gắn license open source.
