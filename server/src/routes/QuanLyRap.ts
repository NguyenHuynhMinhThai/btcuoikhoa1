import express from "express";
import { pool } from "../db";

export const theaterRouter = express.Router();

theaterRouter.get("/LayThongTinHeThongRap", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT maHeThongRap, tenHeThongRap, logo FROM theater_systems"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

theaterRouter.get("/LayThongTinCumRapTheoHeThong", async (req, res) => {
  const maHeThongRap = req.query.maHeThongRap as string;
  if (!maHeThongRap) {
    return res.status(400).json({ message: "Thiếu tham số maHeThongRap" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT maCumRap, tenCumRap, diaChi FROM theater_clusters WHERE maHeThongRap = ?",
      [maHeThongRap]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

theaterRouter.get("/LayThongTinLichChieuHeThongRap", async (req, res) => {
  const maHeThongRap = req.query.maHeThongRap as string;

  try {
    const [systemsRows] = maHeThongRap
      ? await pool.query(
          "SELECT maHeThongRap, tenHeThongRap, logo FROM theater_systems WHERE maHeThongRap = ?",
          [maHeThongRap]
        )
      : await pool.query("SELECT maHeThongRap, tenHeThongRap, logo FROM theater_systems");
    const systems = systemsRows as any[];

    const result = [];
    for (const sys of systems) {
      const [clustersRows] = await pool.query(
        `SELECT tc.maCumRap, tc.tenCumRap, tc.diaChi
         FROM theater_clusters tc
         WHERE tc.maHeThongRap = ?`,
        [sys.maHeThongRap]
      );
      const clusters = clustersRows as any[];

      const cumRapChieu = [];
      for (const c of clusters) {
        const [showtimesRows] = await pool.query(
          `SELECT sh.maLichChieu, sh.maRap, t.tenRap, sh.ngayChieu, sh.gioChieu, sh.giaVe
           FROM showtimes sh
           JOIN theaters t ON sh.maRap = t.maRap
           WHERE t.maCumRap = ?
           ORDER BY sh.ngayChieu, sh.gioChieu`,
          [c.maCumRap]
        );
        const showtimes = (showtimesRows as any[]).map((s) => ({
          maLichChieu: s.maLichChieu,
          maRap: s.maRap,
          tenRap: s.tenRap,
          ngayChieuGioChieu: `${s.ngayChieu}T${String(s.gioChieu).slice(0, 8)}`,
          giaVe: Number(s.giaVe)
        }));
        cumRapChieu.push({
          maCumRap: c.maCumRap,
          tenCumRap: c.tenCumRap,
          diaChi: c.diaChi,
          lichChieuPhim: showtimes
        });
      }

      result.push({
        maHeThongRap: sys.maHeThongRap,
        tenHeThongRap: sys.tenHeThongRap,
        logo: sys.logo || "",
        cumRapChieu
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});

theaterRouter.get("/LayThongTinLichChieuPhim", async (req, res) => {
  const maPhim = Number(req.query.MaPhim);
  if (!maPhim) {
    return res.status(400).json({ message: "Thiếu tham số MaPhim" });
  }

  try {
    const [systemsRows] = await pool.query(
      `SELECT DISTINCT ts.maHeThongRap, ts.tenHeThongRap, ts.logo
       FROM theater_systems ts
       JOIN theater_clusters tc ON ts.maHeThongRap = tc.maHeThongRap
       JOIN theaters t ON tc.maCumRap = t.maCumRap
       JOIN showtimes sh ON t.maRap = sh.maRap
       WHERE sh.maPhim = ?`,
      [maPhim]
    );
    const systems = systemsRows as any[];

    const heThongRapChieu = [];
    for (const sys of systems) {
      const [clustersRows] = await pool.query(
        `SELECT tc.maCumRap, tc.tenCumRap, tc.diaChi
         FROM theater_clusters tc
         JOIN theaters t ON tc.maCumRap = t.maCumRap
         JOIN showtimes sh ON t.maRap = sh.maRap
         WHERE tc.maHeThongRap = ? AND sh.maPhim = ?`,
        [sys.maHeThongRap, maPhim]
      );
      const clusters = clustersRows as any[];

      const cumRapChieu = [];
      for (const c of clusters) {
        const [showtimesRows] = await pool.query(
          `SELECT sh.maLichChieu, sh.maRap, t.tenRap, sh.ngayChieu, sh.gioChieu, sh.giaVe
           FROM showtimes sh
           JOIN theaters t ON sh.maRap = t.maRap
           WHERE t.maCumRap = ? AND sh.maPhim = ?
           ORDER BY sh.ngayChieu, sh.gioChieu`,
          [c.maCumRap, maPhim]
        );
        const lichChieuPhim = (showtimesRows as any[]).map((s) => ({
          maLichChieu: s.maLichChieu,
          maRap: s.maRap,
          tenRap: s.tenRap,
          ngayChieuGioChieu: `${s.ngayChieu}T${String(s.gioChieu).slice(0, 8)}`,
          giaVe: Number(s.giaVe)
        }));
        cumRapChieu.push({
          maCumRap: c.maCumRap,
          tenCumRap: c.tenCumRap,
          diaChi: c.diaChi,
          lichChieuPhim
        });
      }

      heThongRapChieu.push({
        maHeThongRap: sys.maHeThongRap,
        tenHeThongRap: sys.tenHeThongRap,
        logo: sys.logo || "",
        cumRapChieu
      });
    }

    res.json({
      maPhim,
      heThongRapChieu
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
});
