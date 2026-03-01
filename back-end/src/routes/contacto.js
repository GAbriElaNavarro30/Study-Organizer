import { Router } from "express";
import { db } from "../config/db.js";
import { transporter } from "../config/mailer.js";

const router = Router();

router.post("/contactanos", async (req, res) => {
    try {
        const { nombre, correo, mensaje } = req.body;
        const errores = {};

        // Validar nombre
        if (!nombre || nombre.trim() === "") {
            errores.nombre = "El nombre es obligatorio";
        } else if (nombre.trim().length < 2) {
            errores.nombre = "El nombre debe tener al menos 2 caracteres";
        } else if (nombre.trim().length > 100) {
            errores.nombre = "El nombre no puede exceder 100 caracteres";
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.]+$/.test(nombre.trim())) {
            errores.nombre = "El nombre solo puede contener letras, espacios y puntos";
        }

        // Validar correo
        if (!correo || correo.trim() === "") {
            errores.correo = "El correo electrónico es obligatorio";
        } else {
            const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
            if (!correoRegex.test(correo.trim())) {
                errores.correo = "El correo electrónico no cumple con un formato válido";
            } else {
                const parteUsuario = correo.trim().split("@")[0];
                if (parteUsuario.length > 64) {
                    errores.correo = "El correo no debe superar 64 caracteres antes del @";
                }
            }
        }

        // Validar mensaje
        if (!mensaje || mensaje.trim() === "") {
            errores.mensaje = "El mensaje es obligatorio";
        } else if (mensaje.trim().length < 10) {
            errores.mensaje = "El mensaje debe tener al menos 10 caracteres";
        } else if (mensaje.trim().length > 1000) {
            errores.mensaje = "El mensaje no puede exceder 1000 caracteres";
        }

        if (Object.keys(errores).length > 0) {
            return res.status(400).json({ errores });
        }

        await transporter.sendMail({
            from: `"Study Organizer Contacto" <${process.env.MAIL_USER}>`,
            replyTo: `"${nombre.trim()}" <${correo.trim()}>`,
            to: process.env.MAIL_USER,
            subject: `Nuevo mensaje de contacto - ${nombre.trim()}`,
            html: `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:20px;">📬 Nuevo mensaje de contacto</h1>
        </div>
        <div style="padding:24px;">
            <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Nombre:</p>
            <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827;">${nombre.trim()}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Correo:</p>
            <p style="margin:0 0 16px;font-size:15px;color:#2563eb;">${correo.trim()}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Mensaje:</p>
            <div style="background:#f9fafb;border-left:4px solid #2563eb;padding:14px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.7;">
                ${mensaje.trim().replace(/\n/g, "<br>")}
            </div>
        </div>
        <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
            Study Organizer — Formulario de contacto
        </div>
    </div>
</body></html>`,
        });

        res.json({ mensaje: "Mensaje enviado correctamente" });

    } catch (error) {
        console.error("Error al enviar mensaje de contacto:", error);
        res.status(500).json({ mensaje: "Error al enviar el mensaje. Intenta nuevamente." });
    }
});

export default router;