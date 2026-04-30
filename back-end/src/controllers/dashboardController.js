// ============================== DASHBOARD CONTROLLER ==============================
import axios from "axios";
import { db } from "../config/db.js";
import { Emocion } from "../models/Emocion.js";
import { RegistroEmocion } from "../models/RegistroEmocion.js";
import { AlertaEspecialista } from "../models/AlertaEspecialista.js";

const PYTHON_URL = process.env.PYTHON_URL || "http://localhost:8000";

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita acentos
        .trim();
}

function sufijosEmociones(texto) {
    const norm = normalizarTexto(texto);
    return norm
        .replace(/adas?$/, "ad")
        .replace(/ados?$/, "ad")
        .replace(/idas?$/, "id")
        .replace(/idos?$/, "id")
        .replace(/as$/, "")
        .replace(/os$/, "")
        .replace(/a$/, "")
        .replace(/o$/, "");
}

function getFechaHoy() {
    return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Mexico_City" });
}

function getFechaHoraActual() {
    return new Date().toLocaleString("sv-SE", { timeZone: "America/Mexico_City" });
}

// ================ obtener todas las emociones existentes =================
export const obtenerEmociones = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const emociones = await Emocion.getByUsuario(id_usuario);
        res.json({ emociones });
    } catch (error) {
        console.error("Error al obtener emociones:", error);
        res.status(500).json({ mensaje: "Error al obtener emociones" });
    }
};

// ===================== agregar emoción no existente =======================
export const crearEmocion = async (req, res) => {
    try {
        const { nombre_emocion, categoria } = req.body;
        const id_usuario = req.usuario.id;

        if (!nombre_emocion?.trim() || !categoria) {
            return res.status(400).json({ mensaje: "El nombre y la categoría son obligatorios." });
        }

        const categorias_validas = ["positiva", "negativa", "neutra"];
        if (!categorias_validas.includes(categoria)) {
            return res.status(400).json({ mensaje: "Categoría inválida." });
        }

        // Obtener todas las emociones globales + las del usuario
        const [todasEmociones] = await db.query(
            `SELECT nombre_emocion FROM Emocion WHERE id_usuario IS NULL OR id_usuario = ?`,
            [id_usuario]
        );

        const stemNueva = sufijosEmociones(nombre_emocion);

        const yaExiste = todasEmociones.some(
            e => sufijosEmociones(e.nombre_emocion) === stemNueva
        );

        if (yaExiste) {
            return res.status(409).json({ mensaje: "Ya existe está emoción en tu lista." });
        }

        const nueva = new Emocion({
            nombre_emocion: nombre_emocion.trim(),
            categoria,
            fecha_creacion: new Date(),
            id_usuario,
        });

        const result = await nueva.save();

        res.status(201).json({
            mensaje: "Emoción creada correctamente.",
            emocion: {
                id_emocion: result.insertId,
                nombre_emocion: nueva.nombre_emocion,
                categoria: nueva.categoria,
            },
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ mensaje: "Ya tienes una emoción con ese nombre." });
        }
        console.error("Error al crear emoción:", error);
        res.status(500).json({ mensaje: "Error al crear emoción." });
    }
};

// ===================== verificar si ya registró hoy =======================
export const verificarRegistroHoy = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const hoy = getFechaHoy();

        const [registro] = await db.query(`
            SELECT re.id_registro, e.nombre_emocion, e.categoria, re.nivel
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ? AND DATE(re.fecha_registro) = ?
        `, [id_usuario, hoy]);

        if (registro.length > 0) {
            return res.json({
                registrado: true,
                emocion: registro[0].nombre_emocion,
                categoria: registro[0].categoria,
                nivel: registro[0].nivel,
            });
        }

        res.json({ registrado: false });

    } catch (error) {
        console.error("Error al verificar registro:", error);
        res.status(500).json({ mensaje: "Error al verificar el registro." });
    }
};

// ===================== registrar emoción del día ==========================
export const registrarEmocionDia = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_emocion, nivel = "medio" } = req.body;

        if (!id_emocion) {
            return res.status(400).json({ mensaje: "Debes seleccionar una emoción." });
        }

        const hoy = getFechaHoy();

        // Verificar si ya registró hoy
        const [yaRegistro] = await db.query(`
            SELECT id_registro FROM Registro_Emocion
            WHERE id_usuario = ? AND DATE(fecha_registro) = ?
        `, [id_usuario, hoy]);

        if (yaRegistro.length > 0) {
            return res.status(400).json({ mensaje: "Ya registraste tu emoción del día." });
        }

        // Verificar que la emoción sea válida para este usuario
        const [emocionExiste] = await db.query(`
            SELECT id_emocion, nombre_emocion, categoria FROM Emocion
            WHERE id_emocion = ? AND (id_usuario IS NULL OR id_usuario = ?)
        `, [id_emocion, id_usuario]);

        if (emocionExiste.length === 0) {
            return res.status(404).json({ mensaje: "Emoción no válida." });
        }

        const emocion = emocionExiste[0];

        // ── Consultar sistema experto para obtener frase ──
        let frase_dia = null;
        try {
            const respuesta = await axios.post(`${PYTHON_URL}/frases/obtener`, {
                clasificacion: emocion.categoria,
                nivel: nivel,
            });
            frase_dia = respuesta.data?.frase ?? null;
        } catch (errorPython) {
            console.warn("Sistema experto no disponible, se omite la frase:", errorPython.message);
        }

        // ── Guardar registro con la frase ──
        const registro = new RegistroEmocion({
            nivel,
            fecha_registro: getFechaHoraActual(),
            frase_dia,
            id_emocion,
            id_usuario,
        });

        await registro.save();

        // ── Verificar racha de 14 días consecutivos de emoción negativa alta ──
        // ── Verificar racha de 14 días consecutivos de emoción negativa crítica ──
        let mostrar_alerta_especialista = false;
        try {
            const [ultimos14] = await db.query(`
        SELECT re.nivel, e.categoria
        FROM Registro_Emocion re
        JOIN Emocion e ON re.id_emocion = e.id_emocion
        WHERE re.id_usuario = ?
        ORDER BY re.fecha_registro DESC
        LIMIT 14
    `, [id_usuario]);

            // Por esto:
            if (ultimos14.length >= 14) {
                const esRachaCritica = ultimos14.every(
                    r => r.categoria === "negativa" && r.nivel === "critico"
                );

                if (esRachaCritica) {
                    // Contar cuántos días consecutivos lleva realmente
                    const [todosRegistros] = await db.query(`
                    SELECT re.nivel, e.categoria, DATE(re.fecha_registro) as fecha
                    FROM Registro_Emocion re
                    JOIN Emocion e ON re.id_emocion = e.id_emocion
                    WHERE re.id_usuario = ?
                    ORDER BY re.fecha_registro DESC
                `, [id_usuario]);

                    let diasConsecutivos = 0;
                    for (const r of todosRegistros) {
                        if (r.categoria === "negativa" && r.nivel === "critico") {
                            diasConsecutivos++;
                        } else {
                            break;
                        }
                    }

                    if (diasConsecutivos >= 14) {
                        const alerta = new AlertaEspecialista({
                            fecha_alerta: getFechaHoraActual(),
                            dias_consecutivos: diasConsecutivos,
                            id_usuario,
                        });
                        await alerta.save();
                        mostrar_alerta_especialista = true;
                    }
                }
            }
        } catch (errAlerta) {
            console.warn("No se pudo verificar racha:", errAlerta.message);
        }

        res.status(201).json({
            mensaje: "Emoción registrada correctamente.",
            emocion: {
                id_emocion: emocion.id_emocion,
                nombre: emocion.nombre_emocion,
                categoria: emocion.categoria,
            },
            frase: frase_dia,
            mostrar_alerta_frase: false,
            mostrar_alerta_especialista,
        });

    } catch (error) {
        console.error("Error al registrar emoción del día:", error);
        res.status(500).json({ mensaje: "Error al registrar la emoción." });
    }
};

// ============= Obtener frase del día por medio de la emoción ==============
export const obtenerFraseHoy = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const hoy = getFechaHoy();

        const [registro] = await db.query(`
            SELECT frase_dia
            FROM Registro_Emocion
            WHERE id_usuario = ? AND DATE(fecha_registro) = ?
            LIMIT 1
        `, [id_usuario, hoy]);

        if (registro.length === 0 || !registro[0].frase_dia) {
            return res.json({ frase: null });
        }

        res.json({ frase: registro[0].frase_dia });

    } catch (error) {
        console.error("Error al obtener frase del día:", error);
        res.status(500).json({ mensaje: "Error al obtener la frase del día." });
    }
};

// ===================== historial emocional ==========================
export const obtenerHistorialEmocional = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;

        const [historial] = await db.query(`
            SELECT 
                DATE_FORMAT(re.fecha_registro, '%Y-%m-%d') AS fecha_registro,
                e.nombre_emocion,
                e.categoria,
                re.nivel
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ?
            ORDER BY re.fecha_registro ASC
        `, [id_usuario]);

        res.json({ historial });

    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ mensaje: "Error al obtener historial emocional." });
    }
};

// ===================== obtener alertas del especialista ==========================
export const obtenerAlertasEspecialista = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const alertas = await AlertaEspecialista.getByUsuario(id_usuario);
        res.json({ alertas });
    } catch (error) {
        console.error("Error al obtener alertas:", error);
        res.status(500).json({ mensaje: "Error al obtener alertas." });
    }
};

// ===================== marcar alerta como vista ==========================
export const marcarAlertaVista = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id } = req.params;

        await AlertaEspecialista.marcarVista(id, id_usuario);
        res.json({ mensaje: "Alerta marcada como vista." });
    } catch (error) {
        console.error("Error al marcar alerta:", error);
        res.status(500).json({ mensaje: "Error al marcar la alerta." });
    }
}; 