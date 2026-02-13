import { Router } from "express";
import { db } from "../config/db.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

/* ====================================================
-------------------- Obtener Notas ---------------------
=====================================================*/
router.get("/obtener-notas", verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('📋 Obteniendo notas para usuario:', id_usuario);

        const [notas] = await db.query(
            `SELECT 
                id_nota,
                titulo,
                contenido,
                background_color,
                font_family,
                font_size,
                created_at,
                updated_at
            FROM Nota
            WHERE id_usuario = ?
            ORDER BY updated_at DESC`,
            [id_usuario]
        );

        res.json(notas);
    } catch (error) {
        console.error("❌ Error al obtener notas:", error);
        res.status(500).json({ 
            error: "Error al obtener las notas",
            detalles: error.message 
        });
    }
});

/* ====================================================
--------------------- Crear Nota ----------------------
=====================================================*/
router.post("/crear-nota", verificarToken, async (req, res) => {
    try {
        const { titulo, contenido, backgroundColor, fontFamily, fontSize } = req.body;
        
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('📄 Creando nota:', { titulo, usuario: id_usuario });

        // Validaciones
        if (!titulo || !contenido) {
            return res.status(400).json({ 
                error: "El título y el contenido son obligatorios" 
            });
        }

        // Guardar en base de datos
        const [result] = await db.query(
            `INSERT INTO Nota (
                titulo, 
                contenido,
                background_color,
                font_family,
                font_size,
                id_usuario
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                contenido,
                backgroundColor || '#ffffff',
                fontFamily || 'Arial',
                fontSize || '16',
                id_usuario
            ]
        );

        console.log('✅ Nota guardada en BD con ID:', result.insertId);

        res.status(201).json({
            mensaje: "Nota creada exitosamente",
            nota: {
                id_nota: result.insertId,
                titulo
            }
        });

    } catch (error) {
        console.error("❌ Error al crear nota:", error);
        res.status(500).json({ 
            error: "Error al crear la nota",
            detalles: error.message 
        });
    }
});

/* ====================================================
------------------- Actualizar Nota -------------------
=====================================================*/
router.put("/actualizar-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, backgroundColor, fontFamily, fontSize } = req.body;
        
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('📝 Actualizando nota:', id);

        // Validaciones
        if (!titulo || !contenido) {
            return res.status(400).json({ 
                error: "El título y el contenido son obligatorios" 
            });
        }

        // Verificar que la nota pertenece al usuario
        const [notaExistente] = await db.query(
            "SELECT * FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        if (notaExistente.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        // Actualizar en base de datos
        await db.query(
            `UPDATE Nota 
            SET titulo = ?, 
                contenido = ?,
                background_color = ?,
                font_family = ?,
                font_size = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_nota = ? AND id_usuario = ?`,
            [
                titulo,
                contenido,
                backgroundColor || '#ffffff',
                fontFamily || 'Arial',
                fontSize || '16',
                id,
                id_usuario
            ]
        );

        console.log('✅ Nota actualizada en BD');

        res.json({
            mensaje: "Nota actualizada exitosamente",
            nota: {
                id_nota: id,
                titulo
            }
        });

    } catch (error) {
        console.error("❌ Error al actualizar nota:", error);
        res.status(500).json({ 
            error: "Error al actualizar la nota",
            detalles: error.message 
        });
    }
});

/* ====================================================
------------------- Eliminar Nota ---------------------
=====================================================*/
router.delete("/eliminar-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('🗑️ Eliminando nota:', id);

        // Verificar que la nota pertenece al usuario
        const [nota] = await db.query(
            "SELECT id_nota FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        if (nota.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        // Eliminar de base de datos
        await db.query(
            "DELETE FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        console.log('✅ Nota eliminada de BD');

        res.json({ mensaje: "Nota eliminada exitosamente" });

    } catch (error) {
        console.error("❌ Error al eliminar nota:", error);
        res.status(500).json({ 
            error: "Error al eliminar la nota",
            detalles: error.message 
        });
    }
});

/* ====================================================
----------------- Renombrar Nota ----------------------
=====================================================*/
router.patch("/renombrar-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo } = req.body;
        
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('✍️ Renombrando nota:', id, 'nuevo título:', titulo);

        // Validación
        if (!titulo || titulo.trim() === '') {
            return res.status(400).json({ 
                error: "El título es obligatorio" 
            });
        }

        // Verificar que la nota pertenece al usuario
        const [notaExistente] = await db.query(
            "SELECT id_nota FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        if (notaExistente.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        // Actualizar solo el título
        await db.query(
            `UPDATE Nota 
            SET titulo = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_nota = ? AND id_usuario = ?`,
            [titulo, id, id_usuario]
        );

        console.log('✅ Nota renombrada');

        res.json({
            mensaje: "Nota renombrada exitosamente",
            nota: {
                id_nota: id,
                titulo
            }
        });

    } catch (error) {
        console.error("❌ Error al renombrar nota:", error);
        res.status(500).json({ 
            error: "Error al renombrar la nota",
            detalles: error.message 
        });
    }
});

/* ====================================================
----------------- Obtener una Nota --------------------
=====================================================*/
router.get("/obtener-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('📖 Obteniendo nota:', id);

        const [notas] = await db.query(
            `SELECT 
                id_nota,
                titulo,
                contenido,
                background_color,
                font_family,
                font_size,
                created_at,
                updated_at
            FROM Nota 
            WHERE id_nota = ? AND id_usuario = ?`,
            [id, id_usuario]
        );

        if (notas.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        res.json(notas[0]);

    } catch (error) {
        console.error("❌ Error al obtener nota:", error);
        res.status(500).json({ 
            error: "Error al obtener la nota",
            detalles: error.message 
        });
    }
});

/* ====================================================
----------------- Buscar Notas ------------------------
=====================================================*/
router.get("/buscar-notas", verificarToken, async (req, res) => {
    try {
        const { q } = req.query; // query string: ?q=busqueda
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('🔍 Buscando notas:', q);

        if (!q || q.trim() === '') {
            return res.status(400).json({ 
                error: "El término de búsqueda es obligatorio" 
            });
        }

        const [notas] = await db.query(
            `SELECT 
                id_nota,
                titulo,
                contenido,
                background_color,
                font_family,
                font_size,
                created_at,
                updated_at
            FROM Nota
            WHERE id_usuario = ? 
            AND (titulo LIKE ? OR contenido LIKE ?)
            ORDER BY updated_at DESC`,
            [id_usuario, `%${q}%`, `%${q}%`]
        );

        res.json({
            resultados: notas.length,
            notas: notas
        });

    } catch (error) {
        console.error("❌ Error al buscar notas:", error);
        res.status(500).json({ 
            error: "Error al buscar notas",
            detalles: error.message 
        });
    }
});

/* ====================================================
----------------- Compartir Nota ----------------------
=====================================================*/
router.post("/compartir-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('📤 Compartiendo nota:', id, 'con:', email);

        // Verificar que la nota pertenece al usuario
        const [nota] = await db.query(
            "SELECT titulo FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        if (nota.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        // TODO: Implementar lógica de compartir
        // Por ejemplo: enviar email, crear enlace compartido, etc.

        res.json({
            mensaje: "Nota compartida exitosamente",
            nota: {
                id_nota: id,
                titulo: nota[0].titulo,
                compartido_con: email
            }
        });

    } catch (error) {
        console.error("❌ Error al compartir nota:", error);
        res.status(500).json({ 
            error: "Error al compartir la nota",
            detalles: error.message 
        });
    }
});

export default router;