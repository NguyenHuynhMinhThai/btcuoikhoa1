import express from "express";
import { pool } from "../db";

export const bookingRouter = express.Router();

bookingRouter.get("/LayDanhSachPhongVe", async (req, res) => {
  const maLichChieu = Number(req.query.MaLichChieu);
  if (!maLichChieu) {
    return res.status(400).json({ message: "Thiếu tham số MaLichChieu" });
  }

  try {
    const [showtimeRows] = await pool.query(
      `SELECT sh.maLichChieu, sh.maRap, sh.ngayChieu, sh.gioChieu, sh.giaVe,
        t.tenRap, tc.tenCumRap, tc.diaChi, m.tenPhim, m.hinhAnh
       FROM showtimes sh
       JOIN theaters t ON sh.maRap = t.maRap
       JOIN theater_clusters tc ON t.maCumRap = tc.maCumRap
       JOIN movies m ON sh.maPhim = m.maPhim
       WHERE sh.maLichChieu = ?`,
      [maLichChieu]
    );
    const showtimes = showtimeRows as any[];
    if (showtimes.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy lịch chiếu" });
    }
    const st = showtimes[0];

    const [bookedRows] = await pool.query(
      `SELECT bs.maGhe FROM booking_seats bs
       JOIN bookings b ON bs.maVe = b.maVe
       WHERE b.maLichChieu = ?`,
      [maLichChieu]
    );
    const bookedSeatIds = new Set((bookedRows as any[]).map((r) => r.maGhe));

    const [seatRows] = await pool.query(
      `SELECT s.maGhe, s.tenGhe, s.maRap, s.loaiGhe, s.stt,
        CASE WHEN s.loaiGhe = 'Vip' THEN sh.giaVe + 20000 ELSE sh.giaVe END as giaVe
       FROM seats s
       JOIN showtimes sh ON s.maRap = sh.maRap
       WHERE sh.maLichChieu = ?`,
      [maLichChieu]
    );

    const danhSachGhe = (seatRows as any[]).map((s) => ({
      maGhe: s.maGhe,
      tenGhe: s.tenGhe,
      maRap: s.maRap,
      loaiGhe: s.loaiGhe,
      stt: s.stt,
      giaVe: s.giaVe,
      daDat: bookedSeatIds.has(s.maGhe)
    }));

    const ngayChieu = st.ngayChieu instanceof Date
      ? st.ngayChieu.toISOString().split("T")[0]
      : String(st.ngayChieu).split(" ")[0];
    const gioChieu = st.gioChieu instanceof Date
      ? st.gioChieu.toString().slice(0, 8)
      : String(st.gioChieu).slice(0, 8);

    res.json({
      maLichChieu: Number(st.maLichChieu),
      thongTinPhim: {
        maLichChieu: Number(st.maLichChieu),
        tenCumRap: st.tenCumRap,
        tenRap: st.tenRap,
        diaChi: st.diaChi,
        tenPhim: st.tenPhim,
        hinhAnh: st.hinhAnh,
        ngayChieu: ngayChieu,
        gioChieu: gioChieu
      },
      danhSachGhe
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

bookingRouter.post("/DatVe", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: "Cần đăng nhập để đặt vé" });
  }
  const taiKhoan = auth.replace("Bearer fake-token-", "");
  const { maLichChieu, danhSachVe } = req.body as {
    maLichChieu: number;
    danhSachVe: { maGhe: number; giaVe: number }[];
  };

  if (!maLichChieu || !Array.isArray(danhSachVe) || danhSachVe.length === 0) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }

  try {
    const [userRows] = await pool.query("SELECT id FROM users WHERE taiKhoan = ?", [taiKhoan]);
    const users = userRows as any[];
    if (users.length === 0) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    const userId = users[0].id;

    const [bookedRows] = await pool.query(
      `SELECT bs.maGhe FROM booking_seats bs
       JOIN bookings b ON bs.maVe = b.maVe
       WHERE b.maLichChieu = ?`,
      [maLichChieu]
    );
    const bookedIds = new Set((bookedRows as any[]).map((r) => r.maGhe));
    const conflict = danhSachVe.some((v) => bookedIds.has(v.maGhe));
    if (conflict) {
      return res.status(400).json({ message: "Ghế đã được đặt" });
    }

    const tongTien = danhSachVe.reduce((sum, v) => sum + v.giaVe, 0);

    const [insertBook] = await pool.query(
      "INSERT INTO bookings (user_id, maLichChieu, tongTien) VALUES (?, ?, ?)",
      [userId, maLichChieu, tongTien]
    );
    const maVe = (insertBook as any).insertId;

    for (const v of danhSachVe) {
      await pool.query(
        "INSERT INTO booking_seats (maVe, maGhe, giaVe) VALUES (?, ?, ?)",
        [maVe, v.maGhe, v.giaVe]
      );
    }

    res.json({
      maLichChieu,
      danhSachVe,
      maVe,
      message: "Đặt vé thành công"
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

bookingRouter.post("/TaoLichChieu", async (req, res) => {
  const { maPhim, ngayChieuGioChieu, maRap, giaVe } = req.body as {
    maPhim: number;
    ngayChieuGioChieu: string;
    maRap: string;
    giaVe: number;
  };

  if (!maPhim || !ngayChieuGioChieu || !maRap || giaVe === undefined) {
    return res.status(400).json({ message: "Thiếu tham số: maPhim, ngayChieuGioChieu, maRap, giaVe" });
  }

  const parts = String(ngayChieuGioChieu).split("T");
  const ngayChieu = parts[0];
  const gioPart = parts[1] || "00:00:00";
  const gioChieu = gioPart.length >= 8 ? gioPart.slice(0, 8) : gioPart + "00".slice(0, 8);

  try {
    const [existingTheater] = await pool.query("SELECT maRap FROM theaters WHERE maRap = ?", [maRap]);
    if ((existingTheater as any[]).length === 0) {
      return res.status(400).json({ message: "Không tìm thấy rạp" });
    }

    const [existingMovie] = await pool.query("SELECT maPhim FROM movies WHERE maPhim = ?", [maPhim]);
    if ((existingMovie as any[]).length === 0) {
      return res.status(400).json({ message: "Không tìm thấy phim" });
    }

    const [result] = await pool.query(
      "INSERT INTO showtimes (maPhim, maRap, ngayChieu, gioChieu, giaVe) VALUES (?, ?, ?, ?, ?)",
      [maPhim, maRap, ngayChieu, gioChieu, giaVe]
    );
    const maLichChieu = (result as any).insertId;

    const [newRows] = await pool.query(
      "SELECT * FROM showtimes WHERE maLichChieu = ?",
      [maLichChieu]
    );
    res.status(201).json((newRows as any[])[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});
