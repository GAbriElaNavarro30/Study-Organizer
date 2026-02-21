import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import { VarkPregunta, VarkRespuestaUsuario, VarkResultado } from "../models/Vark.js";
import axios from "axios";

const router = Router();

// GET /vark/preguntas — obtener las 16 preguntas con sus opciones
router.get("/preguntas", verificarToken, async (req, res) => {
    try {
        const preguntas = await VarkPregunta.getAll();
        res.json({ preguntas });
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// POST /vark/responder — guardar respuestas y obtener resultado del sistema experto
router.post("/responder", verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { respuestas } = req.body;
        // respuestas = [{ id_pregunta, id_opcion, categoria }, ...]

        if (!respuestas || respuestas.length !== 16) {
            return res.status(400).json({ error: "Debes responder las 16 preguntas" });
        }

        // 1. Eliminar respuestas y resultado anteriores (si repite el test)
        await VarkRespuestaUsuario.deleteByUsuario(id_usuario);
        await VarkResultado.deleteByUsuario(id_usuario);

        // 2. Guardar las 16 respuestas
        await VarkRespuestaUsuario.saveMany(id_usuario, respuestas);

        // 3. Mandar respuestas al sistema experto en Python
        const categorias = respuestas.map(r => r.categoria);

        const pythonRes = await axios.post("http://localhost:8000/analizar", {
            categorias
        });

        const { puntaje_v, puntaje_a, puntaje_r, puntaje_k, perfil_dominante, recomendaciones } = pythonRes.data;

        // 4. Guardar resultado
        const resultado = new VarkResultado({
            id_usuario,
            puntaje_v,
            puntaje_a,
            puntaje_r,
            puntaje_k,
            perfil_dominante
        });
        await resultado.save();

        res.json({
            perfil_dominante,
            puntajes: { v: puntaje_v, a: puntaje_a, r: puntaje_r, k: puntaje_k },
            recomendaciones
        });

    } catch (error) {
        console.error("Error al procesar respuestas VARK:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// GET /vark/resultado — obtener el último resultado del usuario
router.get("/resultado", verificarToken, async (req, res) => {
    try {
        const resultado = await VarkResultado.getUltimoByUsuario(req.usuario.id);

        if (!resultado) {
            return res.status(404).json({ mensaje: "El usuario aún no ha realizado el test" });
        }

        res.json({ resultado });
    } catch (error) {
        console.error("Error al obtener resultado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// GET /vark/historial — historial de todos los tests del usuario
router.get("/historial", verificarToken, async (req, res) => {
    try {
        const historial = await VarkResultado.getHistorialByUsuario(req.usuario.id);
        res.json({ historial });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;