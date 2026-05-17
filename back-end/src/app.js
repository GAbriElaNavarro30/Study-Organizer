import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Importación de rutas por módulo
import usuarioRoutes from "../src/routes/usuario.js";
import tareasRoutes from "../src/routes/tareas.js";
import notasRoutes from "../src/routes/notas.js";
import contactoRoutes from "../src/routes/contacto.js";
import estilosAprendizajeRoutes from "../src/routes/estilos-aprendizaje.js";
import metodosEstudioRoutes from "../src/routes/metodos-estudio.js";
import cursosRoutes from "../src/routes/cursos.js";
import dashboardRoutes from "../src/routes/dashboard.js";

import "../src/cron/recordatoriosCron.js";

const app = express();

// limite de las notas 50mb para el envío de notas
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// Configuración del CORS para la comunicación con el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
}));


// Manejo de cookies para la autenticación
app.use(cookieParser());


// ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando..." });
});


// Registro de rutas por módulo
app.use("/usuarios", usuarioRoutes);
app.use("/tareas", tareasRoutes); 
app.use("/notas", notasRoutes);
app.use("/estilosaprendizaje", estilosAprendizajeRoutes);
app.use("/metodosestudio", metodosEstudioRoutes);
app.use("/cursos", cursosRoutes);
app.use("/contacto", contactoRoutes);
app.use("/dashboard", dashboardRoutes);

export default app;
