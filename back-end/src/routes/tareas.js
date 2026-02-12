import { Router } from "express";
import { Recordatorio } from "../models/Recordatorio.js";
import { Usuario } from "../models/Usuario.js";
import { db } from "../config/db.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

/* ====================================================
--------- Obtiene todas de todos los usuarios ---------
=====================================================*/
router.get("/obtener-tareas-usuarios", verificarToken, async (req, res) => {
    try {
        const [tareas] = await db.query(
            `SELECT * FROM Recordatorio 
       ORDER BY fecha DESC, hora DESC`,
            [req.usuario.id_usuario]
        );

        res.json(tareas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener las tareas" });
    }
});

/* ====================================================
------- Obtener todas las tareas de un usuario --------
=====================================================*/
router.get("/obtener-tareas", verificarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id;

        // Marcar tareas vencidas
        await db.query(
            `
      UPDATE Recordatorio
      SET estado = 'vencida'
      WHERE estado = 'pendiente'
        AND TIMESTAMP(fecha, hora) < NOW()
        AND id_usuario = ?
      `,
            [idUsuario]
        );

        // Obtener tareas actualizadas
        const [tareas] = await db.query(
            `
      SELECT * FROM Recordatorio
      WHERE id_usuario = ?
      ORDER BY fecha DESC, hora DESC
      `,
            [idUsuario]
        );

        res.json(tareas);
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).json({ mensaje: "Error al obtener las tareas" });
    }
});

/* ====================================================
------------ Completar/Descompletar tarea -------------
=====================================================*/
router.patch("/completar-tarea/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        //console.log("ID recibido:", id);
        //console.log("Usuario del token:", req.usuario);
        //console.log("id_usuario:", req.usuario.id);

        // Primero verifica si la tarea existe
        const [tareaExistente] = await db.query(
            `SELECT * FROM Recordatorio WHERE id_recordatorio = ?`,
            [id]
        );

        console.log("Tarea encontrada en DB:", tareaExistente);

        if (tareaExistente.length === 0) {
            console.log("La tarea no existe en la base de datos");
            return res.status(404).json({ mensaje: "Tarea no encontrada" });
        }

        if (tareaExistente[0].id_usuario !== req.usuario.id) {
            console.log("La tarea pertenece a otro usuario");
            console.log("Dueño de la tarea:", tareaExistente[0].id_usuario);
            //console.log("Usuario actual:", req.usuario.id);
            return res.status(403).json({ mensaje: "No tienes permiso para modificar esta tarea" });
        }

        // Ejecuta la actualización
        const [resultado] = await db.query(
            `UPDATE Recordatorio
       SET estado = CASE
         WHEN estado = 'pendiente' THEN 'completada'
         ELSE 'pendiente'
       END
       WHERE id_recordatorio = ? AND id_usuario = ?`,
            [id, req.usuario.id]
        );

        console.log("Filas afectadas:", resultado.affectedRows);

        // Obtiene el nuevo estado
        const [tareaActualizada] = await db.query(
            `SELECT * FROM Recordatorio WHERE id_recordatorio = ?`,
            [id]
        );

        //console.log("Tarea actualizada:", tareaActualizada[0]);

        res.json({
            mensaje: "Estado de tarea actualizado",
            tarea: tareaActualizada[0]
        });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ mensaje: "Error al actualizar el estado" });
    }
});

/* ====================================================
--------------------- Crear Tarea ---------------------
=====================================================*/
router.post("/crear-tarea", verificarToken, async (req, res) => {
    try {
        const { titulo, descripcion, fecha, hora } = req.body;

        const recordatorio = new Recordatorio({
            titulo,
            descripcion,
            fecha,
            hora,
            id_usuario: req.usuario.id, // ✅ CAMBIO AQUÍ
        });

        await recordatorio.save();

        res.status(201).json({
            mensaje: "Tarea creada correctamente",
            recordatorio // Devolver la tarea creada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al crear la tarea",
        });
    }
});

/* ====================================================
------------------ Actualizar tarea ------------------
=====================================================*/
router.put("/actualizar-tarea/:id", verificarToken, async (req, res) => {
    try {
        const { titulo, descripcion, fecha, hora } = req.body;
        const { id } = req.params;

        // Resetear flags de envío cuando se actualiza fecha/hora
        await db.query(
            `UPDATE Recordatorio 
       SET titulo = ?, descripcion = ?, fecha = ?, hora = ?,
           enviado_hora_antes = FALSE, enviado_dia_antes = FALSE
       WHERE id_recordatorio = ? AND id_usuario = ?`,
            [titulo, descripcion, fecha, hora, id, req.usuario.id] // ✅ CAMBIO AQUÍ
        );

        res.json({ mensaje: "Tarea actualizada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar la tarea" });
    }
});

/* ====================================================
------------------ Eliminar tarea ------------------
=====================================================*/
router.delete("/eliminar-tarea/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            `DELETE FROM Recordatorio 
       WHERE id_recordatorio = ? AND id_usuario = ?`,
            [id, req.usuario.id] // ✅ CAMBIO AQUÍ
        );

        res.json({ mensaje: "Tarea eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar la tarea" });
    }
});

/* ====================================================
-------------------- Buscar tarea ---------------------
=====================================================*/


export default router;