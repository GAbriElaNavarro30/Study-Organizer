import { Router } from "express";
import { db } from "../config/db.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

// ==================== FRASES RANDOM DIARIAS ======================
router.get("/tip-diario", verificarToken, async (req, res) => {
    try {
        const hoy = new Date().toISOString().split("T")[0];
        const idUsuario = req.usuario.id;

        // 1. ¿Ya existe un tip para este usuario hoy?
        const [existente] = await db.query(
            `SELECT td.fecha, f.texto 
       FROM tip_diario td
       JOIN frases f ON td.frase_id = f.id
       WHERE td.fecha = ? AND td.id_usuario = ?`,
            [hoy, idUsuario]
        );

        if (existente.length > 0) {
            return res.json({ texto: existente[0].texto, fecha: existente[0].fecha });
        }

        // 2. Obtener total de frases
        const [totalResult] = await db.query(`SELECT COUNT(*) as total FROM frases`);
        const total = totalResult[0].total;

        // 3. Obtener IDs usados por ESTE usuario en su ciclo actual
        const [usadasCiclo] = await db.query(
            `SELECT frase_id FROM tip_diario 
       WHERE id_usuario = ? 
       ORDER BY fecha DESC LIMIT ?`,
            [idUsuario, total]
        );

        const idsUsados = usadasCiclo.map(r => r.frase_id);

        let fraseDisponible;

        if (idsUsados.length >= total || idsUsados.length === 0) {
            // Ciclo completo o primera vez → todas disponibles
            const [rand] = await db.query(`SELECT id FROM frases ORDER BY RAND() LIMIT 1`);
            fraseDisponible = rand[0];
        } else {
            // Quedan frases sin usar para este usuario
            const placeholders = idsUsados.map(() => "?").join(",");
            const [disponibles] = await db.query(
                `SELECT id FROM frases WHERE id NOT IN (${placeholders}) ORDER BY RAND() LIMIT 1`,
                idsUsados
            );
            fraseDisponible = disponibles[0];
        }

        // 4. Guardar el tip del día para este usuario
        await db.query(
            `INSERT INTO tip_diario (fecha, frase_id, id_usuario) VALUES (?, ?, ?)`,
            [hoy, fraseDisponible.id, idUsuario]
        );

        // 5. Devolver el texto
        const [resultado] = await db.query(
            `SELECT texto FROM frases WHERE id = ?`,
            [fraseDisponible.id]
        );

        return res.json({ texto: resultado[0].texto, fecha: hoy });

    } catch (error) {
        console.error("Error al obtener tip diario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;