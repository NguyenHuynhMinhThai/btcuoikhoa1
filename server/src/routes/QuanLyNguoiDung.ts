import express from "express";
import { pool } from "../db";

export const userRouter = express.Router();

userRouter.get("/LayDanhSachLoaiNguoiDung", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM loai_nguoi_dung");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.post("/DangNhap", async (req, res) => {
  const { taiKhoan, matKhau } = req.body as { taiKhoan: string; matKhau: string };

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE taiKhoan = ? AND matKhau = ?", [
      taiKhoan,
      matKhau
    ]);
    const userRows = rows as any[];
    if (userRows.length === 0) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }
    const user = userRows[0];
    return res.json({
      taiKhoan: user.taiKhoan,
      matKhau: user.matKhau,
      email: user.email,
      soDt: user.soDt,
      maNhom: user.maNhom,
      hoTen: user.hoTen,
      maLoaiNguoiDung: user.maLoaiNguoiDung,
      accessToken: `fake-token-${user.taiKhoan}`
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.post("/DangKy", async (req, res) => {
  const payload = req.body as {
    taiKhoan: string;
    matKhau: string;
    email: string;
    soDt: string;
    maNhom: string;
    hoTen: string;
    maLoaiNguoiDung?: "KhachHang" | "QuanTri";
  };

  try {
    const [existingRows] = await pool.query("SELECT id FROM users WHERE taiKhoan = ?", [
      payload.taiKhoan
    ]);
    const existing = existingRows as any[];
    if (existing.length > 0) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    await pool.query(
      "INSERT INTO users (taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        payload.taiKhoan,
        payload.matKhau,
        payload.email,
        payload.soDt,
        payload.maNhom,
        payload.hoTen,
        payload.maLoaiNguoiDung ?? "KhachHang"
      ]
    );

    return res.status(201).json({
      ...payload,
      maLoaiNguoiDung: payload.maLoaiNguoiDung ?? "KhachHang"
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.get("/LayDanhSachNguoiDung", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung FROM users"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.get("/LayDanhSachNguoiDungPhanTrang", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const soPhanTuTrenTrang = Number(req.query.soPhanTuTrenTrang) || 10;

  try {
    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM users");
    const total = (countRows as any[])[0].total;
    const offset = (page - 1) * soPhanTuTrenTrang;

    const [rows] = await pool.query(
      "SELECT taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung FROM users LIMIT ? OFFSET ?",
      [soPhanTuTrenTrang, offset]
    );

    res.json({
      currentPage: page,
      count: total,
      totalPages: Math.ceil(total / soPhanTuTrenTrang),
      items: rows
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.get("/TimKiemNguoiDung", async (req, res) => {
  const tuKhoa = String(req.query.tuKhoa || "").trim();

  try {
    if (!tuKhoa) {
      const [rows] = await pool.query(
        "SELECT taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung FROM users"
      );
      return res.json(rows);
    }
    const pattern = `%${tuKhoa}%`;
    const [rows] = await pool.query(
      "SELECT taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung FROM users WHERE taiKhoan LIKE ? OR hoTen LIKE ? OR email LIKE ?",
      [pattern, pattern, pattern]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.get("/TimKiemNguoiDungPhanTrang", async (req, res) => {
  const tuKhoa = String(req.query.tuKhoa || "").trim();
  const page = Number(req.query.page) || 1;
  const soPhanTuTrenTrang = Number(req.query.soPhanTuTrenTrang) || 10;

  try {
    const pattern = tuKhoa ? `%${tuKhoa}%` : "%";
    const whereClause =
      tuKhoa === ""
        ? ""
        : " WHERE taiKhoan LIKE ? OR hoTen LIKE ? OR email LIKE ?";
    const countParams = tuKhoa === "" ? [] : [pattern, pattern, pattern];
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM users${whereClause}`,
      countParams
    );
    const total = (countRows as any[])[0].total;
    const offset = (page - 1) * soPhanTuTrenTrang;

    const selectParams =
      tuKhoa === "" ? [soPhanTuTrenTrang, offset] : [pattern, pattern, pattern, soPhanTuTrenTrang, offset];
    const queryStr =
      tuKhoa === ""
        ? "SELECT taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung FROM users LIMIT ? OFFSET ?"
        : "SELECT taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung FROM users WHERE taiKhoan LIKE ? OR hoTen LIKE ? OR email LIKE ? LIMIT ? OFFSET ?";

    const [rows] = await pool.query(queryStr, selectParams);

    res.json({
      currentPage: page,
      count: total,
      totalPages: Math.ceil(total / soPhanTuTrenTrang),
      items: rows
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.post("/ThongTinTaiKhoan", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: "Không có token" });
  }
  const taiKhoan = auth.replace("Bearer fake-token-", "");

  try {
    const [rows] = await pool.query(
      "SELECT u.*, (SELECT JSON_ARRAYAGG(JSON_OBJECT('maVe', b.maVe, 'tenPhim', m.tenPhim, 'hinhAnh', m.hinhAnh, 'ngayDat', b.ngayDat, 'giaVe', b.tongTien)) FROM bookings b JOIN movies m ON b.maLichChieu IN (SELECT maLichChieu FROM showtimes WHERE maPhim = m.maPhim) WHERE b.user_id = u.id) as thongTinDatVe FROM users u WHERE u.taiKhoan = ?",
      [taiKhoan]
    );
    const userRows = rows as any[];
    if (userRows.length === 0) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    const user = userRows[0];
    const [bookingRows] = await pool.query(
      `SELECT b.maVe, m.tenPhim, m.hinhAnh, b.ngayDat, b.tongTien as giaVe
       FROM bookings b
       JOIN showtimes sh ON b.maLichChieu = sh.maLichChieu
       JOIN movies m ON sh.maPhim = m.maPhim
       WHERE b.user_id = ?`,
      [user.id]
    );
    const thongTinDatVe = [];
    for (const r of bookingRows as any[]) {
      const [seatRows] = await pool.query(
        `SELECT ts.tenHeThongRap, tc.tenCumRap, t.tenRap, s.maGhe, s.tenGhe
         FROM booking_seats bs
         JOIN seats s ON bs.maGhe = s.maGhe
         JOIN theaters t ON s.maRap = t.maRap
         JOIN theater_clusters tc ON t.maCumRap = tc.maCumRap
         JOIN theater_systems ts ON tc.maHeThongRap = ts.maHeThongRap
         WHERE bs.maVe = ?`,
        [r.maVe]
      );
      thongTinDatVe.push({
        maVe: r.maVe,
        tenPhim: r.tenPhim,
        hinhAnh: r.hinhAnh,
        ngayDat: r.ngayDat,
        thoiLuongPhim: 120,
        giaVe: r.giaVe,
        danhSachGhe: (seatRows as any[]).map((s) => ({
          tenHeThongRap: s.tenHeThongRap,
          tenCumRap: s.tenCumRap,
          tenRap: s.tenRap,
          maGhe: s.maGhe,
          tenGhe: s.tenGhe
        }))
      });
    }

    return res.json({
      taiKhoan: user.taiKhoan,
      hoTen: user.hoTen,
      email: user.email,
      soDT: user.soDt,
      maNhom: user.maNhom,
      loaiNguoiDung: user.maLoaiNguoiDung,
      thongTinDatVe
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.post("/LayThongTinNguoiDung", async (req, res) => {
  const { taiKhoan } = req.body as { taiKhoan: string };

  try {
    const [rows] = await pool.query(
      "SELECT taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung FROM users WHERE taiKhoan = ?",
      [taiKhoan]
    );
    const userRows = rows as any[];
    if (userRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.json(userRows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

userRouter.post("/ThemNguoiDung", async (req, res) => {
  const payload = req.body as {
    taiKhoan: string;
    matKhau: string;
    email: string;
    soDt: string;
    maNhom: string;
    hoTen: string;
    maLoaiNguoiDung?: "KhachHang" | "QuanTri";
  };

  try {
    const [existingRows] = await pool.query("SELECT id FROM users WHERE taiKhoan = ?", [
      payload.taiKhoan
    ]);
    const existing = existingRows as any[];
    if (existing.length > 0) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    await pool.query(
      "INSERT INTO users (taiKhoan, matKhau, email, soDt, maNhom, hoTen, maLoaiNguoiDung) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        payload.taiKhoan,
        payload.matKhau,
        payload.email,
        payload.soDt,
        payload.maNhom,
        payload.hoTen,
        payload.maLoaiNguoiDung ?? "KhachHang"
      ]
    );

    return res.status(201).json({
      ...payload,
      maLoaiNguoiDung: payload.maLoaiNguoiDung ?? "KhachHang"
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

const handleCapNhatThongTinNguoiDung = async (
  req: express.Request,
  res: express.Response
) => {
  const payload = req.body as {
    taiKhoan: string;
    matKhau?: string;
    email?: string;
    soDt?: string;
    maNhom?: string;
    hoTen?: string;
    maLoaiNguoiDung?: "KhachHang" | "QuanTri";
  };

  try {
    const [existingRows] = await pool.query("SELECT id FROM users WHERE taiKhoan = ?", [
      payload.taiKhoan
    ]);
    const existing = existingRows as any[];
    if (existing.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    if (payload.matKhau !== undefined) {
      updates.push("matKhau = ?");
      values.push(payload.matKhau);
    }
    if (payload.email !== undefined) {
      updates.push("email = ?");
      values.push(payload.email);
    }
    if (payload.soDt !== undefined) {
      updates.push("soDt = ?");
      values.push(payload.soDt);
    }
    if (payload.maNhom !== undefined) {
      updates.push("maNhom = ?");
      values.push(payload.maNhom);
    }
    if (payload.hoTen !== undefined) {
      updates.push("hoTen = ?");
      values.push(payload.hoTen);
    }
    if (payload.maLoaiNguoiDung !== undefined) {
      updates.push("maLoaiNguoiDung = ?");
      values.push(payload.maLoaiNguoiDung);
    }

    if (updates.length === 0) {
      return res.json(payload);
    }
    values.push(payload.taiKhoan);
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE taiKhoan = ?`,
      values
    );

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};

userRouter.put("/CapNhatThongTinNguoiDung", handleCapNhatThongTinNguoiDung);
userRouter.post("/CapNhatThongTinNguoiDung", handleCapNhatThongTinNguoiDung);

userRouter.delete("/XoaNguoiDung", async (req, res) => {
  const taiKhoan = (req.query.taiKhoa || req.query.taiKhoan) as string;
  if (!taiKhoan) {
    return res.status(400).json({ message: "Thiếu tham số taiKhoa" });
  }

  try {
    const [result] = await pool.query("DELETE FROM users WHERE taiKhoan = ?", [
      taiKhoan
    ]);
    const affected = (result as any).affectedRows;
    if (affected === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.json({ message: "Xóa thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});
