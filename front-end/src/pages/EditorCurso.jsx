import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    IoArrowBackOutline, IoCloudUploadOutline, IoAddOutline, IoTrashOutline,
    IoCheckmarkOutline, IoImageOutline, IoHelpCircleOutline, IoCheckmarkCircle,
    IoEllipseOutline, IoCloseOutline, IoChevronDownOutline, IoChevronUpOutline,
    IoAlertCircleOutline, IoBookOutline, IoLayersOutline, IoEyeOutline,
    IoSparkles, IoExpandOutline, IoContractOutline, IoCropOutline,
} from "react-icons/io5";
import api from "../services/api";
import "../styles/EditorCurso.css";
import { ContentImageUpload } from "../components/ContentImageUpload_new";
import { ModalConfirmarSalir } from "../components/ModalConfirmarSalir";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const VARK_OPTIONS = [
    { value: "V", label: "Visual", letter: "V", accent: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { value: "A", label: "Auditivo", letter: "A", accent: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { value: "R", label: "Lectura / Escritura", letter: "R", accent: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { value: "K", label: "Kinestésico", letter: "K", accent: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { value: "VA", label: "Visual-Auditivo", letter: "VA", accent: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { value: "VR", label: "Visual-Lectura", letter: "VR", accent: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { value: "VK", label: "Visual-Kinestésico", letter: "VK", accent: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { value: "AR", label: "Auditivo-Lectura", letter: "AR", accent: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { value: "AK", label: "Auditivo-Kinestésico", letter: "AK", accent: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { value: "RK", label: "Lectura-Kinestésico", letter: "RK", accent: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { value: "VAR", label: "Visual-Auditivo-Lectura", letter: "VAR", accent: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { value: "VAK", label: "Visual-Auditivo-Kinestésico", letter: "VAK", accent: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { value: "VRK", label: "Visual-Lectura-Kinestésico", letter: "VRK", accent: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { value: "ARK", label: "Auditivo-Lectura-Kinestésico", letter: "ARK", accent: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { value: "VARK", label: "Multimodal", letter: "★", accent: "#0F172A", bg: "#F8FAFC", border: "#CBD5E1" },
];

const STEPS = [
    { id: 1, label: "Curso", icon: IoBookOutline },
    { id: 2, label: "Contenido", icon: IoLayersOutline },
    { id: 3, label: "Publicar", icon: IoEyeOutline },
];

const uuid = () => crypto.randomUUID();
const crearContenidoVacio = () => ({ _id: uuid(), titulo: "", contenido: "", imagen_file: null, imagen_preview: null, imagen_url: "", imagen_crop: null, imagen_cropped_preview: null });
const crearOpcionVacia = () => ({ _id: uuid(), texto_opcion: "", es_correcta: false });
const crearPreguntaVacia = () => ({ _id: uuid(), texto_pregunta: "", opciones: [crearOpcionVacia(), crearOpcionVacia()] });
const crearSeccionVacia = () => ({ _id: uuid(), titulo_seccion: "", contenidos: [crearContenidoVacio()], preguntas: [], mostrarTest: false, expanded: true });

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

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
    const containerRef = useRef(null);
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
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const sens = 100 / (zoom * (rect.width / 100));
        onPosX(clamp(posX - dx * sens * 0.5, 0, 100));
        onPosY(clamp(posY - dy * sens * 0.5, 0, 100));
    }, [posX, posY, zoom, onPosX, onPosY]);

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
            <div ref={containerRef} className="img-preview-box" style={{ height }}
                onMouseDown={startDrag} onTouchStart={startDrag} title="Arrastra para reposicionar">
                <img src={src} alt="preview" className="img-preview-img" draggable={false}
                    style={{ transform: `scale(${zoom})`, objectPosition: `${posX}% ${posY}%`, transformOrigin: `${posX}% ${posY}%` }} />
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
const ImageUploadZone = ({ preview, url, zoom, posX, posY, onUpdate, height = 220, label = "Arrastra o haz clic para subir", hint = "JPG, PNG, WEBP — máx. 5 MB" }) => {
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
                    <ImageAdjust src={current} zoom={zoom ?? 1} posX={posX ?? 50} posY={posY ?? 50}
                        onZoom={(v) => onUpdate({ imagen_zoom: v })}
                        onPosX={(v) => onUpdate({ imagen_pos_x: v })}
                        onPosY={(v) => onUpdate({ imagen_pos_y: v })}
                        height={height} />
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
                    <IoImageOutline size={28} /><p>{label}</p><small>{hint}</small>
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
            <p className="field-error-msg"><IoAlertCircleOutline size={13} /> Selecciona un perfil VARK para continuar</p>
        )}
    </div>
);

/* ─────────────────────────────────────────────────────────
   STEP 1
───────────────────────────────────────────────────────── */
const StepInfo = ({ datos, onChange, dimensiones, showErrors }) => (
    <div className="ec-panel">
        <div className="panel-section">
            <div className="section-header">
                <span className="section-tag">01</span>
                <h3 className="section-title">Portada del curso</h3>
            </div>
            <ImageUploadZone
                preview={datos.foto_preview} url={datos.foto_url}
                zoom={datos.foto_zoom} posX={datos.foto_pos_x} posY={datos.foto_pos_y}
                height={260} label="Sube la imagen de portada" hint="Ajusta con zoom y arrastra para recortar"
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

        <div className="panel-section">
            <div className="section-header">
                <span className="section-tag">02</span>
                <h3 className="section-title">Información básica</h3>
            </div>
            <div className="ec-field">
                <label className="ec-label">Título del curso <span className="req">*</span></label>
                <input className={`ec-input ${showErrors && !datos.titulo.trim() ? "input-error" : ""}`}
                    value={datos.titulo} onChange={(e) => onChange("titulo", e.target.value)}
                    placeholder="Ej. Diseño UX para principiantes" maxLength={200} />
                <span className="ec-counter">{datos.titulo.length}/200</span>
                {showErrors && !datos.titulo.trim() && (
                    <p className="field-error-msg"><IoAlertCircleOutline size={13} /> El título es obligatorio</p>
                )}
            </div>
            <div className="ec-field">
                <label className="ec-label">Descripción</label>
                <textarea className="ec-input ec-textarea" value={datos.descripcion}
                    onChange={(e) => onChange("descripcion", e.target.value)}
                    placeholder="¿Qué aprenderán los estudiantes?" rows={4} />
            </div>
            <div className="ec-field">
                <label className="ec-label">Dimensión de aprendizaje <span className="opt">(opcional)</span></label>
                <select className="ec-input ec-select" value={datos.id_dimension}
                    onChange={(e) => onChange("id_dimension", e.target.value)}>
                    <option value="">— Sin dimensión asignada —</option>
                    {dimensiones.map((d) => (
                        <option key={d.id_dimension} value={d.id_dimension}>{d.nombre_dimension}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="panel-section">
            <div className="section-header">
                <span className="section-tag">03</span>
                <h3 className="section-title">Perfil VARK <span className="req">*</span></h3>
                <p className="section-desc">Define el estilo de aprendizaje al que está orientado este curso.</p>
            </div>
            <VarkSelector value={datos.perfil_vark} onChange={(v) => onChange("perfil_vark", v)} required={showErrors} />
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────
   CONTENT BLOCK — con validaciones visibles
───────────────────────────────────────────────────────── */
const ContentBlock = ({ con, index, onUpdate, onDelete, canDelete, showErrors }) => {
    const tituloVacio = showErrors && !con.titulo.trim();
    return (
        <div className={`content-block ${tituloVacio ? "block-has-error" : ""}`}>
            <div className="content-block-header">
                <span className="content-block-num">Bloque {index + 1}</span>
                {canDelete && (
                    <button className="btn-icon-sm danger" onClick={onDelete}>
                        <IoCloseOutline size={13} />
                    </button>
                )}
            </div>
            <div className="content-block-body">
                <div className="ec-field">
                    <input
                        className={`ec-input ec-input-sm ${tituloVacio ? "input-error" : ""}`}
                        value={con.titulo}
                        onChange={(e) => onUpdate({ titulo: e.target.value })}
                        placeholder="Título del bloque de contenido"
                    />
                    {tituloVacio && (
                        <p className="field-error-msg">
                            <IoAlertCircleOutline size={13} /> El título del bloque es obligatorio
                        </p>
                    )}
                </div>
                <textarea className="ec-input ec-textarea ec-textarea-sm" value={con.contenido}
                    onChange={(e) => onUpdate({ contenido: e.target.value })}
                    placeholder="Escribe el contenido aquí…" rows={4} />
                <div className="content-block-image">
                    <p className="content-image-label">
                        <IoImageOutline size={12} /> Imagen del bloque <span className="opt">(opcional)</span>
                    </p>
                    <ContentImageUpload con={con} onUpdate={onUpdate} />
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   QUESTION CARD — con validaciones visibles
───────────────────────────────────────────────────────── */
const QuestionCard = ({ preg, index, onUpdate, onDelete, showErrors }) => {
    const preguntaVacia = showErrors && !preg.texto_pregunta.trim();
    const sinCorrecta = showErrors && !preg.opciones.some((o) => o.es_correcta);

    return (
        <div className={`question-card ${preguntaVacia || sinCorrecta ? "block-has-error" : ""}`}>
            <div className="question-header">
                <span className="question-num">P{index + 1}</span>
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
                    <p className="field-error-msg">
                        <IoAlertCircleOutline size={13} /> El texto de la pregunta es obligatorio
                    </p>
                )}
            </div>

            <div className="options-list">
                {preg.opciones.map((op, oi) => {
                    const opcionVacia = showErrors && !op.texto_opcion.trim();
                    return (
                        <div key={op._id} className="option-row">
                            <button
                                className={`option-radio ${op.es_correcta ? "correct" : ""}`}
                                onClick={() => onUpdate({ ...preg, opciones: preg.opciones.map((o) => ({ ...o, es_correcta: o._id === op._id })) })}
                                title="Marcar como correcta"
                            >
                                {op.es_correcta ? <IoCheckmarkCircle size={18} /> : <IoEllipseOutline size={18} />}
                            </button>
                            <div style={{ flex: 1 }}>
                                <input
                                    className={`ec-input ec-input-sm option-input ${opcionVacia ? "input-error" : ""}`}
                                    value={op.texto_opcion}
                                    onChange={(e) => onUpdate({ ...preg, opciones: preg.opciones.map((o) => o._id === op._id ? { ...o, texto_opcion: e.target.value } : o) })}
                                    placeholder={`Opción ${oi + 1}`}
                                />
                                {opcionVacia && (
                                    <p className="field-error-msg">
                                        <IoAlertCircleOutline size={13} /> La opción no puede estar vacía
                                    </p>
                                )}
                            </div>
                            {preg.opciones.length > 2 && (
                                <button className="btn-icon-sm danger"
                                    onClick={() => onUpdate({ ...preg, opciones: preg.opciones.filter((o) => o._id !== op._id) })}>
                                    <IoCloseOutline size={11} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {sinCorrecta && (
                <p className="field-error-msg">
                    <IoAlertCircleOutline size={13} /> Marca al menos una opción como correcta
                </p>
            )}

            <button className="btn-add-small"
                onClick={() => onUpdate({ ...preg, opciones: [...preg.opciones, crearOpcionVacia()] })}>
                <IoAddOutline size={12} /> Añadir opción
            </button>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   SECTION CARD — con validaciones visibles
───────────────────────────────────────────────────────── */
const SeccionCard = ({ sec, index, onUpdate, onDelete, canDelete, showErrors }) => {
    const updCon = (cid, upd) => onUpdate({ ...sec, contenidos: sec.contenidos.map((c) => c._id === cid ? { ...c, ...upd } : c) });
    const updPreg = (pid, upd) => onUpdate({ ...sec, preguntas: sec.preguntas.map((p) => p._id === pid ? upd : p) });

    const tituloSeccionVacio = showErrors && !sec.titulo_seccion.trim();

    const tieneErrores = showErrors && (
        tituloSeccionVacio ||
        sec.contenidos.some((c) => !c.titulo.trim()) ||
        sec.preguntas.some((p) =>
            !p.texto_pregunta.trim() ||
            p.opciones.some((o) => !o.texto_opcion.trim()) ||
            !p.opciones.some((o) => o.es_correcta)
        )
    );

    return (
        <div className={`seccion-card ${sec.expanded ? "expanded" : ""} ${tieneErrores ? "seccion-has-error" : ""}`}>
            <div className="seccion-card-header" onClick={() => onUpdate({ ...sec, expanded: !sec.expanded })}>
                <div className="seccion-header-left">
                    <span className="seccion-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="seccion-titles">
                        {sec.titulo_seccion
                            ? <span className="seccion-name">{sec.titulo_seccion}</span>
                            : <span className="seccion-name placeholder">Sin título</span>}
                        <span className="seccion-meta">
                            {sec.contenidos.length} bloque{sec.contenidos.length !== 1 ? "s" : ""}
                            {sec.preguntas.length > 0 && ` · ${sec.preguntas.length} pregunta${sec.preguntas.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>
                </div>
                <div className="seccion-header-right">
                    {tieneErrores && !sec.expanded && (
                        <IoAlertCircleOutline size={16} className="seccion-error-icon" />
                    )}
                    {canDelete && (
                        <button className="btn-icon-sm danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                            <IoTrashOutline size={13} />
                        </button>
                    )}
                    <div className="seccion-chevron">
                        {sec.expanded ? <IoChevronUpOutline size={16} /> : <IoChevronDownOutline size={16} />}
                    </div>
                </div>
            </div>

            {sec.expanded && (
                <div className="seccion-body">
                    <div className="ec-field">
                        <label className="ec-label">Título de la sección <span className="req">*</span></label>
                        <input
                            className={`ec-input ${tituloSeccionVacio ? "input-error" : ""}`}
                            value={sec.titulo_seccion}
                            onChange={(e) => onUpdate({ ...sec, titulo_seccion: e.target.value })}
                            placeholder="Ej. Introducción a los fundamentos"
                            onClick={(e) => e.stopPropagation()}
                        />
                        {tituloSeccionVacio && (
                            <p className="field-error-msg">
                                <IoAlertCircleOutline size={13} /> El título de la sección es obligatorio
                            </p>
                        )}
                    </div>

                    <div className="seccion-subgroup">
                        <p className="subgroup-label">Bloques de contenido</p>
                        {sec.contenidos.map((con, ci) => (
                            <ContentBlock
                                key={con._id} con={con} index={ci}
                                showErrors={showErrors}
                                onUpdate={(upd) => updCon(con._id, upd)}
                                onDelete={() => onUpdate({ ...sec, contenidos: sec.contenidos.filter((c) => c._id !== con._id) })}
                                canDelete={sec.contenidos.length > 1}
                            />
                        ))}
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
                                {sec.preguntas.map((preg, pi) => (
                                    <QuestionCard
                                        key={preg._id} preg={preg} index={pi}
                                        showErrors={showErrors}
                                        onUpdate={(upd) => updPreg(preg._id, upd)}
                                        onDelete={() => onUpdate({ ...sec, preguntas: sec.preguntas.filter((p) => p._id !== preg._id) })}
                                    />
                                ))}
                                <button className="btn-add-secondary"
                                    onClick={() => onUpdate({ ...sec, preguntas: [...sec.preguntas, crearPreguntaVacia()] })}>
                                    <IoAddOutline size={13} /> Nueva pregunta
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   STEP 2
───────────────────────────────────────────────────────── */
const StepSecciones = ({ secciones, onChange, showErrors }) => {
    const updSec = (id, sec) => onChange(secciones.map((s) => s._id === id ? sec : s));
    return (
        <div className="ec-panel">
            <div className="panel-section">
                <div className="section-header">
                    <span className="section-tag">Secciones</span>
                    <h3 className="section-title">Estructura del curso</h3>
                    <p className="section-desc">Organiza el contenido en secciones. Cada una puede tener bloques de texto, imágenes y un cuestionario.</p>
                </div>
                <div className="secciones-list">
                    {secciones.map((sec, si) => (
                        <SeccionCard
                            key={sec._id} sec={sec} index={si}
                            showErrors={showErrors}
                            onUpdate={(upd) => updSec(sec._id, upd)}
                            onDelete={() => onChange(secciones.filter((s) => s._id !== sec._id))}
                            canDelete={secciones.length > 1}
                        />
                    ))}
                </div>
                <button className="btn-add-section" onClick={() => onChange([...secciones, crearSeccionVacia()])}>
                    <IoAddOutline size={15} /> Agregar sección
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   STEP 3
───────────────────────────────────────────────────────── */
const StepRevision = ({ datos, secciones }) => {
    const vark = VARK_OPTIONS.find((v) => v.value === datos.perfil_vark);
    return (
        <div className="ec-panel">
            <div className="panel-section">
                <div className="section-header">
                    <span className="section-tag">Vista previa</span>
                    <h3 className="section-title">Revisión final</h3>
                    <p className="section-desc">Revisa que todo esté en orden antes de guardar.</p>
                </div>
                <div className="revision-course-card">
                    {datos.foto_preview && (
                        <div className="revision-cover">
                            <img src={datos.foto_preview} alt="portada"
                                style={{
                                    transform: `scale(${datos.foto_zoom ?? 1})`,
                                    objectPosition: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%`,
                                    transformOrigin: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%`,
                                }} />
                        </div>
                    )}
                    <div className="revision-info">
                        <h2 className="revision-title">{datos.titulo || <em>Sin título</em>}</h2>
                        {datos.descripcion && <p className="revision-desc">{datos.descripcion}</p>}
                        <div className="revision-tags">
                            {vark && (
                                <span className="revision-vark-tag" style={{ background: vark.bg, borderColor: vark.border, color: vark.accent }}>
                                    <IoSparkles size={11} /> {vark.value} — {vark.label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="revision-sections">
                    <p className="revision-sec-heading">{secciones.length} sección{secciones.length !== 1 ? "es" : ""}</p>
                    {secciones.map((s, i) => (
                        <div key={s._id} className="revision-sec-row">
                            <span className="revision-sec-num">{i + 1}</span>
                            <div>
                                <p className="revision-sec-name">{s.titulo_seccion || <em>Sin título</em>}</p>
                                <small className="revision-sec-sub">
                                    {s.contenidos.length} bloque{s.contenidos.length !== 1 ? "s" : ""}
                                    {s.preguntas.length > 0 && ` · ${s.preguntas.length} pregunta${s.preguntas.length !== 1 ? "s" : ""}`}
                                </small>
                                {s.contenidos.some((c) => c.imagen_cropped_preview) && (
                                    <div className="revision-img-thumbs">
                                        {s.contenidos.filter((c) => c.imagen_cropped_preview).map((c) => (
                                            <img key={c._id} src={c.imagen_cropped_preview} alt="" className="revision-img-thumb" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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
    const [showErrors, setShowErrors] = useState(false);
    const [dimensiones, setDimensiones] = useState([]);
    const [seccionesOriginales, setSeccionesOriginales] = useState([]);
    const [modalSalirOpen, setModalSalirOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Ref para saber cuándo ya terminó la carga inicial y los cambios son del usuario
    const initialLoadDone = useRef(false);

    const [infoCurso, setInfoCurso] = useState({
        titulo: "", descripcion: "", perfil_vark: "", id_dimension: "",
        foto_file: null, foto_preview: null, foto_url: null,
        foto_zoom: 1, foto_pos_x: 50, foto_pos_y: 50,
    });
    const [secciones, setSecciones] = useState([crearSeccionVacia()]);

    // En modo creación, el ref se activa de inmediato (no hay carga)
    useEffect(() => {
        if (!modoEdicion) {
            setTimeout(() => { initialLoadDone.current = true; }, 0);
        }
    }, []);

    // Marcar dirty solo cuando el usuario realmente cambia algo
    useEffect(() => {
        if (initialLoadDone.current) setIsDirty(true);
    }, [infoCurso]);

    useEffect(() => {
        if (initialLoadDone.current) setIsDirty(true);
    }, [secciones]);

    useEffect(() => {
        api.get("/cursos/dimensiones")
            .then(({ data }) => { if (data.ok) setDimensiones(data.dimensiones); })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!modoEdicion) return;
        (async () => {
            try {
                setCargando(true);
                const { data } = await api.get(`/cursos/cursos/${id}`);
                if (!data.ok) throw new Error(data.mensaje);
                const c = data.curso;
                setInfoCurso({
                    titulo: c.titulo || "", descripcion: c.descripcion || "",
                    perfil_vark: c.perfil_vark || "", id_dimension: c.id_dimension ? String(c.id_dimension) : "",
                    foto_file: null, foto_preview: c.foto || null, foto_url: c.foto || null,
                    foto_zoom: 1, foto_pos_x: 50, foto_pos_y: 50,
                });
                setSeccionesOriginales(c.secciones || []);
                if (c.secciones?.length > 0) {
                    setSecciones(c.secciones.map((s) => ({
                        _id: String(s.id_seccion), id_seccion: s.id_seccion,
                        titulo_seccion: s.titulo_seccion || "",
                        mostrarTest: (s.preguntas?.length || 0) > 0,
                        expanded: false,
                        contenidos: s.contenidos?.length > 0
                            ? s.contenidos.map((con) => ({
                                _id: String(con.id_contenido), id_contenido: con.id_contenido,
                                titulo: con.titulo || "", contenido: con.contenido || "",
                                imagen_file: null, imagen_preview: null,
                                imagen_url: con.imagen_url || "",
                                imagen_crop: con.imagen_crop || null,
                                imagen_cropped_preview: con.imagen_url || null,
                                imagen_cropped_file: null,
                            }))
                            : [crearContenidoVacio()],
                        preguntas: (s.preguntas || []).map((p) => ({
                            _id: String(p.id_test), id_test: p.id_test,
                            texto_pregunta: p.texto_pregunta || "",
                            opciones: (p.opciones || []).map((o) => ({
                                _id: String(o.id_opcion), id_opcion: o.id_opcion,
                                texto_opcion: o.texto_opcion || "", es_correcta: Boolean(o.es_correcta),
                            })),
                        })),
                    })));
                }
            } catch (err) {
                setError(err.response?.data?.mensaje || err.message);
            } finally {
                setCargando(false);
                // Activar el ref DESPUÉS de que React procese los setState anteriores
                setTimeout(() => { initialLoadDone.current = true; }, 0);
            }
        })();
    }, [id, modoEdicion]);

    const handleInfoChange = (campo, valor) => setInfoCurso((p) => ({ ...p, [campo]: valor }));

    const handleSalir = () => {
        if (isDirty) { setModalSalirOpen(true); return; }
        navigate("/cursos-tutor");
    };

    const canAdvance = () => {
        if (paso === 1) return infoCurso.titulo.trim().length > 0 && infoCurso.perfil_vark.length > 0;
        if (paso === 2) return secciones.every(
            (s) => s.titulo_seccion.trim() &&
                s.contenidos.every((c) => c.titulo.trim()) &&
                s.preguntas.every((p) =>
                    p.texto_pregunta.trim() &&
                    p.opciones.every((o) => o.texto_opcion.trim()) &&
                    p.opciones.some((o) => o.es_correcta)
                )
        );
        return true;
    };

    const handleNext = () => {
        if (!canAdvance()) { setShowErrors(true); return; }
        setShowErrors(false);
        setPaso((p) => p + 1);
    };

    const handlePrev = () => {
        setShowErrors(false);
        setPaso((p) => p - 1);
    };

    const buildContenidoPayload = async (con, id_seccion, orden) => {
        if (con.imagen_cropped_file) {
            const fd = new FormData();
            fd.append("titulo", con.titulo);
            fd.append("contenido", con.contenido);
            fd.append("orden", orden);
            fd.append("imagen", con.imagen_cropped_file, "imagen_recortada.jpg");
            return { useFormData: true, fd };
        }
        return {
            useFormData: false,
            body: { titulo: con.titulo, contenido: con.contenido, orden, imagen_crop: con.imagen_crop ?? null },
        };
    };

    const handleCrear = async () => {
        const fd = new FormData();
        fd.append("titulo", infoCurso.titulo.trim());
        if (infoCurso.descripcion) fd.append("descripcion", infoCurso.descripcion.trim());
        if (infoCurso.perfil_vark) fd.append("perfil_vark", infoCurso.perfil_vark);
        if (infoCurso.id_dimension) fd.append("id_dimension", infoCurso.id_dimension);
        if (infoCurso.foto_file) fd.append("foto", infoCurso.foto_file);
        const { data: dc } = await api.post("/cursos/cursos", fd);
        if (!dc.ok) throw new Error(dc.mensaje);
        const id_curso = dc.id_curso;

        for (let i = 0; i < secciones.length; i++) {
            const sec = secciones[i];
            const { data: ds } = await api.post(`/cursos/cursos/${id_curso}/secciones`, { titulo_seccion: sec.titulo_seccion, orden: i + 1 });
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
                await api.put(`/cursos/secciones/${sec.id_seccion}`, { titulo_seccion: sec.titulo_seccion, orden: i + 1 });
                id_seccion = sec.id_seccion;
            } else {
                const { data: ds } = await api.post(`/cursos/cursos/${id}/secciones`, { titulo_seccion: sec.titulo_seccion, orden: i + 1 });
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
                    await api.put(`/cursos/preguntas/${preg.id_test}`, {
                        texto_pregunta: preg.texto_pregunta,
                        opciones: preg.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: o.es_correcta })),
                    });
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

    const handleGuardar = async () => {
        setGuardando(true); setError(null);
        try {
            modoEdicion ? await handleEditar() : await handleCrear();
            setIsDirty(false);
            navigate("/cursos-tutor");
        } catch (err) {
            setError(err.response?.data?.mensaje || err.message || "Ocurrió un error al guardar.");
        } finally { setGuardando(false); }
    };

    if (cargando) return (
        <div className="ec-root">
            <div className="ec-loading"><div className="ec-spinner" /><p>Cargando curso…</p></div>
        </div>
    );

    return (
        <div className="ec-root">
            <header className="ec-topbar">
                <button className="ec-back-btn" onClick={handleSalir}>
                    <IoArrowBackOutline size={16} /><span>Volver</span>
                </button>
                <div className="ec-topbar-center"><StepIndicator paso={paso} /></div>
                <div className="ec-topbar-title">{modoEdicion ? "Editando curso" : "Nuevo curso"}</div>
            </header>

            <main className="ec-main">
                <div className="ec-content-wrap">
                    {paso === 1 && <StepInfo datos={infoCurso} onChange={handleInfoChange} dimensiones={dimensiones} showErrors={showErrors} />}
                    {paso === 2 && <StepSecciones secciones={secciones} onChange={setSecciones} showErrors={showErrors} />}
                    {paso === 3 && <StepRevision datos={infoCurso} secciones={secciones} />}
                    {error && (
                        <div className="ec-error-banner">
                            <IoAlertCircleOutline size={16} /><span>{error}</span>
                            <button onClick={() => setError(null)}><IoCloseOutline size={14} /></button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="ec-footer">
                <button className="ec-foot-btn ec-foot-btn--prev" disabled={paso === 1} onClick={handlePrev}>
                    Anterior
                </button>
                <div className="ec-foot-dots">
                    {STEPS.map((s) => (
                        <div key={s.id} className={`ec-foot-dot ${paso === s.id ? "active" : ""} ${paso > s.id ? "done" : ""}`} />
                    ))}
                </div>
                {paso < STEPS.length
                    ? <button className="ec-foot-btn ec-foot-btn--next" onClick={handleNext}>Siguiente</button>
                    : <button className="ec-foot-btn ec-foot-btn--save" disabled={guardando} onClick={handleGuardar}>
                        {guardando
                            ? <><div className="btn-spinner" /> Guardando…</>
                            : <><IoCheckmarkOutline size={15} /> {modoEdicion ? "Guardar cambios" : "Crear curso"}</>
                        }
                    </button>
                }
            </footer>

            <ModalConfirmarSalir
                isOpen={modalSalirOpen}
                onCancel={() => setModalSalirOpen(false)}
                onConfirm={() => navigate("/cursos-tutor")}
            />
        </div>
    );
}