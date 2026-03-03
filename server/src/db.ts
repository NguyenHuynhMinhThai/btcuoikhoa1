import "dotenv/config";
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || "movie_user",
  password: process.env.DB_PASSWORD || "movie_pass",
  database: process.env.DB_NAME || "movie_booking",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

