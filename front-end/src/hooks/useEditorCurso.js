// src/hooks/useEditorCurso.js
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
 
/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
export const VARK_OPTIONS = [
    { value: "V", label: "Visual", letter: "V", accent: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    { value: "A", label: "Auditivo", letter: "A", accent: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
    { value: "R", label: "Lectura / Escritura", letter: "R", accent: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    { value: "K", label: "Kinestésico", letter: "K", accent: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC" },
    { value: "VA", label: "Visual-Auditivo", letter: "VA", accent: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    { value: "VR", label: "Visual-Lectura", letter: "VR", accent: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
    { value: "VK", label: "Visual-Kinestésico", letter: "VK", accent: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC" },
    { value: "AR", label: "Auditivo-Lectura", letter: "AR", accent: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    { value: "AK", label: "Auditivo-Kinestésico", letter: "AK", accent: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { value: "RK", label: "Lectura-Kinestésico", letter: "RK", accent: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
    { value: "VAR", label: "Visual-Auditivo-Lectura", letter: "VAR", accent: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC" },
    { value: "VAK", label: "Visual-Auditivo-Kinestésico", letter: "VAK", accent: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    { value: "VRK", label: "Visual-Lectura-Kinestésico", letter: "VRK", accent: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
    { value: "ARK", label: "Auditivo-Lectura-Kinestésico", letter: "ARK", accent: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    { value: "VARK", label: "Multimodal", letter: "★", accent: "#1E293B", bg: "#F8FAFC", border: "#CBD5E1" },
];

export const PLACEHOLDER_PALETTES = [
    { bg: "#DBEAFE", text: "#1E40AF" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#EDE9FE", text: "#5B21B6" },
    { bg: "#FEF3C7", text: "#92400E" },
    { bg: "#CFFAFE", text: "#155E75" },
    { bg: "#FFE4E6", text: "#9F1239" },
    { bg: "#DCFCE7", text: "#14532D" },
];

export const STEPS = [
    { id: 1, label: "Curso", icon: null },   // los iconos se inyectan en la vista
    { id: 2, label: "Contenido", icon: null },
    { id: 3, label: "Crear", icon: null },
];

/* ─────────────────────────────────────────────────────────
   HELPERS — uuid / factories
───────────────────────────────────────────────────────── */
export const uuid = () => crypto.randomUUID();

export const crearContenidoVacio = () => ({
    _id: uuid(), titulo: "", contenido: "",
    imagen_file: null, imagen_preview: null, imagen_url: "",
    imagen_crop: null, imagen_cropped_preview: null,
});

export const crearOpcionVacia = () => ({ _id: uuid(), texto_opcion: "", es_correcta: false });

export const crearPreguntaVacia = () => ({
    _id: uuid(), texto_pregunta: "",
    opciones: [crearOpcionVacia(), crearOpcionVacia()],
});

export const crearSeccionVacia = () => ({
    _id: uuid(), titulo_seccion: "", descripcion_seccion: "",
    contenidos: [crearContenidoVacio()], preguntas: [], mostrarTest: false,
});

/* ─────────────────────────────────────────────────────────
   HELPERS — utilidades
───────────────────────────────────────────────────────── */
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const getPlaceholderPalette = (titulo = "") => {
    const idx = (titulo.charCodeAt(0) || 65) % PLACEHOLDER_PALETTES.length;
    return PLACEHOLDER_PALETTES[idx];
};

export const getInitials = (titulo = "") =>
    titulo.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";

export const fmtDate = (iso) => {
    if (!iso) return new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

/* ─────────────────────────────────────────────────────────
   HELPERS — base64
───────────────────────────────────────────────────────── */
export const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
    });

export const base64ToFile = (base64, filename = "imagen.jpg") => {
    try {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    } catch { return null; }
};

/* ─────────────────────────────────────────────────────────
   LOCAL STORAGE — BORRADOR
───────────────────────────────────────────────────────── */
const STORAGE_KEY_INFO = "ec_infoCurso";
const STORAGE_KEY_SECCIONES = "ec_secciones";
const STORAGE_KEY_PASO = "ec_paso";
const STORAGE_KEY_SECCION_ACTIVA = "ec_seccion_activa";
const STORAGE_KEY_EDIT_PREFIX = "ec_edit_";

export const getStorageKeys = (cursoId = null) => ({
    info: cursoId ? `${STORAGE_KEY_EDIT_PREFIX}info_${cursoId}` : STORAGE_KEY_INFO,
    secciones: cursoId ? `${STORAGE_KEY_EDIT_PREFIX}secs_${cursoId}` : STORAGE_KEY_SECCIONES,
    paso: cursoId ? `${STORAGE_KEY_EDIT_PREFIX}paso_${cursoId}` : STORAGE_KEY_PASO,
    seccionActiva: cursoId ? `${STORAGE_KEY_EDIT_PREFIX}secact_${cursoId}` : STORAGE_KEY_SECCION_ACTIVA,
});

export const guardarBorrador = async (info, secs, cursoId = null, paso = null, seccionActiva = null) => {
    try {
        const keys = getStorageKeys(cursoId);
        const fotoPreviewGuardable = info.foto_preview?.startsWith("data:") ? info.foto_preview : null;
        const infoLimpia = { ...info, foto_file: null, foto_preview: fotoPreviewGuardable };

        const seccionesLimpias = await Promise.all(
            secs.map(async (s) => ({
                ...s,
                contenidos: await Promise.all(
                    s.contenidos.map(async (c) => {
                        let imagenPersistible = c.imagen_cropped_preview?.startsWith("data:")
                            ? c.imagen_cropped_preview
                            : c.imagen_url || null;

                        if (c.imagen_cropped_file instanceof File) {
                            try { imagenPersistible = await fileToBase64(c.imagen_cropped_file); } catch { }
                        } else if (c.imagen_preview?.startsWith("data:")) {
                            imagenPersistible = c.imagen_preview;
                        } else if (c.imagen_preview?.startsWith("blob:") && c.imagen_file instanceof File) {
                            try { imagenPersistible = await fileToBase64(c.imagen_file); } catch { }
                        }

                        return {
                            ...c,
                            imagen_file: null,
                            imagen_cropped_file: null,
                            imagen_preview: null,
                            imagen_cropped_preview: imagenPersistible,
                            imagen_url: c.imagen_url || "",
                        };
                    })
                ),
            }))
        );

        localStorage.setItem(keys.info, JSON.stringify(infoLimpia));
        localStorage.setItem(keys.secciones, JSON.stringify(seccionesLimpias));
        if (paso !== null) localStorage.setItem(keys.paso, String(paso));
        if (seccionActiva !== null) localStorage.setItem(keys.seccionActiva, String(seccionActiva));
    } catch (e) { console.error("Error guardando borrador:", e); }
};

export const cargarBorrador = (cursoId = null) => {
    try {
        const keys = getStorageKeys(cursoId);
        const info = localStorage.getItem(keys.info);
        const secs = localStorage.getItem(keys.secciones);
        const paso = localStorage.getItem(keys.paso);
        const seccionActiva = localStorage.getItem(keys.seccionActiva);
        return {
            info: info ? JSON.parse(info) : null,
            secciones: secs ? JSON.parse(secs) : null,
            paso: paso ? parseInt(paso, 10) : null,
            seccionActiva: seccionActiva !== null ? parseInt(seccionActiva, 10) : null,
        };
    } catch { return { info: null, secciones: null, paso: null, seccionActiva: null }; }
};

export const limpiarBorrador = (cursoId = null) => {
    try {
        const keys = getStorageKeys(cursoId);
        localStorage.removeItem(keys.info);
        localStorage.removeItem(keys.secciones);
        localStorage.removeItem(keys.paso);
        localStorage.removeItem(keys.seccionActiva);
    } catch { }
};

/* ─────────────────────────────────────────────────────────
   HOOK PRINCIPAL
───────────────────────────────────────────────────────── */
export function useEditorCurso() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const modoEdicion = Boolean(id);

    const [paso, setPaso] = useState(1);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(modoEdicion);
    const [error, setError] = useState(null);
    const [erroresPorPaso, setErroresPorPaso] = useState({ 1: false, 2: false });

    const [dimensiones, setDimensiones] = useState([]);
    const [seccionesOriginales, setSeccionesOriginales] = useState([]);
    const [modalSalirOpen, setModalSalirOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [tituloDuplicado, setTituloDuplicado] = useState(false);
    const [tieneInscritos, setTieneInscritos] = useState(false);
    const [seccionActivaIdx, setSeccionActivaIdx] = useState(0);
    const [modalElimPortada, setModalElimPortada] = useState(false);

    const initialLoadDone = useRef(false);
    const skipNextDirty = useRef(false);

    const [infoCurso, setInfoCurso] = useState({
        titulo: "", descripcion: "", perfil_vark: "", id_dimension: "",
        foto_file: null, foto_preview: null, foto_url: null,
        foto_zoom: 1, foto_pos_x: 50, foto_pos_y: 50,
    });
    const [secciones, setSecciones] = useState([crearSeccionVacia()]);

    /* ── Carga inicial CREAR ── */
    useEffect(() => {
        if (!modoEdicion) {
            const { info, secciones: secsGuardadas, paso: pasoGuardado, seccionActiva } = cargarBorrador(null);
            if (info && pasoGuardado) {
                setInfoCurso(info);
                if (secsGuardadas) setSecciones(secsGuardadas);
                setPaso(pasoGuardado);
                if (seccionActiva !== null) setSeccionActivaIdx(seccionActiva);
            }
            setTimeout(() => { initialLoadDone.current = true; }, 0);
        }
    }, []);

    /* ── Carga inicial EDITAR ── */
    useEffect(() => {
        if (!modoEdicion) return;
        (async () => {
            try {
                setCargando(true);
                const { data } = await api.get(`/cursos/cursos/${id}`);
                if (!data.ok) throw new Error(data.mensaje);
                const c = data.curso;

                setSeccionesOriginales(c.secciones || []);
                setTieneInscritos(Number(c.total_estudiantes ?? 0) > 0);

                const borrador = cargarBorrador(id);
                if (borrador.info) {
                    setInfoCurso(borrador.info);
                    if (borrador.secciones) setSecciones(borrador.secciones);
                    if (borrador.paso) setPaso(borrador.paso);
                    if (borrador.seccionActiva !== null) setSeccionActivaIdx(borrador.seccionActiva);
                } else {
                    setInfoCurso({
                        titulo: c.titulo || "",
                        descripcion: c.descripcion || "",
                        perfil_vark: c.perfil_vark || "",
                        id_dimension: c.id_dimension ? String(c.id_dimension) : "",
                        foto_file: null,
                        foto_preview: c.foto || null,
                        foto_url: c.foto || null,
                        foto_zoom: 1, foto_pos_x: 50, foto_pos_y: 50,
                    });
                    if (c.secciones?.length > 0) {
                        setSecciones(c.secciones.map((s) => ({
                            _id: String(s.id_seccion),
                            id_seccion: s.id_seccion,
                            titulo_seccion: s.titulo_seccion || "",
                            descripcion_seccion: s.descripcion_seccion || "",
                            mostrarTest: (s.preguntas?.length || 0) > 0,
                            contenidos: s.contenidos?.length > 0
                                ? s.contenidos.map((con) => ({
                                    _id: String(con.id_contenido),
                                    id_contenido: con.id_contenido,
                                    titulo: con.titulo || "",
                                    contenido: con.contenido || "",
                                    imagen_file: null,
                                    imagen_preview: null,
                                    imagen_url: con.imagen_url || "",
                                    imagen_crop: con.imagen_crop || null,
                                    imagen_cropped_preview: con.imagen_url || null,
                                    imagen_cropped_file: null,
                                }))
                                : [crearContenidoVacio()],
                            preguntas: (s.preguntas || []).map((p) => ({
                                _id: String(p.id_test),
                                id_test: p.id_test,
                                texto_pregunta: p.texto_pregunta || "",
                                opciones: (p.opciones || []).map((o) => ({
                                    _id: String(o.id_opcion),
                                    id_opcion: o.id_opcion,
                                    texto_opcion: o.texto_opcion || "",
                                    es_correcta: Boolean(o.es_correcta),
                                })),
                            })),
                        })));
                    }
                }
            } catch (err) {
                setError(err.response?.data?.mensaje || err.message);
            } finally {
                setCargando(false);
                setTimeout(() => {
                    initialLoadDone.current = true;
                    skipNextDirty.current = true;
                    setIsDirty(false);
                }, 0);
            }
        })();
    }, [id, modoEdicion]);

    /* ── Auto-guardar borrador ── */
    useEffect(() => {
        if (!initialLoadDone.current) return;
        if (skipNextDirty.current) { skipNextDirty.current = false; return; }
        guardarBorrador(infoCurso, secciones, modoEdicion ? id : null, paso, seccionActivaIdx);
        setIsDirty(true);
    }, [infoCurso, secciones, paso, seccionActivaIdx]); // eslint-disable-line

    /* ── Dimensiones ── */
    useEffect(() => {
        api.get("/cursos/dimensiones")
            .then(({ data }) => { if (data.ok) setDimensiones(data.dimensiones); })
            .catch(console.error);
    }, []);

    /* ── handleInfoChange ── */
    const handleInfoChange = async (campo, valor) => {
        if (campo === "foto_file" && valor instanceof File) {
            try {
                const base64 = await fileToBase64(valor);
                setInfoCurso((p) => ({ ...p, foto_file: valor, foto_preview: base64 }));
            } catch {
                setInfoCurso((p) => ({ ...p, foto_file: valor, foto_preview: URL.createObjectURL(valor) }));
            }
            return;
        }
        setInfoCurso((p) => ({ ...p, [campo]: valor }));
        if (campo === "titulo") setTituloDuplicado(false);
    };

    const handleSalir = () => {
        if (isDirty) { setModalSalirOpen(true); return; }
        navigate("/cursos-tutor");
    };

    /* ── canAdvance ── */
    const canAdvance = () => {
        if (paso === 1)
            return infoCurso.titulo.trim().length >= 5 &&
                infoCurso.titulo.trim().length <= 200 &&
                infoCurso.perfil_vark.length > 0;
        if (paso === 2) return secciones.every((s) => {
            if (!s.titulo_seccion.trim()) return false;
            if (!s.mostrarTest) return true;
            const preguntasNuevas = s.preguntas.filter((p) => !p.id_test);
            return preguntasNuevas.every((p) =>
                p.texto_pregunta.trim() &&
                p.opciones.every((o) => o.texto_opcion.trim()) &&
                p.opciones.some((o) => o.es_correcta)
            );
        });
        return true;
    };

    const handleNext = async () => {
        if (paso === 1) {
            setErroresPorPaso((p) => ({ ...p, 1: true }));
            setTituloDuplicado(false);
            const camposValidos = canAdvance();
            let duplicado = false;
            if (infoCurso.titulo.trim()) {
                try {
                    const { data } = await api.get("/cursos/cursos");
                    duplicado = (data.cursos || []).some(
                        (c) => c.titulo.toLowerCase() === infoCurso.titulo.trim().toLowerCase() &&
                            (!modoEdicion || String(c.id_curso) !== id)
                    );
                } catch { }
            }
            if (duplicado) setTituloDuplicado(true);
            if (!camposValidos || duplicado) return;
            setErroresPorPaso((p) => ({ ...p, 1: false }));
            setTituloDuplicado(false);
            setPaso((p) => p + 1);
            return;
        }
        if (paso === 2) {
            setErroresPorPaso((p) => ({ ...p, 2: true }));
            if (!canAdvance()) return;
            setErroresPorPaso((p) => ({ ...p, 2: false }));
            setPaso((p) => p + 1);
            return;
        }
        setPaso((p) => p + 1);
    };

    const handlePrev = () => setPaso((p) => p - 1);

    /* ── buildContenidoPayload ── */
    const buildContenidoPayload = async (con, id_seccion, orden) => {
        if (con.imagen_cropped_file) {
            const fd = new FormData();
            fd.append("titulo", con.titulo);
            fd.append("contenido", con.contenido);
            fd.append("orden", orden);
            fd.append("imagen", con.imagen_cropped_file, "imagen_recortada.jpg");
            return { useFormData: true, fd };
        }

        if (con.imagen_cropped_preview?.startsWith("data:") && !con.imagen_url) {
            const fileRecuperado = base64ToFile(con.imagen_cropped_preview, "imagen_borrador.jpg");
            if (fileRecuperado) {
                const fd = new FormData();
                fd.append("titulo", con.titulo);
                fd.append("contenido", con.contenido);
                fd.append("orden", orden);
                fd.append("imagen", fileRecuperado, "imagen_borrador.jpg");
                return { useFormData: true, fd };
            }
        }

        const imagenEliminada =
            !con.imagen_cropped_preview &&
            !con.imagen_preview &&
            !con.imagen_url &&
            !con.imagen_cropped_file;

        return {
            useFormData: false,
            body: {
                titulo: con.titulo,
                contenido: con.contenido,
                orden,
                imagen_crop: con.imagen_crop ?? null,
                ...(imagenEliminada && con.id_contenido ? { eliminar_imagen: true } : {}),
            },
        };
    };

    /* ── handleCrear ── */
    const handleCrear = async () => {
        const fd = new FormData();
        fd.append("titulo", infoCurso.titulo.trim());
        if (infoCurso.descripcion) fd.append("descripcion", infoCurso.descripcion.trim());
        if (infoCurso.perfil_vark) fd.append("perfil_vark", infoCurso.perfil_vark);
        if (infoCurso.id_dimension) fd.append("id_dimension", infoCurso.id_dimension);
        if (infoCurso.foto_file) {
            fd.append("foto", infoCurso.foto_file);
        } else if (infoCurso.foto_preview?.startsWith("data:")) {
            const fileRecuperado = base64ToFile(infoCurso.foto_preview, "portada.jpg");
            if (fileRecuperado) fd.append("foto", fileRecuperado);
        }
        const { data: dc } = await api.post("/cursos/cursos", fd);
        if (!dc.ok) throw new Error(dc.mensaje);
        const id_curso = dc.id_curso;

        for (let i = 0; i < secciones.length; i++) {
            const sec = secciones[i];
            const { data: ds } = await api.post(`/cursos/cursos/${id_curso}/secciones`, {
                titulo_seccion: sec.titulo_seccion,
                descripcion_seccion: sec.descripcion_seccion || "",
                orden: i + 1,
            });
            if (!ds.ok) throw new Error(ds.mensaje);
            const id_seccion = ds.id_seccion;

            for (let j = 0; j < sec.contenidos.length; j++) {
                const con = sec.contenidos[j];
                const payload = await buildContenidoPayload(con, id_seccion, j + 1);
                const { data: dcon } = payload.useFormData
                    ? await api.post(`/cursos/secciones/${id_seccion}/contenidos`, payload.fd)
                    : await api.post(`/cursos/secciones/${id_seccion}/contenidos`, payload.body);
                if (!dcon.ok) throw new Error(dcon.mensaje);
            }

            if (sec.mostrarTest) {
                for (const preg of sec.preguntas) {
                    const { data: dp } = await api.post(`/cursos/secciones/${id_seccion}/preguntas`, {
                        texto_pregunta: preg.texto_pregunta,
                        opciones: preg.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: o.es_correcta })),
                    });
                    if (!dp.ok) throw new Error(dp.mensaje);
                }
            }
        }
    };

    /* ── handleEditar ── */
    const handleEditar = async () => {
        const fd = new FormData();
        fd.append("titulo", infoCurso.titulo.trim());
        fd.append("descripcion", infoCurso.descripcion?.trim() || "");
        fd.append("perfil_vark", infoCurso.perfil_vark || "");
        fd.append("id_dimension", infoCurso.id_dimension || "");

        if (infoCurso.foto_file) {
            fd.append("foto", infoCurso.foto_file);
        } else if (!infoCurso.foto_preview && !infoCurso.foto_url) {
            fd.append("eliminar_foto", "true");
        }

        const { data: dc } = await api.put(`/cursos/cursos/${id}`, fd);
        if (!dc.ok) throw new Error(dc.mensaje);

        const idsAct = secciones.filter((s) => s.id_seccion).map((s) => s.id_seccion);
        for (const so of seccionesOriginales)
            if (!idsAct.includes(so.id_seccion)) await api.delete(`/cursos/secciones/${so.id_seccion}`);

        for (let i = 0; i < secciones.length; i++) {
            const sec = secciones[i];
            let id_seccion;
            if (sec.id_seccion) {
                await api.put(`/cursos/secciones/${sec.id_seccion}`, {
                    titulo_seccion: sec.titulo_seccion,
                    descripcion_seccion: sec.descripcion_seccion || "",
                    orden: i + 1,
                });
                id_seccion = sec.id_seccion;
            } else {
                const { data: ds } = await api.post(`/cursos/cursos/${id}/secciones`, {
                    titulo_seccion: sec.titulo_seccion,
                    descripcion_seccion: sec.descripcion_seccion || "",
                    orden: i + 1,
                });
                if (!ds.ok) throw new Error(ds.mensaje);
                id_seccion = ds.id_seccion;
            }

            const so = seccionesOriginales.find((s) => s.id_seccion === sec.id_seccion);
            const cAct = sec.contenidos.filter((c) => c.id_contenido).map((c) => c.id_contenido);
            for (const co of so?.contenidos || [])
                if (!cAct.includes(co.id_contenido)) await api.delete(`/cursos/contenidos/${co.id_contenido}`);

            for (let j = 0; j < sec.contenidos.length; j++) {
                const con = sec.contenidos[j];
                const payload = await buildContenidoPayload(con, id_seccion, j + 1);
                if (con.id_contenido) {
                    payload.useFormData
                        ? await api.put(`/cursos/contenidos/${con.id_contenido}`, payload.fd)
                        : await api.put(`/cursos/contenidos/${con.id_contenido}`, payload.body);
                } else {
                    const { data: dcon } = payload.useFormData
                        ? await api.post(`/cursos/secciones/${id_seccion}/contenidos`, payload.fd)
                        : await api.post(`/cursos/secciones/${id_seccion}/contenidos`, payload.body);
                    if (!dcon.ok) throw new Error(dcon.mensaje);
                }
            }

            const preguntasOriginales = so?.preguntas || [];
            const hayPreguntasEnBD = preguntasOriginales.length > 0;

            if (!sec.mostrarTest && hayPreguntasEnBD) {
                await api.delete(`/cursos/secciones/${id_seccion}/cuestionario`);
            } else if (sec.mostrarTest) {
                if (!tieneInscritos || !hayPreguntasEnBD) {
                    const pAct = sec.preguntas.filter((p) => p.id_test).map((p) => p.id_test);
                    for (const po of preguntasOriginales)
                        if (!pAct.includes(po.id_test)) await api.delete(`/cursos/preguntas/${po.id_test}`);

                    for (const preg of sec.preguntas) {
                        if (preg.id_test) {
                            const original = preguntasOriginales.find((p) => p.id_test === preg.id_test);
                            const cambio = !original ||
                                original.texto_pregunta !== preg.texto_pregunta ||
                                JSON.stringify(original.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: Boolean(o.es_correcta) }))) !==
                                JSON.stringify(preg.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: Boolean(o.es_correcta) })));
                            if (cambio) {
                                await api.put(`/cursos/preguntas/${preg.id_test}`, {
                                    texto_pregunta: preg.texto_pregunta,
                                    opciones: preg.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: o.es_correcta })),
                                });
                            }
                        } else {
                            const { data: dp } = await api.post(`/cursos/secciones/${id_seccion}/preguntas`, {
                                texto_pregunta: preg.texto_pregunta,
                                opciones: preg.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: o.es_correcta })),
                            });
                            if (!dp.ok) throw new Error(dp.mensaje);
                        }
                    }
                } else {
                    for (const preg of sec.preguntas.filter((p) => !p.id_test)) {
                        const { data: dp } = await api.post(`/cursos/secciones/${id_seccion}/preguntas`, {
                            texto_pregunta: preg.texto_pregunta,
                            opciones: preg.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: o.es_correcta })),
                        });
                        if (!dp.ok) throw new Error(dp.mensaje);
                    }
                }
            }
        }
    };

    /* ── handleGuardar ── */
    const handleGuardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            if (modoEdicion) {
                await handleEditar();
                limpiarBorrador(id);
            } else {
                await handleCrear();
                limpiarBorrador(null);
            }
            setIsDirty(false);
            setShowSuccessAlert(true);
        } catch (err) {
            setError(err.response?.data?.mensaje || err.message || "Ocurrió un error al guardar.");
        } finally {
            setGuardando(false);
        }
    };

    /* ── showErrors derivado ── */
    const showErrors = erroresPorPaso[paso] ?? false;

    return {
        // Routing / modo
        id,
        modoEdicion,
        navigate,

        // Estado de UI
        paso,
        setPaso,
        guardando,
        cargando,
        error,
        setError,
        showErrors,

        // Datos
        infoCurso,
        setInfoCurso,
        secciones,
        setSecciones,
        dimensiones,
        tieneInscritos,
        seccionActivaIdx,
        setSeccionActivaIdx,

        // Validación
        tituloDuplicado,
        setTituloDuplicado,

        // Modales
        modalSalirOpen,
        setModalSalirOpen,
        modalElimPortada,
        setModalElimPortada,
        showSuccessAlert,
        setShowSuccessAlert,

        // Handlers
        handleInfoChange,
        handleSalir,
        handleNext,
        handlePrev,
        handleGuardar,

        // Utils expuestos para la vista
        limpiarBorrador,
    };
}