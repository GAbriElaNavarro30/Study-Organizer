import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    IoArrowBackOutline, IoCloudUploadOutline, IoAddOutline, IoTrashOutline,
    IoCheckmarkOutline, IoImageOutline, IoHelpCircleOutline, IoCheckmarkCircle,
    IoEllipseOutline, IoCloseOutline, IoAlertCircleOutline, IoBookOutline,
    IoLayersOutline, IoEyeOutline, IoSparkles, IoCopyOutline,
    IoDocumentTextOutline, IoSchoolOutline, IoBrushOutline, IoListOutline,
    IoChevronDownOutline, IoChevronForwardOutline, IoChevronBackOutline,
} from "react-icons/io5";
import api from "../services/api";
import "../styles/EditorCurso.css";
import { ContentImageUpload } from "../components/ContentImageUpload_new";
import { ModalConfirmarSalir } from "../components/ModalConfirmarSalir";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const VARK_OPTIONS = [
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

const PLACEHOLDER_PALETTES = [
    { bg: "#DBEAFE", text: "#1E40AF" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#EDE9FE", text: "#5B21B6" },
    { bg: "#FEF3C7", text: "#92400E" },
    { bg: "#CFFAFE", text: "#155E75" },
    { bg: "#FFE4E6", text: "#9F1239" },
    { bg: "#DCFCE7", text: "#14532D" },
];

const getPlaceholderPalette = (titulo = "") => {
    const idx = (titulo.charCodeAt(0) || 65) % PLACEHOLDER_PALETTES.length;
    return PLACEHOLDER_PALETTES[idx];
};

const getInitials = (titulo = "") =>
    titulo.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";

const fmtDate = (iso) => {
    if (!iso) return new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const STEPS = [
    { id: 1, label: "Curso", icon: IoBookOutline },
    { id: 2, label: "Contenido", icon: IoLayersOutline },
    { id: 3, label: "Crear", icon: IoEyeOutline },
];

const uuid = () => crypto.randomUUID();
const crearContenidoVacio = () => ({ _id: uuid(), titulo: "", contenido: "", imagen_file: null, imagen_preview: null, imagen_url: "", imagen_crop: null, imagen_cropped_preview: null });
const crearOpcionVacia = () => ({ _id: uuid(), texto_opcion: "", es_correcta: false });
const crearPreguntaVacia = () => ({ _id: uuid(), texto_pregunta: "", opciones: [crearOpcionVacia(), crearOpcionVacia()] });
const crearSeccionVacia = () => ({
    _id: uuid(), titulo_seccion: "", descripcion_seccion: "",
    contenidos: [crearContenidoVacio()], preguntas: [], mostrarTest: false,
});

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ─────────────────────────────────────────────────────────
   HELPERS — base64
───────────────────────────────────────────────────────── */
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
    });

const base64ToFile = (base64, filename = "imagen.jpg") => {
    try {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    } catch {
        return null;
    }
};

/* ─────────────────────────────────────────────────────────
   LOCAL STORAGE — BORRADOR
   Claves separadas para modo crear vs. modo editar (por id)
───────────────────────────────────────────────────────── */
const STORAGE_KEY_INFO = "ec_infoCurso";
const STORAGE_KEY_SECCIONES = "ec_secciones";
const STORAGE_KEY_PASO = "ec_paso";
const STORAGE_KEY_SECCION_ACTIVA = "ec_seccion_activa";
const STORAGE_KEY_EDIT_PREFIX = "ec_edit_";

/** Devuelve las claves de localStorage según si es edición o creación */
const getStorageKeys = (cursoId = null) => ({
    info: cursoId
        ? `${STORAGE_KEY_EDIT_PREFIX}info_${cursoId}`
        : STORAGE_KEY_INFO,
    secciones: cursoId
        ? `${STORAGE_KEY_EDIT_PREFIX}secs_${cursoId}`
        : STORAGE_KEY_SECCIONES,
    paso: cursoId
        ? `${STORAGE_KEY_EDIT_PREFIX}paso_${cursoId}`
        : STORAGE_KEY_PASO,
    seccionActiva: cursoId
        ? `${STORAGE_KEY_EDIT_PREFIX}secact_${cursoId}`
        : STORAGE_KEY_SECCION_ACTIVA,
});

/**
 * Guarda el borrador en localStorage.
 * - Las imágenes de contenido se convierten a base64 si son File/blob.
 * - La foto de portada también.
 * - cursoId: null → modo crear, string/number → modo editar
 * - paso: número del paso activo
 * - seccionActiva: índice de la sección activa en el paso 2
 */
const guardarBorrador = async (info, secs, cursoId = null, paso = null, seccionActiva = null) => {
    try {
        const keys = getStorageKeys(cursoId);

        // ── Portada ──
        const fotoPreviewGuardable =
            info.foto_preview?.startsWith("data:") ? info.foto_preview : null;

        const infoLimpia = {
            ...info,
            foto_file: null,
            foto_preview: fotoPreviewGuardable,
        };

        // ── Secciones: convertir imágenes de contenido a base64 ──
        const seccionesLimpias = await Promise.all(
            secs.map(async (s) => ({
                ...s,
                contenidos: await Promise.all(
                    s.contenidos.map(async (c) => {
                        let imagenPersistible =
                            c.imagen_cropped_preview?.startsWith("data:")
                                ? c.imagen_cropped_preview
                                : c.imagen_url || null;

                        // Prioridad 1: archivo recortado nuevo
                        if (c.imagen_cropped_file instanceof File) {
                            try {
                                imagenPersistible = await fileToBase64(c.imagen_cropped_file);
                            } catch { /* mantener valor anterior */ }
                        }
                        // Prioridad 2: preview ya es base64
                        else if (c.imagen_preview?.startsWith("data:")) {
                            imagenPersistible = c.imagen_preview;
                        }
                        // Prioridad 3: preview es blob pero tenemos el File
                        else if (
                            c.imagen_preview?.startsWith("blob:") &&
                            c.imagen_file instanceof File
                        ) {
                            try {
                                imagenPersistible = await fileToBase64(c.imagen_file);
                            } catch { /* mantener valor anterior */ }
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

        // ── Persistir paso activo y sección activa ──
        if (paso !== null) localStorage.setItem(keys.paso, String(paso));
        if (seccionActiva !== null) localStorage.setItem(keys.seccionActiva, String(seccionActiva));

    } catch (e) {
        console.error("Error guardando borrador:", e);
    }
};

/** Carga el borrador desde localStorage */
const cargarBorrador = (cursoId = null) => {
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
    } catch {
        return { info: null, secciones: null, paso: null, seccionActiva: null };
    }
};

/** Elimina el borrador de localStorage */
const limpiarBorrador = (cursoId = null) => {
    try {
        const keys = getStorageKeys(cursoId);
        localStorage.removeItem(keys.info);
        localStorage.removeItem(keys.secciones);
        localStorage.removeItem(keys.paso);
        localStorage.removeItem(keys.seccionActiva);
    } catch { }
};

/* ─────────────────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────────────────── */
const StepIndicator = ({ paso }) => (
    <div className="ec-steps">
        {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = s.id < paso;
            const active = s.id === paso;
            return (
                <div key={s.id} className="ec-step-item">
                    <div className={`ec-step-dot ${active ? "active" : ""} ${done ? "done" : ""}`}>
                        {done ? <IoCheckmarkOutline size={11} /> : <Icon size={11} />}
                    </div>
                    <span className={`ec-step-label ${active ? "active" : ""}`}>{s.label}</span>
                    {i < STEPS.length - 1 && <div className={`ec-step-line ${done ? "done" : ""}`} />}
                </div>
            );
        })}
    </div>
);

/* ─────────────────────────────────────────────────────────
   IMAGE ADJUST
───────────────────────────────────────────────────────── */
const ImageAdjust = ({ src, zoom, posX, posY, onZoom, onPosX, onPosY, height = 220 }) => {
    const dragging = useRef(false);
    const last = useRef({ x: 0, y: 0 });

    const startDrag = (e) => {
        dragging.current = true;
        last.current = {
            x: e.touches ? e.touches[0].clientX : e.clientX,
            y: e.touches ? e.touches[0].clientY : e.clientY,
        };
    };

    const onMove = useCallback((e) => {
        if (!dragging.current) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = cx - last.current.x;
        const dy = cy - last.current.y;
        last.current = { x: cx, y: cy };
        onPosX(clamp(posX - dx * 0.08, 0, 100));
        onPosY(clamp(posY - dy * 0.08, 0, 100));
    }, [posX, posY, onPosX, onPosY]);

    const stopDrag = () => { dragging.current = false; };

    useEffect(() => {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", stopDrag);
        window.addEventListener("touchmove", onMove, { passive: true });
        window.addEventListener("touchend", stopDrag);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", stopDrag);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", stopDrag);
        };
    }, [onMove]);

    return (
        <div className="img-adjust-root">
            <div className="img-preview-box" style={{ height }}
                onMouseDown={startDrag} onTouchStart={startDrag}>
                <img src={src} alt="preview" className="img-preview-img" draggable={false}
                    style={{
                        transform: `scale(${zoom})`,
                        objectPosition: `${posX}% ${posY}%`,
                        transformOrigin: `${posX}% ${posY}%`,
                    }} />
                <div className="img-drag-hint">Arrastra para mover</div>
            </div>
            <div className="img-adjust-controls">
                <div className="img-ctrl-row">
                    <span className="img-ctrl-label">Zoom</span>
                    <input type="range" min="1" max="3" step="0.05" value={zoom}
                        onChange={(e) => onZoom(parseFloat(e.target.value))} className="img-ctrl-slider" />
                    <span className="img-ctrl-val">{Math.round(zoom * 100)}%</span>
                </div>
                <button className="img-ctrl-reset" onClick={() => { onZoom(1); onPosX(50); onPosY(50); }}>
                    Restablecer
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   IMAGE UPLOAD ZONE
───────────────────────────────────────────────────────── */
const ImageUploadZone = ({
    preview, url, zoom, posX, posY, onUpdate,
    height = 220,
    label = "Arrastra o haz clic para subir",
    hint = "JPG, PNG, WEBP — máx. 5 MB",
}) => {
    const inputRef = useRef();
    const [drag, setDrag] = useState(false);

    const processFile = (file) => {
        if (!file?.type.startsWith("image/")) return;
        onUpdate({ imagen_file: file, imagen_preview: URL.createObjectURL(file), imagen_zoom: 1, imagen_pos_x: 50, imagen_pos_y: 50 });
    };

    const current = preview || url;

    return (
        <div className="img-upload-root">
            {current ? (
                <>
                    <ImageAdjust
                        src={current} zoom={zoom ?? 1} posX={posX ?? 50} posY={posY ?? 50}
                        onZoom={(v) => onUpdate({ imagen_zoom: v })}
                        onPosX={(v) => onUpdate({ imagen_pos_x: v })}
                        onPosY={(v) => onUpdate({ imagen_pos_y: v })}
                        height={height}
                    />
                    <div className="img-upload-actions">
                        <button className="img-action-btn" onClick={() => inputRef.current.click()}>
                            <IoCloudUploadOutline size={13} /> Cambiar imagen
                        </button>
                        <button className="img-action-btn img-action-btn--danger"
                            onClick={() => onUpdate({ imagen_file: null, imagen_preview: null, imagen_url: "", imagen_zoom: 1, imagen_pos_x: 50, imagen_pos_y: 50 })}>
                            <IoTrashOutline size={13} /> Eliminar
                        </button>
                    </div>
                </>
            ) : (
                <div className={`img-drop-zone ${drag ? "dragging" : ""}`} style={{ height }}
                    onClick={() => inputRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); }}>
                    <IoImageOutline size={26} />
                    <p>{label}</p>
                    <small>{hint}</small>
                </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => processFile(e.target.files[0])} />
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   VARK SELECTOR
───────────────────────────────────────────────────────── */
const VarkSelector = ({ value, onChange, required }) => (
    <div className="vark-root">
        <div className="vark-grid">
            {VARK_OPTIONS.map((v) => {
                const sel = value === v.value;
                return (
                    <button key={v.value} type="button"
                        className={`vark-tile ${sel ? "selected" : ""}`}
                        style={sel ? { background: v.bg, borderColor: v.border, color: v.accent } : {}}
                        onClick={() => onChange(sel ? "" : v.value)}>
                        <span className="vark-letter" style={sel ? { color: v.accent } : {}}>{v.letter}</span>
                        <span className="vark-name">{v.label}</span>
                        {sel && <IoCheckmarkCircle size={14} className="vark-check" style={{ color: v.accent }} />}
                    </button>
                );
            })}
        </div>
        {required && !value && (
            <p className="field-error-msg">
                <IoAlertCircleOutline size={13} /> Selecciona un perfil VARK para continuar
            </p>
        )}
    </div>
);

/* ─────────────────────────────────────────────────────────
   COURSE CARD LIVE PREVIEW
───────────────────────────────────────────────────────── */
const CourseCardPreview = ({ datos, secciones, dimensiones }) => {
    const palette = getPlaceholderPalette(datos.titulo);
    const initials = getInitials(datos.titulo);
    const current = datos.foto_preview || datos.foto_url;
    const vark = VARK_OPTIONS.find((v) => v.value === datos.perfil_vark);
    const dim = dimensiones.find((d) => String(d.id_dimension) === String(datos.id_dimension));
    const totalBloques = secciones.reduce((acc, s) => acc + s.contenidos.length, 0);

    return (
        <div className="cover-card-preview">
            <div className="cover-card-cover">
                {current ? (
                    <img src={current} alt="portada" className="cover-card-cover-img"
                        style={{
                            transform: `scale(${datos.foto_zoom ?? 1})`,
                            objectPosition: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%`,
                            transformOrigin: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%`,
                        }}
                    />
                ) : (
                    <div className="cover-card-placeholder" style={{ background: palette.bg }}>
                        <span className="cover-card-initials" style={{ color: palette.text }}>{initials}</span>
                    </div>
                )}
                <div className="cover-card-overlay">
                    <span className="cover-status-badge cover-status-badge--draft">
                        <IoEllipseOutline size={9} /> Borrador
                    </span>
                    <div className="cover-menu-stub">···</div>
                </div>
            </div>
            <div className="cover-card-body">
                <p className="cover-card-title">
                    {datos.titulo.trim() || <em style={{ color: "#94A3B8", fontWeight: 400 }}>Sin título</em>}
                </p>
                {dim && <span className="cover-dim-badge"><IoLayersOutline size={10} /> {dim.nombre_dimension}</span>}
                {datos.descripcion && (
                    <p className="cover-card-desc">
                        {datos.descripcion.length > 80 ? datos.descripcion.slice(0, 80) + "…" : datos.descripcion}
                    </p>
                )}
            </div>
            <div className="cover-card-footer">
                <div className="cover-card-stats">
                    <div className="cover-card-stat">
                        <span className="cover-stat-val">{secciones.length}</span>
                        <span className="cover-stat-lbl">Secciones</span>
                    </div>
                    <div className="cover-card-stat">
                        <span className="cover-stat-val">{totalBloques}</span>
                        <span className="cover-stat-lbl">Bloques</span>
                    </div>
                    <div className="cover-card-stat">
                        <span className="cover-stat-val">0</span>
                        <span className="cover-stat-lbl">Estudiantes</span>
                    </div>
                </div>
                <div className="cover-card-meta">
                    {vark ? (
                        <span className="cover-vark-pill" style={{ background: vark.bg, color: vark.accent }}>◆ {vark.label}</span>
                    ) : (
                        <span style={{ fontSize: 11, color: "#CBD5E1" }}>Sin VARK</span>
                    )}
                    <span className="cover-card-date">{fmtDate()}</span>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   STEP 1
───────────────────────────────────────────────────────── */
const StepInfo = ({ datos, onChange, dimensiones, secciones, showErrors, tituloDuplicado, onLimpiarDuplicado }) => (
    <div className="ec-panel">
        <div className="step1-grid">
            <div className="panel-section step1-cover-section">
                <div className="section-header">
                    <div className="section-tag-row">
                        <span className="section-num">01</span>
                        <h3 className="section-title">Portada del curso</h3>
                    </div>
                    <p className="section-desc">Así se verá tu curso en el panel de cursos.</p>
                </div>
                <ImageUploadZone
                    preview={datos.foto_preview} url={datos.foto_url}
                    zoom={datos.foto_zoom} posX={datos.foto_pos_x} posY={datos.foto_pos_y}
                    height={150}
                    label="Sube la imagen de portada"
                    hint="Ajusta con zoom y arrastra"
                    onUpdate={(u) => {
                        if (u.imagen_file !== undefined) onChange("foto_file", u.imagen_file);
                        if (u.imagen_preview !== undefined) onChange("foto_preview", u.imagen_preview);
                        if (u.imagen_url !== undefined) onChange("foto_url", u.imagen_url);
                        if (u.imagen_zoom !== undefined) onChange("foto_zoom", u.imagen_zoom);
                        if (u.imagen_pos_x !== undefined) onChange("foto_pos_x", u.imagen_pos_x);
                        if (u.imagen_pos_y !== undefined) onChange("foto_pos_y", u.imagen_pos_y);
                    }}
                />
            </div>

            <div className="panel-section step1-info-section">
                <div className="section-header">
                    <div className="section-tag-row">
                        <span className="section-num">02</span>
                        <h3 className="section-title">Información básica</h3>
                    </div>
                </div>
                <div className="ec-field">
                    <label className="ec-label">
                        <IoDocumentTextOutline size={13} /> Título del curso <span className="req">*</span>
                    </label>
                    <input
                        className={`ec-input ${(showErrors && (!datos.titulo.trim() || datos.titulo.trim().length < 5 || datos.titulo.trim().length > 200)) || tituloDuplicado ? "input-error" : ""}`}
                        value={datos.titulo}
                        onChange={(e) => { onChange("titulo", e.target.value); onLimpiarDuplicado(); }}
                        placeholder="Ej. Diseño UX para principiantes"
                        maxLength={200}
                    />
                    <span className="ec-counter">{datos.titulo.length}/200</span>
                    {showErrors && !datos.titulo.trim() && (
                        <p className="field-error-msg"><IoAlertCircleOutline size={13} /> El título es obligatorio</p>
                    )}
                    {showErrors && datos.titulo.trim().length > 0 && datos.titulo.trim().length < 5 && (
                        <p className="field-error-msg"><IoAlertCircleOutline size={13} /> Mínimo 5 caracteres</p>
                    )}
                    {tituloDuplicado && (
                        <p className="field-error-msg"><IoAlertCircleOutline size={13} /> Ya tienes un curso con ese título</p>
                    )}
                </div>
                <div className="ec-field">
                    <label className="ec-label">
                        <IoCopyOutline size={13} /> Descripción <span className="opt">(opcional)</span>
                    </label>
                    <textarea
                        className={`ec-input ec-textarea ${showErrors && datos.descripcion.length > 500 ? "input-error" : ""}`}
                        value={datos.descripcion}
                        onChange={(e) => onChange("descripcion", e.target.value)}
                        placeholder="¿Qué aprenderán los estudiantes?"
                        rows={4}
                        maxLength={500}
                    />
                    <span className="ec-counter">{datos.descripcion.length}/500</span>
                </div>
                <div className="ec-field">
                    <label className="ec-label">
                        <IoSchoolOutline size={13} /> Dimensión de aprendizaje <span className="opt">(opcional)</span>
                    </label>
                    <select className="ec-input ec-select" value={datos.id_dimension}
                        onChange={(e) => onChange("id_dimension", e.target.value)}>
                        <option value="">— Sin dimensión asignada —</option>
                        {dimensiones.map((d) => (
                            <option key={d.id_dimension} value={d.id_dimension}>{d.nombre_dimension}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="panel-section">
            <div className="section-header">
                <div className="section-tag-row">
                    <span className="section-num">03</span>
                    <h3 className="section-title">Perfil VARK <span className="req">*</span></h3>
                </div>
                <p className="section-desc">Define el estilo de aprendizaje al que está orientado este curso.</p>
            </div>
            <VarkSelector value={datos.perfil_vark} onChange={(v) => onChange("perfil_vark", v)} required={showErrors} />
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────
   CONTENT BLOCK
───────────────────────────────────────────────────────── */
const ContentBlock = ({ con, index, onUpdate, onDelete, canDelete, showErrors }) => (
    <div className="content-block">
        <div className="content-block-header">
            <div className="content-block-tag">
                <IoDocumentTextOutline size={11} />
                Bloque {index + 1}
            </div>
            {canDelete && (
                <button className="btn-icon-sm danger" onClick={onDelete} title="Eliminar bloque">
                    <IoTrashOutline size={13} />
                </button>
            )}
        </div>
        <div className="content-block-body">
            <input
                className="ec-input ec-input-sm"
                value={con.titulo}
                onChange={(e) => onUpdate({ titulo: e.target.value })}
                placeholder="Título del bloque (opcional)"
            />
            <textarea
                className="ec-input ec-textarea ec-textarea-sm"
                value={con.contenido}
                onChange={(e) => onUpdate({ contenido: e.target.value })}
                placeholder="Escribe el contenido aquí…"
                rows={4}
            />
            <div className="content-block-image">
                <p className="content-image-label">
                    <IoImageOutline size={12} /> Imagen <span className="opt">(opcional)</span>
                </p>
                <ContentImageUpload con={con} onUpdate={onUpdate} />
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────
   QUESTION CARD
───────────────────────────────────────────────────────── */
const QuestionCard = ({ preg, index, onUpdate, onDelete, showErrors }) => {
    const preguntaVacia = showErrors && !preg.texto_pregunta.trim();
    const sinCorrecta = showErrors && !preg.opciones.some((o) => o.es_correcta);

    return (
        <div className={`question-card ${preguntaVacia || sinCorrecta ? "block-has-error" : ""}`}>
            <div className="question-header">
                <div className="question-num-badge">
                    <IoHelpCircleOutline size={11} /> P{index + 1}
                </div>
                <button className="btn-icon-sm danger" onClick={onDelete}>
                    <IoTrashOutline size={12} />
                </button>
            </div>
            <div className="ec-field">
                <input
                    className={`ec-input ec-input-sm ${preguntaVacia ? "input-error" : ""}`}
                    value={preg.texto_pregunta}
                    onChange={(e) => onUpdate({ ...preg, texto_pregunta: e.target.value })}
                    placeholder="Escribe la pregunta…"
                />
                {preguntaVacia && (
                    <p className="field-error-msg"><IoAlertCircleOutline size={13} /> La pregunta es obligatoria</p>
                )}
            </div>
            <div className="options-list">
                {preg.opciones.map((op, oi) => {
                    const opcionVacia = showErrors && !op.texto_opcion.trim();
                    return (
                        <div key={op._id} className="option-row">
                            <button
                                className={`option-radio ${op.es_correcta ? "correct" : ""}`}
                                onClick={() => onUpdate({
                                    ...preg,
                                    opciones: preg.opciones.map((o) => ({ ...o, es_correcta: o._id === op._id })),
                                })}
                                title="Marcar como correcta">
                                {op.es_correcta ? <IoCheckmarkCircle size={18} /> : <IoEllipseOutline size={18} />}
                            </button>
                            <div style={{ flex: 1 }}>
                                <input
                                    className={`ec-input ec-input-sm option-input ${opcionVacia ? "input-error" : ""}`}
                                    value={op.texto_opcion}
                                    onChange={(e) => onUpdate({
                                        ...preg,
                                        opciones: preg.opciones.map((o) =>
                                            o._id === op._id ? { ...o, texto_opcion: e.target.value } : o
                                        ),
                                    })}
                                    placeholder={`Opción ${oi + 1}`}
                                />
                                {opcionVacia && (
                                    <p className="field-error-msg"><IoAlertCircleOutline size={13} /> La opción no puede estar vacía</p>
                                )}
                            </div>
                            {preg.opciones.length > 2 && (
                                <button className="btn-icon-sm danger"
                                    onClick={() => onUpdate({
                                        ...preg,
                                        opciones: preg.opciones.filter((o) => o._id !== op._id),
                                    })}>
                                    <IoCloseOutline size={11} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            {sinCorrecta && (
                <p className="field-error-msg"><IoAlertCircleOutline size={13} /> Marca al menos una opción como correcta</p>
            )}
            <button className="btn-add-small"
                onClick={() => onUpdate({ ...preg, opciones: [...preg.opciones, crearOpcionVacia()] })}>
                <IoAddOutline size={12} /> Añadir opción
            </button>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   SECTION EDITOR PANEL
───────────────────────────────────────────────────────── */
const SeccionEditorPanel = ({ sec, index, onUpdate, showErrors }) => {
    const updCon = (cid, upd) => onUpdate({ ...sec, contenidos: sec.contenidos.map((c) => c._id === cid ? { ...c, ...upd } : c) });
    const updPreg = (pid, upd) => onUpdate({ ...sec, preguntas: sec.preguntas.map((p) => p._id === pid ? upd : p) });

    const tituloSeccionVacio = showErrors && !sec.titulo_seccion.trim();
    const tieneErrores = showErrors && (
        tituloSeccionVacio ||
        sec.preguntas.some((p) =>
            !p.texto_pregunta.trim() ||
            p.opciones.some((o) => !o.texto_opcion.trim()) ||
            !p.opciones.some((o) => o.es_correcta)
        )
    );

    return (
        <div className={`seccion-editor-panel ${tieneErrores ? "has-error" : ""}`}>
            <div className="seccion-editor-header">
                <div className="seccion-editor-title">
                    <span className="seccion-editor-num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="seccion-editor-name">
                        {sec.titulo_seccion || <em style={{ color: "#94A3B8", fontWeight: 400 }}>Sin título</em>}
                    </span>
                </div>
            </div>

            <div className="seccion-fields-grid">
                <div className="ec-field">
                    <label className="ec-label">Título de la sección <span className="req">*</span></label>
                    <input
                        className={`ec-input ${tituloSeccionVacio ? "input-error" : ""}`}
                        value={sec.titulo_seccion}
                        onChange={(e) => onUpdate({ ...sec, titulo_seccion: e.target.value })}
                        placeholder="Ej. Introducción a los fundamentos"
                    />
                    {tituloSeccionVacio && (
                        <p className="field-error-msg"><IoAlertCircleOutline size={13} /> El título es obligatorio</p>
                    )}
                </div>
                <div className="ec-field">
                    <label className="ec-label">Descripción <span className="opt">(opcional)</span></label>
                    <textarea
                        className="ec-input ec-textarea ec-textarea-sm"
                        value={sec.descripcion_seccion || ""}
                        onChange={(e) => onUpdate({ ...sec, descripcion_seccion: e.target.value })}
                        placeholder="¿Qué aprenderá el estudiante en esta sección?"
                        rows={3}
                        maxLength={300}
                    />
                    <span className="ec-counter">{(sec.descripcion_seccion || "").length}/300</span>
                </div>
            </div>

            <div className="seccion-subgroup">
                <p className="subgroup-label"><IoListOutline size={12} /> Bloques de contenido</p>
                <div className="contenidos-grid">
                    {sec.contenidos.map((con, ci) => (
                        <ContentBlock
                            key={con._id} con={con} index={ci}
                            showErrors={showErrors}
                            onUpdate={(upd) => updCon(con._id, upd)}
                            onDelete={() => onUpdate({ ...sec, contenidos: sec.contenidos.filter((c) => c._id !== con._id) })}
                            canDelete={sec.contenidos.length > 1}
                        />
                    ))}
                </div>
                <button className="btn-add-secondary"
                    onClick={() => onUpdate({ ...sec, contenidos: [...sec.contenidos, crearContenidoVacio()] })}>
                    <IoAddOutline size={13} /> Nuevo bloque de contenido
                </button>
            </div>

            <div className="seccion-subgroup">
                <div className="quiz-toggle-row">
                    <div className="quiz-toggle-info">
                        <IoHelpCircleOutline size={14} />
                        <p className="subgroup-label">Cuestionario</p>
                    </div>
                    <label className="ec-switch">
                        <input type="checkbox" checked={sec.mostrarTest}
                            onChange={(e) => onUpdate({ ...sec, mostrarTest: e.target.checked })} />
                        <span className="ec-switch-track" />
                    </label>
                </div>
                {sec.mostrarTest && (
                    <div className="quiz-body">
                        {sec.preguntas.length === 0 && (
                            <p className="quiz-empty">Agrega preguntas para este cuestionario.</p>
                        )}
                        <div className="preguntas-grid">
                            {sec.preguntas.map((preg, pi) => (
                                <QuestionCard
                                    key={preg._id} preg={preg} index={pi}
                                    showErrors={showErrors}
                                    onUpdate={(upd) => updPreg(preg._id, upd)}
                                    onDelete={() => onUpdate({ ...sec, preguntas: sec.preguntas.filter((p) => p._id !== preg._id) })}
                                />
                            ))}
                        </div>
                        <button className="btn-add-secondary"
                            onClick={() => onUpdate({ ...sec, preguntas: [...sec.preguntas, crearPreguntaVacia()] })}>
                            <IoAddOutline size={13} /> Nueva pregunta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   STEP 2
   — activaIdxExterno y onActivaChange permiten que el padre
     persista qué sección estaba activa al hacer refresh
───────────────────────────────────────────────────────── */
const StepSecciones = ({ secciones, onChange, showErrors, activaIdxExterno = 0, onActivaChange }) => {
    const [activaIdx, setActivaIdx] = useState(activaIdxExterno);

    // Sincronizar solo al montar (restaurar desde borrador)
    useEffect(() => {
        setActivaIdx(activaIdxExterno);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const cambiarActiva = (idx) => {
        setActivaIdx(idx);
        onActivaChange?.(idx);
    };

    const updSec = (id, sec) => onChange(secciones.map((s) => s._id === id ? sec : s));
    const secActiva = secciones[activaIdx] ?? secciones[0];

    const seccionTieneError = (sec) =>
        showErrors && (
            !sec.titulo_seccion.trim() ||
            sec.preguntas.some((p) =>
                !p.texto_pregunta.trim() ||
                p.opciones.some((o) => !o.texto_opcion.trim()) ||
                !p.opciones.some((o) => o.es_correcta)
            )
        );

    return (
        <div className="step2-layout">
            <div className="secciones-index">
                <div className="secciones-index-header">
                    <div className="section-tag-row">
                        <span className="section-num"><IoLayersOutline size={14} /></span>
                        <span className="secciones-index-title">Secciones</span>
                    </div>
                    <p className="secciones-index-sub">
                        {secciones.length} sección{secciones.length !== 1 ? "es" : ""}
                    </p>
                </div>
                <div className="secciones-index-list">
                    {secciones.map((sec, si) => (
                        <div
                            key={sec._id}
                            className={`seccion-index-card ${si === activaIdx ? "active" : ""} ${seccionTieneError(sec) ? "has-error" : ""}`}
                            onClick={() => cambiarActiva(si)}
                        >
                            <span className="seccion-index-num">{String(si + 1).padStart(2, "0")}</span>
                            <div className="seccion-index-info">
                                {sec.titulo_seccion
                                    ? <span className="seccion-index-name">{sec.titulo_seccion}</span>
                                    : <span className="seccion-index-name placeholder">Sin título</span>}
                                <span className="seccion-index-meta">
                                    <IoDocumentTextOutline size={10} />
                                    {sec.contenidos.length} bloque{sec.contenidos.length !== 1 ? "s" : ""}
                                    {sec.preguntas.length > 0 && <>&nbsp;·&nbsp;{sec.preguntas.length} preg.</>}
                                </span>
                            </div>
                            <div className="seccion-index-actions">
                                {secciones.length > 1 && (
                                    <button
                                        className="btn-icon-sm danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newSecs = secciones.filter((s) => s._id !== sec._id);
                                            onChange(newSecs);
                                            const newIdx = Math.min(si, newSecs.length - 1);
                                            cambiarActiva(newIdx);
                                        }}
                                        title="Eliminar sección"
                                    >
                                        <IoTrashOutline size={12} />
                                    </button>
                                )}
                                {seccionTieneError(sec) && (
                                    <IoAlertCircleOutline size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="btn-add-section"
                    onClick={() => {
                        const nueva = crearSeccionVacia();
                        onChange([...secciones, nueva]);
                        cambiarActiva(secciones.length);
                    }}>
                    <IoAddOutline size={15} /> Agregar sección
                </button>
            </div>

            <div className="seccion-editor-wrap">
                {secActiva ? (
                    <SeccionEditorPanel
                        key={secActiva._id}
                        sec={secActiva}
                        index={activaIdx}
                        showErrors={showErrors}
                        onUpdate={(upd) => updSec(secActiva._id, upd)}
                    />
                ) : (
                    <div className="seccion-editor-empty">
                        <div className="seccion-editor-empty-icon"><IoLayersOutline size={28} /></div>
                        <p className="seccion-editor-empty-text">Selecciona una sección para editarla</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   STEP 3 — PREVIEW
───────────────────────────────────────────────────────── */
const StepPreview = ({ datos, secciones, dimensiones }) => {
    const [secActiva, setSecActiva] = useState(0);
    const current = datos.foto_preview || datos.foto_url;
    const palette = getPlaceholderPalette(datos.titulo);
    const initials = getInitials(datos.titulo);
    const vark = VARK_OPTIONS.find((v) => v.value === datos.perfil_vark);
    const sec = secciones[secActiva] ?? secciones[0];

    const handlePrev = () => setSecActiva((p) => Math.max(0, p - 1));
    const handleNext = () => setSecActiva((p) => Math.min(secciones.length - 1, p + 1));

    return (
        <div className="ec-panel">
            <div className="panel-section" style={{ padding: 0, overflow: "hidden" }}>
                <div className="course-preview-root">
                    <div className="course-preview-hero">
                        {current ? (
                            <img src={current} alt="portada" className="course-preview-hero-img"
                                style={{
                                    transform: `scale(${datos.foto_zoom ?? 1})`,
                                    objectPosition: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%`,
                                    transformOrigin: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%`,
                                }}
                            />
                        ) : (
                            <div className="course-preview-hero-placeholder" style={{ background: palette.bg }}>
                                <span className="course-preview-hero-initials" style={{ color: palette.text }}>{initials}</span>
                            </div>
                        )}
                        <div className="course-preview-hero-overlay">
                            <div className="course-preview-hero-title">{datos.titulo || <em>Sin título</em>}</div>
                            <div className="course-preview-hero-meta">
                                {vark && <span className="course-preview-vark"><IoSparkles size={11} /> {vark.value} — {vark.label}</span>}
                            </div>
                            {datos.descripcion && <div className="course-preview-hero-desc">{datos.descripcion}</div>}
                        </div>
                    </div>

                    <div className="course-preview-layout">
                        <div className="course-preview-sidebar">
                            <div className="course-preview-sidebar-title">
                                <IoLayersOutline size={11} />
                                {secciones.length} sección{secciones.length !== 1 ? "es" : ""}
                            </div>
                            {secciones.map((s, i) => (
                                <button key={s._id} className={`preview-sec-btn ${i === secActiva ? "active" : ""}`} onClick={() => setSecActiva(i)}>
                                    <span className="preview-sec-btn-num">{i + 1}</span>
                                    <div className="preview-sec-btn-info">
                                        <span className="preview-sec-btn-label">{s.titulo_seccion || <em>Sin título</em>}</span>
                                        <span className="preview-sec-btn-meta">
                                            {s.contenidos.length} bloque{s.contenidos.length !== 1 ? "s" : ""}
                                            {s.preguntas.length > 0 && ` · ${s.preguntas.length} preg.`}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="course-preview-content">
                            {sec && (
                                <>
                                    <div>
                                        <div className="preview-section-title">{sec.titulo_seccion || <em>Sin título</em>}</div>
                                        {sec.descripcion_seccion && <div className="preview-section-desc">{sec.descripcion_seccion}</div>}
                                    </div>
                                    <div className="preview-blocks">
                                        {sec.contenidos.map((con) => (
                                            <div key={con._id} className="preview-block">
                                                {con.titulo && <div className="preview-block-title">{con.titulo}</div>}
                                                {con.contenido && <div className="preview-block-text">{con.contenido}</div>}
                                                {(con.imagen_cropped_preview || con.imagen_preview || con.imagen_url) && (
                                                    <img
                                                        src={con.imagen_cropped_preview || con.imagen_preview || con.imagen_url}
                                                        alt={con.titulo || "imagen"}
                                                        className="preview-block-img"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {sec.mostrarTest && sec.preguntas.length > 0 && (
                                        <div className="preview-quiz">
                                            <div className="preview-quiz-header">
                                                <IoHelpCircleOutline size={13} /> Cuestionario de la sección
                                            </div>
                                            {sec.preguntas.map((preg, pi) => (
                                                <div key={preg._id} className="preview-quiz-question">
                                                    <div className="preview-quiz-q-num">PREGUNTA {pi + 1}</div>
                                                    <div className="preview-quiz-q-text">{preg.texto_pregunta || <em>Sin pregunta</em>}</div>
                                                    <div className="preview-quiz-options">
                                                        {preg.opciones.map((op, oi) => (
                                                            <div key={op._id} className={`preview-quiz-option ${op.es_correcta ? "correct" : ""}`}>
                                                                <div className="preview-quiz-radio" />
                                                                {op.texto_opcion || `Opción ${oi + 1}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="course-preview-nav">
                        <button className="preview-nav-btn" disabled={secActiva === 0} onClick={handlePrev}>
                            <IoChevronBackOutline size={14} /> Anterior
                        </button>
                        <div className="preview-nav-progress">
                            <div className="preview-nav-dots">
                                {secciones.map((_, i) => (
                                    <div key={i}
                                        className={`preview-nav-dot ${i === secActiva ? "active" : i < secActiva ? "done" : ""}`}
                                        onClick={() => setSecActiva(i)}
                                        style={{ cursor: "pointer" }}
                                    />
                                ))}
                            </div>
                            <span>Sección {secActiva + 1} de {secciones.length}</span>
                        </div>
                        <button
                            className={`preview-nav-btn ${secActiva < secciones.length - 1 ? "preview-nav-btn--next" : ""}`}
                            disabled={secActiva === secciones.length - 1}
                            onClick={handleNext}
                        >
                            Siguiente <IoChevronForwardOutline size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export function EditorCurso() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const modoEdicion = Boolean(id);

    const [paso, setPaso] = useState(1);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(modoEdicion);
    const [error, setError] = useState(null);
    const [erroresPorPaso, setErroresPorPaso] = useState({ 1: false, 2: false });
    const showErrors = erroresPorPaso[paso] ?? false;

    const [dimensiones, setDimensiones] = useState([]);
    const [seccionesOriginales, setSeccionesOriginales] = useState([]);
    const [modalSalirOpen, setModalSalirOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [tituloDuplicado, setTituloDuplicado] = useState(false);

    // ── Estado de sección activa elevado al padre para persistirlo ──
    const [seccionActivaIdx, setSeccionActivaIdx] = useState(0);

    const initialLoadDone = useRef(false);

    const [infoCurso, setInfoCurso] = useState({
        titulo: "", descripcion: "", perfil_vark: "", id_dimension: "",
        foto_file: null, foto_preview: null, foto_url: null,
        foto_zoom: 1, foto_pos_x: 50, foto_pos_y: 50,
    });
    const [secciones, setSecciones] = useState([crearSeccionVacia()]);

    /* ──────────────────────────────────────────────────────
       CARGA INICIAL — modo CREAR: restaurar borrador
    ────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!modoEdicion) {
            const { info, secciones: secsGuardadas, paso: pasoGuardado, seccionActiva } = cargarBorrador(null);
            if (info) setInfoCurso(info);
            if (secsGuardadas) setSecciones(secsGuardadas);
            if (pasoGuardado) setPaso(pasoGuardado);
            if (seccionActiva !== null) setSeccionActivaIdx(seccionActiva);
            setTimeout(() => { initialLoadDone.current = true; }, 0);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ──────────────────────────────────────────────────────
       CARGA INICIAL — modo EDITAR: servidor + posible borrador
    ────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!modoEdicion) return;
        (async () => {
            try {
                setCargando(true);
                const { data } = await api.get(`/cursos/cursos/${id}`);
                if (!data.ok) throw new Error(data.mensaje);
                const c = data.curso;

                setSeccionesOriginales(c.secciones || []);

                const borrador = cargarBorrador(id);

                if (borrador.info) {
                    // Restaurar borrador (cambios no guardados del usuario)
                    setInfoCurso(borrador.info);
                    if (borrador.secciones) setSecciones(borrador.secciones);
                    if (borrador.paso) setPaso(borrador.paso);
                    if (borrador.seccionActiva !== null) setSeccionActivaIdx(borrador.seccionActiva);
                } else {
                    // Sin borrador: cargar datos frescos del servidor
                    setInfoCurso({
                        titulo: c.titulo || "",
                        descripcion: c.descripcion || "",
                        perfil_vark: c.perfil_vark || "",
                        id_dimension: c.id_dimension ? String(c.id_dimension) : "",
                        foto_file: null,
                        foto_preview: c.foto || null,
                        foto_url: c.foto || null,
                        foto_zoom: 1,
                        foto_pos_x: 50,
                        foto_pos_y: 50,
                    });

                    if (c.secciones?.length > 0) {
                        setSecciones(
                            c.secciones.map((s) => ({
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
                            }))
                        );
                    }
                }
            } catch (err) {
                setError(err.response?.data?.mensaje || err.message);
            } finally {
                setCargando(false);
                setTimeout(() => { initialLoadDone.current = true; }, 0);
            }
        })();
    }, [id, modoEdicion]);

    /* ──────────────────────────────────────────────────────
       AUTO-GUARDAR BORRADOR
       Un único efecto unificado que persiste info, secciones,
       paso activo y sección activa en localStorage.
    ────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!initialLoadDone.current) return;
        setIsDirty(true);
        guardarBorrador(infoCurso, secciones, modoEdicion ? id : null, paso, seccionActivaIdx);
    }, [infoCurso, secciones, paso, seccionActivaIdx]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ──────────────────────────────────────────────────────
       DIMENSIONES
    ────────────────────────────────────────────────────── */
    useEffect(() => {
        api.get("/cursos/dimensiones")
            .then(({ data }) => { if (data.ok) setDimensiones(data.dimensiones); })
            .catch(console.error);
    }, []);

    /* ──────────────────────────────────────────────────────
       handleInfoChange
    ────────────────────────────────────────────────────── */
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

    const canAdvance = () => {
        if (paso === 1) {
            return infoCurso.titulo.trim().length >= 5 &&
                infoCurso.titulo.trim().length <= 200 &&
                infoCurso.perfil_vark.length > 0;
        }
        if (paso === 2) return secciones.every(
            (s) => s.titulo_seccion.trim() &&
                s.preguntas.every((p) =>
                    p.texto_pregunta.trim() &&
                    p.opciones.every((o) => o.texto_opcion.trim()) &&
                    p.opciones.some((o) => o.es_correcta)
                )
        );
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

    /* ──────────────────────────────────────────────────────
       BUILD CONTENIDO PAYLOAD
    ────────────────────────────────────────────────────── */
    const buildContenidoPayload = async (con, id_seccion, orden) => {
        if (con.imagen_cropped_file) {
            const fd = new FormData();
            fd.append("titulo", con.titulo);
            fd.append("contenido", con.contenido);
            fd.append("orden", orden);
            fd.append("imagen", con.imagen_cropped_file, "imagen_recortada.jpg");
            return { useFormData: true, fd };
        }

        if (
            con.imagen_cropped_preview?.startsWith("data:") &&
            !con.imagen_url
        ) {
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

        return {
            useFormData: false,
            body: {
                titulo: con.titulo,
                contenido: con.contenido,
                orden,
                imagen_crop: con.imagen_crop ?? null,
            },
        };
    };

    /* ──────────────────────────────────────────────────────
       CREAR CURSO
    ────────────────────────────────────────────────────── */
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

            for (const preg of sec.preguntas) {
                const { data: dp } = await api.post(`/cursos/secciones/${id_seccion}/preguntas`, {
                    texto_pregunta: preg.texto_pregunta,
                    opciones: preg.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: o.es_correcta })),
                });
                if (!dp.ok) throw new Error(dp.mensaje);
            }
        }
    };

    /* ──────────────────────────────────────────────────────
       EDITAR CURSO
    ────────────────────────────────────────────────────── */
    const handleEditar = async () => {
        const fd = new FormData();
        fd.append("titulo", infoCurso.titulo.trim());
        fd.append("descripcion", infoCurso.descripcion?.trim() || "");
        fd.append("perfil_vark", infoCurso.perfil_vark || "");
        fd.append("id_dimension", infoCurso.id_dimension || "");
        if (infoCurso.foto_file) fd.append("foto", infoCurso.foto_file);

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

            const pAct = sec.preguntas.filter((p) => p.id_test).map((p) => p.id_test);
            for (const po of so?.preguntas || [])
                if (!pAct.includes(po.id_test)) await api.delete(`/cursos/preguntas/${po.id_test}`);

            for (const preg of sec.preguntas) {
                if (preg.id_test) {
                    const original = so?.preguntas?.find((p) => p.id_test === preg.id_test);
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
        }
    };

    /* ──────────────────────────────────────────────────────
       GUARDAR (crear o editar)
    ────────────────────────────────────────────────────── */
    const handleGuardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            if (modoEdicion) {
                await handleEditar();
                limpiarBorrador(id);
                setIsDirty(false);
                navigate("/cursos-tutor");
            } else {
                await handleCrear();
                limpiarBorrador(null);
                setIsDirty(false);
                setShowSuccessAlert(true);
            }
        } catch (err) {
            setError(err.response?.data?.mensaje || err.message || "Ocurrió un error al guardar.");
        } finally {
            setGuardando(false);
        }
    };

    /* ──────────────────────────────────────────────────────
       RENDER — Loading
    ────────────────────────────────────────────────────── */
    if (cargando) return (
        <div className="ec-root">
            <div className="ec-loading">
                <div className="ec-spinner" />
                <p>Cargando curso…</p>
            </div>
        </div>
    );

    /* ──────────────────────────────────────────────────────
       RENDER — Main
    ────────────────────────────────────────────────────── */
    return (
        <div className="ec-root">
            <header className="ec-topbar">
                <button className="ec-back-btn" onClick={handleSalir}>
                    <IoArrowBackOutline size={15} /><span>Volver</span>
                </button>
                <div className="ec-topbar-center"><StepIndicator paso={paso} /></div>
                <div className="ec-topbar-title">
                    {modoEdicion ? "Editando curso" : "Nuevo curso"}
                </div>
            </header>

            <main className="ec-main">
                <div className="ec-content-wrap">
                    {paso === 1 && (
                        <StepInfo
                            datos={infoCurso}
                            onChange={handleInfoChange}
                            dimensiones={dimensiones}
                            secciones={secciones}
                            showErrors={showErrors || tituloDuplicado}
                            tituloDuplicado={tituloDuplicado}
                            onLimpiarDuplicado={() => setTituloDuplicado(false)}
                        />
                    )}
                    {paso === 2 && (
                        <StepSecciones
                            secciones={secciones}
                            onChange={setSecciones}
                            showErrors={showErrors}
                            activaIdxExterno={seccionActivaIdx}
                            onActivaChange={setSeccionActivaIdx}
                        />
                    )}
                    {paso === 3 && (
                        <StepPreview
                            datos={infoCurso}
                            secciones={secciones}
                            dimensiones={dimensiones}
                        />
                    )}
                    {error && (
                        <div className="ec-error-banner">
                            <IoAlertCircleOutline size={16} />
                            <span>{error}</span>
                            <button onClick={() => setError(null)}><IoCloseOutline size={14} /></button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="ec-footer">
                <button className="ec-foot-btn ec-foot-btn--prev" disabled={paso === 1} onClick={handlePrev}>
                    <IoArrowBackOutline size={14} /> Anterior
                </button>
                <div className="ec-foot-dots">
                    {STEPS.map((s) => (
                        <div key={s.id}
                            className={`ec-foot-dot ${paso === s.id ? "active" : ""} ${paso > s.id ? "done" : ""}`} />
                    ))}
                </div>
                {paso < STEPS.length
                    ? (
                        <button className="ec-foot-btn ec-foot-btn--next" onClick={handleNext}>
                            Siguiente <IoChevronDownOutline size={13} style={{ transform: "rotate(-90deg)" }} />
                        </button>
                    ) : (
                        <button className="ec-foot-btn ec-foot-btn--save" disabled={guardando} onClick={handleGuardar}>
                            {guardando
                                ? <><div className="btn-spinner" /> Guardando…</>
                                : <><IoCheckmarkOutline size={15} /> {modoEdicion ? "Guardar cambios" : "Crear curso"}</>
                            }
                        </button>
                    )
                }
            </footer>

            <ModalConfirmarSalir
                isOpen={modalSalirOpen}
                onCancel={() => setModalSalirOpen(false)}
                onConfirm={() => {
                    limpiarBorrador(modoEdicion ? id : null);
                    navigate("/cursos-tutor");
                }}
            />

            {showSuccessAlert && (
                <CustomAlert
                    type="success"
                    title="¡Curso creado!"
                    logo={logo}
                    message="Tu curso se ha creado correctamente."
                    onClose={() => { setShowSuccessAlert(false); navigate("/cursos-tutor"); }}
                />
            )}
        </div>
    );
}