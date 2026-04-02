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

const CROP_RATIOS = [
    { label: "Libre", key: "free", w: null, h: null },
    { label: "16 : 9", key: "16-9", w: 16, h: 9 },
    { label: "4 : 3", key: "4-3", w: 4, h: 3 },
    { label: "1 : 1", key: "1-1", w: 1, h: 1 },
    { label: "3 : 4", key: "3-4", w: 3, h: 4 },
    { label: "9 : 16", key: "9-16", w: 9, h: 16 },
];

const DEFAULT_CROP = {
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    ratioKey: "16-9",
    frameW: 100,
};

const uuid = () => crypto.randomUUID();
const crearContenidoVacio = () => ({ _id: uuid(), titulo: "", contenido: "", imagen_file: null, imagen_preview: null, imagen_url: "", imagen_crop: null, imagen_cropped_preview: null });
const crearOpcionVacia = () => ({ _id: uuid(), texto_opcion: "", es_correcta: false });
const crearPreguntaVacia = () => ({ _id: uuid(), texto_pregunta: "", opciones: [crearOpcionVacia(), crearOpcionVacia()] });
const crearSeccionVacia = () => ({ _id: uuid(), titulo_seccion: "", contenidos: [crearContenidoVacio()], preguntas: [], mostrarTest: false, expanded: true });

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ─────────────────────────────────────────────────────────
   APPLY CROP — renderiza el recorte en canvas y devuelve
   una URL de datos (base64) lista para preview o un File
   para subir al servidor.
   
   Parámetros:
   • src       — URL de la imagen original (blob: o https:)
   • crop      — objeto con { offsetX, offsetY, zoom, ratioKey, frameW }
   • outW      — ancho de salida en px (default 1280)
   • asFile    — si true devuelve File, si false devuelve dataURL
───────────────────────────────────────────────────────── */
const applyCrop = (src, crop, outW = 1280, asFile = false) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const c = { ...DEFAULT_CROP, ...crop };
            const ratio = CROP_RATIOS.find((r) => r.key === c.ratioKey) ?? CROP_RATIOS[1];

            /* ── Mismo cálculo que CropEditor ── */
            /* 1. Tamaño del "marco" de referencia (usamos 800px de ancho de referencia) */
            const REF_W = 800;
            const frameW = REF_W * (c.frameW / 100);
            const frameH = ratio.w ? frameW * (ratio.h / ratio.w) : frameW * 0.5625;

            /* 2. Escala base (image fits frame) */
            const baseScale = Math.max(frameW / img.naturalWidth, frameH / img.naturalHeight);
            const totalScale = baseScale * c.zoom;

            /* 3. Coordenadas del recorte en px de la imagen ORIGINAL */
            /* Centro de la imagen escalada respecto al marco */
            const scaledW = img.naturalWidth * totalScale;
            const scaledH = img.naturalHeight * totalScale;

            /* Offset en coordenadas del canvas de la imagen escalada */
            const imgLeft = (frameW - scaledW) / 2 + c.offsetX;
            const imgTop = (frameH - scaledH) / 2 + c.offsetY;

            /* Traducimos a coordenadas de la imagen original */
            const srcX = (-imgLeft) / totalScale;
            const srcY = (-imgTop) / totalScale;
            const srcW = frameW / totalScale;
            const srcH = frameH / totalScale;

            /* 4. Canvas de salida */
            const aspectRatio = ratio.w ? ratio.h / ratio.w : frameH / frameW;
            const outH = Math.round(outW * aspectRatio);

            const canvas = document.createElement("canvas");
            canvas.width = outW;
            canvas.height = outH;
            const ctx = canvas.getContext("2d");

            ctx.drawImage(
                img,
                clamp(srcX, 0, img.naturalWidth),
                clamp(srcY, 0, img.naturalHeight),
                Math.min(srcW, img.naturalWidth - clamp(srcX, 0, img.naturalWidth)),
                Math.min(srcH, img.naturalHeight - clamp(srcY, 0, img.naturalHeight)),
                0, 0, outW, outH,
            );

            if (asFile) {
                canvas.toBlob((blob) => {
                    if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
                    resolve(new File([blob], "imagen_recortada.jpg", { type: "image/jpeg" }));
                }, "image/jpeg", 0.92);
            } else {
                resolve(canvas.toDataURL("image/jpeg", 0.92));
            }
        };
        img.onerror = reject;
        img.src = src;
    });

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
   IMAGE ADJUST — portada del curso
───────────────────────────────────────────────────────── */
const ImageAdjust = ({ src, zoom, posX, posY, onZoom, onPosX, onPosY, height = 220 }) => {
    const containerRef = useRef(null);
    const dragging = useRef(false);
    const last = useRef({ x: 0, y: 0 });

    const startDrag = (e) => {
        dragging.current = true;
        last.current = { x: e.touches ? e.touches[0].clientX : e.clientX, y: e.touches ? e.touches[0].clientY : e.clientY };
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
   IMAGE UPLOAD ZONE — portada del curso
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

/* ═══════════════════════════════════════════════════════════
   CROP EDITOR — estilo WhatsApp
═══════════════════════════════════════════════════════════ */
const CropEditor = ({ src, crop, onChange }) => {
    const wrapRef = useRef(null);
    const imgRef = useRef(null);
    const dragging = useRef(false);        // arrastrar imagen
    const resizing = useRef(null);         // "tl"|"tr"|"bl"|"br" | null
    const lastPos = useRef({ x: 0, y: 0 });
    const startFrameW = useRef(0);            // frameW al inicio del resize
    const startMouseX = useRef(0);            // X del mouse al inicio del resize

    const [imgNat, setImgNat] = useState({ w: 1, h: 1 });
    const [framePx, setFramePx] = useState({ w: 560, h: 315 });

    const c = { ...DEFAULT_CROP, ...crop };
    const ratio = CROP_RATIOS.find((r) => r.key === c.ratioKey) ?? CROP_RATIOS[1];

    /* ── Medir el contenedor y actualizar framePx ── */
    useEffect(() => {
        const measure = () => {
            if (!wrapRef.current) return;
            const cw = wrapRef.current.offsetWidth;
            const fw = cw * (c.frameW / 100);
            const fh = ratio.w ? fw * (ratio.h / ratio.w) : fw * 0.5625;
            setFramePx({ w: fw, h: Math.round(fh) });
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [c.frameW, c.ratioKey, ratio]);

    /* ── Cálculos derivados ── */
    const baseScale = Math.max(framePx.w / Math.max(imgNat.w, 1), framePx.h / Math.max(imgNat.h, 1));
    const totalScale = baseScale * c.zoom;
    const scaledW = imgNat.w * totalScale;
    const scaledH = imgNat.h * totalScale;
    const maxOX = Math.max(0, (scaledW - framePx.w) / 2);
    const maxOY = Math.max(0, (scaledH - framePx.h) / 2);

    /* ── Inicio de arrastre de imagen ── */
    const startDrag = (e) => {
        if (resizing.current) return;   // no iniciar drag si ya hay resize activo
        e.preventDefault();
        dragging.current = true;
        lastPos.current = {
            x: e.touches ? e.touches[0].clientX : e.clientX,
            y: e.touches ? e.touches[0].clientY : e.clientY,
        };
    };

    /* ── Inicio de resize desde una esquina ── */
    const startResize = (corner) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        resizing.current = corner;
        startFrameW.current = c.frameW;
        startMouseX.current = e.touches ? e.touches[0].clientX : e.clientX;
    };

    /* ── Movimiento (imagen O resize) ── */
    const onMove = useCallback((e) => {
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;

        /* RESIZE — ajusta frameW según el delta horizontal del mouse */
        if (resizing.current) {
            if (!wrapRef.current) return;
            const containerW = wrapRef.current.offsetWidth;
            const dx = cx - startMouseX.current;

            /* Las esquinas derechas amplían al mover derecha;
               las izquierdas amplían al mover izquierda (dx invertido) */
            const dir = resizing.current.includes("r") ? 1 : -1;
            /* Dos lados cambian a la vez (espejo) → multiplicar × 2 */
            const delta = dir * dx * 2;
            const newPx = clamp(
                (startFrameW.current / 100) * containerW + delta,
                containerW * 0.25,   // mínimo 25% del contenedor
                containerW,          // máximo 100%
            );
            const newFW = Math.round((newPx / containerW) * 100);

            onChange({ ...c, frameW: newFW, offsetX: 0, offsetY: 0 });
            return;
        }

        /* DRAG — mueve la imagen dentro del marco */
        if (!dragging.current) return;
        const dx = cx - lastPos.current.x;
        const dy = cy - lastPos.current.y;
        lastPos.current = { x: cx, y: cy };
        onChange({
            ...c,
            offsetX: clamp(c.offsetX + dx, -maxOX, maxOX),
            offsetY: clamp(c.offsetY + dy, -maxOY, maxOY),
        });
    }, [c, maxOX, maxOY, onChange]);

    const stopAll = () => {
        dragging.current = false;
        resizing.current = null;
    };

    useEffect(() => {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", stopAll);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", stopAll);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", stopAll);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", stopAll);
        };
    }, [onMove]);

    /* ── Handlers para zoom y proporciones ── */
    const handleZoom = (z) => {
        const bs = Math.max(framePx.w / Math.max(imgNat.w, 1), framePx.h / Math.max(imgNat.h, 1));
        const ts = bs * z;
        const mox = Math.max(0, (imgNat.w * ts - framePx.w) / 2);
        const moy = Math.max(0, (imgNat.h * ts - framePx.h) / 2);
        onChange({ ...c, zoom: z, offsetX: clamp(c.offsetX, -mox, mox), offsetY: clamp(c.offsetY, -moy, moy) });
    };

    const handleRatio = (key) => onChange({ ...c, ratioKey: key, offsetX: 0, offsetY: 0 });
    const handleFrameW = (w) => onChange({ ...c, frameW: w, offsetX: 0, offsetY: 0 });

    const imgTransform = `translate(${c.offsetX}px, ${c.offsetY}px) scale(${totalScale})`;
    const frameHeight = ratio.w ? framePx.w * (ratio.h / ratio.w) : framePx.w * 0.5625;

    return (
        <div className="crop-editor" ref={wrapRef}>

            {/* ── Selector de proporción ── */}
            <div className="crop-ratio-bar">
                <span className="crop-ratio-label">Proporción</span>
                <div className="crop-ratio-pills">
                    {CROP_RATIOS.map((r) => (
                        <button key={r.key}
                            className={`crop-ratio-pill ${c.ratioKey === r.key ? "active" : ""}`}
                            onClick={() => handleRatio(r.key)}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Escenario ── */}
            <div className="crop-stage">
                {/* Sombras laterales fuera del marco */}
                <div className="crop-side-shadow crop-side-shadow--left"
                    style={{ width: `calc((100% - ${c.frameW}%) / 2)` }} />
                <div className="crop-side-shadow crop-side-shadow--right"
                    style={{ width: `calc((100% - ${c.frameW}%) / 2)` }} />

                {/* Marco de recorte */}
                <div className="crop-frame-wrap" style={{ width: `${c.frameW}%`, height: frameHeight }}>

                    {/* Imagen arrastrable */}
                    <div className="crop-img-container"
                        onMouseDown={startDrag}
                        onTouchStart={startDrag}>
                        <img
                            ref={imgRef}
                            src={src}
                            alt="recorte"
                            className="crop-img"
                            draggable={false}
                            style={{ transformOrigin: "center center", transform: imgTransform }}
                            onLoad={(e) => setImgNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                        />
                    </div>

                    {/* Cuadrícula de regla de tercios */}
                    <div className="crop-grid" aria-hidden="true">
                        <div className="crop-grid-line crop-grid-line--v1" />
                        <div className="crop-grid-line crop-grid-line--v2" />
                        <div className="crop-grid-line crop-grid-line--h1" />
                        <div className="crop-grid-line crop-grid-line--h2" />
                    </div>

                    {/* Borde blanco del marco */}
                    <div className="crop-frame-border" aria-hidden="true" />

                    {/* Hint de arrastre */}
                    <div className="crop-drag-hint">Arrastra para ajustar</div>

                    {/* ── HANDLES de resize en las 4 esquinas ── */}
                    {["tl", "tr", "bl", "br"].map((corner) => (
                        <div
                            key={corner}
                            className={`crop-resize-handle crop-resize-handle--${corner}`}
                            onMouseDown={startResize(corner)}
                            onTouchStart={startResize(corner)}
                            title="Arrastra para redimensionar"
                        >
                            {/* L-shape visual de la esquina */}
                            <div className="crop-handle-l" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Controles de ancho y zoom ── */}
            <div className="crop-controls">
                <div className="crop-ctrl-row">
                    <IoContractOutline size={13} className="crop-ctrl-icon" />
                    <span className="crop-ctrl-lbl">Ancho</span>
                    <input type="range" min="30" max="100" step="5" value={c.frameW}
                        onChange={(e) => handleFrameW(Number(e.target.value))}
                        className="crop-ctrl-slider" />
                    <span className="crop-ctrl-val">{c.frameW}%</span>
                </div>
                <div className="crop-ctrl-row">
                    <IoExpandOutline size={13} className="crop-ctrl-icon" />
                    <span className="crop-ctrl-lbl">Zoom</span>
                    <input type="range" min="1" max="4" step="0.02" value={c.zoom}
                        onChange={(e) => handleZoom(parseFloat(e.target.value))}
                        className="crop-ctrl-slider" />
                    <span className="crop-ctrl-val">{Math.round(c.zoom * 100)}%</span>
                </div>
                <button className="crop-reset-btn"
                    onClick={() => onChange({ ...DEFAULT_CROP, ratioKey: c.ratioKey })}>
                    Restablecer
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   CONTENT IMAGE UPLOAD
   
   Flujo completo:
   1. Usuario sube imagen → se muestra CropEditor en modo "edición"
   2. Usuario ajusta recorte → los datos quedan en imagen_crop
   3. Al presionar "Aplicar recorte" → applyCrop() renderiza el canvas
      y guarda imagen_cropped_preview (dataURL para mostrar) +
      imagen_cropped_file (File para subir al servidor)
   4. Se muestra la imagen ya recortada con opción de "Editar recorte"
      para volver al paso 2
───────────────────────────────────────────────────────── */
const ContentImageUpload = ({ con, onUpdate }) => {
    const inputRef = useRef();
    const [drag, setDrag] = useState(false);
    const [editando, setEditando] = useState(false);
    const [aplicando, setAplicando] = useState(false);

    const processFile = (file) => {
        if (!file?.type.startsWith("image/")) return;
        onUpdate({
            imagen_file: file,
            imagen_preview: URL.createObjectURL(file),
            imagen_url: "",
            imagen_crop: { ...DEFAULT_CROP },
            imagen_cropped_preview: null,
            imagen_cropped_file: null,
        });
        setEditando(true); // abre automáticamente el editor
    };

    /* Aplicar el recorte: canvas → dataURL + File */
    const handleAplicar = async () => {
        const src = con.imagen_preview || con.imagen_url;
        if (!src) return;
        setAplicando(true);
        try {
            const [dataURL, file] = await Promise.all([
                applyCrop(src, con.imagen_crop, 1280, false),
                applyCrop(src, con.imagen_crop, 1280, true),
            ]);
            onUpdate({ imagen_cropped_preview: dataURL, imagen_cropped_file: file });
            setEditando(false);
        } catch (err) {
            console.error("Error al aplicar recorte:", err);
        } finally {
            setAplicando(false);
        }
    };

    const handleEliminar = () => {
        onUpdate({
            imagen_file: null,
            imagen_preview: null,
            imagen_url: "",
            imagen_crop: null,
            imagen_cropped_preview: null,
            imagen_cropped_file: null,
        });
        setEditando(false);
    };

    const hasSrc = !!(con.imagen_preview || con.imagen_url);
    const hasCropped = !!con.imagen_cropped_preview;

    /* ── Sin imagen → zona de drop ── */
    if (!hasSrc) return (
        <div className="img-upload-root">
            <div className={`img-drop-zone img-drop-zone--content ${drag ? "dragging" : ""}`}
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); }}>
                <IoImageOutline size={26} />
                <p>Agregar imagen al bloque</p>
                <small>Arrastra o haz clic · Ajusta el recorte como en WhatsApp</small>
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => processFile(e.target.files[0])} />
        </div>
    );

    return (
        <div className="img-upload-root">

            {/* ── Modo EDITOR de recorte ── */}
            {editando && (
                <div className="crop-editing-panel">
                    <div className="crop-editing-header">
                        <div className="crop-editing-title">
                            <IoCropOutline size={14} />
                            <span>Ajustar recorte</span>
                        </div>
                        {hasCropped && (
                            <button className="crop-cancel-btn" onClick={() => setEditando(false)}>
                                Cancelar
                            </button>
                        )}
                    </div>

                    <CropEditor
                        src={con.imagen_preview || con.imagen_url}
                        crop={con.imagen_crop ?? DEFAULT_CROP}
                        onChange={(crop) => onUpdate({ imagen_crop: crop })}
                    />

                    <div className="crop-editing-actions">
                        <button
                            className="crop-apply-btn"
                            onClick={handleAplicar}
                            disabled={aplicando}
                        >
                            {aplicando
                                ? <><div className="btn-spinner" /> Procesando…</>
                                : <><IoCheckmarkOutline size={14} /> Aplicar recorte</>
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modo PREVIEW del recorte ya aplicado ── */}
            {!editando && hasCropped && (
                <div className="crop-result-panel">
                    <div className="crop-result-preview">
                        <img
                            src={con.imagen_cropped_preview}
                            alt="imagen recortada"
                            className="crop-result-img"
                        />
                        <div className="crop-result-badge">
                            <IoCropOutline size={11} /> Recortada
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sin recorte aplicado aún (imagen cargada pero no recortada) ── */}
            {!editando && !hasCropped && (
                <div className="crop-pending-notice">
                    <IoCropOutline size={14} />
                    <span>Imagen cargada — ajusta el recorte para continuar</span>
                </div>
            )}

            {/* ── Acciones siempre visibles cuando hay imagen ── */}
            {!editando && (
                <div className="img-upload-actions">
                    <button className="img-action-btn" onClick={() => setEditando(true)}>
                        <IoCropOutline size={13} />
                        {hasCropped ? "Editar recorte" : "Recortar imagen"}
                    </button>
                    <button className="img-action-btn" onClick={() => inputRef.current.click()}>
                        <IoCloudUploadOutline size={13} /> Cambiar imagen
                    </button>
                    <button className="img-action-btn img-action-btn--danger" onClick={handleEliminar}>
                        <IoTrashOutline size={13} /> Eliminar
                    </button>
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
   CONTENT BLOCK
───────────────────────────────────────────────────────── */
const ContentBlock = ({ con, index, onUpdate, onDelete, canDelete }) => (
    <div className="content-block">
        <div className="content-block-header">
            <span className="content-block-num">Bloque {index + 1}</span>
            {canDelete && <button className="btn-icon-sm danger" onClick={onDelete}><IoCloseOutline size={13} /></button>}
        </div>
        <div className="content-block-body">
            <input className="ec-input ec-input-sm" value={con.titulo}
                onChange={(e) => onUpdate({ titulo: e.target.value })}
                placeholder="Título del bloque de contenido" />
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

/* ─────────────────────────────────────────────────────────
   QUESTION CARD
───────────────────────────────────────────────────────── */
const QuestionCard = ({ preg, index, onUpdate, onDelete }) => (
    <div className="question-card">
        <div className="question-header">
            <span className="question-num">P{index + 1}</span>
            <button className="btn-icon-sm danger" onClick={onDelete}><IoTrashOutline size={12} /></button>
        </div>
        <input className="ec-input ec-input-sm" value={preg.texto_pregunta}
            onChange={(e) => onUpdate({ ...preg, texto_pregunta: e.target.value })}
            placeholder="Escribe la pregunta…" />
        <div className="options-list">
            {preg.opciones.map((op, oi) => (
                <div key={op._id} className="option-row">
                    <button className={`option-radio ${op.es_correcta ? "correct" : ""}`}
                        onClick={() => onUpdate({ ...preg, opciones: preg.opciones.map((o) => ({ ...o, es_correcta: o._id === op._id })) })}
                        title="Marcar como correcta">
                        {op.es_correcta ? <IoCheckmarkCircle size={18} /> : <IoEllipseOutline size={18} />}
                    </button>
                    <input className="ec-input ec-input-sm option-input" value={op.texto_opcion}
                        onChange={(e) => onUpdate({ ...preg, opciones: preg.opciones.map((o) => o._id === op._id ? { ...o, texto_opcion: e.target.value } : o) })}
                        placeholder={`Opción ${oi + 1}`} />
                    {preg.opciones.length > 2 && (
                        <button className="btn-icon-sm danger"
                            onClick={() => onUpdate({ ...preg, opciones: preg.opciones.filter((o) => o._id !== op._id) })}>
                            <IoCloseOutline size={11} />
                        </button>
                    )}
                </div>
            ))}
        </div>
        <button className="btn-add-small"
            onClick={() => onUpdate({ ...preg, opciones: [...preg.opciones, crearOpcionVacia()] })}>
            <IoAddOutline size={12} /> Añadir opción
        </button>
    </div>
);

/* ─────────────────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────────────────── */
const SeccionCard = ({ sec, index, onUpdate, onDelete, canDelete }) => {
    const updCon = (cid, upd) => onUpdate({ ...sec, contenidos: sec.contenidos.map((c) => c._id === cid ? { ...c, ...upd } : c) });
    const updPreg = (pid, upd) => onUpdate({ ...sec, preguntas: sec.preguntas.map((p) => p._id === pid ? upd : p) });

    return (
        <div className={`seccion-card ${sec.expanded ? "expanded" : ""}`}>
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
                        <input className="ec-input" value={sec.titulo_seccion}
                            onChange={(e) => onUpdate({ ...sec, titulo_seccion: e.target.value })}
                            placeholder="Ej. Introducción a los fundamentos"
                            onClick={(e) => e.stopPropagation()} />
                    </div>

                    <div className="seccion-subgroup">
                        <p className="subgroup-label">Bloques de contenido</p>
                        {sec.contenidos.map((con, ci) => (
                            <ContentBlock key={con._id} con={con} index={ci}
                                onUpdate={(upd) => updCon(con._id, upd)}
                                onDelete={() => onUpdate({ ...sec, contenidos: sec.contenidos.filter((c) => c._id !== con._id) })}
                                canDelete={sec.contenidos.length > 1} />
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
                                {sec.preguntas.length === 0 && <p className="quiz-empty">Agrega preguntas para este cuestionario.</p>}
                                {sec.preguntas.map((preg, pi) => (
                                    <QuestionCard key={preg._id} preg={preg} index={pi}
                                        onUpdate={(upd) => updPreg(preg._id, upd)}
                                        onDelete={() => onUpdate({ ...sec, preguntas: sec.preguntas.filter((p) => p._id !== preg._id) })} />
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
const StepSecciones = ({ secciones, onChange }) => {
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
                        <SeccionCard key={sec._id} sec={sec} index={si}
                            onUpdate={(upd) => updSec(sec._id, upd)}
                            onDelete={() => onChange(secciones.filter((s) => s._id !== sec._id))}
                            canDelete={secciones.length > 1} />
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
                                style={{ transform: `scale(${datos.foto_zoom ?? 1})`, objectPosition: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%`, transformOrigin: `${datos.foto_pos_x ?? 50}% ${datos.foto_pos_y ?? 50}%` }} />
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
                                {/* Mini-preview de imágenes recortadas */}
                                {s.contenidos.some(c => c.imagen_cropped_preview) && (
                                    <div className="revision-img-thumbs">
                                        {s.contenidos.filter(c => c.imagen_cropped_preview).map(c => (
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

    const [infoCurso, setInfoCurso] = useState({
        titulo: "", descripcion: "", perfil_vark: "", id_dimension: "",
        foto_file: null, foto_preview: null, foto_url: null,
        foto_zoom: 1, foto_pos_x: 50, foto_pos_y: 50,
    });
    const [secciones, setSecciones] = useState([crearSeccionVacia()]);

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
            }
        })();
    }, [id, modoEdicion]);

    const handleInfoChange = (campo, valor) => setInfoCurso((p) => ({ ...p, [campo]: valor }));

    const canAdvance = () => {
        if (paso === 1) return infoCurso.titulo.trim().length > 0 && infoCurso.perfil_vark.length > 0;
        if (paso === 2) return secciones.every(
            (s) => s.titulo_seccion.trim() &&
                s.contenidos.every((c) => c.titulo.trim()) &&
                s.preguntas.every((p) => p.texto_pregunta.trim() && p.opciones.every((o) => o.texto_opcion.trim()) && p.opciones.some((o) => o.es_correcta))
        );
        return true;
    };

    const handleNext = () => {
        if (!canAdvance()) { setShowErrors(true); return; }
        setShowErrors(false);
        setPaso((p) => p + 1);
    };

    /* ── Construye payload para contenido, usando el File recortado si existe ── */
    const buildContenidoPayload = async (con, id_seccion, orden) => {
        /* Si hay archivo recortado, subirlo como FormData */
        if (con.imagen_cropped_file) {
            const fd = new FormData();
            fd.append("titulo", con.titulo);
            fd.append("contenido", con.contenido);
            fd.append("orden", orden);
            fd.append("imagen", con.imagen_cropped_file, "imagen_recortada.jpg");
            return { useFormData: true, fd };
        }
        /* Sin imagen nueva: solo JSON */
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
            navigate("/cursos-tutor");
        } catch (err) {
            setError(err.response?.data?.mensaje || err.message || "Ocurrió un error al guardar.");
        } finally { setGuardando(false); }
    };

    if (cargando) return (
        <div className="ec-root"><div className="ec-loading"><div className="ec-spinner" /><p>Cargando curso…</p></div></div>
    );

    return (
        <div className="ec-root">
            <header className="ec-topbar">
                <button className="ec-back-btn" onClick={() => navigate("/cursos-tutor")}>
                    <IoArrowBackOutline size={16} /><span>Mis cursos</span>
                </button>
                <div className="ec-topbar-center"><StepIndicator paso={paso} /></div>
                <div className="ec-topbar-title">{modoEdicion ? "Editando curso" : "Nuevo curso"}</div>
            </header>

            <main className="ec-main">
                <div className="ec-content-wrap">
                    {paso === 1 && <StepInfo datos={infoCurso} onChange={handleInfoChange} dimensiones={dimensiones} showErrors={showErrors} />}
                    {paso === 2 && <StepSecciones secciones={secciones} onChange={setSecciones} />}
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
                <button className="ec-foot-btn ec-foot-btn--prev" disabled={paso === 1} onClick={() => setPaso((p) => p - 1)}>
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
                        {guardando ? <><div className="btn-spinner" /> Guardando…</> : <><IoCheckmarkOutline size={15} /> {modoEdicion ? "Guardar cambios" : "Crear curso"}</>}
                    </button>
                }
            </footer>
        </div>
    );
}