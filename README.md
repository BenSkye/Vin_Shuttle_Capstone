# VinShuttle - Electric Vehicle Booking System

## 🚀 Giới thiệu dự án
VinShuttle là một hệ thống đặt xe điện thông minh, được thiết kế nhằm tối ưu hóa việc di chuyển nội bộ trong các khu đô thị lớn, đặc biệt là tại khu đô thị **VinHome Grand Park (VHGP), Thành phố Hồ Chí Minh**. Ứng dụng giúp giải quyết các vấn đề về sự bất tiện và thiếu hiệu quả của phương thức di chuyển truyền thống bằng cách cung cấp một nền tảng **tập trung, thân thiện với người dùng và bảo vệ môi trường**.

### 🎯 Tính năng nổi bật:
- **Theo dõi thời gian thực**: Cập nhật vị trí xe theo thời gian thực.
- **Tối ưu hóa tuyến đường**: Đề xuất lộ trình tối ưu.
- **Thanh toán trực tuyến**: Hỗ trợ nhiều phương thức thanh toán tiện lợi.
- **Trải nghiệm người dùng tốt**: Giao diện trực quan, dễ sử dụng.

---
## 📌 Tính năng chính

### 🖥 Ứng dụng Web cho **Admin**
✅ Quản lý người dùng (thêm, sửa, xóa thông tin người dùng).
✅ Quản lý giá dịch vụ (xem, cập nhật giá).
✅ Quản lý danh mục xe (thêm, sửa, xóa danh mục).
✅ Quản lý thông tin xe (thêm, sửa, xóa thông tin xe).
✅ Quản lý tuyến đường (thêm, sửa, xóa tuyến đường).
✅ Quản lý dòng tiền (xem, chỉnh sửa thông tin thanh toán).

### 🏢 Ứng dụng Web cho **Manager**
✅ Quản lý tài xế (xem, thêm, sửa, xóa thông tin tài xế).
✅ Quản lý đặt xe (xem thông tin đặt xe).
✅ Quản lý lịch trình tài xế (chỉnh sửa lịch trình).
✅ Quản lý phản hồi từ khách hàng (xem và phản hồi).

### 📱 Ứng dụng Mobile cho **Tài xế**
✅ Xem thông tin đặt xe và chấp nhận đặt xe.
✅ Xem lịch trình cá nhân và điểm danh (check-in, check-out).
✅ Trò chuyện với khách hàng.

### 🌐 Ứng dụng Web cho **Khách hàng**
✅ Đặt dịch vụ (thuê theo giờ, thuê theo tuyến, chia sẻ chuyến đi).
✅ Theo dõi chuyến đi thời gian thực (xem thông tin tài xế và xe).
✅ Đánh giá và phản hồi về dịch vụ.
✅ Quản lý thông tin cá nhân và nhận thông báo.

---
## 🛠 Công nghệ sử dụng
🚀 Dưới đây là những công nghệ được sử dụng trong hệ thống VinShuttle:

| 🚀 **Công nghệ**  | 🔍 **Mô tả** |
|----------------|--------------|
| ![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white) **Frontend** | Next.js (Web), React Native (Mobile) |
| ![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white) **Backend** | NestJS |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white) **Cơ sở dữ liệu** | MongoDB |
| ![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white) **Quản lý phiên bản** | Git/GitHub |
| ![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white) **Triển khai** | Vercel |
| ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black) **API Documentation** | Swagger |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) **Ngôn ngữ** | TypeScript |

---
## 📖 Hướng dẫn cài đặt và chạy dự án

### 🔧 1. Backend (Server API)
```bash
# Clone repository
git clone https://github.com/your-repo/vin-shuttle.git

# Di chuyển vào thư mục backend
cd backend

# Cài đặt các dependencies
npm install

# Chạy server
tsc && npm run start
```
🔥 **Swagger API Documentation**: Sau khi khởi động, truy cập `http://localhost:3000/api` để xem tài liệu API.

### 🌐 2. Frontend (Admin, Manager, Customer)
```bash
# Di chuyển vào thư mục frontend tương ứng
cd frontend-admin  # hoặc frontend-manager, frontend-customer

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm run dev
```

### 📱 3. Mobile (Driver)
```bash
# Di chuyển vào thư mục mobile
cd frontend-driver

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

---
## 📌 Hướng dẫn sử dụng Swagger
**Swagger UI** được sử dụng để tài liệu hóa API, giúp kiểm thử trực tiếp các API endpoints.

- Truy cập Swagger UI tại: **`http://localhost:3000/api`**
- Các API endpoints được tự động tạo dựa trên decorators của **NestJS**
- Dữ liệu trả về theo chuẩn **JSON**

---
## 🚀 Đóng góp & Phát triển
Chúng tôi hoan nghênh mọi đóng góp để phát triển hệ thống **VinShuttle** ngày càng tốt hơn!

### 🌟 Cách đóng góp:
1. Fork repo này 🍴
2. Tạo branch mới (`git checkout -b feature-awesome`) ✨
3. Commit thay đổi (`git commit -m 'Thêm tính năng ABC'`) ✅
4. Push lên branch (`git push origin feature-awesome`) 🚀
5. Tạo Pull Request 🛠

---
## 📄 Giấy phép
Dự án này được phát hành theo **MIT License**. Vui lòng đọc tệp `LICENSE` để biết thêm chi tiết.

---
## 🌟 Liên hệ
📧 Email: nhatdm9a7@gmail.com  
🌐 Website: [VinShuttle](https://vinshuttle.com)  
📌 Được phát triển bởi **VinShuttle Team** 🚀

