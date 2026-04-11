import { useState, useRef, useEffect, useCallback } from "react";

/* ─── utilidad: clampar ──────────────────────────────── */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ─── aplicar recorte con rotación ──────────────────── */
export const applyFreeCrop = (src, state, asFile = false) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const rad = (state.rotation * Math.PI) / 180;
            const cosA = Math.abs(Math.cos(rad));
            const sinA = Math.abs(Math.sin(rad));
            const rotW = img.naturalWidth * cosA + img.naturalHeight * sinA;
            const rotH = img.naturalWidth * sinA + img.naturalHeight * cosA;

            const rot = document.createElement("canvas");
            rot.width = rotW;
            rot.height = rotH;
            const rCtx = rot.getContext("2d");
            rCtx.translate(rotW / 2, rotH / 2);
            rCtx.rotate(rad);
            rCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

            const sx = (state.cropX / 100) * rotW;
            const sy = (state.cropY / 100) * rotH;
            const sw = (state.cropW / 100) * rotW;
            const sh = (state.cropH / 100) * rotH;

            const out = document.createElement("canvas");
            out.width = Math.round(sw);
            out.height = Math.round(sh);
            const oCtx = out.getContext("2d");
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
        img.src = src;
    });

export const INITIAL_CROP = { cropX: 5, cropY: 5, cropW: 90, cropH: 90, rotation: 0 };

export function useContentImageUpload(src, initialState) {
    const [cs, setCs] = useState({ ...INITIAL_CROP, ...initialState });
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imgRef = useRef(null);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
    const drag = useRef(null);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => { imgRef.current = i; setImgLoaded(true); };
        i.onerror = () => console.error("Error loading image");
        i.src = src;
    }, [src]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.offsetWidth || el.getBoundingClientRect().width;
            const h = el.offsetHeight || el.getBoundingClientRect().height;
            if (w > 0 && h > 0) {
                if (canvasRef.current) { canvasRef.current.width = w; canvasRef.current.height = h; }
                setContainerSize({ w, h });
            }
        };
        measure();
        const raf = requestAnimationFrame(measure);
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    }, []);

    const getImgDims = useCallback((c, cw, ch) => {
        if (!imgRef.current) return { imgLeft: 0, imgTop: 0, imgDispW: cw, imgDispH: ch };
        const img = imgRef.current;
        const rad = (c.rotation * Math.PI) / 180;
        const cosA = Math.abs(Math.cos(rad));
        const sinA = Math.abs(Math.sin(rad));
        const rotW = img.naturalWidth * cosA + img.naturalHeight * sinA;
        const rotH = img.naturalWidth * sinA + img.naturalHeight * cosA;
        const scale = Math.min(cw / rotW, ch / rotH);
        const imgDispW = rotW * scale;
        const imgDispH = rotH * scale;
        const imgLeft = (cw - imgDispW) / 2;
        const imgTop = (ch - imgDispH) / 2;
        return { imgLeft, imgTop, imgDispW, imgDispH };
    }, []);

    useEffect(() => {
        if (!imgLoaded || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const W = canvas.width;
        const H = canvas.height;
        if (W === 0 || H === 0) return;
        const img = imgRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, W, H);

        const rad = (cs.rotation * Math.PI) / 180;
        const { imgLeft, imgTop, imgDispW, imgDispH } = getImgDims(cs, W, H);
        const cosA = Math.abs(Math.cos(rad));
        const sinA = Math.abs(Math.sin(rad));
        const rotW = img.naturalWidth * cosA + img.naturalHeight * sinA;
        const rotH = img.naturalWidth * sinA + img.naturalHeight * cosA;
        const scale = Math.min(W / rotW, H / rotH);

        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(rad);
        ctx.scale(scale, scale);
        ctx.globalAlpha = 0.35;
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        const rx = imgLeft + (cs.cropX / 100) * imgDispW;
        const ry = imgTop + (cs.cropY / 100) * imgDispH;
        const rw = (cs.cropW / 100) * imgDispW;
        const rh = (cs.cropH / 100) * imgDispH;

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

        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.52)";
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.rect(rx, ry, rw, rh);
        ctx.fill("evenodd");
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx + 0.75, ry + 0.75, rw - 1.5, rh - 1.5);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1;
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(rx + rw * i / 3, ry); ctx.lineTo(rx + rw * i / 3, ry + rh); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rx, ry + rh * i / 3); ctx.lineTo(rx + rw, ry + rh * i / 3); ctx.stroke();
        }
        ctx.restore();

        const handles = getHandlePositions(rx, ry, rw, rh);
        Object.values(handles).forEach(([hx, hy]) => {
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 1;
            ctx.shadowColor = "rgba(0,0,0,0.4)";
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(hx, hy, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });
    }, [imgLoaded, cs, containerSize, getImgDims]);

    const getHandlePositions = (rx, ry, rw, rh) => ({
        tl: [rx, ry], tc: [rx + rw / 2, ry], tr: [rx + rw, ry],
        ml: [rx, ry + rh / 2], mr: [rx + rw, ry + rh / 2],
        bl: [rx, ry + rh], bc: [rx + rw / 2, ry + rh], br: [rx + rw, ry + rh],
    });

    const hitHandle = useCallback((px, py, c) => {
        const W = canvasRef.current?.width || 0;
        const H = canvasRef.current?.height || 0;
        const { imgLeft, imgTop, imgDispW, imgDispH } = getImgDims(c, W, H);
        const rx = imgLeft + (c.cropX / 100) * imgDispW;
        const ry = imgTop + (c.cropY / 100) * imgDispH;
        const rw = (c.cropW / 100) * imgDispW;
        const rh = (c.cropH / 100) * imgDispH;
        const handles = getHandlePositions(rx, ry, rw, rh);
        const R = 14;
        for (const [key, [hx, hy]] of Object.entries(handles))
            if (Math.hypot(px - hx, py - hy) < R) return key;
        if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) return "move";
        return null;
    }, [getImgDims]);

    const getCursor = useCallback((handle) => ({
        tl: "nwse-resize", br: "nwse-resize",
        tr: "nesw-resize", bl: "nesw-resize",
        tc: "ns-resize", bc: "ns-resize",
        ml: "ew-resize", mr: "ew-resize",
        move: "grab",
    }[handle] ?? "crosshair"), []);

    const onPointerDown = useCallback((e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const px = (e.clientX ?? e.touches[0].clientX) - rect.left;
        const py = (e.clientY ?? e.touches[0].clientY) - rect.top;
        const hit = hitHandle(px, py, cs);
        if (!hit) return;
        e.preventDefault();
        drag.current = { type: hit, startX: px, startY: py, snap: { ...cs } };
    }, [cs, hitHandle]);

    const onPointerMove = useCallback((e) => {
        if (!drag.current && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const px = (e.clientX ?? (e.touches?.[0]?.clientX ?? 0)) - rect.left;
            const py = (e.clientY ?? (e.touches?.[0]?.clientY ?? 0)) - rect.top;
            const hit = hitHandle(px, py, cs);
            canvasRef.current.style.cursor = hit ? getCursor(hit) : "crosshair";
        }
        if (!drag.current) return;
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const px = (e.clientX ?? e.touches[0].clientX) - rect.left;
        const py = (e.clientY ?? e.touches[0].clientY) - rect.top;
        const dx = px - drag.current.startX;
        const dy = py - drag.current.startY;
        const W = canvasRef.current?.width || 0;
        const H = canvasRef.current?.height || 0;
        const { imgDispW, imgDispH } = getImgDims(drag.current.snap, W, H);
        const snap = drag.current.snap;
        const dxPct = (dx / imgDispW) * 100;
        const dyPct = (dy / imgDispH) * 100;
        const MIN_SZ = 5;
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
            case "bc": next.cropH = clamp(snap.cropH + dyPct, MIN_SZ, 100 - snap.cropY); break;
            case "ml": {
                const nx = clamp(snap.cropX + dxPct, 0, snap.cropX + snap.cropW - MIN_SZ);
                next.cropW = snap.cropW + (snap.cropX - nx);
                next.cropX = nx;
                break;
            }
            case "mr": next.cropW = clamp(snap.cropW + dxPct, MIN_SZ, 100 - snap.cropX); break;
            default: break;
        }
        setCs(next);
    }, [cs, drag, getImgDims, hitHandle, getCursor]);

    const onPointerUp = useCallback(() => { drag.current = null; }, []);
    const onTouchStart = useCallback((e) => { if (e.touches.length >= 2) return; onPointerDown(e); }, [onPointerDown]);
    const onTouchMove = useCallback((e) => { if (e.touches.length >= 2) return; onPointerMove(e); }, [onPointerMove]);
    const onTouchEnd = useCallback(() => { onPointerUp(); }, [onPointerUp]);

    const rotate = () => setCs((c) => ({ ...c, rotation: (c.rotation + 90) % 360, cropX: 5, cropY: 5, cropW: 90, cropH: 90 }));
    const reset = () => setCs({ ...INITIAL_CROP });

    const handleApply = async (onApply) => {
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

    return {
        cs,
        canvasRef,
        containerRef,
        imgLoaded,
        applying,
        rotate,
        reset,
        handleApply,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    };
}