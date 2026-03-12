import { db } from "../config/db.js";
import sanitizeHtml from "sanitize-html";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import twilio from "twilio";

/* ====================================================
-------------------- Sanitizar PDF --------------------
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
        "img": ["src", "alt", "width", "height"],
        "ul": ["style", "class"],
        "ol": ["style", "class"],
        "li": ["style", "class"],
    },
    allowedSchemes: ["data", "http", "https"],
    allowedStyles: {
        "*": {
            "color": [/.*/],
            "background-color": [/.*/],
            "font-size": [/.*/],
            "font-family": [/.*/],
            "font-weight": [/.*/],
            "text-align": [/.*/],
            "text-decoration": [/.*/],
            "list-style-type": [/.*/],
            "padding-left": [/.*/],
            "margin": [/.*/],
            "margin-left": [/.*/],
        }
    }
};

/* ====================================================
---------- Singleton: Navegador compartido ------------
=====================================================*/
let browserInstance = null;

export async function getBrowser() {
    if (!browserInstance || !browserInstance.connected) {
        browserInstance = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        });
    }
    return browserInstance;
}

/* ====================================================
------------------ Generar PDF Buffer -----------------
=====================================================*/
export async function generarPDFBuffer(html) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        await page.setContent(html, { waitUntil: "domcontentloaded" });
        const pdfBuffer = await page.pdf({
            format: "Letter",
            printBackground: true,
            margin: { top: "0", bottom: "0", left: "0", right: "0" },
        });
        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
    }
}

/* ====================================================
-------------------- Obtener Notas --------------------
=====================================================*/
export async function obtenerNotas(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        const [notas] = await db.query(
            `SELECT 
                id_nota,
                titulo,
                contenido,
                color_fondo         AS background_color,
                tipo_letra          AS font_family,
                tamano_letra        AS font_size,
                fecha_creacion      AS created_at,
                fecha_actualizacion AS updated_at
            FROM Nota
            WHERE id_usuario = ?
            ORDER BY fecha_actualizacion DESC`,
            [id_usuario]
        );

        res.json(notas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las notas", detalles: error.message });
    }
}

/* ====================================================
--------------------- Crear Nota ----------------------
=====================================================*/
export async function crearNota(req, res) {
    try {
        const { titulo, contenido, backgroundColor, fontFamily, fontSize } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!titulo || titulo.trim() === "")
            return res.status(400).json({ error: "El título es obligatorio" });

        if (titulo.trim().length > 100)
            return res.status(400).json({ error: "El título no puede exceder los 100 caracteres" });

        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(titulo.trim()))
            return res.status(400).json({ error: "El título contiene caracteres no permitidos" });

        const [notaDuplicada] = await db.query(
            "SELECT id_nota FROM Nota WHERE LOWER(titulo) = LOWER(?) AND id_usuario = ?",
            [titulo.trim(), id_usuario]
        );
        if (notaDuplicada.length > 0)
            return res.status(409).json({ error: "Ya tienes una nota con ese título" });

        const contenidoLimpio = sanitizeHtml(contenido || "", sanitizeOpciones);

        const [result] = await db.query(
            `INSERT INTO Nota (titulo, contenido, color_fondo, tipo_letra, tamano_letra, id_usuario)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo.trim(), contenidoLimpio || "", backgroundColor || "#ffffff", fontFamily || "Arial", fontSize || "16", id_usuario]
        );

        res.status(201).json({
            mensaje: "Nota creada exitosamente",
            nota: { id_nota: result.insertId, titulo: titulo.trim() }
        });
    } catch (error) {
        res.status(500).json({ error: "Error al crear la nota", detalles: error.message });
    }
}

/* ====================================================
------------------- Actualizar Nota -------------------
=====================================================*/
export async function actualizarNota(req, res) {
    try {
        const { id } = req.params;
        const { titulo, contenido, backgroundColor, fontFamily, fontSize } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!titulo || !contenido)
            return res.status(400).json({ error: "El título y el contenido son obligatorios" });

        const [notaExistente] = await db.query(
            "SELECT id_nota FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );
        if (notaExistente.length === 0)
            return res.status(404).json({ error: "Nota no encontrada" });

        const contenidoLimpio = sanitizeHtml(contenido || "", sanitizeOpciones);

        await db.query(
            `UPDATE Nota 
             SET titulo = ?, contenido = ?, color_fondo = ?, tipo_letra = ?, tamano_letra = ?,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id_nota = ? AND id_usuario = ?`,
            [titulo, contenidoLimpio, backgroundColor || "#ffffff", fontFamily || "Arial", fontSize || "16", id, id_usuario]
        );

        res.json({ mensaje: "Nota actualizada exitosamente", nota: { id_nota: id, titulo } });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la nota", detalles: error.message });
    }
}

/* ====================================================
------------------- Eliminar Nota ---------------------
=====================================================*/
export async function eliminarNota(req, res) {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        const [nota] = await db.query(
            "SELECT id_nota FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );
        if (nota.length === 0)
            return res.status(404).json({ error: "Nota no encontrada" });

        await db.query(
            "DELETE FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );

        res.json({ mensaje: "Nota eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la nota", detalles: error.message });
    }
}

/* ====================================================
----------------- Renombrar Nota ----------------------
=====================================================*/
export async function renombrarNota(req, res) {
    try {
        const { id } = req.params;
        const { titulo } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!titulo || titulo.trim() === "")
            return res.status(400).json({ error: "El título es obligatorio" });

        if (titulo.trim().length > 100)
            return res.status(400).json({ error: "El título no puede exceder los 100 caracteres" });

        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(titulo.trim()))
            return res.status(400).json({ error: "El título contiene caracteres no permitidos" });

        const [notaExistente] = await db.query(
            "SELECT id_nota FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );
        if (notaExistente.length === 0)
            return res.status(404).json({ error: "Nota no encontrada" });

        const [notaDuplicada] = await db.query(
            "SELECT id_nota FROM Nota WHERE titulo = ? AND id_usuario = ? AND id_nota != ?",
            [titulo.trim(), id_usuario, id]
        );
        if (notaDuplicada.length > 0)
            return res.status(409).json({ error: "Ya tienes una nota con ese título" });

        await db.query(
            `UPDATE Nota SET titulo = ?, fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id_nota = ? AND id_usuario = ?`,
            [titulo.trim(), id, id_usuario]
        );

        res.json({ mensaje: "Nota renombrada exitosamente", nota: { id_nota: id, titulo: titulo.trim() } });
    } catch (error) {
        res.status(500).json({ error: "Error al renombrar la nota", detalles: error.message });
    }
}

/* ====================================================
----------------- Obtener una Nota --------------------
=====================================================*/
export async function obtenerNota(req, res) {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        const [notas] = await db.query(
            `SELECT 
                id_nota,
                titulo,
                contenido,
                color_fondo         AS background_color,
                tipo_letra          AS font_family,
                tamano_letra        AS font_size,
                fecha_creacion      AS created_at,
                fecha_actualizacion AS updated_at
            FROM Nota
            WHERE id_nota = ? AND id_usuario = ?`,
            [id, id_usuario]
        );

        if (notas.length === 0)
            return res.status(404).json({ error: "Nota no encontrada" });

        res.json(notas[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la nota", detalles: error.message });
    }
}

/* ====================================================
----------------- Buscar Notas ------------------------
=====================================================*/
export async function buscarNotas(req, res) {
    try {
        const { q } = req.query;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!q || q.trim() === "")
            return res.status(400).json({ error: "El término de búsqueda es obligatorio" });

        const [notas] = await db.query(
            `SELECT 
                id_nota, titulo, contenido,
                color_fondo         AS background_color,
                tipo_letra          AS font_family,
                tamano_letra        AS font_size,
                fecha_creacion      AS created_at,
                fecha_actualizacion AS updated_at
            FROM Nota
            WHERE id_usuario = ? AND (titulo LIKE ? OR contenido LIKE ?)
            ORDER BY fecha_actualizacion DESC`,
            [id_usuario, `%${q}%`, `%${q}%`]
        );

        res.json({ resultados: notas.length, notas });
    } catch (error) {
        res.status(500).json({ error: "Error al buscar notas", detalles: error.message });
    }
}

/* ====================================================
------------- Compartir Nota por Correo ---------------
=====================================================*/
export async function compartirNotaCorreo(req, res) {
    try {
        const { id } = req.params;
        const { email, html } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: "El correo electrónico no es válido" });

        if (!html)
            return res.status(400).json({ error: "HTML no recibido" });

        const [resultado] = await db.query(
            `SELECT n.titulo, 
                    CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
                    u.correo_electronico
             FROM Nota n
             INNER JOIN Usuario u ON u.id_usuario = n.id_usuario
             WHERE n.id_nota = ? AND n.id_usuario = ?`,
            [id, id_usuario]
        );
        if (resultado.length === 0)
            return res.status(404).json({ error: "Nota no encontrada" });

        const { titulo: nombreNota, nombre_usuario: nombreRemite, correo_electronico: correoRemite } = resultado[0];
        const pdfBuffer = await generarPDFBuffer(html);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
        });

        const htmlCorreo = `
            <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
            <body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5;">
                <div style="max-width:600px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1);">
                    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;text-align:center;">
                        <h1 style="color:white;margin:0;font-size:20px;">📝 Study Organizer</h1>
                        <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:13px;">Te han compartido una nota</p>
                    </div>
                    <div style="padding:24px;">
                        <p style="color:#374151;font-size:15px;margin:0 0 12px;"><strong>${nombreRemite}</strong> compartió contigo la siguiente nota:</p>
                        <div style="background:#f3f4f6;border-left:4px solid #2563eb;padding:12px 16px;border-radius:0 8px 8px 0;font-weight:bold;color:#1e3a5f;font-size:16px;">
                            📄 ${nombreNota}
                        </div>
                        <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">Encuentra el contenido completo en el archivo PDF adjunto.</p>
                    </div>
                    <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
                        Este correo fue enviado desde Study Organizer
                    </div>
                </div>
            </body></html>`;

        await transporter.sendMail({
            from: `"${nombreRemite} (vía Study Organizer)" <${process.env.MAIL_USER}>`,
            replyTo: `"${nombreRemite}" <${correoRemite}>`,
            to: email,
            subject: `Nota compartida: ${nombreNota}`,
            html: htmlCorreo,
            attachments: [{ filename: `${nombreNota}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
        });

        // Guardar destinatario (sin sobreescribir nombre si ya existe)
        await db.query(
            `INSERT INTO CorreoDestinatario (id_usuario, correo_electronico)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE correo_electronico = VALUES(correo_electronico)`,
            [id_usuario, email.trim().toLowerCase()]
        );

        const [correoRow] = await db.query(
            `SELECT id_correo_destinatario FROM CorreoDestinatario
             WHERE id_usuario = ? AND correo_electronico = ?`,
            [id_usuario, email.trim().toLowerCase()]
        );

        await db.query(
            `INSERT INTO NotaCompartida (id_nota, medio, id_correo_destinatario) VALUES (?, 'correo', ?)`,
            [id, correoRow[0].id_correo_destinatario]
        );

        res.json({ mensaje: "Nota compartida exitosamente por correo", compartido_con: email });
    } catch (error) {
        console.error("Error al compartir nota:", error);
        res.status(500).json({ error: "No se pudo enviar el correo.", detalles: error.message });
    }
}

/* ====================================================
-------- Obtener Destinatarios Correo -----------------
=====================================================*/
export async function obtenerDestinatariosCorreo(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        const [destinatarios] = await db.query(
            `SELECT id_correo_destinatario AS id, correo_electronico, nombre, fecha_creacion AS created_at
             FROM CorreoDestinatario
             WHERE id_usuario = ?
             ORDER BY fecha_creacion DESC`,
            [id_usuario]
        );

        res.json(destinatarios);
    } catch (error) {
        console.error("Error al obtener destinatarios de correo:", error);
        res.status(500).json({ error: "Error al obtener destinatarios" });
    }
}

/* ====================================================
-------- Renombrar Destinatario Correo ----------------
=====================================================*/
export async function renombrarDestinatarioCorreo(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!nombre || nombre.trim() === "")
            return res.status(400).json({ error: "El nombre es obligatorio" });

        if (nombre.trim().length > 100)
            return res.status(400).json({ error: "El nombre no puede exceder 100 caracteres" });

        const [existente] = await db.query(
            "SELECT id_correo_destinatario FROM CorreoDestinatario WHERE id_correo_destinatario = ? AND id_usuario = ?",
            [id, id_usuario]
        );
        if (existente.length === 0)
            return res.status(404).json({ error: "Destinatario no encontrado" });

        await db.query(
            "UPDATE CorreoDestinatario SET nombre = ? WHERE id_correo_destinatario = ? AND id_usuario = ?",
            [nombre.trim(), id, id_usuario]
        );

        res.json({ mensaje: "Destinatario renombrado exitosamente" });
    } catch (error) {
        console.error("Error al renombrar destinatario de correo:", error);
        res.status(500).json({ error: "Error al renombrar destinatario" });
    }
}

/* ====================================================
------------ Compartir Nota por Telegram --------------
=====================================================*/
export async function compartirNotaTelegram(req, res) {
    try {
        const { id } = req.params;
        const { chatId, html } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!chatId || chatId.trim() === "")
            return res.status(400).json({ error: "El Chat ID de Telegram es obligatorio" });

        if (!html)
            return res.status(400).json({ error: "HTML no recibido" });

        const [resultado] = await db.query(
            `SELECT n.titulo, CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
             FROM Nota n
             INNER JOIN Usuario u ON u.id_usuario = n.id_usuario
             WHERE n.id_nota = ? AND n.id_usuario = ?`,
            [id, id_usuario]
        );
        if (resultado.length === 0)
            return res.status(404).json({ error: "Nota no encontrada" });

        const { titulo: nombreNota, nombre_usuario: nombreRemite } = resultado[0];
        const pdfBuffer = await generarPDFBuffer(html);
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

        // 1. Enviar mensaje de texto
        const resMensaje = await fetch(
            `https://api.telegram.org/bot${telegramToken}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId.trim(),
                    text: `📝 *${nombreNota}*\n\nTe comparte esta nota: *${nombreRemite}*\n\n_Adjunto encontrarás el PDF con el contenido completo._`,
                    parse_mode: "Markdown",
                }),
            }
        );
        const dataMensaje = await resMensaje.json();
        if (!dataMensaje.ok) throw new Error(`Telegram: ${dataMensaje.description}`);

        // 2. Enviar PDF
        const formData = new FormData();
        formData.append("chat_id", chatId.trim());
        formData.append("document", new Blob([pdfBuffer], { type: "application/pdf" }), `${nombreNota}.pdf`);

        const resDoc = await fetch(`https://api.telegram.org/bot${telegramToken}/sendDocument`, {
            method: "POST",
            body: formData,
        });
        const dataDoc = await resDoc.json();
        if (!dataDoc.ok) throw new Error(`Telegram (PDF): ${dataDoc.description}`);

        // Guardar destinatario
        await db.query(
            `INSERT INTO TelegramDestinatario (id_usuario, chat_id, nombre)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE chat_id = VALUES(chat_id)`,
            [id_usuario, chatId.trim(), `Chat ${chatId.trim()}`]
        );

        const [telegramRow] = await db.query(
            `SELECT id_telegram_destinatario AS id FROM TelegramDestinatario
             WHERE id_usuario = ? AND chat_id = ?`,
            [id_usuario, chatId.trim()]
        );

        await db.query(
            `INSERT INTO NotaCompartida (id_nota, medio, id_telegram_destinatario) VALUES (?, 'telegram', ?)`,
            [id, telegramRow[0].id]
        );

        res.json({ mensaje: "Nota compartida exitosamente por Telegram" });
    } catch (error) {
        console.error("Error al compartir por Telegram:", error);
        if (error.message.includes("chat not found"))
            return res.status(404).json({ error: "Chat ID no encontrado. Asegúrate de haber iniciado el bot primero." });
        res.status(500).json({ error: "No se pudo enviar por Telegram.", detalles: error.message });
    }
}

/* ====================================================
-------- Obtener Destinatarios Telegram ---------------
=====================================================*/
export async function obtenerDestinatariosTelegram(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        const [destinatarios] = await db.query(
            `SELECT id_telegram_destinatario AS id, chat_id, nombre, fecha_creacion AS created_at
             FROM TelegramDestinatario
             WHERE id_usuario = ?
             ORDER BY fecha_creacion DESC`,
            [id_usuario]
        );

        res.json(destinatarios);
    } catch (error) {
        console.error("Error al obtener destinatarios:", error);
        res.status(500).json({ error: "Error al obtener destinatarios" });
    }
}

/* ====================================================
-------- Renombrar Destinatario Telegram --------------
=====================================================*/
export async function renombrarDestinatarioTelegram(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!nombre || nombre.trim() === "")
            return res.status(400).json({ error: "El nombre es obligatorio" });

        if (nombre.trim().length > 100)
            return res.status(400).json({ error: "El nombre no puede exceder 100 caracteres" });

        const [existente] = await db.query(
            "SELECT id_telegram_destinatario FROM TelegramDestinatario WHERE id_telegram_destinatario = ? AND id_usuario = ?",
            [id, id_usuario]
        );
        if (existente.length === 0)
            return res.status(404).json({ error: "Destinatario no encontrado" });

        await db.query(
            "UPDATE TelegramDestinatario SET nombre = ? WHERE id_telegram_destinatario = ? AND id_usuario = ?",
            [nombre.trim(), id, id_usuario]
        );

        res.json({ mensaje: "Destinatario renombrado exitosamente" });
    } catch (error) {
        console.error("Error al renombrar destinatario:", error);
        res.status(500).json({ error: "Error al renombrar destinatario" });
    }
}

/* ====================================================
------------ Compartir Nota por WhatsApp --------------
=====================================================*/
export async function compartirNotaWhatsApp(req, res) {
    try {
        const { id } = req.params;
        const { telefono, html } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!telefono || !/^\+\d{10,15}$/.test(telefono.trim()))
            return res.status(400).json({ error: "El número debe incluir código de país. Ej: +521234567890" });

        if (!html)
            return res.status(400).json({ error: "HTML no recibido" });

        const [resultado] = await db.query(
            `SELECT n.titulo, CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
             FROM Nota n
             INNER JOIN Usuario u ON u.id_usuario = n.id_usuario
             WHERE n.id_nota = ? AND n.id_usuario = ?`,
            [id, id_usuario]
        );
        if (resultado.length === 0)
            return res.status(404).json({ error: "Nota no encontrada" });

        const { titulo: nombreNota, nombre_usuario: nombreRemite } = resultado[0];
        const pdfBuffer = await generarPDFBuffer(html);

        const { v2: cloudinary } = await import("cloudinary");
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "raw", folder: "notas_pdf", public_id: `nota_${id}_${Date.now()}`, format: "pdf" },
                (error, result) => { if (error) reject(error); else resolve(result); }
            );
            uploadStream.end(pdfBuffer);
        });

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const mensaje = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:${telefono.trim()}`,
            body: `📝 *${nombreNota}*\n\n${nombreRemite} te compartió esta nota desde Study Organizer.\n\nEncuentra el PDF adjunto 👇`,
            mediaUrl: [uploadResult.secure_url],
        });

        console.log("Twilio WhatsApp response:", {
            sid: mensaje.sid, status: mensaje.status, to: mensaje.to,
            from: mensaje.from, errorCode: mensaje.errorCode, errorMessage: mensaje.errorMessage,
        });

        res.json({ mensaje: "Nota compartida exitosamente por WhatsApp" });
    } catch (error) {
        console.error("Error al compartir por WhatsApp:", error);
        if (error.code === 21211) return res.status(400).json({ error: "Número de teléfono inválido." });
        if (error.code === 21408) return res.status(400).json({ error: "Este número no tiene WhatsApp o no está en el sandbox de Twilio." });
        res.status(500).json({ error: "No se pudo enviar por WhatsApp.", detalles: error.message });
    }
}

/* ====================================================
------------------- Exportar PDF ----------------------
=====================================================*/
export async function exportarPDF(req, res) {
    try {
        const { id } = req.params;
        const { html } = req.body;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!html) return res.status(400).json({ error: "HTML no recibido" });

        const [notas] = await db.query(
            "SELECT titulo FROM Nota WHERE id_nota = ? AND id_usuario = ?",
            [id, id_usuario]
        );
        if (notas.length === 0) return res.status(404).json({ error: "Nota no encontrada" });

        const pdfBuffer = await generarPDFBuffer(html);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${notas[0].titulo}.pdf"; filename*=UTF-8''${encodeURIComponent(notas[0].titulo)}.pdf`
        );
        res.setHeader("Content-Length", pdfBuffer.length);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error al exportar PDF:", error);
        res.status(500).json({ error: "Error al exportar PDF", detalles: error.message });
    }
}