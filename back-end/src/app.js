import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import usuarioRoutes from "../src/routes/usuario.js";
import tareasRoutes from "../src/routes/tareas.js";
import notasRoutes from "../src/routes/notas.js";
import contactoRoutes from "../src/routes/contacto.js";
import estilosAprendizajeRoutes from "../src/routes/estilos-aprendizaje.js";
import metodosEstudioRoutes from "../src/routes/metodos-estudio.js";
import cursosRoutes from "../src/routes/cursos.js";
import dashboardRoutes from "../src/routes/dashboard.js";

import "../src/cron/recordatoriosCron.js";
import "../src/bot/telegram-bot.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
}));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando..." });
});

app.use("/usuarios", usuarioRoutes);
app.use("/tareas", tareasRoutes); 
app.use("/notas", notasRoutes);
app.use("/estilosaprendizaje", estilosAprendizajeRoutes);
app.use("/metodosestudio", metodosEstudioRoutes);
app.use("/cursos", cursosRoutes);
app.use("/contacto", contactoRoutes);
app.use("/dashboard", dashboardRoutes);

export default app;
