import express from "express";
import path from "path";
import cors from "cors";
import { json } from "body-parser";
import { movieRouter } from "./routes/QuanLyPhim";
import { userRouter } from "./routes/QuanLyNguoiDung";
import { bookingRouter } from "./routes/QuanLyDatVe";
import { theaterRouter } from "./routes/QuanLyRap";
import { pool } from "./db";

const app = express();
const port = 4000;

app.use(cors());
app.use(json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Movie Booking API (TypeScript)" });
});

app.use("/api/QuanLyPhim", movieRouter);
app.use("/api/QuanLyNguoiDung", userRouter);
app.use("/api/QuanLyDatVe", bookingRouter);
app.use("/api/QuanLyRap", theaterRouter);

app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
  try {
    const connection = await pool.getConnection();
    // eslint-disable-next-line no-console
    console.log("Connected to MySQL database");
    connection.release();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Cannot connect to MySQL database", error);
  }
});
