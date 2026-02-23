import cron from "node-cron";
import { db } from "../config/db.js";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export function iniciarCronTipDiario() {
    // Se ejecuta todos los días a las 00:00
    cron.schedule("0 0 * * *", async () => {
        try {
            const hoy = dayjs().tz("America/Mexico_City").format("YYYY-MM-DD");
            const [totalResult] = await db.query(`SELECT COUNT(*) as total FROM frases`);
            const total = totalResult[0].total;

            // Obtener todos los usuarios
            const [usuarios] = await db.query(`SELECT id_usuario FROM Usuario`);

            for (const user of usuarios) {
                const idUsuario = user.id_usuario;

                // Verificar si ya tiene tip hoy
                const [existente] = await db.query(
                    `SELECT id FROM tip_diario WHERE fecha = ? AND id_usuario = ?`,
                    [hoy, idUsuario]
                );
                if (existente.length > 0) continue;

                // Obtener IDs usados por este usuario
                const [usadasCiclo] = await db.query(
                    `SELECT frase_id FROM tip_diario WHERE id_usuario = ? ORDER BY fecha DESC LIMIT ?`,
                    [idUsuario, total]
                );

                const idsUsados = usadasCiclo.map(r => r.frase_id);
                let fraseDisponible;

                if (idsUsados.length >= total || idsUsados.length === 0) {
                    const [rand] = await db.query(`SELECT id FROM frases ORDER BY RAND() LIMIT 1`);
                    fraseDisponible = rand[0];
                } else {
                    const placeholders = idsUsados.map(() => "?").join(",");
                    const [disponibles] = await db.query(
                        `SELECT id FROM frases WHERE id NOT IN (${placeholders}) ORDER BY RAND() LIMIT 1`,
                        idsUsados
                    );
                    fraseDisponible = disponibles[0];
                }

                await db.query(
                    `INSERT INTO tip_diario (fecha, frase_id, id_usuario) VALUES (?, ?, ?)`,
                    [hoy, fraseDisponible.id, idUsuario]
                );
            }

            //console.log(`Tips diarios generados para ${hoy}`);
        } catch (error) {
            ///console.error("Error en cron tip diario:", error);
        }
    }, { timezone: "America/Mexico_City" });

    console.log("Cron de frases diarias inciiado");
}