import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// rutas
import usuarioRoutes from "../src/routes/usuario.js";
import tareasRoutes from "../src/routes/tareas.js";
import notasRoutes from "../src/routes/notas.js";
import contactoRoutes from "../src/routes/contacto.js";
import estilosAprendizajeRoutes from "../src/routes/estilos-aprendizaje.js";
import metodosEstudioRoutes from "../src/routes/metodos-estudio.js";
import dashboardRoutes from "../src/routes/dashboard.js";
// falta cursos

import "../src/cron/recordatoriosCron.js";
//import { iniciarCronTipDiario } from "./cron/tipDiario.cron.js";

const app = express(); // crea la app para recibir y responder http

// limite de las notas 50mb
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
}));

app.use(cookieParser());

// ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando..." });
});

// rutas
//iniciarCronTipDiario();
app.use("/usuarios", usuarioRoutes); // ej. 
app.use("/tareas", tareasRoutes); // /ej. /tareas/crear
app.use("/notas", notasRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/estilosaprendizaje", estilosAprendizajeRoutes);
app.use("/metodosEstudio", metodosEstudioRoutes);
app.use("/contacto", contactoRoutes);
// cursos

export default app;
