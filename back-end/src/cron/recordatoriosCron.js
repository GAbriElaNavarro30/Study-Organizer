import cron from "node-cron";
import { db } from "../config/db.js";
import { transporter } from "../config/mailer.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

cron.schedule("* * * * *", async () => {
    try {
        const ahora = dayjs().tz("America/Mexico_City");

        /* ================= CORREO 1 HORA ANTES ================= */
        const unaHoraAntes = ahora.add(1, "hour").format("YYYY-MM-DD HH:mm:00");

        const [horaAntes] = await db.query(`
            SELECT r.*, u.correo_electronico, u.nombre_usuario
            FROM Recordatorio r
            JOIN Usuario u ON r.id_usuario = u.id_usuario
            WHERE CONCAT(r.fecha, ' ', r.hora) = ?
            AND r.estado = 'pendiente'
            AND r.enviado_hora_antes = FALSE
        `, [unaHoraAntes]);

        for (const r of horaAntes) {
            await enviarCorreo(r, "Recordatorio próximo", "1 hora");
            await db.query(
                "UPDATE Recordatorio SET enviado_hora_antes = TRUE WHERE id_recordatorio = ?",
                [r.id_recordatorio]
            );
            console.log(`✅ Correo 1 hora antes enviado para: ${r.titulo}`);
        }

        /* ================= CORREO 1 DÍA ANTES A LAS 11:59 PM ================= */
        // Solo ejecutar a las 23:59
        if (ahora.format("HH:mm") === "23:59") {
            const manana = ahora.add(1, "day").format("YYYY-MM-DD");

            const [diaAntesRows] = await db.query(`
                SELECT r.*, u.correo_electronico, u.nombre_usuario
                FROM Recordatorio r
                JOIN Usuario u ON r.id_usuario = u.id_usuario
                WHERE DATE(r.fecha) = ?
                AND r.estado = 'pendiente'
                AND r.enviado_dia_antes = FALSE
            `, [manana]);

            for (const r of diaAntesRows) {
                await enviarCorreo(r, "Recordatorio importante", "24 horas");
                await db.query(
                    "UPDATE Recordatorio SET enviado_dia_antes = TRUE WHERE id_recordatorio = ?",
                    [r.id_recordatorio]
                );
                console.log(`✅ Correo 1 día antes enviado para: ${r.titulo}`);
            }
        }

    } catch (error) {
        console.error("❌ Error cron recordatorios:", error);
    }
});

async function enviarCorreo(recordatorio, asunto, tipoRecordatorio) {
    const fechaFormateada = dayjs(recordatorio.fecha).format("DD/MM/YYYY");
    const horaFormateada = recordatorio.hora.substring(0, 5);

    const icono = tipoRecordatorio === "1 hora" ? "🕒" : "📅";

    await transporter.sendMail({
        to: recordatorio.correo_electronico,
        subject: asunto,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0; background:#f2f4f7; font-family:Arial, sans-serif;">
  <table width="100%" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="500" style="background:#ffffff; border-radius:10px; padding:40px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- TÍTULO -->
          <tr>
            <td style="text-align:center;">
              <h2 style="margin:0; color:#333;">
                ${icono} ${asunto}
              </h2>
            </td>
          </tr>

          <!-- ESPACIO -->
          <tr><td style="height:25px;"></td></tr>

          <!-- CONTENIDO -->
          <tr>
            <td style="color:#555; font-size:15px; line-height:1.6;">
              <p>Hola <strong>${recordatorio.nombre_usuario}</strong>,</p>

              <p>Te recordamos que tienes la siguiente tarea programada en <strong>${tipoRecordatorio}</strong>:</p>

              <div style="background:#f9fafb; padding:20px; border-radius:8px;">
                <p style="margin:0 0 10px 0; font-size:16px;">
                  <strong>${recordatorio.titulo}</strong>
                </p>

                ${recordatorio.descripcion ?
                `<p style="margin:0 0 10px 0;">${recordatorio.descripcion}</p>`
                : ""}

                <p style="margin:0;"><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p style="margin:5px 0 0 0;"><strong>Hora:</strong> ${horaFormateada}</p>
              </div>

              <p style="margin-top:30px; font-size:13px; color:#999;">
                Este es un mensaje automático. Por favor no responder.
              </p>

              <p style="margin-top:20px; font-size:14px; color:#333;">
                Att:<br>
                <strong>Equipo de Study Organizer</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    });
}

console.log("Cron de recordatorios iniciado");