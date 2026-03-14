import { useRef, useState, useEffect, useCallback } from "react";
import "../styles/ImageCropModal.css";

/**
 * ImageCropModal
 * Props:
 *   - file: File | Blob
 *   - type: "perfil" | "portada"
 *   - onConfirm: (croppedBlob, previewUrl) => void
 *   - onCancel: () => void
 */
export function ImageCropModal({ file, type = "perfil", onConfirm, onCancel }) {
  // ── Canvas principal (preview con overlay) ──
  const previewCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // ── Imagen fuente ──
  const [imgEl, setImgEl] = useState(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  // ── Transformación ──
  const scaleRef = useRef(1);          // fuente de verdad para scale (sin stale closure)
  const offsetRef = useRef({ x: 0, y: 0 });
  const [renderTick, setRenderTick] = useState(0); // fuerza re-render del canvas
  const [scaleDisplay, setScaleDisplay] = useState(1); // solo para la barra visual

  // ── Drag ──
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // ── Pinch ──
  const lastPinchDist = useRef(null);

  // ── Dimensiones del área de recorte ──
  // Canvas de preview más pequeño para que quepa en pantalla,
  // pero la imagen final se genera al tamaño real.
  const REAL_W = type === "portada" ? 780 : 400;
  const REAL_H = type === "portada" ? 260 : 400;

  // Preview: escala para que quepa en pantalla (max 95vw / 90vh)
  const MAX_PX = typeof window !== "undefined" ? Math.min(window.innerWidth * 0.9, 820) : 700;
  const PREVIEW_SCALE = Math.min(1, MAX_PX / REAL_W, (typeof window !== "undefined" ? window.innerHeight * 0.55 : 500) / REAL_H);
  const CANVAS_W = Math.round(REAL_W * PREVIEW_SCALE);
  const CANVAS_H = Math.round(REAL_H * PREVIEW_SCALE);

  const IS_CIRCLE = type === "perfil";
  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  // ── Helpers ──────────────────────────────────────────────
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const clampOffset = useCallback(
    (ox, oy, sc) => {
      if (!naturalW || !naturalH) return { x: ox, y: oy };
      const imgW = naturalW * sc;
      const imgH = naturalH * sc;
      const maxX = Math.max(0, (imgW - CANVAS_W) / 2);
      const maxY = Math.max(0, (imgH - CANVAS_H) / 2);
      return {
        x: clamp(ox, -maxX, maxX),
        y: clamp(oy, -maxY, maxY),
      };
    },
    [naturalW, naturalH, CANVAS_W, CANVAS_H]
  );

  const applyScale = useCallback(
    (newScale) => {
      const sc = clamp(newScale, MIN_SCALE, MAX_SCALE);
      scaleRef.current = sc;
      // Re-clamp offset con nueva escala
      const clamped = clampOffset(offsetRef.current.x, offsetRef.current.y, sc);
      offsetRef.current = clamped;
      setScaleDisplay(sc);
      setRenderTick(t => t + 1);
    },
    [clampOffset]
  );

  // ── Cargar imagen ──────────────────────────────────────────
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      setNaturalW(img.naturalWidth);
      setNaturalH(img.naturalHeight);

      // Escala inicial: cubrir el área de preview exactamente
      const sx = CANVAS_W / img.naturalWidth;
      const sy = CANVAS_H / img.naturalHeight;
      const init = Math.max(sx, sy);
      scaleRef.current = init;
      offsetRef.current = { x: 0, y: 0 };
      setScaleDisplay(init);
      setRenderTick(t => t + 1);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, CANVAS_W, CANVAS_H]);

  // ── Dibujar canvas preview ─────────────────────────────────
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !imgEl) return;

    const sc = scaleRef.current;
    const { x: ox, y: oy } = offsetRef.current;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 1. Dibujar imagen
    const imgW = naturalW * sc;
    const imgH = naturalH * sc;
    const ix = (CANVAS_W - imgW) / 2 + ox;
    const iy = (CANVAS_H - imgH) / 2 + oy;
    ctx.drawImage(imgEl, ix, iy, imgW, imgH);

    // 2. Overlay oscuro SOLO fuera del área de recorte
    //    Técnica: fill todo oscuro, luego "borrar" el área de recorte
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.48)";

    if (IS_CIRCLE) {
      // Rellenar todo EXCEPTO el círculo usando "evenodd"
      const cx = CANVAS_W / 2;
      const cy = CANVAS_H / 2;
      const r = Math.min(CANVAS_W, CANVAS_H) / 2 - 1;
      ctx.beginPath();
      ctx.rect(0, 0, CANVAS_W, CANVAS_H); // exterior
      ctx.arc(cx, cy, r, 0, Math.PI * 2, true); // círculo como "agujero"
      ctx.fill("evenodd");
    } else {
      // Para portada no hay overlay — el área completa ES el recorte
      // Solo dibujamos el borde guía
    }
    ctx.restore();

    // 3. Borde del área de recorte
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1.5;
    if (IS_CIRCLE) {
      const cx = CANVAS_W / 2;
      const cy = CANVAS_H / 2;
      const r = Math.min(CANVAS_W, CANVAS_H) / 2 - 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Líneas guía de tercios (como Instagram/WhatsApp para portada)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      // Verticales
      ctx.beginPath();
      ctx.moveTo(CANVAS_W / 3, 0); ctx.lineTo(CANVAS_W / 3, CANVAS_H);
      ctx.moveTo((CANVAS_W / 3) * 2, 0); ctx.lineTo((CANVAS_W / 3) * 2, CANVAS_H);
      // Horizontales
      ctx.moveTo(0, CANVAS_H / 3); ctx.lineTo(CANVAS_W, CANVAS_H / 3);
      ctx.moveTo(0, (CANVAS_H / 3) * 2); ctx.lineTo(CANVAS_W, (CANVAS_H / 3) * 2);
      ctx.stroke();
      // Borde exterior
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);
    }
    ctx.restore();

  }, [renderTick, imgEl, naturalW, naturalH, CANVAS_W, CANVAS_H, IS_CIRCLE]);

  // ── Eventos de mouse ──────────────────────────────────────
  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    const clamped = clampOffset(
      offsetRef.current.x + dx,
      offsetRef.current.y + dy,
      scaleRef.current
    );
    offsetRef.current = clamped;
    setRenderTick(t => t + 1);
  };

  const onMouseUp = () => { dragging.current = false; };

  // ── Wheel zoom ────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.06 : -0.06;
      applyScale(scaleRef.current + delta);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [applyScale]);

  // ── Touch ─────────────────────────────────────────────────
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      dragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPointer.current.x;
      const dy = e.touches[0].clientY - lastPointer.current.y;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const clamped = clampOffset(
        offsetRef.current.x + dx,
        offsetRef.current.y + dy,
        scaleRef.current
      );
      offsetRef.current = clamped;
      setRenderTick(t => t + 1);
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = (dist - lastPinchDist.current) * 0.008;
      lastPinchDist.current = dist;
      applyScale(scaleRef.current + delta);
    }
  };

  const onTouchEnd = () => {
    dragging.current = false;
    lastPinchDist.current = null;
  };

  // ── Zoom buttons ──────────────────────────────────────────
  const zoomIn  = () => applyScale(scaleRef.current + 0.12);
  const zoomOut = () => applyScale(scaleRef.current - 0.12);

  // Porcentaje para la barra visual
  const zoomPct = ((scaleDisplay - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100;

  // ── Confirmar: generar blob al tamaño REAL ────────────────
  const handleConfirm = () => {
    if (!imgEl) return;

    const sc = scaleRef.current;
    const { x: ox, y: oy } = offsetRef.current;

    // Relación entre canvas de preview y tamaño real
    const ratio = REAL_W / CANVAS_W;

    const output = document.createElement("canvas");
    output.width = REAL_W;
    output.height = REAL_H;
    const ctx = output.getContext("2d");

    const imgW = naturalW * sc * ratio;
    const imgH = naturalH * sc * ratio;
    const ix = (REAL_W - imgW) / 2 + ox * ratio;
    const iy = (REAL_H - imgH) / 2 + oy * ratio;

    if (IS_CIRCLE) {
      const r = REAL_H / 2;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(imgEl, ix, iy, imgW, imgH);

    output.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        onConfirm(blob, url);
      },
      "image/jpeg",
      0.93
    );
  };

  return (
    <div className="icm-backdrop">
      <div className="icm-modal">

        {/* ── Header ── */}
        <div className="icm-header">
          <button className="icm-btn-close" onClick={onCancel} aria-label="Cerrar">✕</button>
          <div className="icm-header-text">
            <span className="icm-title">
              {type === "perfil" ? "Ajustar foto de perfil" : "Ajustar foto de portada"}
            </span>
            <span className="icm-subtitle">
              {type === "perfil"
                ? "Arrastra · rueda para zoom"
                : `Arrastra · rueda para zoom · recorte ${REAL_W}×${REAL_H}px`}
            </span>
          </div>
          {/* Badge de tamaño real */}
          <span className="icm-size-badge">{REAL_W} × {REAL_H}</span>
        </div>

        {/* ── Canvas wrapper ── */}
        <div
          className="icm-canvas-wrapper"
          ref={containerRef}
          style={{ width: CANVAS_W, height: CANVAS_H }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <canvas ref={previewCanvasRef} className="icm-canvas" />
        </div>

        {/* ── Zoom controls ── */}
        <div className="icm-zoom-controls">
          <button
            className="icm-zoom-btn"
            onClick={zoomOut}
            disabled={scaleDisplay <= MIN_SCALE}
            aria-label="Alejar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          <div className="icm-zoom-track">
            <div className="icm-zoom-fill" style={{ width: `${zoomPct}%` }} />
            <div className="icm-zoom-thumb" style={{ left: `calc(${zoomPct}% - 8px)` }} />
          </div>

          <button
            className="icm-zoom-btn"
            onClick={zoomIn}
            disabled={scaleDisplay >= MAX_SCALE}
            aria-label="Acercar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          <span className="icm-zoom-label">{Math.round(zoomPct)}%</span>
        </div>

        {/* ── Acciones ── */}
        <div className="icm-actions">
          <button className="icm-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="icm-btn-confirm" onClick={handleConfirm}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Aplicar
          </button>
        </div>

      </div>
    </div>
  );
}