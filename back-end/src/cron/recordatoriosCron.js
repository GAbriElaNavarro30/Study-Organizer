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
    const ahoraFormato = ahora.format("YYYY-MM-DD HH:mm:00");

    // Buscar recordatorios pendientes cuya fecha/hora de envío ya llegó
    const [recordatorios] = await db.query(`
      SELECT 
        r.id_recordatorio,
        r.tipo,
        t.titulo,
        t.descripcion,
        t.fecha_tarea,
        t.hora_tarea,
        t.recordatorio_activo,
        u.correo_electronico,
        u.nombre,
        u.apellido
      FROM Recordatorio r
      JOIN Tarea t ON r.id_tarea = t.id_tarea
      JOIN Usuario u ON t.id_usuario = u.id_usuario
      WHERE CONCAT(r.fecha_envio, ' ', r.hora_envio) = ?
        AND r.enviado = FALSE
        AND t.recordatorio_activo = TRUE
        AND t.estado_tarea = 'pendiente'
    `, [ahoraFormato]);

    for (const r of recordatorios) {
      const tipoTexto = r.tipo === "una_hora_antes" ? "en 1 hora" : "mañana";
      const asunto = r.tipo === "una_hora_antes"
        ? "Recordatorio próximo"
        : "Recordatorio importante";

      await enviarCorreo(r, asunto, tipoTexto);

      await db.query(
        `UPDATE Recordatorio SET enviado = TRUE WHERE id_recordatorio = ?`,
        [r.id_recordatorio]
      );

      console.log(`Correo (${r.tipo}) enviado para: ${r.titulo}`);
    }

  } catch (error) {
    console.error("Error cron recordatorios:", error);
  }
});

async function enviarCorreo(recordatorio, asunto, tipoRecordatorio) {
  const fechaFormateada = dayjs(recordatorio.fecha_tarea).format("DD/MM/YYYY");
  const horaFormateada = recordatorio.hora_tarea.substring(0, 5);
  const icono = tipoRecordatorio === "en 1 hora" ? "🕒" : "📅";

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
          
          <tr>
            <td style="text-align:center;">
              <h2 style="margin:0; color:#333;">${icono} ${asunto}</h2>
            </td>
          </tr>

          <tr><td style="height:25px;"></td></tr>

          <tr>
            <td style="color:#555; font-size:15px; line-height:1.6;">
              <p>Hola <strong>${recordatorio.nombre} ${recordatorio.apellido}</strong>,</p>
              <p>Te recordamos que tienes la siguiente tarea programada <strong>${tipoRecordatorio}</strong>:</p>

              <div style="background:#f9fafb; padding:20px; border-radius:8px;">
                <p style="margin:0 0 10px 0; font-size:16px;">
                  <strong>${recordatorio.titulo}</strong>
                </p>
                ${recordatorio.descripcion
        ? `<p style="margin:0 0 10px 0;">${recordatorio.descripcion}</p>`
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