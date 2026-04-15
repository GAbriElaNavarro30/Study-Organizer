// ============================== DASHBOARD CONTROLLER ==============================
import { db } from "../config/db.js";
import { Emocion } from "../models/Emocion.js";
import { RegistroEmocion } from "../models/RegistroEmocion.js";
import { AlertaEmocional } from "../models/AlertaEmocional.js";
import { TipDiario } from "../models/TipDiario.js";
import { FraseRandom } from "../models/FraseRandom.js";

/* ===================================================
 --------------- FRASES ADMINISTRADOR ----------------
=================================================== */
export const obtenerTipDiarioBienvenida = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const hoy = new Date().toISOString().split("T")[0];

        // El cron ya lo generó, solo lo retornamos
        const tip = await TipDiario.getByFecha(hoy, idUsuario);

        if (tip) {
            return res.json({ texto: tip.frase });
        }

        // Si el cron aún no corrió (ej. usuario nuevo registrado hoy)
        // generamos el tip manualmente como fallback
        const fraseElegida = await FraseRandom.getRandom();

        if (!fraseElegida) {
            return res.json({ texto: "No hay frases disponibles aún" });
        }

        const nuevoTip = new TipDiario({
            fecha: hoy,
            frase_id: fraseElegida.id_frase,
            id_usuario: idUsuario
        });

        await nuevoTip.save();

        return res.json({ texto: fraseElegida.frase });

    } catch (error) {
        console.error("Error en tip diario:", error);
        res.status(500).json({ mensaje: "Error al obtener el tip diario" });
    }
};

/* ====================================================
  -------------- OBTENER EMOCIONES DEL USUARIO --------
  =====================================================*/
export const obtenerEmociones = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;

        // Emociones globales (predeterminadas) + las personalizadas del usuario
        const [emociones] = await db.query(`
            SELECT id_emocion, nombre_emocion, categoria
            FROM Emocion
            WHERE id_usuario IS NULL OR id_usuario = ?
            ORDER BY id_emocion ASC
        `, [idUsuario]);

        res.json({ emociones });
    } catch (error) {
        console.error("Error al obtener emociones:", error);
        res.status(500).json({ mensaje: "Error al obtener emociones" });
    }
};

/* ====================================================
  ------------ AGREGAR EMOCIÓN PERSONALIZADA ----------
  =====================================================*/
export const agregarEmocionPersonalizada = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const { nombre_emocion } = req.body;

        if (!nombre_emocion || nombre_emocion.trim() === "") {
            return res.status(400).json({ mensaje: "El nombre de la emoción es obligatorio" });
        }

        const nombreNorm = nombre_emocion.trim().toLowerCase();

        if (nombreNorm.length > 100) {
            return res.status(400).json({ mensaje: "El nombre de la emoción no puede superar 100 caracteres" });
        }

        // Verificar que no exista ya (global o del usuario)
        const [existe] = await db.query(`
            SELECT id_emocion FROM Emocion
            WHERE LOWER(nombre_emocion) = ? AND (id_usuario IS NULL OR id_usuario = ?)
        `, [nombreNorm, idUsuario]);

        if (existe.length > 0) {
            return res.status(400).json({ mensaje: "Esta emoción ya existe en tu lista" });
        }

        // SISTEMA EXPERTO: Inferir categoría automáticamente
        const categoria = inferirCategoriaEmocion(nombreNorm);

        const emocion = new Emocion({
            nombre_emocion: nombre_emocion.trim(),
            categoria,
            id_usuario: idUsuario
        });

        const result = await emocion.save();

        res.status(201).json({
            mensaje: "Emoción agregada correctamente",
            emocion: {
                id_emocion: result.insertId,
                nombre_emocion: nombre_emocion.trim(),
                categoria
            }
        });
    } catch (error) {
        console.error("Error al agregar emoción:", error);
        res.status(500).json({ mensaje: "Error al agregar la emoción" });
    }
};

/* ====================================================
  ------------- REGISTRAR EMOCIÓN DEL DÍA -------------
  =====================================================*/
export const registrarEmocion = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const { id_emocion } = req.body;

        if (!id_emocion) {
            return res.status(400).json({ mensaje: "Debes seleccionar una emoción" });
        }

        const hoy = new Date().toISOString().split("T")[0];

        // Verificar si ya registró hoy
        const [yaRegistro] = await db.query(`
            SELECT id_registro FROM Registro_Emocion
            WHERE id_usuario = ? AND fecha_registro = ?
        `, [idUsuario, hoy]);

        if (yaRegistro.length > 0) {
            return res.status(400).json({ mensaje: "Ya registraste tu emoción del día" });
        }

        // Verificar que la emoción existe y pertenece al usuario o es global
        const [emocionExiste] = await db.query(`
            SELECT id_emocion, nombre_emocion, categoria FROM Emocion
            WHERE id_emocion = ? AND (id_usuario IS NULL OR id_usuario = ?)
        `, [id_emocion, idUsuario]);

        if (emocionExiste.length === 0) {
            return res.status(404).json({ mensaje: "Emoción no válida" });
        }

        const emocion = emocionExiste[0];

        // Guardar el registro
        const registro = new RegistroEmocion({
            fecha_registro: hoy,
            id_emocion,
            id_usuario: idUsuario
        });
        await registro.save();

        // SISTEMA EXPERTO: Evaluar si se genera alerta
        const alertaData = await evaluarAlertaEmocional(idUsuario);
        if (alertaData) {
            // Verificar que no exista ya una alerta del mismo tipo hoy
            const [alertaExiste] = await db.query(`
                SELECT id_alerta FROM Alerta_Emocional
                WHERE id_usuario = ? AND fecha_alerta = ? AND tipo = ?
            `, [idUsuario, hoy, alertaData.tipo]);

            if (alertaExiste.length === 0) {
                const alerta = new AlertaEmocional({
                    fecha_alerta: hoy,
                    tipo: alertaData.tipo,
                    mensaje: alertaData.mensaje,
                    id_usuario: idUsuario
                });
                await alerta.save();
            }
        }

        res.status(201).json({
            mensaje: "Emoción registrada correctamente",
            emocion: {
                nombre: emocion.nombre_emocion,
                categoria: emocion.categoria
            },
            alerta: alertaData ? alertaData.tipo : null
        });
    } catch (error) {
        console.error("Error al registrar emoción:", error);
        res.status(500).json({ mensaje: "Error al registrar la emoción" });
    }
};

/* ====================================================
  -------------- TIP / FRASE DEL DÍA -----------------
  =====================================================
  Regla del sistema experto:
  - Si el usuario ya registró emoción hoy → frase según categoria
  - Si no registró → frase neutra motivacional
  - Las emociones personalizadas ya tienen categoría inferida
======================================================*/
export const obtenerTipDiario = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const hoy = new Date().toISOString().split("T")[0];

        // Buscar el registro de hoy
        const [registro] = await db.query(`
            SELECT e.categoria
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ? AND re.fecha_registro = ?
        `, [idUsuario, hoy]);

        let categoria = "neutra";
        if (registro.length > 0) {
            categoria = registro[0].categoria;
            // Las críticas reciben frases positivas/motivacionales (no negativas)
            if (categoria === "critica") categoria = "positiva";
        }

        // Obtener frase random de esa categoría
        const [frases] = await db.query(
            "SELECT frase FROM Frase WHERE categoria = ? ORDER BY RAND() LIMIT 1",
            [categoria]
        );

        const texto = frases.length > 0
            ? frases[0].frase
            : "Cada día es una oportunidad para crecer. ¡Tú puedes!";

        res.json({ texto, categoria, registroHoy: registro.length > 0 });
    } catch (error) {
        console.error("Error al obtener tip diario:", error);
        res.status(500).json({ mensaje: "Error al obtener el tip diario" });
    }
};

/* ====================================================
  ----------- EMOCIONES PREDOMINANTES -----------------
======================================================*/
export const obtenerEmocionesPredomnantes = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;

        const [resultados] = await db.query(`
            SELECT 
                e.nombre_emocion,
                e.categoria,
                COUNT(*) as total,
                ROUND(COUNT(*) * 100.0 / (
                    SELECT COUNT(*) FROM Registro_Emocion WHERE id_usuario = ?
                ), 1) AS porcentaje
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ?
            GROUP BY e.id_emocion, e.nombre_emocion, e.categoria
            ORDER BY total DESC
            LIMIT 3
        `, [idUsuario, idUsuario]);

        res.json({ predominantes: resultados });
    } catch (error) {
        console.error("Error al obtener emociones predominantes:", error);
        res.status(500).json({ mensaje: "Error al obtener emociones predominantes" });
    }
};

/* ====================================================
  ----------- ALERTAS NO VISTAS -----------------------
======================================================*/
export const obtenerAlertas = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;

        const [alertas] = await db.query(`
            SELECT id_alerta, fecha_alerta, tipo, mensaje, visto, fecha_creacion
            FROM Alerta_Emocional
            WHERE id_usuario = ? AND visto = FALSE
            ORDER BY fecha_creacion DESC
        `, [idUsuario]);

        res.json({ alertas });
    } catch (error) {
        console.error("Error al obtener alertas:", error);
        res.status(500).json({ mensaje: "Error al obtener alertas" });
    }
};

/* ====================================================
  ----------- MARCAR ALERTA COMO VISTA ----------------
======================================================*/
export const marcarAlertaVista = async (req, res) => {
    try {
        const { id } = req.params;
        const idUsuario = req.usuario.id;

        await db.query(`
            UPDATE Alerta_Emocional SET visto = TRUE
            WHERE id_alerta = ? AND id_usuario = ?
        `, [id, idUsuario]);

        res.json({ mensaje: "Alerta marcada como vista" });
    } catch (error) {
        console.error("Error al marcar alerta:", error);
        res.status(500).json({ mensaje: "Error al marcar la alerta" });
    }
};

/* ====================================================
  ----------- VERIFICAR REGISTRO DE HOY ---------------
======================================================*/
export const verificarRegistroHoy = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const hoy = new Date().toISOString().split("T")[0];

        const [registro] = await db.query(`
            SELECT re.id_registro, e.nombre_emocion, e.categoria
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ? AND re.fecha_registro = ?
        `, [idUsuario, hoy]);

        if (registro.length > 0) {
            return res.json({
                registrado: true,
                emocion: registro[0].nombre_emocion,
                categoria: registro[0].categoria
            });
        }

        res.json({ registrado: false });
    } catch (error) {
        console.error("Error al verificar registro:", error);
        res.status(500).json({ mensaje: "Error al verificar el registro" });
    }
};

/* ====================================================
  ----------- HISTORIAL EMOCIONAL (últimos 7 días) ----
======================================================*/
export const obtenerHistorialEmocional = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;

        const [historial] = await db.query(`
            SELECT 
                re.fecha_registro,
                e.nombre_emocion,
                e.categoria
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ?
              AND re.fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY re.fecha_registro ASC
        `, [idUsuario]);

        res.json({ historial });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ mensaje: "Error al obtener historial emocional" });
    }
};

