import express from "express";
import usuarioRoutes from "../src/routes/usuario.js";
import tareasRoutes from "../src/routes/tareas.js";
import notasRoutes from "../src/routes/notas.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import "../src/cron/recordatoriosCron.js";

dotenv.config();
const app = express();

//app.use(express.json());
//app.use(express.urlencoded({ extended: true })); 

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando" });
});

// rutas
app.use("/usuarios", usuarioRoutes);
app.use("/tareas", tareasRoutes);
app.use("/notas", notasRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

export default app;
