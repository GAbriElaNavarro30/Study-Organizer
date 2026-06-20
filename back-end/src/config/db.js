import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: true }
    : false
});

try {
  const connection = await db.getConnection();
  console.log("Conexión a la base de datos exitosa");
  connection.release();
} catch (error) {
  console.error("Error conectando a la BD", error);
}