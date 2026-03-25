// metodos estudio

import { db } from "../config/db.js";

export class ResultadoME {
    constructor({ puntaje_obtenido, id_intento, id_dimension }) {
        this.puntaje_obtenido = puntaje_obtenido;
        this.id_intento       = id_intento;
        this.id_dimension     = id_dimension;
    }

    async save() {
        return await db.query(
            "INSERT INTO Resultado_ME (puntaje_obtenido, id_intento, id_dimension) VALUES (?, ?, ?)",
            [this.puntaje_obtenido, this.id_intento, this.id_dimension]
        );
    }

    static async saveMany(id_intento, resultadosPorDimension) {
        const valores = Object.entries(resultadosPorDimension).map(
            ([id_dim, info]) => [info.puntaje, id_intento, Number(id_dim)]
        );
        return await db.query(
            "INSERT INTO Resultado_ME (puntaje_obtenido, id_intento, id_dimension) VALUES ?",
            [valores]
        );
    }

    static async getByIntento(id_intento) {
        const [rows] = await db.query(`
            SELECT
                r.id_resultado,
                r.id_dimension,
                d.nombre_dimension,
                r.puntaje_obtenido
            FROM Resultado_ME r
            JOIN Dimension_Evaluar d ON r.id_dimension = d.id_dimension
            WHERE r.id_intento = ?
            ORDER BY r.id_dimension
        `, [id_intento]);
        return rows;
    }

    static async getHistorialByUsuario(id_usuario) {
        const [rows] = await db.query(`
            SELECT
                i.id_intento,
                i.fecha_intento,
                AVG(r.puntaje_obtenido) AS puntaje_global
            FROM Intento_Test i
            JOIN Resultado_ME r ON r.id_intento = i.id_intento
            WHERE i.id_usuario = ? AND i.tipo_test = 'metodos_estudio'
            GROUP BY i.id_intento, i.fecha_intento
            ORDER BY i.fecha_intento DESC
        `, [id_usuario]);
        return rows;
    }
}