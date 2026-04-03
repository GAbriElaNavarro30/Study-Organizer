/**
 * ContentImageUpload — Editor de recorte estilo WhatsApp/profesional
 *
 * Reemplaza el componente ContentImageUpload y el CropEditor en EditorCurso.jsx
 *
 * Características:
 *  - Recorte libre con handles en las 4 esquinas y 4 lados (resize libre)
 *  - Rotación de imagen 0 / 90 / 180 / 270 °
 *  - Zoom con rueda del mouse (desktop) y pellizco/pinch (móvil)
 *  - Arrastre de imagen dentro del ventana de recorte
 *  - Preview en tiempo real
 *  - Mismos design tokens que EditorCurso.css
 *
 * USO (sustituye a <ContentImageUpload> en SeccionCard/ContentBlock):
 *
 *   <ContentImageUpload con={con} onUpdate={onUpdate} />
 *
 * El objeto `con` y las claves que maneja onUpdate son idénticas a antes.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
    IoImageOutline, IoCloudUploadOutline, IoTrashOutline,
    IoCheckmarkOutline, IoRefresh, IoCloseOutline,
    IoCropOutline,
} from "react-icons/io5";

/* ─── utilidad: clampar ──────────────────────────────── */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ─── aplicar recorte con rotación ──────────────────── */
const applyFreeCrop = (src, state, asFile = false) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            /* Dimensiones de la imagen rotada */
            const rad    = (state.rotation * Math.PI) / 180;
            const cosA   = Math.abs(Math.cos(rad));
            const sinA   = Math.abs(Math.sin(rad));
            const rotW   = img.naturalWidth * cosA + img.naturalHeight * sinA;
            const rotH   = img.naturalWidth * sinA + img.naturalHeight * cosA;

            /* Canvas auxiliar para rotar */
            const rot    = document.createElement("canvas");
            rot.width    = rotW;
            rot.height   = rotH;
            const rCtx   = rot.getContext("2d");
            rCtx.translate(rotW / 2, rotH / 2);
            rCtx.rotate(rad);
            rCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

            /* Coordenadas del recorte en píxeles del canvas rotado */
            const sx = (state.cropX / 100) * rotW;
            const sy = (state.cropY / 100) * rotH;
            const sw = (state.cropW / 100) * rotW;
            const sh = (state.cropH / 100) * rotH;

            const out   = document.createElement("canvas");
            out.width   = Math.round(sw);
            out.height  = Math.round(sh);
            const oCtx  = out.getContext("2d");
            oCtx.drawImage(rot, sx, sy, sw, sh, 0, 0, out.width, out.height);

            if (asFile) {
                out.toBlob((blob) => {
                    if (!blob) { reject(new Error("toBlob failed")); return; }
                    resolve(new File([blob], "imagen_recortada.jpg", { type: "image/jpeg" }));
                }, "image/jpeg", 0.92);
            } else {
                resolve(out.toDataURL("image/jpeg", 0.92));
            }
        };
        img.onerror = reject;
        img.src     = src;
    });

/* ════════════════════════════════════════════════════════
   CROP MODAL — el corazón del editor
════════════════════════════════════════════════════════ */
const INITIAL_CROP = { cropX: 5, cropY: 5, cropW: 90, cropH: 90, zoom: 1, rotation: 0 };

function CropModal({ src, initialState, onApply, onCancel }) {
    /* Estado de recorte (en % del canvas visible) */
    const [cs, setCs] = useState({ ...INITIAL_CROP, ...initialState });

    /* Refs del canvas donde renderizamos */
    const canvasRef   = useRef(null);
    const containerRef = useRef(null);

    /* Imagen cargada */
    const imgRef      = useRef(null);
    const [imgLoaded, setImgLoaded] = useState(false);

    /* Tamaño real del canvas — driven by ResizeObserver */
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    /* Estado de interacción */
    const drag      = useRef(null);
    const lastTouch = useRef(null);

    /* ── Cargar imagen ── */
    useEffect(() => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload  = () => { imgRef.current = i; setImgLoaded(true); };
        i.onerror = () => console.error("Error loading image");
        i.src = src;
    }, [src]);

    /* ── Medir contenedor y fijar dimensiones reales del canvas ── */
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.offsetWidth  || el.getBoundingClientRect().width;
            const h = el.offsetHeight || el.getBoundingClientRect().height;
            if (w > 0 && h > 0) {
                if (canvasRef.current) {
                    canvasRef.current.width  = w;
                    canvasRef.current.height = h;
                }
                setContainerSize({ w, h });
            }
        };
        measure();
        const raf = requestAnimationFrame(measure);
        const ro  = new ResizeObserver(measure);
        ro.observe(el);
        return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    }, []);

    /* ── Render del canvas ── */
    useEffect(() => {
        if (!imgLoaded || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const W = canvas.width;
        const H = canvas.height;
        if (W === 0 || H === 0) return;
        const img = imgRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, W, H);

        /* Imagen rotada en el canvas */
        const rad   = (cs.rotation * Math.PI) / 180;
        const cosA  = Math.abs(Math.cos(rad));
        const sinA  = Math.abs(Math.sin(rad));
        const rotW  = img.naturalWidth  * cosA + img.naturalHeight * sinA;
        const rotH  = img.naturalWidth  * sinA + img.naturalHeight * cosA;

        /* Escalar para llenar el canvas con zoom */
        const baseScale = Math.min(W / rotW, H / rotH);
        const scale     = baseScale * cs.zoom;
        const imgDispW  = rotW * scale;
        const imgDispH  = rotH * scale;
        const imgLeft   = (W - imgDispW) / 2;
        const imgTop    = (H - imgDispH) / 2;

        /* Dibujar imagen oscurecida (fondo) */
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(rad);
        ctx.scale(scale, scale);
        ctx.globalAlpha = 0.35;
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        /* Zona de recorte en píxeles del canvas */
        const rx = imgLeft  + (cs.cropX / 100) * imgDispW;
        const ry = imgTop   + (cs.cropY / 100) * imgDispH;
        const rw = (cs.cropW / 100) * imgDispW;
        const rh = (cs.cropH / 100) * imgDispH;

        /* Dibujar imagen DENTRO del recorte (brillante) */
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(rad);
        ctx.scale(scale, scale);
        ctx.globalAlpha = 1;
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        /* Overlay oscuro fuera del recorte */
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.52)";
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.rect(rx, ry, rw, rh);
        ctx.fill("evenodd");
        ctx.restore();

        /* Borde del recorte */
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(rx + 0.75, ry + 0.75, rw - 1.5, rh - 1.5);
        ctx.restore();

        /* Regla de tercios */
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth   = 1;
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(rx + rw * i / 3, ry); ctx.lineTo(rx + rw * i / 3, ry + rh); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rx, ry + rh * i / 3); ctx.lineTo(rx + rw, ry + rh * i / 3); ctx.stroke();
        }
        ctx.restore();

        /* Handles: esquinas y laterales */
        const handles = getHandlePositions(rx, ry, rw, rh);
        Object.values(handles).forEach(([hx, hy]) => {
            ctx.save();
            ctx.fillStyle    = "#ffffff";
            ctx.strokeStyle  = "rgba(0,0,0,0.3)";
            ctx.lineWidth    = 1;
            ctx.shadowColor  = "rgba(0,0,0,0.4)";
            ctx.shadowBlur   = 4;
            ctx.beginPath();
            ctx.arc(hx, hy, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });
    }, [imgLoaded, cs, containerSize]);

    /* Posiciones de handles en px  */
    const getHandlePositions = (rx, ry, rw, rh) => ({
        tl: [rx,          ry         ],
        tc: [rx + rw / 2, ry         ],
        tr: [rx + rw,     ry         ],
        ml: [rx,          ry + rh / 2],
        mr: [rx + rw,     ry + rh / 2],
        bl: [rx,          ry + rh    ],
        bc: [rx + rw / 2, ry + rh    ],
        br: [rx + rw,     ry + rh    ],
    });

    /* ── Calcular dimensiones de imagen en el canvas ── */
    const getImgDims = useCallback((c, cw, ch) => {
        if (!imgRef.current) return { imgLeft: 0, imgTop: 0, imgDispW: cw, imgDispH: ch };
        const img   = imgRef.current;
        const rad   = (c.rotation * Math.PI) / 180;
        const cosA  = Math.abs(Math.cos(rad));
        const sinA  = Math.abs(Math.sin(rad));
        const rotW  = img.naturalWidth  * cosA + img.naturalHeight * sinA;
        const rotH  = img.naturalWidth  * sinA + img.naturalHeight * cosA;
        const base  = Math.min(cw / rotW, ch / rotH);
        const scale = base * c.zoom;
        const imgDispW = rotW * scale;
        const imgDispH = rotH * scale;
        const imgLeft  = (cw - imgDispW) / 2;
        const imgTop   = (ch - imgDispH) / 2;
        return { imgLeft, imgTop, imgDispW, imgDispH };
    }, []);

    /* ── Hit-test: ¿qué handle estoy tocando? ── */
    const hitHandle = useCallback((px, py, c) => {
        const W = canvasRef.current?.width  || 0;
        const H = canvasRef.current?.height || 0;
        const { imgLeft, imgTop, imgDispW, imgDispH } = getImgDims(c, W, H);
        const rx = imgLeft  + (c.cropX / 100) * imgDispW;
        const ry = imgTop   + (c.cropY / 100) * imgDispH;
        const rw = (c.cropW / 100) * imgDispW;
        const rh = (c.cropH / 100) * imgDispH;
        const handles = getHandlePositions(rx, ry, rw, rh);
        const R = 14; // radio de hit
        for (const [key, [hx, hy]] of Object.entries(handles)) {
            if (Math.hypot(px - hx, py - hy) < R) return key;
        }
        /* ¿Dentro del recuadro? → mover */
        if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) return "move";
        return null;
    }, [getImgDims]);

    /* ── Cursor según posición ── */
    const getCursor = useCallback((handle) => {
        const map = {
            tl: "nwse-resize", br: "nwse-resize",
            tr: "nesw-resize", bl: "nesw-resize",
            tc: "ns-resize",   bc: "ns-resize",
            ml: "ew-resize",   mr: "ew-resize",
            move: "grab",
        };
        return map[handle] ?? "crosshair";
    }, []);

    /* ── Mouse / touch down ── */
    const onPointerDown = useCallback((e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const px   = (e.clientX ?? e.touches[0].clientX) - rect.left;
        const py   = (e.clientY ?? e.touches[0].clientY) - rect.top;
        const hit  = hitHandle(px, py, cs);
        if (!hit) return;
        e.preventDefault();
        drag.current = {
            type: hit, startX: px, startY: py,
            snap: { ...cs },
        };
    }, [cs, hitHandle]);

    /* ── Mouse / touch move ── */
    const onPointerMove = useCallback((e) => {
        /* Cursor dinámico */
        if (!drag.current && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const px   = (e.clientX ?? (e.touches?.[0]?.clientX ?? 0)) - rect.left;
            const py   = (e.clientY ?? (e.touches?.[0]?.clientY ?? 0)) - rect.top;
            const hit  = hitHandle(px, py, cs);
            canvasRef.current.style.cursor = hit ? getCursor(hit) : "crosshair";
        }

        if (!drag.current) return;
        e.preventDefault();

        const rect  = canvasRef.current.getBoundingClientRect();
        const px    = (e.clientX ?? e.touches[0].clientX) - rect.left;
        const py    = (e.clientY ?? e.touches[0].clientY) - rect.top;
        const dx    = px - drag.current.startX;
        const dy    = py - drag.current.startY;
        const W = canvasRef.current?.width  || 0;
        const H = canvasRef.current?.height || 0;
        const { imgDispW, imgDispH } = getImgDims(drag.current.snap, W, H);
        const snap  = drag.current.snap;

        /* Convertir δpx → δ% del canvas de imagen */
        const dxPct = (dx / imgDispW) * 100;
        const dyPct = (dy / imgDispH) * 100;
        const MIN_SZ = 5; // mínimo 5%

        const next = { ...snap };

        switch (drag.current.type) {
            case "move": {
                next.cropX = clamp(snap.cropX + dxPct, 0, 100 - snap.cropW);
                next.cropY = clamp(snap.cropY + dyPct, 0, 100 - snap.cropH);
                break;
            }
            case "tl": {
                const nx = clamp(snap.cropX + dxPct, 0, snap.cropX + snap.cropW - MIN_SZ);
                const ny = clamp(snap.cropY + dyPct, 0, snap.cropY + snap.cropH - MIN_SZ);
                next.cropW = snap.cropW + (snap.cropX - nx);
                next.cropH = snap.cropH + (snap.cropY - ny);
                next.cropX = nx; next.cropY = ny;
                break;
            }
            case "tr": {
                const ny = clamp(snap.cropY + dyPct, 0, snap.cropY + snap.cropH - MIN_SZ);
                next.cropW = clamp(snap.cropW + dxPct, MIN_SZ, 100 - snap.cropX);
                next.cropH = snap.cropH + (snap.cropY - ny);
                next.cropY = ny;
                break;
            }
            case "bl": {
                const nx = clamp(snap.cropX + dxPct, 0, snap.cropX + snap.cropW - MIN_SZ);
                next.cropW = snap.cropW + (snap.cropX - nx);
                next.cropH = clamp(snap.cropH + dyPct, MIN_SZ, 100 - snap.cropY);
                next.cropX = nx;
                break;
            }
            case "br": {
                next.cropW = clamp(snap.cropW + dxPct, MIN_SZ, 100 - snap.cropX);
                next.cropH = clamp(snap.cropH + dyPct, MIN_SZ, 100 - snap.cropY);
                break;
            }
            case "tc": {
                const ny = clamp(snap.cropY + dyPct, 0, snap.cropY + snap.cropH - MIN_SZ);
                next.cropH = snap.cropH + (snap.cropY - ny);
                next.cropY = ny;
                break;
            }
            case "bc": {
                next.cropH = clamp(snap.cropH + dyPct, MIN_SZ, 100 - snap.cropY);
                break;
            }
            case "ml": {
                const nx = clamp(snap.cropX + dxPct, 0, snap.cropX + snap.cropW - MIN_SZ);
                next.cropW = snap.cropW + (snap.cropX - nx);
                next.cropX = nx;
                break;
            }
            case "mr": {
                next.cropW = clamp(snap.cropW + dxPct, MIN_SZ, 100 - snap.cropX);
                break;
            }
            default: break;
        }

        setCs(next);
    }, [cs, drag, getImgDims, hitHandle, getCursor]);

    const onPointerUp = useCallback(() => { drag.current = null; }, []);

    /* ── Pinch (zoom móvil) ── */
    const onTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            lastTouch.current = {
                dist: Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY,
                ),
                zoom: cs.zoom,
            };
            drag.current = null; // anular arrastre durante pinch
            return;
        }
        onPointerDown(e);
    }, [cs.zoom, onPointerDown]);

    const onTouchMove = useCallback((e) => {
        if (e.touches.length === 2 && lastTouch.current) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY,
            );
            const factor = dist / lastTouch.current.dist;
            setCs((c) => ({ ...c, zoom: clamp(c.zoom * factor, 0.5, 5) }));
            lastTouch.current = { ...lastTouch.current, dist };
            return;
        }
        onPointerMove(e);
    }, [onPointerMove]);

    const onTouchEnd = useCallback((e) => {
        if (e.touches.length < 2) lastTouch.current = null;
        onPointerUp();
    }, [onPointerUp]);

    /* ── Rueda del mouse (zoom desktop) ── */
    const onWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.92 : 1.08;
        setCs((c) => ({ ...c, zoom: clamp(c.zoom * delta, 0.5, 5) }));
    }, []);

    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [onWheel]);

    /* ── Rotar ── */
    const rotate = () => {
        setCs((c) => ({
            ...c,
            rotation: (c.rotation + 90) % 360,
            cropX: 5, cropY: 5, cropW: 90, cropH: 90,
        }));
    };

    /* ── Restablecer ── */
    const reset = () => setCs({ ...INITIAL_CROP });

    /* ── Aplicar ── */
    const [applying, setApplying] = useState(false);
    const handleApply = async () => {
        setApplying(true);
        try {
            const [dataURL, file] = await Promise.all([
                applyFreeCrop(src, cs, false),
                applyFreeCrop(src, cs, true),
            ]);
            onApply({ dataURL, file, cropState: { ...cs } });
        } catch (err) {
            console.error("Error al aplicar recorte:", err);
        } finally {
            setApplying(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                {/* ── Header ── */}
                <div style={styles.modalHeader}>
                    <div style={styles.modalTitle}>
                        <IoCropOutline size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                        <span>Ajustar recorte</span>
                    </div>
                    <div style={styles.modalHeaderActions}>
                        <button style={styles.rotateBtn} onClick={rotate} title="Rotar 90°">
                            <IoRefresh size={15} />
                            <span>Rotar</span>
                        </button>
                        <button style={styles.resetBtn} onClick={reset} title="Restablecer">
                            Restablecer
                        </button>
                        <button style={styles.closeBtn} onClick={onCancel} title="Cancelar">
                            <IoCloseOutline size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Canvas ── */}
                <div ref={containerRef} style={styles.canvasWrap}>
                    {!imgLoaded && (
                        <div style={styles.loadingOverlay}>
                            <div style={styles.spinner} />
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }}
                        onMouseDown={onPointerDown}
                        onMouseMove={onPointerMove}
                        onMouseUp={onPointerUp}
                        onMouseLeave={onPointerUp}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    />
                </div>

                {/* ── Hints ── */}
                <div style={styles.hints}>
                    <span style={styles.hintPill}>✦ Arrastra la imagen para moverla</span>
                    <span style={styles.hintPill}>✦ Pellizca o usa la rueda para hacer zoom</span>
                    <span style={styles.hintPill}>✦ Arrastra los puntos blancos para recortar</span>
                </div>

                {/* ── Footer con zoom y aplicar ── */}
                <div style={styles.modalFooter}>
                    <div style={styles.zoomRow}>
                        <span style={styles.zoomLabel}>Zoom</span>
                        <input
                            type="range" min="0.5" max="5" step="0.05"
                            value={cs.zoom}
                            onChange={(e) => setCs((c) => ({ ...c, zoom: parseFloat(e.target.value) }))}
                            style={styles.zoomSlider}
                        />
                        <span style={styles.zoomVal}>{Math.round(cs.zoom * 100)}%</span>
                    </div>
                    <div style={styles.footerActions}>
                        <button style={styles.cancelBtn} onClick={onCancel} disabled={applying}>
                            Cancelar
                        </button>
                        <button style={{ ...styles.applyBtn, opacity: applying ? 0.65 : 1 }}
                            onClick={handleApply} disabled={applying}>
                            {applying
                                ? <><InlineSpinner />Procesando…</>
                                : <><IoCheckmarkOutline size={15} />Aplicar recorte</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Spinner inline ── */
const InlineSpinner = () => (
    <span style={{
        display: "inline-block", width: 14, height: 14,
        border: "2.5px solid rgba(255,255,255,0.25)",
        borderTopColor: "#fff", borderRadius: "50%",
        animation: "cropSpin 0.6s linear infinite", marginRight: 7,
    }} />
);

/* ════════════════════════════════════════════════════════
   CONTENT IMAGE UPLOAD — componente público
════════════════════════════════════════════════════════ */
export function ContentImageUpload({ con, onUpdate }) {
    const inputRef             = useRef();
    const [drag, setDrag]      = useState(false);
    const [showCrop, setShowCrop] = useState(false);

    /* Procesar archivo seleccionado */
    const processFile = (file) => {
        if (!file?.type.startsWith("image/")) return;
        onUpdate({
            imagen_file:            file,
            imagen_preview:         URL.createObjectURL(file),
            imagen_url:             "",
            imagen_crop:            null,
            imagen_cropped_preview: null,
            imagen_cropped_file:    null,
        });
        setShowCrop(true);
    };

    /* Cuando el usuario aplica el recorte desde el modal */
    const handleCropApply = ({ dataURL, file, cropState }) => {
        onUpdate({
            imagen_crop:            cropState,
            imagen_cropped_preview: dataURL,
            imagen_cropped_file:    file,
        });
        setShowCrop(false);
    };

    /* Eliminar imagen */
    const handleDelete = () => {
        onUpdate({
            imagen_file:            null,
            imagen_preview:         null,
            imagen_url:             "",
            imagen_crop:            null,
            imagen_cropped_preview: null,
            imagen_cropped_file:    null,
        });
        setShowCrop(false);
    };

    const hasSrc     = !!(con.imagen_preview || con.imagen_url);
    const hasCropped = !!con.imagen_cropped_preview;
    const cropSrc    = con.imagen_preview || con.imagen_url;

    return (
        <>
            {/* ── Zona principal ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!hasSrc ? (
                    /* Drop zone */
                    <div
                        style={{
                            ...styles.dropZone,
                            ...(drag ? styles.dropZoneActive : {}),
                        }}
                        onClick={() => inputRef.current.click()}
                        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={(e) => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); }}
                    >
                        <IoImageOutline size={28} style={{ color: drag ? "var(--accent-mid)" : "var(--ink-muted)" }} />
                        <p style={styles.dropZoneText}>Agregar imagen al bloque</p>
                        <small style={styles.dropZoneHint}>Arrastra o haz clic · Recorta libremente</small>
                    </div>
                ) : (
                    /* Preview del resultado recortado o estado pendiente */
                    <div style={styles.previewCard}>
                        {hasCropped ? (
                            <div style={styles.previewImgWrap}>
                                <img
                                    src={con.imagen_cropped_preview}
                                    alt="imagen recortada"
                                    style={styles.previewImg}
                                />
                                <div style={styles.croppedBadge}>
                                    <IoCropOutline size={11} /> Recortada
                                </div>
                            </div>
                        ) : (
                            <div style={styles.pendingNotice}>
                                <IoCropOutline size={14} style={{ flexShrink: 0 }} />
                                <span>Imagen cargada — abre el editor para recortarla</span>
                            </div>
                        )}

                        {/* Acciones */}
                        <div style={styles.actionRow}>
                            <button style={styles.actionBtn} onClick={() => setShowCrop(true)}>
                                <IoCropOutline size={13} />
                                {hasCropped ? "Editar recorte" : "Recortar imagen"}
                            </button>
                            <button style={styles.actionBtn} onClick={() => inputRef.current.click()}>
                                <IoCloudUploadOutline size={13} /> Cambiar
                            </button>
                            <button style={{ ...styles.actionBtn, ...styles.actionBtnDanger }} onClick={handleDelete}>
                                <IoTrashOutline size={13} /> Eliminar
                            </button>
                        </div>
                    </div>
                )}

                <input
                    ref={inputRef} type="file" accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => processFile(e.target.files[0])}
                />
            </div>

            {/* ── Modal de recorte ── */}
            {showCrop && cropSrc && (
                <CropModal
                    src={cropSrc}
                    initialState={con.imagen_crop ?? INITIAL_CROP}
                    onApply={handleCropApply}
                    onCancel={() => setShowCrop(false)}
                />
            )}

            {/* Keyframe para spinners */}
            <style>{`
                @keyframes cropSpin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}

/* ════════════════════════════════════════════════════════
   INLINE STYLES
   (usan var() del design system de EditorCurso.css
    cuando están disponibles, con fallbacks hardcoded)
════════════════════════════════════════════════════════ */
const styles = {
    /* Drop zone */
    dropZone: {
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 10, height: 110,
        border: "2px dashed #D4D4CE", borderRadius: 12,
        background: "#F7F7F5", cursor: "pointer",
        transition: "all 0.14s ease", textAlign: "center", padding: 16,
        userSelect: "none",
    },
    dropZoneActive: {
        borderColor: "#3B6494", background: "#EEF3FA",
    },
    dropZoneText: {
        fontSize: 13, fontWeight: 500, color: "#6B6B63", margin: 0,
    },
    dropZoneHint: {
        fontSize: 11.5, color: "#9B9B94",
    },

    /* Preview card */
    previewCard: {
        display: "flex", flexDirection: "column", gap: 10,
    },
    previewImgWrap: {
        position: "relative", borderRadius: 10, overflow: "hidden",
        border: "1.5px solid #E8E8E4",
    },
    previewImg: {
        width: "100%", display: "block", objectFit: "cover",
    },
    croppedBadge: {
        position: "absolute", top: 8, left: 8,
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "rgba(22,163,74,.88)", color: "#fff",
        fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em",
        padding: "3px 9px", borderRadius: 20, pointerEvents: "none",
    },
    pendingNotice: {
        display: "flex", alignItems: "center", gap: 8,
        background: "#FFFBEB", border: "1px solid #FDE68A",
        borderRadius: 9, padding: "9px 14px",
        fontSize: 12.5, fontWeight: 500, color: "#D97706",
    },
    actionRow: {
        display: "flex", gap: 8, flexWrap: "wrap",
    },
    actionBtn: {
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 8,
        border: "1px solid #E8E8E4", background: "#fff",
        fontSize: 12.5, fontWeight: 500, color: "#6B6B63",
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.14s ease",
    },
    actionBtnDanger: {
        color: "#DC2626",
    },

    /* Modal overlay */
    overlay: {
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "none",
    },
    modal: {
        width: "100%", maxWidth: 720,
        background: "#0F172A",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        border: "1px solid rgba(255,255,255,0.08)",
        maxHeight: "calc(100vh - 32px)",
    },

    /* Modal header */
    modalHeader: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
    },
    modalTitle: {
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
    },
    modalHeaderActions: {
        display: "flex", alignItems: "center", gap: 8,
    },
    rotateBtn: {
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 14px", borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.7)", fontSize: 12.5, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.14s ease",
    },
    resetBtn: {
        padding: "5px 12px", borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "transparent",
        color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.14s ease",
    },
    closeBtn: {
        width: 32, height: 32, borderRadius: 8,
        border: "none", background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.14s ease",
    },

    /* Canvas area */
    canvasWrap: {
        position: "relative",
        width: "100%", height: 380,
        background: "#0a0f1a",
        overflow: "hidden",
        flexShrink: 0,
        display: "block",
    },
    loadingOverlay: {
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0a0f1a",
    },
    spinner: {
        width: 32, height: 32, borderRadius: "50%",
        border: "2.5px solid transparent",
        borderTopColor: "#3B6494", borderLeftColor: "#3B6494",
        animation: "cropSpin 0.7s linear infinite",
    },

    /* Hints */
    hints: {
        display: "flex", gap: 8, flexWrap: "wrap",
        padding: "10px 18px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
    },
    hintPill: {
        fontSize: 10.5, fontWeight: 500,
        color: "rgba(255,255,255,0.3)",
        background: "rgba(255,255,255,0.04)",
        padding: "3px 10px", borderRadius: 20,
        whiteSpace: "nowrap",
    },

    /* Modal footer */
    modalFooter: {
        padding: "14px 18px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap",
        flexShrink: 0,
    },
    zoomRow: {
        display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 140,
    },
    zoomLabel: {
        fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
        minWidth: 32, flexShrink: 0,
    },
    zoomSlider: {
        flex: 1, WebkitAppearance: "none", appearance: "none",
        height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)",
        outline: "none", cursor: "pointer",
    },
    zoomVal: {
        fontSize: 11.5, fontWeight: 700, color: "#93C5FD",
        minWidth: 38, textAlign: "right", flexShrink: 0,
    },
    footerActions: {
        display: "flex", gap: 8, flexShrink: 0,
    },
    cancelBtn: {
        padding: "9px 20px", borderRadius: 9,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.55)", fontSize: 13.5, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.14s ease",
    },
    applyBtn: {
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "9px 22px", background: "#16A34A", color: "#fff",
        border: "none", borderRadius: 9,
        fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 2px 8px rgba(22,163,74,.35)",
        transition: "all 0.14s ease",
    },
};