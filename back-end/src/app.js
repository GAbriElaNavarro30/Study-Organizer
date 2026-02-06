import express from "express";
import usuarioRoutes from "../src/routes/usuario.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando" });
});

// rutas
app.use("/usuarios", usuarioRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

export default app;
