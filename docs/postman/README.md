# Hướng dẫn test API bằng Postman

## 1. Import collection

- Mở Postman
- Chọn **Import** → Chọn file `Movie-Booking-API.postman_collection.json`
- Collection **Movie Booking API** sẽ xuất hiện trong sidebar

## 2. Chỉnh base URL (nếu cần)

- Click vào collection **Movie Booking API**
- Tab **Variables**:
  - `baseUrl`: mặc định `http://localhost:4000`
  - Nếu chạy bằng Docker (port 4001): đổi thành `http://localhost:4001`
  - `accessToken`: sau khi gọi **DangNhap**, copy giá trị `accessToken` từ response và dán vào đây

## 3. Thứ tự test gợi ý

1. **DangNhap** → copy `accessToken` → dán vào biến collection
2. **ThongTinTaiKhoan** (cần token)
3. **LayDanhSachPhim**, **LayDanhSachPhongVe**
4. **DatVe** (cần token)
5. Các endpoint còn lại tùy chọn
