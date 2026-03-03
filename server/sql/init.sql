CREATE DATABASE IF NOT EXISTS movie_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE movie_booking;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taiKhoan VARCHAR(50) NOT NULL UNIQUE,
  matKhau VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  soDt VARCHAR(20) NOT NULL,
  maNhom VARCHAR(10) NOT NULL DEFAULT 'GP01',
  hoTen VARCHAR(100) NOT NULL,
  maLoaiNguoiDung ENUM('KhachHang', 'QuanTri') NOT NULL DEFAULT 'KhachHang',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  maPhim INT AUTO_INCREMENT PRIMARY KEY,
  tenPhim VARCHAR(255) NOT NULL,
  trailer VARCHAR(500),
  hinhAnh VARCHAR(500),
  moTa TEXT,
  maNhom VARCHAR(10) NOT NULL DEFAULT 'GP01',
  ngayKhoiChieu DATE,
  danhGia DECIMAL(3,1) DEFAULT 0,
  hot TINYINT(1) DEFAULT 0,
  dangChieu TINYINT(1) DEFAULT 0,
  sapChieu TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  maPhim INT NOT NULL,
  hinhAnh VARCHAR(500) NOT NULL,
  FOREIGN KEY (maPhim) REFERENCES movies(maPhim)
);

CREATE TABLE IF NOT EXISTS theater_systems (
  maHeThongRap VARCHAR(20) PRIMARY KEY,
  tenHeThongRap VARCHAR(100) NOT NULL,
  logo VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS theater_clusters (
  maCumRap VARCHAR(20) PRIMARY KEY,
  tenCumRap VARCHAR(100) NOT NULL,
  diaChi VARCHAR(255) NOT NULL,
  maHeThongRap VARCHAR(20) NOT NULL,
  FOREIGN KEY (maHeThongRap) REFERENCES theater_systems(maHeThongRap)
);

CREATE TABLE IF NOT EXISTS theaters (
  maRap VARCHAR(20) PRIMARY KEY,
  tenRap VARCHAR(100) NOT NULL,
  maCumRap VARCHAR(20) NOT NULL,
  FOREIGN KEY (maCumRap) REFERENCES theater_clusters(maCumRap)
);

CREATE TABLE IF NOT EXISTS showtimes (
  maLichChieu INT AUTO_INCREMENT PRIMARY KEY,
  maPhim INT NOT NULL,
  maRap VARCHAR(20) NOT NULL,
  ngayChieu DATE NOT NULL,
  gioChieu TIME NOT NULL,
  giaVe DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (maPhim) REFERENCES movies(maPhim),
  FOREIGN KEY (maRap) REFERENCES theaters(maRap)
);

CREATE TABLE IF NOT EXISTS seats (
  maGhe INT AUTO_INCREMENT PRIMARY KEY,
  maRap VARCHAR(20) NOT NULL,
  tenGhe VARCHAR(20) NOT NULL,
  loaiGhe ENUM('Thuong', 'Vip') NOT NULL DEFAULT 'Thuong',
  stt VARCHAR(10),
  FOREIGN KEY (maRap) REFERENCES theaters(maRap)
);

CREATE TABLE IF NOT EXISTS bookings (
  maVe INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  maLichChieu INT NOT NULL,
  ngayDat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tongTien DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (maLichChieu) REFERENCES showtimes(maLichChieu)
);

CREATE TABLE IF NOT EXISTS booking_seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  maVe INT NOT NULL,
  maGhe INT NOT NULL,
  giaVe DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (maVe) REFERENCES bookings(maVe),
  FOREIGN KEY (maGhe) REFERENCES seats(maGhe)
);

CREATE TABLE IF NOT EXISTS loai_nguoi_dung (
  maLoaiNguoiDung VARCHAR(20) PRIMARY KEY,
  tenLoai VARCHAR(50) NOT NULL
);

INSERT INTO loai_nguoi_dung (maLoaiNguoiDung, tenLoai) VALUES ('KhachHang', 'Khách hàng'), ('QuanTri', 'Quản trị')
ON DUPLICATE KEY UPDATE tenLoai = VALUES(tenLoai);

INSERT INTO users (taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung)
VALUES ('admin', '123456', 'admin@example.com', '0123456789', 'GP01', 'Quan Tri', 'QuanTri')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO theater_systems (maHeThongRap, tenHeThongRap, logo) VALUES ('CGV', 'CGV', '')
ON DUPLICATE KEY UPDATE tenHeThongRap = VALUES(tenHeThongRap);

INSERT INTO theater_clusters (maCumRap, tenCumRap, diaChi, maHeThongRap) VALUES ('CUM1', 'CGV Vincom', 'Vincom Quận 1', 'CGV')
ON DUPLICATE KEY UPDATE tenCumRap = VALUES(tenCumRap);

INSERT INTO theaters (maRap, tenRap, maCumRap) VALUES ('RAP1', 'Rạp 1', 'CUM1')
ON DUPLICATE KEY UPDATE tenRap = VALUES(tenRap);

INSERT INTO movies (tenPhim, trailer, hinhAnh, moTa, maNhom, ngayKhoiChieu, danhGia, hot, dangChieu, sapChieu)
VALUES
  ('Avengers: Endgame', 'https://www.youtube.com/watch?v=TcMBFSGVi1c', 'https://picsum.photos/300/450?movie=1', 'Siêu anh hùng Marvel chống lại Thanos.', 'GP01', '2019-04-26', 9, 1, 1, 0),
  ('Inception', 'https://www.youtube.com/watch?v=8hP9D6kZseM', 'https://picsum.photos/300/450?movie=2', 'Kiến trúc sư giấc mơ và phi vụ đánh cắp ý tưởng.', 'GP01', '2010-07-16', 8.8, 1, 0, 0);

INSERT IGNORE INTO banners (maPhim, hinhAnh) SELECT maPhim, hinhAnh FROM movies LIMIT 2;

INSERT IGNORE INTO showtimes (maPhim, maRap, ngayChieu, gioChieu, giaVe) VALUES (1, 'RAP1', '2026-03-01', '19:30:00', 90000);

INSERT INTO seats (maRap, tenGhe, loaiGhe, stt)
SELECT 'RAP1', CONCAT('G', n), IF(n > 60, 'Vip', 'Thuong'), CAST(n AS CHAR)
FROM (
  SELECT a.a + 10*b.a AS n
  FROM (SELECT 0 AS a UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
  CROSS JOIN (SELECT 0 AS a UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) b
  WHERE (a.a + 10*b.a) BETWEEN 1 AND 80
) nums
WHERE NOT EXISTS (SELECT 1 FROM seats WHERE maRap = 'RAP1' LIMIT 1);

