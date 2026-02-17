import { Router } from "express";
import { db } from "../config/db.js";
import { verificarToken } from "../middlewares/auth.js";
import sanitizeHtml from "sanitize-html";
import nodemailer from "nodemailer";

const router = Router();

/* ====================================================
-------------------- Sanitizar PDF -------------------- LISTO
=====================================================*/
const sanitizeOpciones = {
    allowedTags: [
        "p", "br", "b", "i", "u", "strong", "em",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "span", "div",
        "blockquote", "pre", "table",
        "thead", "tbody", "tr", "th", "td", "img"
    ],
    allowedAttributes: {
        "*": ["style", "class"],
        "img": ["src", "alt", "width", "height"]
    },
    allowedSchemes: ["data", "http", "https"]
};

/* ====================================================
-------------------- Obtener Notas -------------------- LISTO
=====================================================*/
router.get("/obtener-notas", verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        //console.log('Obteniendo notas para usuario:', id_usuario);

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
        //console.error("Error al obtener notas:", error);
        res.status(500).json({
            error: "Error al obtener las notas",
            detalles: error.message
        });
    }
});

/* ====================================================
--------------------- Crear Nota ---------------------- LISTO
=====================================================*/
router.post("/crear-nota", verificarToken, async (req, res) => {
    try {
        const { titulo, contenido, backgroundColor, fontFamily, fontSize } = req.body;

        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        // console.log('Creando nota:', { titulo, usuario: id_usuario });

        // ===== VALIDACIONES =====

        // 1. Verificar que el título existe
        if (!titulo || titulo.trim() === '') {
            return res.status(400).json({
                error: "El título es obligatorio"
            });
        }

        // 2. Verificar longitud máxima del título
        if (titulo.trim().length > 100) {
            return res.status(400).json({
                error: "El título no puede exceder los 100 caracteres"
            });
        }

        // 3. Verificar caracteres válidos en el título
        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(titulo.trim())) {
            return res.status(400).json({
                error: "El título contiene caracteres no permitidos"
            });
        }

        // 4. Verificar que no exista otra nota con el mismo título para este usuario
        const [notaDuplicada] = await db.query(
            "SELECT id_nota FROM Nota WHERE LOWER(titulo) = LOWER(?) AND id_usuario = ?",
            [titulo.trim(), id_usuario]
        );

        if (notaDuplicada.length > 0) {
            return res.status(409).json({
                error: "Ya tienes una nota con ese título"
            });
        }

        // ===== GUARDAR EN BASE DE DATOS =====
        const contenidoLimpio = sanitizeHtml(contenido || "", sanitizeOpciones);  // SANITIZAR

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
                titulo.trim(),
                contenidoLimpio || '', // Permitir contenido vacío
                backgroundColor || '#ffffff',
                fontFamily || 'Arial',
                fontSize || '16',
                id_usuario
            ]
        );

        // console.log('Nota guardada en BD con ID:', result.insertId);

        res.status(201).json({
            mensaje: "Nota creada exitosamente",
            nota: {
                id_nota: result.insertId,
                titulo: titulo.trim()
            }
        });

    } catch (error) {
        //console.error("Error al crear nota:", error);
        res.status(500).json({
            error: "Error al crear la nota",
            detalles: error.message
        });
    }
});

/* ====================================================
------------------- Actualizar Nota ------------------- LISTO
=====================================================*/
router.put("/actualizar-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, backgroundColor, fontFamily, fontSize } = req.body;

        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        //console.log('Actualizando nota:', id);

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
        const contenidoLimpio = sanitizeHtml(contenido || "", sanitizeOpciones); // sanitiza

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
                contenidoLimpio,
                backgroundColor || '#ffffff',
                fontFamily || 'Arial',
                fontSize || '16',
                id,
                id_usuario
            ]
        );

        //console.log('Nota actualizada en BD');

        res.json({
            mensaje: "Nota actualizada exitosamente",
            nota: {
                id_nota: id,
                titulo
            }
        });

    } catch (error) {
        //console.error("Error al actualizar nota:", error);
        res.status(500).json({
            error: "Error al actualizar la nota",
            detalles: error.message
        });
    }
});

/* ====================================================
------------------- Eliminar Nota --------------------- LISTO
=====================================================*/
router.delete("/eliminar-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        //console.log('Eliminando nota:', id);

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

        //console.log('Nota eliminada de BD');

        res.json({ mensaje: "Nota eliminada exitosamente" });

    } catch (error) {
        //console.error("Error al eliminar nota:", error);
        res.status(500).json({
            error: "Error al eliminar la nota",
            detalles: error.message
        });
    }
});

/* ====================================================
----------------- Renombrar Nota ---------------------- LISTO
=====================================================*/
router.patch("/renombrar-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo } = req.body;

        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        //console.log('Renombrando nota:', id, 'nuevo título:', titulo);

        // ===== VALIDACIONES =====

        // 1. Verificar que el título existe
        if (!titulo || titulo.trim() === '') {
            return res.status(400).json({
                error: "El título es obligatorio"
            });
        }

        // 2. Verificar longitud máxima
        if (titulo.trim().length > 100) {
            return res.status(400).json({
                error: "El título no puede exceder los 100 caracteres"
            });
        }

        // 3. Verificar caracteres válidos (letras, números, espacios y algunos caracteres especiales)
        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(titulo.trim())) {
            return res.status(400).json({
                error: "El título contiene caracteres no permitidos"
            });
        }

        // 4. Verificar que la nota pertenece al usuario
        const [notaExistente] = await db.query(
            "SELECT id_nota FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        if (notaExistente.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        // 5. Verificar que no exista otra nota con el mismo título
        const [notaDuplicada] = await db.query(
            "SELECT id_nota FROM Nota WHERE titulo = ? AND id_usuario = ? AND id_nota != ?",
            [titulo.trim(), id_usuario, id]
        );

        if (notaDuplicada.length > 0) {
            return res.status(409).json({
                error: "Ya tienes una nota con ese título"
            });
        }

        // ===== ACTUALIZAR =====
        await db.query(
            `UPDATE Nota 
            SET titulo = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_nota = ? AND id_usuario = ?`,
            [titulo.trim(), id, id_usuario]
        );

        //console.log('Nota renombrada');

        res.json({
            mensaje: "Nota renombrada exitosamente",
            nota: {
                id_nota: id,
                titulo: titulo.trim()
            }
        });

    } catch (error) {
        //console.error("Error al renombrar nota:", error);
        res.status(500).json({
            error: "Error al renombrar la nota",
            detalles: error.message
        });
    }
});

/* ====================================================
----------------- Obtener una Nota -------------------- LISTO
=====================================================*/
router.get("/obtener-nota/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        //console.log('Obteniendo nota:', id);

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
        //console.error("Error al obtener nota:", error);
        res.status(500).json({
            error: "Error al obtener la nota",
            detalles: error.message
        });
    }
});

/* ====================================================
----------------- Buscar Notas ------------------------ LISTO
=====================================================*/
router.get("/buscar-notas", verificarToken, async (req, res) => {
    try {
        const { q } = req.query; // query string: ?q=busqueda
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        //console.log('Buscando notas:', q);

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
        //console.error("Error al buscar notas:", error);
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
        const { email, pdfBase64, titulo } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!email || !email.includes("@")) {
            return res.status(400).json({ error: "El correo electrónico no es válido" });
        }

        if (!pdfBase64) {
            return res.status(400).json({ error: "No se recibió el PDF" });
        }

        // Verificar que la nota pertenece al usuario
        const [notas] = await db.query(
            "SELECT titulo FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        if (notas.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        const nombreNota = titulo || notas[0].titulo;

        // Configurar transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        // HTML del correo (simple, el contenido va en el PDF adjunto)
        const htmlCorreo = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 20px;">📝 Study Organizer</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Te han compartido una nota</p>
                    </div>
                    <div style="padding: 24px;">
                        <p style="color: #374151; font-size: 15px; margin: 0 0 12px;">Alguien compartió contigo la siguiente nota:</p>
                        <div style="background: #f3f4f6; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; font-weight: bold; color: #1e3a5f; font-size: 16px;">
                            📄 ${nombreNota}
                        </div>
                        <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0;">Encuentra el contenido completo en el archivo PDF adjunto.</p>
                    </div>
                    <div style="padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                        Este correo fue enviado desde Study Organizer
                    </div>
                </div>
            </body>
            </html>
        `;

        // Enviar con PDF adjunto
        await transporter.sendMail({
            from: `"Study Organizer" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `📝 Nota compartida: ${nombreNota}`,
            html: htmlCorreo,
            attachments: [
                {
                    filename: `${nombreNota}.pdf`,
                    content: pdfBase64,
                    encoding: "base64",
                    contentType: "application/pdf",
                },
            ],
        });

        res.json({ mensaje: "Nota compartida exitosamente por correo", compartido_con: email });

    } catch (error) {
        console.error("❌ Error al compartir nota por email:", error);
        res.status(500).json({
            error: "No se pudo enviar el correo.",
            detalles: error.message
        });
    }
});

/*router.post("/compartir-nota/:id", verificarToken, async (req, res) => {
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
});*/

/* ====================================================
------------------- Exportar PDF ---------------------- LISTO
=====================================================*/
router.get("/exportar-pdf/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        console.log('📄 Exportando PDF de nota:', id);

        // Obtener la nota
        const [notas] = await db.query(
            `SELECT 
                id_nota,
                titulo,
                contenido,
                background_color,
                font_family,
                font_size
            FROM Nota 
            WHERE id_nota = ? AND id_usuario = ?`,
            [id, id_usuario]
        );

        if (notas.length === 0) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        const nota = notas[0];

        // Devolver los datos de la nota para que el frontend genere el PDF
        res.json({
            mensaje: "Datos de nota obtenidos para PDF",
            nota: {
                id_nota: nota.id_nota,
                titulo: nota.titulo,
                contenido: nota.contenido,
                background_color: nota.background_color,
                font_family: nota.font_family,
                font_size: nota.font_size
            }
        });

    } catch (error) {
        console.error("❌ Error al exportar PDF:", error);
        res.status(500).json({
            error: "Error al exportar PDF",
            detalles: error.message
        });
    }
});

export default router;