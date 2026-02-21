// para los estilos de aprendizaje
import { db } from "../config/db.js";

export class VarkPregunta {
    // Obtener todas las preguntas con sus opciones
    static async getAll() {
        const [preguntas] = await db.query(
            `SELECT * FROM vark_preguntas ORDER BY orden`
        );

        const [opciones] = await db.query(
            `SELECT * FROM vark_opciones`
        );

        // Agrupar opciones por pregunta
        return preguntas.map(pregunta => ({
            ...pregunta,
            opciones: opciones.filter(o => o.id_pregunta === pregunta.id)
        }));
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM vark_preguntas WHERE id = ?`, [id]
        );
        return rows[0];
    }
}


export class VarkRespuestaUsuario {
    constructor({ id_usuario, id_pregunta, id_opcion }) {
        this.id_usuario = id_usuario;
        this.id_pregunta = id_pregunta;
        this.id_opcion = id_opcion;
    }

    async save() {
        return await db.query(
            `INSERT INTO vark_respuestas_usuario (id_usuario, id_pregunta, id_opcion)
             VALUES (?, ?, ?)`,
            [this.id_usuario, this.id_pregunta, this.id_opcion]
        );
    }

    // Guardar las 16 respuestas de golpe
    static async saveMany(id_usuario, respuestas) {
        // respuestas = [{ id_pregunta, id_opcion }, ...]
        const valores = respuestas.map(r => [id_usuario, r.id_pregunta, r.id_opcion]);

        return await db.query(
            `INSERT INTO vark_respuestas_usuario (id_usuario, id_pregunta, id_opcion)
             VALUES ?`,
            [valores]
        );
    }

    // Obtener respuestas de un usuario en su último intento
    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT vru.id_pregunta, vru.id_opcion, vo.categoria, vo.texto
             FROM vark_respuestas_usuario vru
             JOIN vark_opciones vo ON vru.id_opcion = vo.id
             WHERE vru.id_usuario = ?
             ORDER BY vru.fecha DESC`,
            [id_usuario]
        );
        return rows;
    }

    // Eliminar respuestas anteriores del usuario (para cuando repita el test)
    static async deleteByUsuario(id_usuario) {
        return await db.query(
            `DELETE FROM vark_respuestas_usuario WHERE id_usuario = ?`,
            [id_usuario]
        );
    }
}


export class VarkResultado {
    constructor({ id_usuario, puntaje_v, puntaje_a, puntaje_r, puntaje_k, perfil_dominante }) {
        this.id_usuario = id_usuario;
        this.puntaje_v = puntaje_v;
        this.puntaje_a = puntaje_a;
        this.puntaje_r = puntaje_r;
        this.puntaje_k = puntaje_k;
        this.perfil_dominante = perfil_dominante;
    }

    async save() {
        return await db.query(
            `INSERT INTO vark_resultados (id_usuario, puntaje_v, puntaje_a, puntaje_r, puntaje_k, perfil_dominante)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                this.id_usuario,
                this.puntaje_v,
                this.puntaje_a,
                this.puntaje_r,
                this.puntaje_k,
                this.perfil_dominante
            ]
        );
    }

    // Obtener el resultado más reciente del usuario
    static async getUltimoByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM vark_resultados
             WHERE id_usuario = ?
             ORDER BY fecha DESC
             LIMIT 1`,
            [id_usuario]
        );
        return rows[0];
    }

    // Obtener historial completo de resultados del usuario
    static async getHistorialByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM vark_resultados
             WHERE id_usuario = ?
             ORDER BY fecha DESC`,
            [id_usuario]
        );
        return rows;
    }

    // Eliminar resultado anterior (para cuando repita el test)
    static async deleteByUsuario(id_usuario) {
        return await db.query(
            `DELETE FROM vark_resultados WHERE id_usuario = ?`,
            [id_usuario]
        );
    }
}