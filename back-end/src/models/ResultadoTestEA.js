import { db } from "../config/db.js";

export class ResultadoTestEA {
    constructor({
        puntaje_v = 0,
        puntaje_a = 0,
        puntaje_r = 0,
        puntaje_k = 0,
        perfil_dominante,
        id_intento,
    }) {
        this.puntaje_v        = puntaje_v;
        this.puntaje_a        = puntaje_a;
        this.puntaje_r        = puntaje_r;
        this.puntaje_k        = puntaje_k;
        this.perfil_dominante = perfil_dominante;
        this.id_intento       = id_intento;
    }

    // guarda el resultado 1 vez, cuando el usuario termina el test
    async save() {
        const [result] = await db.query(
            `INSERT INTO Resultado_Test_EA
             (puntaje_v, puntaje_a, puntaje_r, puntaje_k, perfil_dominante, id_intento)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                this.puntaje_v,
                this.puntaje_a,
                this.puntaje_r,
                this.puntaje_k,
                this.perfil_dominante,
                this.id_intento,
            ]
        );
        return result;
    }

    // obtiene todos los resultados de todos los usuarios en todos los intentos
    static async getAll() {
        const [rows] = await db.query(
            `SELECT 
                r.id_resultado,
                r.puntaje_v,
                r.puntaje_a,
                r.puntaje_r,
                r.puntaje_k,
                r.perfil_dominante,
                pv.nombre_perfil,
                r.id_intento
             FROM Resultado_Test_EA r
             INNER JOIN Perfil_VARK pv ON pv.perfil_dominante = r.perfil_dominante`
        );
        return rows;
    }

    // obtiene un resultado en especifico
    static async getById(id_resultado) {
        const [rows] = await db.query(
            `SELECT 
                r.id_resultado,
                r.puntaje_v,
                r.puntaje_a,
                r.puntaje_r,
                r.puntaje_k,
                r.perfil_dominante,
                pv.nombre_perfil,
                r.id_intento
             FROM Resultado_Test_EA r
             INNER JOIN Perfil_VARK pv ON pv.perfil_dominante = r.perfil_dominante
             WHERE r.id_resultado = ?`,
            [id_resultado]
        );
        return rows[0];
    }

    // obtiene resultado de un intento en especifico
    static async getByIntento(id_intento) {
        const [rows] = await db.query(
            `SELECT 
                r.id_resultado,
                r.puntaje_v,
                r.puntaje_a,
                r.puntaje_r,
                r.puntaje_k,
                r.perfil_dominante,
                pv.nombre_perfil,
                r.id_intento
             FROM Resultado_Test_EA r
             INNER JOIN Perfil_VARK pv ON pv.perfil_dominante = r.perfil_dominante
             WHERE r.id_intento = ?`,
            [id_intento]
        );
        return rows[0];
    }

    // obtener el último resultado de un usuario con todos los detalles del intento
    static async getUltimoByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT 
                r.id_resultado,
                r.puntaje_v,
                r.puntaje_a,
                r.puntaje_r,
                r.puntaje_k,
                r.perfil_dominante,
                pv.nombre_perfil,
                it.fecha_intento,
                it.id_usuario
             FROM Resultado_Test_EA r
             INNER JOIN Intento_Test it ON it.id_intento = r.id_intento
             INNER JOIN Perfil_VARK pv ON pv.perfil_dominante = r.perfil_dominante
             WHERE it.id_usuario = ? AND it.tipo_test = 'estilos_aprendizaje'
             ORDER BY it.fecha_intento DESC
             LIMIT 1`,
            [id_usuario]
        );
        return rows[0];
    }

    // historial completo de resultados de un usuario
    static async getHistorialByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT 
                r.id_resultado,
                r.puntaje_v,
                r.puntaje_a,
                r.puntaje_r,
                r.puntaje_k,
                r.perfil_dominante,
                pv.nombre_perfil,
                it.fecha_intento
             FROM Resultado_Test_EA r
             INNER JOIN Intento_Test it ON it.id_intento = r.id_intento
             INNER JOIN Perfil_VARK pv ON pv.perfil_dominante = r.perfil_dominante
             WHERE it.id_usuario = ? AND it.tipo_test = 'estilos_aprendizaje'
             ORDER BY it.fecha_intento DESC`,
            [id_usuario]
        );
        return rows;
    }
}