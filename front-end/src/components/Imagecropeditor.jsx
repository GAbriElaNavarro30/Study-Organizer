import { useRef, useState, useEffect, useCallback } from "react";

/**
 * ImageCropEditor
 * Props:
 *   imageSrc   – URL (object URL) de la imagen a editar
 *   onConfirm  – callback(blob) cuando el usuario confirma
 *   onCancel   – callback() cuando el usuario cancela
 *   size       – diámetro del recorte circular en px (default 280)
 */
export function ImageCropEditor({ imageSrc, onConfirm, onCancel, size = 280 }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Estado de transformación
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef(null);
    const imageRef = useRef(null);

    // Cargar imagen y centrarla
    useEffect(() => {
        if (!imageSrc) return;
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;
            setImageSize({ w: iw, h: ih });

            // Escala inicial para cubrir el área de recorte
            const initScale = Math.max(size / iw, size / ih);
            setScale(initScale);
            setOffset({ x: 0, y: 0 });
        };
        img.src = imageSrc;
    }, [imageSrc, size]);

    // Dibujar en canvas
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Fondo oscuro semitransparente
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, w, h);

        // Calcular posición de la imagen según escala y offset
        const iw = img.naturalWidth * scale;
        const ih = img.naturalHeight * scale;
        const cx = w / 2 + offset.x;
        const cy = h / 2 + offset.y;
        const ix = cx - iw / 2;
        const iy = cy - ih / 2;

        // Recorte circular (clip)
        ctx.save();
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, ix, iy, iw, ih);
        ctx.restore();

        // Borde del círculo
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Guías de tercios (dentro del círculo)
        ctx.save();
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
            const x = w / 2 - size / 2 + (size / 3) * i;
            const y = h / 2 - size / 2 + (size / 3) * i;
            ctx.beginPath(); ctx.moveTo(x, h / 2 - size / 2); ctx.lineTo(x, h / 2 + size / 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w / 2 - size / 2, y); ctx.lineTo(w / 2 + size / 2, y); ctx.stroke();
        }
        ctx.restore();
    }, [scale, offset, imageSize, size]);

    useEffect(() => {
        draw();
    }, [draw]);

    // ====================== DRAG ======================
    const getPoint = (e) => {
        if (e.touches) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const onMouseDown = (e) => {
        e.preventDefault();
        setDragging(true);
        dragStart.current = { ...getPoint(e), ox: offset.x, oy: offset.y };
    };

    const onMouseMove = useCallback((e) => {
        if (!dragging || !dragStart.current) return;
        const p = getPoint(e);
        const dx = p.x - dragStart.current.x;
        const dy = p.y - dragStart.current.y;

        const img = imageRef.current;
        if (!img) return;

        const iw = img.naturalWidth * scale;
        const ih = img.naturalHeight * scale;
        const maxOffX = Math.max(0, (iw - size) / 2);
        const maxOffY = Math.max(0, (ih - size) / 2);

        setOffset({
            x: Math.max(-maxOffX, Math.min(maxOffX, dragStart.current.ox + dx)),
            y: Math.max(-maxOffY, Math.min(maxOffY, dragStart.current.oy + dy)),
        });
    }, [dragging, scale, size]);

    const onMouseUp = () => setDragging(false);

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove, { passive: false });
        window.addEventListener("touchend", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onMouseMove);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, [onMouseMove]);

    // ====================== ZOOM ======================
    const handleScaleChange = (e) => {
        const newScale = parseFloat(e.target.value);
        const img = imageRef.current;
        if (!img) return;

        // Reajustar offset para que no quede fuera de rango
        const iw = img.naturalWidth * newScale;
        const ih = img.naturalHeight * newScale;
        const maxOffX = Math.max(0, (iw - size) / 2);
        const maxOffY = Math.max(0, (ih - size) / 2);

        setOffset(prev => ({
            x: Math.max(-maxOffX, Math.min(maxOffX, prev.x)),
            y: Math.max(-maxOffY, Math.min(maxOffY, prev.y)),
        }));
        setScale(newScale);
    };

    // ====================== CONFIRMAR ======================
    const handleConfirm = () => {
        const img = imageRef.current;
        if (!img) return;

        const outputCanvas = document.createElement("canvas");
        const outputSize = 400;
        outputCanvas.width = outputSize;
        outputCanvas.height = outputSize;
        const ctx = outputCanvas.getContext("2d");

        // Escalar desde el canvas de previsualización al canvas de salida
        const ratio = outputSize / size;
        const canvasW = canvasRef.current.width;
        const canvasH = canvasRef.current.height;

        const iw = img.naturalWidth * scale;
        const ih = img.naturalHeight * scale;
        const cx = canvasW / 2 + offset.x;
        const cy = canvasH / 2 + offset.y;
        const ix = cx - iw / 2;
        const iy = cy - ih / 2;

        // Recorte de la región circular
        const cropX = canvasW / 2 - size / 2;
        const cropY = canvasH / 2 - size / 2;
        const relIx = ix - cropX;
        const relIy = iy - cropY;

        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img,
            relIx * ratio, relIy * ratio,
            iw * ratio, ih * ratio
        );

        outputCanvas.toBlob((blob) => {
            onConfirm(blob);
        }, "image/jpeg", 0.95);
    };

    const canvasSize = size + 120;
    const minScale = imageRef.current
        ? Math.max(size / imageRef.current.naturalWidth, size / imageRef.current.naturalHeight)
        : 1;
    const maxScale = minScale * 4;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <p style={styles.title}>Ajustar foto de perfil</p>
                <p style={styles.hint}>Arrastra para reposicionar · Usa el control para hacer zoom</p>

                {/* Canvas de edición */}
                <div ref={containerRef} style={{ display: "flex", justifyContent: "center" }}>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize}
                        height={canvasSize}
                        style={{
                            cursor: dragging ? "grabbing" : "grab",
                            borderRadius: "12px",
                            maxWidth: "100%",
                        }}
                        onMouseDown={onMouseDown}
                        onTouchStart={onMouseDown}
                    />
                </div>

                {/* Slider de zoom */}
                <div style={styles.sliderRow}>
                    <span style={styles.sliderIcon}>🔍−</span>
                    <input
                        type="range"
                        min={minScale}
                        max={maxScale}
                        step={0.01}
                        value={scale}
                        onChange={handleScaleChange}
                        style={styles.slider}
                    />
                    <span style={styles.sliderIcon}>🔍+</span>
                </div>

                {/* Botones */}
                <div style={styles.btnRow}>
                    <button style={styles.btnCancel} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button style={styles.btnConfirm} onClick={handleConfirm}>
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
    },
    modal: {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "28px 28px 24px",
        maxWidth: "460px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },
    title: {
        margin: "0 0 4px",
        fontSize: "1rem",
        fontWeight: 600,
        color: "#111827",
        textAlign: "center",
    },
    hint: {
        margin: "0 0 16px",
        fontSize: "0.8rem",
        color: "#6B7280",
        textAlign: "center",
    },
    sliderRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: "16px 0 20px",
    },
    slider: {
        flex: 1,
        accentColor: "#2563EB",
    },
    sliderIcon: {
        fontSize: "0.85rem",
        color: "#6B7280",
        userSelect: "none",
    },
    btnRow: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
    },
    btnCancel: {
        padding: "9px 20px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#E5E7EB",
        color: "#374151",
        fontWeight: 500,
        cursor: "pointer",
        fontSize: "0.9rem",
    },
    btnConfirm: {
        padding: "9px 22px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#2563EB",
        color: "#ffffff",
        fontWeight: 500,
        cursor: "pointer",
        fontSize: "0.9rem",
    },
};