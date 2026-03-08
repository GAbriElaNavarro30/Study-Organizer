import { Tarea } from "../models/Tarea.js";
import { Recordatorio } from "../models/Recordatorio.js";
import { db } from "../config/db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const ZONA = "America/Mexico_City";

/* ====================================================
--------- Obtiene todas de todos los usuarios ---------
=====================================================*/
export const obtenerTareasUsuarios = async (req, res) => {
    try {
        const [tareas] = await db.query(
            `SELECT * FROM Tarea ORDER BY fecha_tarea DESC, hora_tarea DESC`
        );
        res.json(tareas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener las tareas" });
    }
};

/* ====================================================
------- Obtener todas las tareas de un usuario --------
=====================================================*/
export const obtenerTareas = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;

        await db.query(
            `UPDATE Tarea
             SET estado_tarea = 'vencida'
             WHERE estado_tarea = 'pendiente'
               AND TIMESTAMP(fecha_tarea, hora_tarea) < NOW()
               AND id_usuario = ?`,
            [idUsuario]
        );

        const [tareas] = await db.query(
            `SELECT * FROM Tarea
             WHERE id_usuario = ?
             ORDER BY fecha_tarea ASC, hora_tarea ASC`,
            [idUsuario]
        );

        res.json(tareas);
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).json({ mensaje: "Error al obtener las tareas" });
    }
};

/* ====================================================
------------ Completar/Descompletar tarea -------------
=====================================================*/
export const completarTarea = async (req, res) => {
    try {
        const { id } = req.params;

        const [tareaExistente] = await db.query(
            `SELECT * FROM Tarea WHERE id_tarea = ?`,
            [id]
        );

        if (tareaExistente.length === 0) {
            return res.status(404).json({ mensaje: "Tarea no encontrada" });
        }

        if (tareaExistente[0].id_usuario !== req.usuario.id) {
            return res.status(403).json({ mensaje: "No tienes permiso para modificar esta tarea" });
        }

        await db.query(
            `UPDATE Tarea
             SET estado_tarea = CASE
               WHEN estado_tarea = 'pendiente' THEN 'completada'
               ELSE 'pendiente'
             END
             WHERE id_tarea = ? AND id_usuario = ?`,
            [id, req.usuario.id]
        );

        const [tareaActualizada] = await db.query(
            `SELECT * FROM Tarea WHERE id_tarea = ?`,
            [id]
        );

        res.json({
            mensaje: "Estado de tarea actualizado",
            tarea: tareaActualizada[0]
        });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ mensaje: "Error al actualizar el estado" });
    }
};

/* ====================================================
--------------------- Crear Tarea ---------------------
=====================================================*/
export const crearTarea = async (req, res) => {
    try {
        const { titulo, descripcion, fecha, hora, activo } = req.body;

        const errores = {};

        if (!titulo || titulo.trim() === "") {
            errores.titulo = "El título es obligatorio";
        } else if (titulo.trim().length < 3) {
            errores.titulo = "El título debe tener al menos 3 caracteres";
        } else if (titulo.trim().length > 100) {
            errores.titulo = "El título no puede exceder 100 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!]+$/.test(titulo.trim())) {
            errores.titulo = "El título solo puede contener letras, números y signos de puntuación básicos";
        }

        if (!descripcion || descripcion.trim() === "") {
            errores.descripcion = "La descripción es obligatoria";
        } else if (descripcion.trim().length > 500) {
            errores.descripcion = "La descripción no puede exceder 500 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!\n]+$/.test(descripcion.trim())) {
            errores.descripcion = "La descripción contiene caracteres no permitidos";
        }

        if (!fecha || fecha.trim() === "") {
            errores.fecha = "La fecha es obligatoria";
        } else {
            const fechaSeleccionada = new Date(fecha + "T00:00:00");
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (isNaN(fechaSeleccionada.getTime())) {
                errores.fecha = "Formato de fecha inválido";
            } else if (fechaSeleccionada < hoy) {
                errores.fecha = "La fecha no puede ser anterior a hoy";
            }
        }

        if (!hora || hora.trim() === "") {
            errores.hora = "La hora es obligatoria";
        } else if (!/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(hora)) {
            errores.hora = "Formato de hora inválido";
        } else if (fecha) {
            const fechaHoraSeleccionada = new Date(`${fecha}T${hora}:00`);
            if (fechaHoraSeleccionada < new Date()) {
                errores.hora = "La fecha y hora no pueden ser anteriores a la actual";
            }
        }

        if (Object.keys(errores).length > 0) {
            return res.status(400).json({ mensaje: "Errores de validación", errores });
        }

        const tarea = new Tarea({
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            fecha_tarea: fecha,
            hora_tarea: hora,
            recordatorio_activo: activo !== undefined ? activo : true,
            id_usuario: req.usuario.id,
        });

        const result = await tarea.save();

        if (activo !== false) {
            const fechaTarea = dayjs(`${fecha} ${hora}:00`).tz(ZONA, true);

            const unDiaAntes = fechaTarea.subtract(1, "day");
            await new Recordatorio({
                tipo: "un_dia_antes",
                fecha_envio: unDiaAntes.format("YYYY-MM-DD"),
                hora_envio: "23:59:00",
                id_tarea: result.insertId,
            }).save();

            const unaHoraAntes = fechaTarea.subtract(1, "hour");
            await new Recordatorio({
                tipo: "una_hora_antes",
                fecha_envio: unaHoraAntes.format("YYYY-MM-DD"),
                hora_envio: unaHoraAntes.format("HH:mm:ss"),
                id_tarea: result.insertId,
            }).save();
        }

        res.status(201).json({ mensaje: "Tarea creada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear la tarea" });
    }
};

/* ====================================================
------------------ Actualizar tarea ------------------
=====================================================*/
export const actualizarTarea = async (req, res) => {
    try {
        const { titulo, descripcion, fecha, hora, activo } = req.body;
        const { id } = req.params;

        const errores = {};

        if (!titulo || titulo.trim() === "") {
            errores.titulo = "El título es obligatorio";
        } else if (titulo.trim().length < 3) {
            errores.titulo = "El título debe tener al menos 3 caracteres";
        } else if (titulo.trim().length > 100) {
            errores.titulo = "El título no puede exceder 100 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!]+$/.test(titulo.trim())) {
            errores.titulo = "El título solo puede contener letras, números y signos de puntuación básicos";
        }

        if (!descripcion || descripcion.trim() === "") {
            errores.descripcion = "La descripción es obligatoria";
        } else if (descripcion.trim().length > 500) {
            errores.descripcion = "La descripción no puede exceder 500 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!\n]+$/.test(descripcion.trim())) {
            errores.descripcion = "La descripción contiene caracteres no permitidos";
        }

        if (!fecha || fecha.trim() === "") {
            errores.fecha = "La fecha es obligatoria";
        } else {
            const fechaSeleccionada = new Date(fecha + "T00:00:00");
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (isNaN(fechaSeleccionada.getTime())) {
                errores.fecha = "Formato de fecha inválido";
            } else if (fechaSeleccionada < hoy) {
                errores.fecha = "La fecha no puede ser anterior a hoy";
            }
        }

        if (!hora || hora.trim() === "") {
            errores.hora = "La hora es obligatoria";
        } else if (!/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(hora)) {
            errores.hora = "Formato de hora inválido";
        } else if (fecha) {
            const fechaHoraSeleccionada = new Date(`${fecha}T${hora}:00`);
            if (fechaHoraSeleccionada < new Date()) {
                errores.hora = "La fecha y hora no pueden ser anteriores a la actual";
            }
        }

        if (Object.keys(errores).length > 0) {
            return res.status(400).json({ mensaje: "Errores de validación", errores });
        }

        await db.query(
            `UPDATE Tarea
             SET titulo = ?, descripcion = ?, fecha_tarea = ?, hora_tarea = ?,
                 recordatorio_activo = ?, estado_tarea = 'pendiente'
             WHERE id_tarea = ? AND id_usuario = ?`,
            [titulo.trim(), descripcion.trim(), fecha, hora,
            activo !== undefined ? activo : true, id, req.usuario.id]
        );

        if (activo !== false) {
            const fechaTarea = dayjs(`${fecha} ${hora}:00`).tz(ZONA, true);

            const unDiaAntes = fechaTarea.subtract(1, "day");
            const unaHoraAntes = fechaTarea.subtract(1, "hour");

            await db.query(
                `UPDATE Recordatorio
                 SET fecha_envio = ?, hora_envio = '23:59:00', enviado = FALSE
                 WHERE id_tarea = ? AND tipo = 'un_dia_antes'`,
                [unDiaAntes.format("YYYY-MM-DD"), id]
            );

            await db.query(
                `UPDATE Recordatorio
                 SET fecha_envio = ?, hora_envio = ?, enviado = FALSE
                 WHERE id_tarea = ? AND tipo = 'una_hora_antes'`,
                [unaHoraAntes.format("YYYY-MM-DD"), unaHoraAntes.format("HH:mm:ss"), id]
            );
        }

        res.json({ mensaje: "Tarea actualizada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar la tarea" });
    }
};

/* ====================================================
------------------ Eliminar tarea ------------------
=====================================================*/
export const eliminarTarea = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            `DELETE FROM Tarea WHERE id_tarea = ? AND id_usuario = ?`,
            [id, req.usuario.id]
        );

        res.json({ mensaje: "Tarea eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar la tarea" });
    }
};

/* ====================================================
-------------------- Buscar tarea ---------------------
=====================================================*/
export const buscarTarea = async (req, res) => {
    try {
        const { q } = req.query;
        const idUsuario = req.usuario.id;

        if (!q || q.trim() === "") {
            return res.status(400).json({ mensaje: "El parámetro de búsqueda es obligatorio" });
        }

        const searchTerm = q.trim().toLowerCase();

        const [tareas] = await db.query(
            `SELECT * FROM Tarea WHERE id_usuario = ? ORDER BY fecha_tarea ASC, hora_tarea ASC`,
            [idUsuario]
        );

        const resultados = tareas.filter(tarea => {
            if (tarea.titulo?.toLowerCase().includes(searchTerm)) return true;
            if (tarea.descripcion?.toLowerCase().includes(searchTerm)) return true;
            if (tarea.estado_tarea?.toLowerCase().includes(searchTerm)) return true;

            if (tarea.fecha_tarea) {
                const dateObj = new Date(tarea.fecha_tarea);
                const fechaFormateada = `${String(dateObj.getUTCDate()).padStart(2, "0")}-${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}-${dateObj.getUTCFullYear()}`;
                if (fechaFormateada.includes(searchTerm)) return true;
            }

            if (tarea.hora_tarea) {
                const [h, min] = tarea.hora_tarea.split(":");
                let hourNum = parseInt(h);
                let period = hourNum >= 12 ? "PM" : "AM";
                let displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                const horaFormateada = `${displayHour}:${min} ${period}`.toLowerCase();
                if (horaFormateada.includes(searchTerm)) return true;
            }

            return false;
        });

        res.json({ total: resultados.length, resultados });
    } catch (error) {
        console.error("Error al buscar tareas:", error);
        res.status(500).json({ mensaje: "Error al buscar tareas" });
    }
};