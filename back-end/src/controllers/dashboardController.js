// ============================== DASHBOARD CONTROLLER ==============================
import axios from "axios";
import { db } from "../config/db.js";
import { Frase_Diaria } from "../models/Frase_Diaria.js";
import { Emocion } from "../models/Emocion.js";
import { RegistroEmocion } from "../models/RegistroEmocion.js";
import { AlertaEmocional } from "../models/AlertaEmocional.js";

const PYTHON_URL = process.env.PYTHON_URL || "http://localhost:8000";

// Reemplaza la función getFechaHoy por estas dos:
function getFechaHoy() {
    // Solo la fecha "YYYY-MM-DD" — para comparaciones en WHERE
    return new Date().toLocaleDateString("sv-SE", {
        timeZone: "America/Mexico_City",
    });
}

function getFechaHoraActual() {
    // Fecha+hora "YYYY-MM-DD HH:MM:SS" — para guardar en BD
    return new Date().toLocaleString("sv-SE", {
        timeZone: "America/Mexico_City",
    });
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function stemearTexto(texto) {
    const norm = normalizarTexto(texto);
    // Quita sufijos: -ada, -ado, -a, -o  (en ese orden, del más largo al más corto)
    return norm
        .replace(/adas?$/, "ad")   // cansadas / cansada → cansad
        .replace(/ados?$/, "ad")   // cansados / cansado → cansad
        .replace(/idas?$/, "id")   // aburridas / aburrida → aburrid
        .replace(/idos?$/, "id")   // aburridos / aburrido → aburrid
        .replace(/as$/, "")        // plural femenino
        .replace(/os$/, "")        // plural masculino
        .replace(/a$/, "")         // femenino singular  enojada → enojad... → enoja → enoj
        .replace(/o$/, "");        // masculino singular
}

async function obtenerFraseSistemaExperto(idUsuario, categoria, nivel) {
    try {
        // Calcular días consecutivos con emociones negativas/críticas
        const [registros] = await db.query(`
            SELECT e.categoria
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ?
            ORDER BY re.fecha_registro ASC
            LIMIT 10
        `, [idUsuario]);

        let diasConsecutivos = 0;
        for (const r of registros) {
            if (r.categoria === "negativa" || r.categoria === "critica") {
                diasConsecutivos++;
            } else {
                break;
            }
        }

        const response = await axios.post(`${PYTHON_URL}/frases/obtener`, {
            clasificacion: categoria,
            nivel: nivel,
            dias_consecutivos: diasConsecutivos,
        });

        return response.data; // { frase, tipo, mostrar_alerta }
    } catch (error) {
        console.error("Error al consultar sistema experto de frases:", error.message);
        return null;
    }
}

/* ===================================================
 --------------- FRASES ADMINISTRADOR ----------------
=================================================== */
export const obtenerTipDiarioBienvenida = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const hoy = getFechaHoy();

        const tip = await TipDiario.getByFecha(hoy, idUsuario);
        if (tip) {
            return res.json({ texto: tip.frase });
        }

        // Fallback: usa frases de Administrador para /home
        const fraseElegida = await Frase.getRandomAdmin(); // ← cambiado
        if (!fraseElegida) {
            return res.json({ texto: null });
        }

        const nuevoTip = new TipDiario({
            fecha: hoy,
            frase_id: fraseElegida.id_frase,
            id_usuario: idUsuario,
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

        const emociones = await Emocion.getByUsuario(idUsuario);

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
        const { nombre_emocion, categoria, nivel = "medio" } = req.body;

        if (!nombre_emocion || nombre_emocion.trim() === "") {
            return res.status(400).json({ mensaje: "El nombre de la emoción es obligatorio" });
        }

        const CATEGORIAS_VALIDAS = ["positiva", "negativa", "neutra"];
        if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) {
            return res.status(400).json({
                mensaje: "Debes indicar si la emoción es positiva, negativa o neutra"
            });
        }

        const nombreNorm = normalizarTexto(nombre_emocion);

        if (nombreNorm.length > 100) {
            return res.status(400).json({
                mensaje: "El nombre no puede superar 100 caracteres"
            });
        }

        // Nueva validación (reemplaza la anterior)
        const [todasEmociones] = await db.query(`
            SELECT nombre_emocion FROM Emocion
            WHERE id_usuario IS NULL OR id_usuario = ?
        `, [idUsuario]);

        const stemNueva = stemearTexto(nombre_emocion);

        const yaExiste = todasEmociones.some(e =>
            stemearTexto(e.nombre_emocion) === stemNueva
        );

        if (yaExiste) {
            return res.status(400).json({
                mensaje: "Esta emoción ya existe en tu lista"
            });
        }

        const emocion = new Emocion({
            nombre_emocion: nombre_emocion.trim(),
            categoria,
            nivel,
            id_usuario: idUsuario
        });

        const result = await emocion.save();

        res.status(201).json({
            mensaje: "Emoción agregada correctamente",
            emocion: {
                id_emocion: result.insertId,
                nombre_emocion: nombre_emocion.trim(),
                categoria,
                nivel,
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
        const { id_emocion, nivel = "medio" } = req.body; // ← nivel viene del body

        if (!id_emocion) {
            return res.status(400).json({ mensaje: "Debes seleccionar una emoción" });
        }

        const hoy = getFechaHoy();

        const [yaRegistro] = await db.query(`
            SELECT id_registro FROM Registro_Emocion
            WHERE id_usuario = ? AND DATE(fecha_registro) = ?
        `, [idUsuario, hoy]);

        if (yaRegistro.length > 0) {
            return res.status(400).json({ mensaje: "Ya registraste tu emoción del día" });
        }

        const [emocionExiste] = await db.query(`
            SELECT id_emocion, nombre_emocion, categoria FROM Emocion
            WHERE id_emocion = ? AND (id_usuario IS NULL OR id_usuario = ?)
        `, [id_emocion, idUsuario]);

        if (emocionExiste.length === 0) {
            return res.status(404).json({ mensaje: "Emoción no válida" });
        }

        const emocion = emocionExiste[0];

        const registro = new RegistroEmocion({
            fecha_registro: getFechaHoraActual(),
            id_emocion,
            id_usuario: idUsuario,
            nivel, // ← guardado en Registro_Emocion
        });
        await registro.save();

        const alertaData = await evaluarAlertaEmocional(idUsuario);
        if (alertaData) {
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
  ------------ REGISTRAR EMOCIÓN EXISTENTE ------------
  Solo registra el día, no crea nueva emoción
  =====================================================*/
export const registrarEmocionDia = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const { id_emocion, nivel = "medio" } = req.body;

        if (!id_emocion) {
            return res.status(400).json({ mensaje: "Debes seleccionar una emoción." });
        }

        const hoy = getFechaHoy();

        const [yaRegistro] = await db.query(`
            SELECT id_registro FROM Registro_Emocion
            WHERE id_usuario = ? AND DATE(fecha_registro) = ?
        `, [idUsuario, hoy]);

        if (yaRegistro.length > 0) {
            return res.status(400).json({ mensaje: "Ya registraste tu emoción del día." });
        }

        const [emocionExiste] = await db.query(`
            SELECT id_emocion, nombre_emocion, categoria FROM Emocion  /* ← eliminado nivel del SELECT */
            WHERE id_emocion = ? AND (id_usuario IS NULL OR id_usuario = ?)
        `, [id_emocion, idUsuario]);

        if (emocionExiste.length === 0) {
            return res.status(404).json({ mensaje: "Emoción no válida." });
        }

        const emocion = emocionExiste[0];
        // nivel ya no se hereda de Emocion; viene del body con default "medio"

        const fraseData = await obtenerFraseSistemaExperto(
            idUsuario,
            emocion.categoria,
            nivel // ← usa el nivel del registro, no de la emoción
        );

        const registro = new RegistroEmocion({
            fecha_registro: getFechaHoraActual(),
            id_emocion,
            id_usuario: idUsuario,
            nivel, // ← guardado en Registro_Emocion
            frase_dia: fraseData?.frase ?? null,
        });
        await registro.save();

        const alertaData = await evaluarAlertaEmocional(idUsuario);
        if (alertaData) {
            const [alertaExiste] = await db.query(`
                SELECT id_alerta FROM Alerta_Emocional
                WHERE id_usuario = ? AND fecha_alerta = ? AND tipo = ?
            `, [idUsuario, hoy, alertaData.tipo]);

            if (alertaExiste.length === 0) {
                const alerta = new AlertaEmocional({
                    fecha_alerta: hoy,
                    tipo: alertaData.tipo,
                    mensaje: alertaData.mensaje,
                    id_usuario: idUsuario,
                });
                await alerta.save();
            }
        }

        res.status(201).json({
            mensaje: "Emoción registrada correctamente.",
            emocion: {
                id_emocion: emocion.id_emocion,
                nombre: emocion.nombre_emocion,
                categoria: emocion.categoria,
            },
            alerta: alertaData ? alertaData.tipo : null,
            frase: fraseData?.frase ?? null,
            mostrar_alerta_frase: fraseData?.mostrar_alerta ?? false,
        });

    } catch (error) {
        console.error("Error al registrar emoción del día:", error);
        res.status(500).json({ mensaje: "Error al registrar la emoción." });
    }
};

/* ====================================================
  ----------- FRASE DEL DÍA (post-registro) -----------
======================================================*/
export const obtenerFraseHoy = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const hoy = getFechaHoy();

        const [registro] = await db.query(`
            SELECT frase_dia
            FROM Registro_Emocion
            WHERE id_usuario = ? AND DATE(fecha_registro) = ?
            LIMIT 1
        `, [idUsuario, hoy]);

        if (registro.length === 0 || !registro[0].frase_dia) {
            return res.json({ frase: null });
        }

        res.json({ frase: registro[0].frase_dia });

    } catch (error) {
        console.error("Error al obtener frase del día:", error);
        res.status(500).json({ mensaje: "Error al obtener la frase del día." });
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
                re.nivel,                              /* ← nivel de Registro_Emocion */
                COUNT(*) as total,
                ROUND(COUNT(*) * 100.0 / (
                    SELECT COUNT(*) FROM Registro_Emocion WHERE id_usuario = ?
                ), 1) AS porcentaje
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ?
            GROUP BY e.id_emocion, e.nombre_emocion, e.categoria, re.nivel  /* ← re.nivel en GROUP BY */
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
        const hoy = getFechaHoy();

        const [registro] = await db.query(`
            SELECT re.id_registro, e.nombre_emocion, e.categoria, re.nivel  /* ← re.nivel */
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ? AND DATE(re.fecha_registro) = ?
        `, [idUsuario, hoy]);

        if (registro.length > 0) {
            return res.json({
                registrado: true,
                emocion: registro[0].nombre_emocion,
                categoria: registro[0].categoria,
                nivel: registro[0].nivel  // ← ya viene de re.nivel
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
                DATE_FORMAT(re.fecha_registro, '%Y-%m-%d') AS fecha_registro,
                e.nombre_emocion,
                e.categoria,
                re.nivel                               /* ← re.nivel */
            FROM Registro_Emocion re
            JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ?
            ORDER BY re.fecha_registro ASC
        `, [idUsuario]);

        res.json({ historial });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ mensaje: "Error al obtener historial emocional" });
    }
};

/* ====================================================
  ----------- SISTEMA EXPERTO: EVALUAR ALERTA ---------
======================================================*/
async function evaluarAlertaEmocional(idUsuario) {
    const [registros] = await db.query(`
        SELECT e.categoria, re.nivel           /* ← re.nivel incluido */
        FROM Registro_Emocion re
        JOIN Emocion e ON re.id_emocion = e.id_emocion
        WHERE re.id_usuario = ?
        ORDER BY re.fecha_registro DESC
        LIMIT 3
    `, [idUsuario]);

    if (registros.length < 3) return null;

    const todasDificiles = registros.every(
        r => r.categoria === "negativa" || r.categoria === "critica"
    );

    if (todasDificiles) {
        // Alerta más urgente si además el nivel es "alto" en todos los registros
        const todasAltas = registros.every(r => r.nivel === "alto");
        return {
            tipo: "consecutivas_negativas",
            mensaje: todasAltas
                ? "Has registrado emociones difíciles de alta intensidad varios días seguidos. Te recomendamos hablar con un especialista de bienestar."
                : "Has registrado emociones difíciles varios días seguidos. Te recomendamos hablar con un especialista de bienestar.",
        };
    }

    return null;
}


/* ====================================================
  ----------- TIP DIARIO DASHBOARD (solo lectura) -----
  Solo frases de tipo Estudiante, sin INSERT
  =====================================================*/
export const obtenerFraseDiaria = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const hoy = getFechaHoy();

        // Buscar si ya existe una frase Estudiante para hoy
        const [tipExistente] = await db.query(`
            SELECT f.frase
            FROM Tip_Diario td
            JOIN Frase f ON td.frase_id = f.id_frase
            WHERE td.id_usuario = ? AND td.fecha = ? AND f.tipo = 'Estudiante'
            LIMIT 1
        `, [idUsuario, hoy]);

        if (tipExistente.length > 0) {
            return res.json({ texto: tipExistente[0].frase });
        }

        // No existe, generar y guardar
        const fraseElegida = await Frase.getRandom();
        if (!fraseElegida) {
            return res.json({ texto: null });
        }

        // ← Guarda para que sea la misma todo el día
        await db.query(`
            INSERT INTO Tip_Diario (fecha, frase_id, id_usuario)
            VALUES (?, ?, ?)
        `, [hoy, fraseElegida.id_frase, idUsuario]);

        return res.json({ texto: fraseElegida.frase });

    } catch (error) {
        console.error("Error en tip diario dashboard:", error);
        res.status(500).json({ mensaje: "Error al obtener el tip diario" });
    }
};

