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

        // Marcar tareas vencidas si el plazo ya se vencio y estaban como pendientes y no como completadas
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

        // Obtener tareas actualizadas ordenadas por fecha/hora más cercana primero
        const [tareas] = await db.query(
            `
      SELECT * FROM Recordatorio
      WHERE id_usuario = ?
      ORDER BY fecha ASC, hora ASC
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

        //console.log("Tarea encontrada en DB:", tareaExistente);

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
        const { titulo, descripcion, fecha, hora, activo } = req.body;

        // Validaciones
        const errores = {};

        // Validar título
        if (!titulo || titulo.trim() === "") {
            errores.titulo = "El título es obligatorio";
        } else if (titulo.trim().length < 3) {
            errores.titulo = "El título debe tener al menos 3 caracteres";
        } else if (titulo.trim().length > 100) {
            errores.titulo = "El título no puede exceder 100 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!]+$/.test(titulo.trim())) {
            errores.titulo = "El título solo puede contener letras, números y signos de puntuación básicos";
        }

        // Validar descripción
        if (!descripcion || descripcion.trim() === "") {
            errores.descripcion = "La descripción es obligatoria";
        } else if (descripcion.trim().length > 500) {
            errores.descripcion = "La descripción no puede exceder 500 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!\n]+$/.test(descripcion.trim())) {
            errores.descripcion = "La descripción contiene caracteres no permitidos";
        }

        // Validar fecha
        if (!fecha || fecha.trim() === "") {
            errores.fecha = "La fecha es obligatoria";
        } else {
            const fechaSeleccionada = new Date(fecha + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (isNaN(fechaSeleccionada.getTime())) {
                errores.fecha = "Formato de fecha inválido";
            } else if (fechaSeleccionada < hoy) {
                errores.fecha = "La fecha no puede ser anterior a hoy";
            }
        }

        // Validar hora
        if (!hora || hora.trim() === "") {
            errores.hora = "La hora es obligatoria";
        } else if (!/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(hora)) {
            errores.hora = "Formato de hora inválido";
        } else if (fecha) {
            // Validar que no sea una fecha/hora pasada
            const fechaHoraSeleccionada = new Date(`${fecha}T${hora}:00`);
            const ahora = new Date();

            if (fechaHoraSeleccionada < ahora) {
                errores.hora = "La fecha y hora no pueden ser anteriores a la actual";
            }
        }

        // Si hay errores, retornarlos
        if (Object.keys(errores).length > 0) {
            return res.status(400).json({
                mensaje: "Errores de validación",
                errores
            });
        }

        const recordatorio = new Recordatorio({
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            fecha,
            hora,
            activo: activo !== undefined ? activo : true,
            id_usuario: req.usuario.id,
        });

        await recordatorio.save();

        res.status(201).json({
            mensaje: "Tarea creada correctamente",
            recordatorio
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
        const { titulo, descripcion, fecha, hora, activo } = req.body;
        const { id } = req.params;

        // Validaciones
        const errores = {};

        // Validar título
        if (!titulo || titulo.trim() === "") {
            errores.titulo = "El título es obligatorio";
        } else if (titulo.trim().length < 3) {
            errores.titulo = "El título debe tener al menos 3 caracteres";
        } else if (titulo.trim().length > 100) {
            errores.titulo = "El título no puede exceder 100 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!]+$/.test(titulo.trim())) {
            errores.titulo = "El título solo puede contener letras, números y signos de puntuación básicos";
        }

        // Validar descripción
        if (!descripcion || descripcion.trim() === "") {
            errores.descripcion = "La descripción es obligatoria";
        } else if (descripcion.trim().length > 500) {
            errores.descripcion = "La descripción no puede exceder 500 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!\n]+$/.test(descripcion.trim())) {
            errores.descripcion = "La descripción contiene caracteres no permitidos";
        }

        // Validar fecha
        if (!fecha || fecha.trim() === "") {
            errores.fecha = "La fecha es obligatoria";
        } else {
            const fechaSeleccionada = new Date(fecha + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (isNaN(fechaSeleccionada.getTime())) {
                errores.fecha = "Formato de fecha inválido";
            } else if (fechaSeleccionada < hoy) {
                errores.fecha = "La fecha no puede ser anterior a hoy";
            }
        }

        // Validar hora
        if (!hora || hora.trim() === "") {
            errores.hora = "La hora es obligatoria";
        } else if (!/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(hora)) {
            errores.hora = "Formato de hora inválido";
        } else if (fecha) {
            // Validar que no sea una fecha/hora pasada
            const fechaHoraSeleccionada = new Date(`${fecha}T${hora}:00`);
            const ahora = new Date();

            if (fechaHoraSeleccionada < ahora) {
                errores.hora = "La fecha y hora no pueden ser anteriores a la actual";
            }
        }

        // Si hay errores, retornarlos
        if (Object.keys(errores).length > 0) {
            return res.status(400).json({
                mensaje: "Errores de validación",
                errores
            });
        }

        // Resetear flags de envío Y ESTADO cuando se actualiza fecha/hora
        await db.query(
            `UPDATE Recordatorio 
             SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, activo = ?,
                 estado = 'pendiente',
                 enviado_hora_antes = FALSE, enviado_dia_antes = FALSE
             WHERE id_recordatorio = ? AND id_usuario = ?`,
            [titulo.trim(), descripcion.trim(), fecha, hora, activo !== undefined ? activo : true, id, req.usuario.id] // 👈 agregar activo
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
            [id, req.usuario.id]
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
router.get("/buscar-tarea", verificarToken, async (req, res) => {
    try {
        const { q } = req.query; // q = query de búsqueda
        const idUsuario = req.usuario.id;

        if (!q || q.trim() === "") {
            return res.status(400).json({ mensaje: "El parámetro de búsqueda es obligatorio" });
        }

        const searchTerm = q.trim().toLowerCase();

        // Obtener todas las tareas del usuario
        const [tareas] = await db.query(
            `SELECT * FROM Recordatorio 
             WHERE id_usuario = ?
             ORDER BY fecha ASC, hora ASC`,
            [idUsuario]
        );

        // Filtrar tareas en el backend
        const resultados = tareas.filter(tarea => {
            // 1. Buscar en título
            if (tarea.titulo && tarea.titulo.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // 2. Buscar en descripción
            if (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // 3. Buscar en estado
            if (tarea.estado && tarea.estado.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // 4. Buscar en fecha (formato DD-MM-YYYY)
            if (tarea.fecha) {
                const dateObj = new Date(tarea.fecha);
                const day = String(dateObj.getUTCDate()).padStart(2, "0");
                const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                const year = dateObj.getUTCFullYear();
                const fechaFormateada = `${day}-${month}-${year}`;

                if (fechaFormateada.includes(searchTerm)) {
                    return true;
                }
            }

            // 5. Buscar en hora (formato 12H con AM/PM)
            if (tarea.hora) {
                const [h, min] = tarea.hora.split(":");
                let hourNum = parseInt(h);
                let period = "AM";
                let displayHour = hourNum;

                // Convertir de 24h a 12h
                if (hourNum === 0) {
                    displayHour = 12;
                    period = "AM";
                } else if (hourNum === 12) {
                    displayHour = 12;
                    period = "PM";
                } else if (hourNum > 12) {
                    displayHour = hourNum - 12;
                    period = "PM";
                } else {
                    displayHour = hourNum;
                    period = "AM";
                }

                const horaFormateada = `${displayHour}:${min} ${period}`.toLowerCase();
                const horaFormateadaSinEspacios = `${displayHour}:${min}${period}`.toLowerCase();

                if (horaFormateada.includes(searchTerm) || horaFormateadaSinEspacios.includes(searchTerm)) {
                    return true;
                }
            }

            return false;
        });

        res.json({
            total: resultados.length,
            resultados: resultados
        });

    } catch (error) {
        console.error("Error al buscar tareas:", error);
        res.status(500).json({ mensaje: "Error al buscar tareas" });
    }
});

export default router;