// src/pages/EditorCurso.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
    IoArrowBackOutline, IoCloudUploadOutline, IoAddOutline, IoTrashOutline,
    IoCheckmarkOutline, IoImageOutline, IoHelpCircleOutline, IoCheckmarkCircle,
    IoEllipseOutline, IoCloseOutline, IoAlertCircleOutline, IoBookOutline,
    IoLayersOutline, IoEyeOutline, IoSparkles, IoCopyOutline,
    IoDocumentTextOutline, IoSchoolOutline, IoBrushOutline, IoListOutline,
    IoChevronDownOutline, IoChevronForwardOutline, IoChevronBackOutline,
    IoLockClosedOutline,
} from "react-icons/io5";
import "../styles/EditorCurso.css";
import { ContentImageUpload } from "../components/ContentImageUpload_new";
import { ModalConfirmarSalir } from "../components/ModalConfirmarSalir";
import { ModalConfirmarEliminar } from "../components/ModalConfirmarEliminar";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import {
    useEditorCurso,
    VARK_OPTIONS,
    STEPS,
    crearContenidoVacio,
    crearOpcionVacia,
    crearPreguntaVacia,
    crearSeccionVacia,
    clamp,
    getPlaceholderPalette,
    getInitials,
    fmtDate,
    limpiarBorrador,
} from "../hooks/useEditorCurso";

/* ─────────────────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────────────────── */
const STEPS_WITH_ICONS = [
    { id: 1, label: "Curso", icon: IoBookOutline },
    { id: 2, label: "Contenido", icon: IoLayersOutline },
    { id: 3, label: "Crear", icon: IoEyeOutline },
];

const StepIndicator = ({ paso }) => (
    <div className="ec-steps">
        {STEPS_WITH_ICONS.map((s, i) => {
            const Icon = s.icon;
            const done = s.id < paso;
            const active = s.id === paso;
            return (
                <div key={s.id} className="ec-step-item">
                    <div className={`ec-step-dot ${active ? "active" : ""} ${done ? "done" : ""}`}>
                        {done ? <IoCheckmarkOutline size={11} /> : <Icon size={11} />}
                    </div>
                    <span className={`ec-step-label ${active ? "active" : ""}`}>{s.label}</span>
                    {i < STEPS_WITH_ICONS.length - 1 && <div className={`ec-step-line ${done ? "done" : ""}`} />}
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
            <div className="img-preview-box" style={{ height }} onMouseDown={startDrag} onTouchStart={startDrag}>
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
    preview, url, zoom, posX, posY, onUpdate, onRequestDeleteImagen,
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
                        <button
                            className="img-action-btn img-action-btn--danger"
                            onClick={onRequestDeleteImagen}
                        >
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
const StepInfo = ({ datos, onChange, dimensiones, secciones, showErrors, tituloDuplicado, onLimpiarDuplicado, onRequestDeletePortada }) => (
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
                    onRequestDeleteImagen={onRequestDeletePortada}
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
const ContentBlock = ({ con, index, onUpdate, onRequestDelete, onRequestDeleteImagen, canDelete, showErrors }) => (
    <div className="content-block">
        <div className="content-block-header">
            <div className="content-block-tag">
                <IoDocumentTextOutline size={11} />
                Bloque {index + 1}
            </div>
            {canDelete && (
                <button className="btn-icon-sm danger" onClick={onRequestDelete} title="Eliminar bloque">
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
                <ContentImageUpload
                    con={con}
                    onUpdate={onUpdate}
                    onRequestDeleteImagen={onRequestDeleteImagen}
                />
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────
   QUESTION CARD
───────────────────────────────────────────────────────── */
const QuestionCard = ({ preg, index, onUpdate, onRequestDelete, showErrors }) => {
    const preguntaVacia = showErrors && !preg.texto_pregunta.trim();
    const sinCorrecta = showErrors && !preg.opciones.some((o) => o.es_correcta);

    return (
        <div className={`question-card ${preguntaVacia || sinCorrecta ? "block-has-error" : ""}`}>
            <div className="question-header">
                <div className="question-num-badge">
                    <IoHelpCircleOutline size={11} /> P{index + 1}
                </div>
                <button className="btn-icon-sm danger" onClick={onRequestDelete}>
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
const SeccionEditorPanel = ({ sec, index, onUpdate, showErrors, tieneInscritos }) => {
    const updCon = (cid, upd) => onUpdate({ ...sec, contenidos: sec.contenidos.map((c) => c._id === cid ? { ...c, ...upd } : c) });
    const updPreg = (pid, upd) => onUpdate({ ...sec, preguntas: sec.preguntas.map((p) => p._id === pid ? upd : p) });

    const [modalElim, setModalElim] = useState({ open: false, tipo: "generico", nombre: "", onConfirm: null });
    const abrirModalElim = (tipo, nombre, onConfirm) => setModalElim({ open: true, tipo, nombre, onConfirm });
    const cerrarModalElim = () => setModalElim((m) => ({ ...m, open: false }));

    const tituloSeccionVacio = showErrors && !sec.titulo_seccion.trim();
    const hayPreguntasBloqueadas = tieneInscritos && sec.preguntas.some((p) => p.id_test);

    const preguntasNuevasConError = showErrors && sec.mostrarTest && sec.preguntas
        .filter((p) => !p.id_test)
        .some((p) =>
            !p.texto_pregunta.trim() ||
            p.opciones.some((o) => !o.texto_opcion.trim()) ||
            !p.opciones.some((o) => o.es_correcta)
        );

    const tieneErrores = tituloSeccionVacio || preguntasNuevasConError;

    return (
        <>
            <ModalConfirmarEliminar
                isOpen={modalElim.open}
                onClose={cerrarModalElim}
                onConfirm={modalElim.onConfirm}
                tipo={modalElim.tipo}
                nombre={modalElim.nombre}
            />

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

                {/* ── Bloques de contenido ── */}
                <div className="seccion-subgroup">
                    <p className="subgroup-label"><IoListOutline size={12} /> Bloques de contenido</p>
                    <div className="contenidos-grid">
                        {sec.contenidos.map((con, ci) => (
                            <ContentBlock
                                key={con._id} con={con} index={ci}
                                showErrors={showErrors}
                                onUpdate={(upd) => updCon(con._id, upd)}
                                canDelete={sec.contenidos.length > 1}
                                onRequestDelete={() =>
                                    abrirModalElim(
                                        "bloque",
                                        con.titulo || `Bloque ${ci + 1}`,
                                        () => onUpdate({ ...sec, contenidos: sec.contenidos.filter((c) => c._id !== con._id) })
                                    )
                                }
                                onRequestDeleteImagen={() =>
                                    abrirModalElim(
                                        "imagen",
                                        con.titulo || `Bloque ${ci + 1}`,
                                        () => updCon(con._id, {
                                            imagen_file: null, imagen_preview: null,
                                            imagen_url: "", imagen_zoom: 1,
                                            imagen_pos_x: 50, imagen_pos_y: 50,
                                            imagen_cropped_preview: null, imagen_cropped_file: null,
                                        })
                                    )
                                }
                            />
                        ))}
                    </div>
                    <button className="btn-add-secondary"
                        onClick={() => onUpdate({ ...sec, contenidos: [...sec.contenidos, crearContenidoVacio()] })}>
                        <IoAddOutline size={13} /> Nuevo bloque de contenido
                    </button>
                </div>

                {/* ── Cuestionario ── */}
                <div className="seccion-subgroup">
                    <div className="quiz-toggle-row">
                        <div className="quiz-toggle-info">
                            <IoHelpCircleOutline size={14} />
                            <p className="subgroup-label">Cuestionario</p>
                            {hayPreguntasBloqueadas && sec.mostrarTest && (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    fontSize: 11, color: "#64748B",
                                    background: "#F1F5F9", border: "1px solid #E2E8F0",
                                    borderRadius: 6, padding: "2px 7px", marginLeft: 6,
                                }}>
                                    <IoLockClosedOutline size={11} /> Solo lectura
                                </span>
                            )}
                        </div>
                        <label className="ec-switch">
                            <input
                                type="checkbox"
                                checked={sec.mostrarTest}
                                onChange={(e) => {
                                    const activando = e.target.checked;
                                    if (!activando && sec.preguntas.length > 0) {
                                        abrirModalElim(
                                            "cuestionario",
                                            sec.titulo_seccion || `Sección ${index + 1}`,
                                            () => onUpdate({ ...sec, mostrarTest: false, preguntas: [] })
                                        );
                                    } else {
                                        onUpdate({ ...sec, mostrarTest: activando, preguntas: activando ? sec.preguntas : [] });
                                    }
                                }}
                            />
                            <span className="ec-switch-track" />
                        </label>
                    </div>

                    {hayPreguntasBloqueadas && sec.mostrarTest && (
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: 8,
                            background: "#FFF7ED", border: "1px solid #FED7AA",
                            borderRadius: 8, padding: "10px 12px", marginTop: 10,
                        }}>
                            <IoAlertCircleOutline size={15} style={{ color: "#EA580C", flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: 12, color: "#9A3412", margin: 0, lineHeight: 1.5 }}>
                                Las preguntas existentes no pueden editarse ni eliminarse individualmente porque hay estudiantes inscritos.
                                Puedes agregar nuevas preguntas o eliminar el cuestionario completo desactivando el interruptor.
                            </p>
                        </div>
                    )}

                    {sec.mostrarTest && (
                        <div className="quiz-body">
                            {sec.preguntas.length === 0 && (
                                <p className="quiz-empty">Agrega preguntas para este cuestionario.</p>
                            )}
                            <div className="preguntas-grid">
                                {sec.preguntas.map((preg, pi) => (
                                    hayPreguntasBloqueadas && preg.id_test ? (
                                        <div key={preg._id} className="question-card" style={{ opacity: 0.72 }}>
                                            <div className="question-header">
                                                <div className="question-num-badge">
                                                    <IoHelpCircleOutline size={11} /> P{pi + 1}
                                                </div>
                                                <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                                                    <IoLockClosedOutline size={11} /> Solo lectura
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 13, color: "#334155", margin: "4px 0 10px", fontWeight: 500 }}>
                                                {preg.texto_pregunta}
                                            </p>
                                            <div className="options-list" style={{ pointerEvents: "none" }}>
                                                {preg.opciones.map((op) => (
                                                    <div key={op._id} className="option-row">
                                                        <span className={`option-radio ${op.es_correcta ? "correct" : ""}`}>
                                                            {op.es_correcta ? <IoCheckmarkCircle size={18} /> : <IoEllipseOutline size={18} />}
                                                        </span>
                                                        <span style={{ fontSize: 13, color: "#475569" }}>{op.texto_opcion}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <QuestionCard
                                            key={preg._id} preg={preg} index={pi}
                                            showErrors={showErrors}
                                            onUpdate={(upd) => updPreg(preg._id, upd)}
                                            onRequestDelete={() =>
                                                abrirModalElim(
                                                    "pregunta",
                                                    preg.texto_pregunta.trim()
                                                        ? (preg.texto_pregunta.length > 60
                                                            ? preg.texto_pregunta.slice(0, 60) + "…"
                                                            : preg.texto_pregunta)
                                                        : `Pregunta ${pi + 1}`,
                                                    () => onUpdate({ ...sec, preguntas: sec.preguntas.filter((p) => p._id !== preg._id) })
                                                )
                                            }
                                        />
                                    )
                                ))}
                            </div>

                            {(() => {
                                const tieneEnBD = sec.preguntas.some((p) => p.id_test);
                                const bloqueado = tieneInscritos && tieneEnBD;

                                if (bloqueado) return (
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        fontSize: 12, color: "#64748B",
                                        background: "#F8FAFC", border: "1px solid #E2E8F0",
                                        borderRadius: 8, padding: "8px 12px",
                                        alignSelf: "flex-start",
                                    }}>
                                        <IoLockClosedOutline size={13} />
                                        No se pueden agregar preguntas a un cuestionario con estudiantes inscritos
                                    </div>
                                );

                                return (
                                    <button className="btn-add-secondary"
                                        onClick={() => onUpdate({ ...sec, preguntas: [...sec.preguntas, crearPreguntaVacia()] })}>
                                        <IoAddOutline size={13} /> Nueva pregunta
                                    </button>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

/* ─────────────────────────────────────────────────────────
   STEP 2
───────────────────────────────────────────────────────── */
const StepSecciones = ({ secciones, onChange, showErrors, activaIdxExterno = 0, onActivaChange, tieneInscritos }) => {
    const [activaIdx, setActivaIdx] = useState(activaIdxExterno);
    const [modalElimSec, setModalElimSec] = useState({ open: false, nombre: "", onConfirm: null });

    useEffect(() => { setActivaIdx(activaIdxExterno); }, []); // eslint-disable-line

    const cambiarActiva = (idx) => { setActivaIdx(idx); onActivaChange?.(idx); };
    const updSec = (id, sec) => onChange(secciones.map((s) => s._id === id ? sec : s));
    const secActiva = secciones[activaIdx] ?? secciones[0];

    const seccionTieneError = (sec) => {
        if (!showErrors) return false;
        if (!sec.titulo_seccion.trim()) return true;
        if (!sec.mostrarTest) return false;
        const preguntasNuevas = sec.preguntas.filter((p) => !p.id_test);
        return preguntasNuevas.some((p) =>
            !p.texto_pregunta.trim() ||
            p.opciones.some((o) => !o.texto_opcion.trim()) ||
            !p.opciones.some((o) => o.es_correcta)
        );
    };

    return (
        <>
            <ModalConfirmarEliminar
                isOpen={modalElimSec.open}
                onClose={() => setModalElimSec((m) => ({ ...m, open: false }))}
                onConfirm={modalElimSec.onConfirm}
                tipo="seccion"
                nombre={modalElimSec.nombre}
            />

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
                                                setModalElimSec({
                                                    open: true,
                                                    nombre: sec.titulo_seccion || `Sección ${si + 1}`,
                                                    onConfirm: () => {
                                                        const newSecs = secciones.filter((s) => s._id !== sec._id);
                                                        onChange(newSecs);
                                                        cambiarActiva(Math.min(si, newSecs.length - 1));
                                                    },
                                                });
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
                            tieneInscritos={tieneInscritos}
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
        </>
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
    const {
        id,
        modoEdicion,
        navigate,
        paso,
        guardando,
        cargando,
        error,
        setError,
        showErrors,
        infoCurso,
        secciones,
        setSecciones,
        dimensiones,
        tieneInscritos,
        seccionActivaIdx,
        setSeccionActivaIdx,
        tituloDuplicado,
        setTituloDuplicado,
        modalSalirOpen,
        setModalSalirOpen,
        modalElimPortada,
        setModalElimPortada,
        showSuccessAlert,
        setShowSuccessAlert,
        handleInfoChange,
        handleSalir,
        handleNext,
        handlePrev,
        handleGuardar,
    } = useEditorCurso();

    if (cargando) return (
        <div className="ec-root">
            <div className="ec-loading">
                <div className="ec-spinner" />
                <p>Cargando curso…</p>
            </div>
        </div>
    );

    return (
        <div className="ec-root">
            {/* ── Modal eliminar portada ── */}
            <ModalConfirmarEliminar
                isOpen={modalElimPortada}
                onClose={() => setModalElimPortada(false)}
                onConfirm={() => {
                    handleInfoChange("foto_url", null);
                    handleInfoChange("foto_preview", null);
                    handleInfoChange("foto_file", null);
                }}
                tipo="imagen"
                nombre="Portada del curso"
            />

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
                            onRequestDeletePortada={() => setModalElimPortada(true)}
                        />
                    )}
                    {paso === 2 && (
                        <StepSecciones
                            secciones={secciones}
                            onChange={setSecciones}
                            showErrors={showErrors}
                            activaIdxExterno={seccionActivaIdx}
                            onActivaChange={setSeccionActivaIdx}
                            tieneInscritos={tieneInscritos}
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
                    {STEPS_WITH_ICONS.map((s) => (
                        <div key={s.id}
                            className={`ec-foot-dot ${paso === s.id ? "active" : ""} ${paso > s.id ? "done" : ""}`} />
                    ))}
                </div>
                {paso < STEPS_WITH_ICONS.length
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
                    title={modoEdicion ? "¡Curso actualizado!" : "¡Curso creado!"}
                    logo={logo}
                    message={modoEdicion ? "Los cambios se guardaron correctamente." : "Tu curso se ha creado correctamente."}
                    onClose={() => { setShowSuccessAlert(false); navigate("/cursos-tutor"); }}
                />
            )}
        </div>
    );
}