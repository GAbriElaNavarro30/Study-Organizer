import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import { VarkPregunta, VarkRespuestaUsuario, VarkResultado, VarkIntento } from "../models/Vark.js";

import axios from "axios";

const router = Router();

// ============== Obtener todas las preguntas con sus opciones para mostrar ===============
router.get("/preguntas", verificarToken, async (req, res) => {
    try {
        const preguntas = await VarkPregunta.getAll();
        res.json({ preguntas });
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ======== Solo guarda las respuestas del usuario ========
router.post("/responder", verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { respuestas } = req.body;

        if (!respuestas || respuestas.length !== 16) {
            return res.status(400).json({ error: "Debes responder las 16 preguntas" });
        }

        // ✅ La BD genera el id automáticamente (1, 2, 3...)
        const id_intento = await VarkIntento.crear(id_usuario);

        await VarkRespuestaUsuario.saveMany(id_usuario, respuestas, id_intento);

        res.json({ mensaje: "Respuestas guardadas correctamente", id_intento });

    } catch (error) {
        console.error("Error al guardar respuestas VARK:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.get("/resultado", verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_intento } = req.query; // ← viene del frontend como query param

        if (!id_intento) {
            return res.status(400).json({ error: "Falta el id_intento" });
        }

        // ✅ Solo trae las respuestas de ese intento específico
        const respuestas = await VarkRespuestaUsuario.getByIntento(id_usuario, id_intento);

        if (!respuestas || respuestas.length !== 16) {
            return res.status(404).json({ mensaje: "No se encontraron las 16 respuestas del intento" });
        }

        const categorias = respuestas.map(r => r.categoria);

        const pythonRes = await axios.post("http://localhost:8000/analizar", { categorias });
        const { puntaje_v, puntaje_a, puntaje_r, puntaje_k, perfil_dominante, recomendaciones } = pythonRes.data;

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
        console.error("Error al obtener resultado VARK:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ======== Consultar el último resultado guardado (sin recalcular) ========
router.get("/resultado-guardado", verificarToken, async (req, res) => {
    try {
        const resultado = await VarkResultado.getUltimoByUsuario(req.usuario.id);

        if (!resultado) {
            return res.status(404).json({ mensaje: "El usuario aún no ha realizado el test" });
        }

        // Obtener recomendaciones del sistema experto según el perfil ya guardado
        const pythonRes = await axios.get(`http://localhost:8000/recomendaciones/${resultado.perfil_dominante}`);
        const recomendaciones = pythonRes.data.recomendaciones;

        res.json({
            perfil_dominante: resultado.perfil_dominante,
            puntajes: {
                v: resultado.puntaje_v,
                a: resultado.puntaje_a,
                r: resultado.puntaje_r,
                k: resultado.puntaje_k
            },
            recomendaciones
        });

    } catch (error) {
        console.error("Error al obtener resultado guardado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// =================== Obtener todo historial de todos los tests de todos los usuarios ====================
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