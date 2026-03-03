import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db";

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: express.Request, _file: Express.Multer.File, cb: (e: null, p: string) => void) =>
    cb(null, uploadDir),
  filename: (_req: express.Request, file: Express.Multer.File, cb: (e: null, p: string) => void) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `movie-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

export const movieRouter = express.Router();

movieRouter.get("/LayDanhSachBanner", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT maPhim, hinhAnh FROM banners");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.get("/LayDanhSachPhim", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT maPhim, tenPhim, trailer, hinhAnh, moTa, maNhom, ngayKhoiChieu, danhGia, hot, dangChieu, sapChieu FROM movies"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.get("/LayDanhSachPhimPhanTrang", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const soPhanTuTrenTrang = Number(req.query.soPhanTuTrenTrang) || 10;

  try {
    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM movies");
    const total = (countRows as any[])[0].total;
    const offset = (page - 1) * soPhanTuTrenTrang;

    const [rows] = await pool.query(
      "SELECT maPhim, tenPhim, trailer, hinhAnh, moTa, maNhom, ngayKhoiChieu, danhGia, hot, dangChieu, sapChieu FROM movies LIMIT ? OFFSET ?",
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

movieRouter.get("/LayDanhSachPhimTheoNgay", async (req, res) => {
  const tuNgay = req.query.tuNgay as string;
  const denNgay = req.query.denNgay as string;

  try {
    let query =
      "SELECT maPhim, tenPhim, trailer, hinhAnh, moTa, maNhom, ngayKhoiChieu, danhGia, hot, dangChieu, sapChieu FROM movies WHERE 1=1";
    const params: (string | Date)[] = [];

    if (tuNgay) {
      query += " AND ngayKhoiChieu >= ?";
      params.push(tuNgay);
    }
    if (denNgay) {
      query += " AND ngayKhoiChieu <= ?";
      params.push(denNgay);
    }
    query += " ORDER BY ngayKhoiChieu DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.get("/LayThongTinPhim", async (req, res) => {
  const maPhim = Number(req.query.maPhim);
  if (!maPhim) {
    return res.status(400).json({ message: "Thiếu tham số maPhim" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT maPhim, tenPhim, trailer, hinhAnh, moTa, maNhom, ngayKhoiChieu, danhGia, hot, dangChieu, sapChieu FROM movies WHERE maPhim = ?",
      [maPhim]
    );
    const items = rows as any[];
    if (items.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }
    res.json(items[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.post("/ThemPhimUploadHinh", upload.single("hinhAnh"), async (req, res) => {
  const body = req.body as any;
  const file = (req as any).file;
  const hinhAnh = file
    ? `/uploads/${file.filename}`
    : body.hinhAnh || "https://picsum.photos/300/450";

  try {
    const [result] = await pool.query(
      "INSERT INTO movies (tenPhim, trailer, hinhAnh, moTa, maNhom, ngayKhoiChieu, danhGia, hot, dangChieu, sapChieu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        body.tenPhim || "",
        body.trailer || "",
        hinhAnh,
        body.moTa || "",
        body.maNhom || "GP01",
        body.ngayKhoiChieu || null,
        Number(body.danhGia) || 0,
        body.hot ? 1 : 0,
        body.dangChieu ? 1 : 0,
        body.sapChieu ? 1 : 0
      ]
    );
    const maPhim = (result as any).insertId;
    await pool.query("INSERT INTO banners (maPhim, hinhAnh) VALUES (?, ?)", [maPhim, hinhAnh]);
    const [newRows] = await pool.query("SELECT * FROM movies WHERE maPhim = ?", [maPhim]);
    res.status(201).json((newRows as any[])[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.post("/CapNhatPhimUpload", upload.single("hinhAnh"), async (req, res) => {
  const body = req.body as any;
  const file = (req as any).file;
  const maPhim = Number(body.maPhim);
  if (!maPhim) {
    return res.status(400).json({ message: "Thiếu maPhim" });
  }

  try {
    const [existingRows] = await pool.query("SELECT * FROM movies WHERE maPhim = ?", [maPhim]);
    if ((existingRows as any[]).length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    const hinhAnh = file
      ? `/uploads/${file.filename}`
      : body.hinhAnh;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (body.tenPhim !== undefined) {
      updates.push("tenPhim = ?");
      values.push(body.tenPhim);
    }
    if (body.trailer !== undefined) {
      updates.push("trailer = ?");
      values.push(body.trailer);
    }
    if (hinhAnh) {
      updates.push("hinhAnh = ?");
      values.push(hinhAnh);
    }
    if (body.moTa !== undefined) {
      updates.push("moTa = ?");
      values.push(body.moTa);
    }
    if (body.maNhom !== undefined) {
      updates.push("maNhom = ?");
      values.push(body.maNhom);
    }
    if (body.ngayKhoiChieu !== undefined) {
      updates.push("ngayKhoiChieu = ?");
      values.push(body.ngayKhoiChieu);
    }
    if (body.danhGia !== undefined) {
      updates.push("danhGia = ?");
      values.push(Number(body.danhGia));
    }
    if (body.hot !== undefined) {
      updates.push("hot = ?");
      values.push(body.hot ? 1 : 0);
    }
    if (body.dangChieu !== undefined) {
      updates.push("dangChieu = ?");
      values.push(body.dangChieu ? 1 : 0);
    }
    if (body.sapChieu !== undefined) {
      updates.push("sapChieu = ?");
      values.push(body.sapChieu ? 1 : 0);
    }

    if (updates.length > 0) {
      values.push(maPhim);
      await pool.query(`UPDATE movies SET ${updates.join(", ")} WHERE maPhim = ?`, values);
      if (hinhAnh) {
        await pool.query("UPDATE banners SET hinhAnh = ? WHERE maPhim = ?", [hinhAnh, maPhim]);
      }
    }

    const [newRows] = await pool.query("SELECT * FROM movies WHERE maPhim = ?", [maPhim]);
    res.json((newRows as any[])[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.post("/", upload.single("hinhAnh"), async (req, res) => {
  const body = req.body as any;
  const file = (req as any).file;
  const hinhAnh = file
    ? `/uploads/${file.filename}`
    : body.hinhAnh || "https://picsum.photos/300/450";

  try {
    const [result] = await pool.query(
      "INSERT INTO movies (tenPhim, trailer, hinhAnh, moTa, maNhom, ngayKhoiChieu, danhGia, hot, dangChieu, sapChieu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        body.tenPhim || "",
        body.trailer || "",
        hinhAnh,
        body.moTa || "",
        body.maNhom || "GP01",
        body.ngayKhoiChieu || null,
        Number(body.danhGia) || 0,
        body.hot ? 1 : 0,
        body.dangChieu ? 1 : 0,
        body.sapChieu ? 1 : 0
      ]
    );
    const maPhim = (result as any).insertId;
    await pool.query("INSERT INTO banners (maPhim, hinhAnh) VALUES (?, ?)", [maPhim, hinhAnh]);
    const [newRows] = await pool.query("SELECT * FROM movies WHERE maPhim = ?", [maPhim]);
    res.status(201).json((newRows as any[])[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.delete("/XoaPhim", async (req, res) => {
  const maPhim = Number(req.query.maPhim);
  if (!maPhim) {
    return res.status(400).json({ message: "Thiếu tham số maPhim" });
  }

  try {
    await pool.query("DELETE FROM banners WHERE maPhim = ?", [maPhim]);
    const [result] = await pool.query("DELETE FROM movies WHERE maPhim = ?", [maPhim]);
    const affected = (result as any).affectedRows;
    if (affected === 0) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }
    res.json({ message: "Xóa phim thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

movieRouter.delete("/XP", async (req, res) => {
  const maPhim = Number(req.query.maPhim || req.query.MaPhim);
  if (!maPhim) {
    return res.status(400).json({ message: "Thiếu tham số maPhim" });
  }

  try {
    await pool.query("DELETE FROM banners WHERE maPhim = ?", [maPhim]);
    const [result] = await pool.query("DELETE FROM movies WHERE maPhim = ?", [maPhim]);
    const affected = (result as any).affectedRows;
    if (affected === 0) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }
    res.json({ message: "Xóa phim thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});
