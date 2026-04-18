// src/cron/tipDiario.cron.js

/*import cron from "node-cron";
import { db } from "../config/db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

cron.schedule("0 0 * * *", async () => {
    try {
        const hoy = dayjs().tz("America/Mexico_City").format("YYYY-MM-DD");

        // Solo frases de tipo Administrador (para la vista /home)
        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM Frase WHERE tipo = 'Administrador'`
        );
        const total = totalResult[0].total;

        const [usuarios] = await db.query(`SELECT id_usuario FROM Usuario`);

        for (const user of usuarios) {
            const idUsuario = user.id_usuario;

            const [existente] = await db.query(
                `SELECT id_tip FROM tip_diario WHERE fecha = ? AND id_usuario = ?`,
                [hoy, idUsuario]
            );
            if (existente.length > 0) continue;

            const [usadasCiclo] = await db.query(
                `SELECT frase_id FROM tip_diario WHERE id_usuario = ? ORDER BY fecha DESC LIMIT ?`,
                [idUsuario, total]
            );

            const idsUsados = usadasCiclo.map(r => r.frase_id);
            let fraseDisponible;

            if (idsUsados.length >= total || idsUsados.length === 0) {
                const [rand] = await db.query(
                    `SELECT id_frase FROM Frase WHERE tipo = 'Administrador' ORDER BY RAND() LIMIT 1`
                );
                fraseDisponible = rand[0];
            } else {
                const placeholders = idsUsados.map(() => "?").join(",");
                const [disponibles] = await db.query(
                    `SELECT id_frase FROM Frase WHERE tipo = 'Administrador' AND id_frase NOT IN (${placeholders}) ORDER BY RAND() LIMIT 1`,
                    idsUsados
                );
                fraseDisponible = disponibles[0];
            }

            await db.query(
                `INSERT INTO tip_diario (fecha, tipo_tip, frase_id, id_usuario) VALUES (?, ?, ?, ?)`,
                [hoy, "aleatorio", fraseDisponible.id_frase, idUsuario]
            );
        }

    } catch (error) {
        console.error("Error en cron tip diario:", error);
    }
}, { timezone: "America/Mexico_City" });

console.log("Cron de frases diarias iniciado");*/