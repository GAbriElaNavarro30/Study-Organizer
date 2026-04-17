import { useState, useEffect, useRef } from "react";
import {
    IoCloseOutline,
    IoCheckmarkCircleOutline,
    IoSparklesOutline,
    IoLeafOutline,
    IoWaterOutline,
    IoFlameOutline,
} from "react-icons/io5";
import "../styles/ModalNuevaEmocion.css";

/* ─── Clasificaciones ─── */
const CLASIFS = [
    { value: "positiva", label: "Positiva", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
    { value: "neutra", label: "Neutra", color: "#64748b", bg: "#f8fafc", border: "#cbd5e1" },
    { value: "negativa", label: "Negativa", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
];

/* ─── Niveles de intensidad ─── */
const NIVELES = [
    {
        value: "bajo",
        label: "Bajo",
        desc: "Apenas perceptible",
        icon: IoLeafOutline,
        color: "#34d399",
        bg: "#ecfdf5",
        border: "#a7f3d0",
    },
    {
        value: "medio",
        label: "Medio",
        desc: "Notablemente presente",
        icon: IoWaterOutline,
        color: "#60a5fa",
        bg: "#eff6ff",
        border: "#bfdbfe",
    },
    {
        value: "alto",
        label: "Alto",
        desc: "Muy intenso",
        icon: IoFlameOutline,
        color: "#f87171",
        bg: "#fef2f2",
        border: "#fecaca",
    },
];

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export function ModalNuevaEmocion({ visible, onClose, onGuardar }) {
    const [nombre, setNombre] = useState("");
    const [clasif, setClasif] = useState(null);
    const [nivel, setNivel] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const inputRef = useRef(null);

    /* Enfocar input al abrir */
    useEffect(() => {
        if (visible) {
            setTimeout(() => inputRef.current?.focus(), 120);
            setNombre(""); setClasif(null); setNivel(null);
            setError(""); setExito(false); setCargando(false);
        }
    }, [visible]);

    /* Cerrar con Escape */
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        if (visible) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [visible, onClose]);

    if (!visible) return null;

    /* ── Validar y enviar ── */
    const handleGuardar = async () => {
        const nombreTrim = nombre.trim();
        if (!nombreTrim) return setError("Escribe el nombre de la emoción.");
        if (!clasif) return setError("Selecciona una clasificación.");
        if (!nivel) return setError("Selecciona el nivel de intensidad.");
        if (nombreTrim.length > 100) return setError("El nombre no puede superar 100 caracteres.");

        setError("");
        setCargando(true);

        try {
            const res = await fetch("http://localhost:3000/dashboard/emociones/agregar", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre_emocion: nombreTrim,
                    categoria: clasif,
                    nivel,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.mensaje || "Error al guardar la emoción.");
                setCargando(false);
                return;
            }

            setExito(true);
            setTimeout(() => {
                onGuardar({ label: nombreTrim, clasif, nivel, id: data.emocion?.id_emocion });
                onClose();
            }, 900);

        } catch {
            setError("No se pudo conectar con el servidor.");
            setCargando(false);
        }
    };

    const clasifActual = CLASIFS.find(c => c.value === clasif);
    const nivelActual = NIVELES.find(n => n.value === nivel);

    return (
        <>
            {/* ── Overlay ── */}
            <div
                className="mnemo-overlay"
                aria-hidden="true"
            />

            {/* ── Caja del modal ── */}
            <div
                className="mnemo-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mnemo-titulo"
            >
                {/* Cabecera */}
                <div className="mnemo-header">
                    <div className="mnemo-header-icon">
                        <IoSparklesOutline size={18} />
                    </div>
                    <div>
                        <h3 id="mnemo-titulo" className="mnemo-title">Nueva emoción</h3>
                        <p className="mnemo-subtitle">Añade cómo te sientes con detalle</p>
                    </div>
                    <button className="mnemo-close" onClick={onClose} aria-label="Cerrar">
                        <IoCloseOutline size={20} />
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="mnemo-body">
                    {/* Error */}
                    {error && (
                        <p className="mnemo-error" role="alert">{error}</p>
                    )}

                    {/* Campo nombre */}
                    <div className="mnemo-field">
                        <label className="mnemo-label" htmlFor="mnemo-nombre">
                            ¿Cómo te sientes?
                        </label>
                        <input
                            id="mnemo-nombre"
                            ref={inputRef}
                            className="mnemo-input"
                            type="text"
                            placeholder="Ej. esperanzado/a, inquieto/a…"
                            value={nombre}
                            maxLength={100}
                            onChange={e => { setNombre(e.target.value); setError(""); }}
                            onKeyDown={e => e.key === "Enter" && handleGuardar()}
                        />
                        <span className="mnemo-counter">{nombre.length}/100</span>
                    </div>

                    {/* Clasificación */}
                    <div className="mnemo-field">
                        <label className="mnemo-label">Clasificación</label>
                        <div className="mnemo-clasif-grid">
                            {CLASIFS.map(c => (
                                <button
                                    key={c.value}
                                    className={`mnemo-clasif-btn ${clasif === c.value ? "mnemo-clasif-btn--sel" : ""}`}
                                    style={clasif === c.value ? {
                                        background: c.bg,
                                        borderColor: c.color,
                                        color: c.color,
                                    } : {}}
                                    onClick={() => { setClasif(c.value); setError(""); }}
                                    type="button"
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nivel de intensidad */}
                    <div className="mnemo-field">
                        <label className="mnemo-label">Intensidad</label>
                        <div className="mnemo-nivel-grid">
                            {NIVELES.map(n => (
                                <button
                                    key={n.value}
                                    className={`mnemo-nivel-btn ${nivel === n.value ? "mnemo-nivel-btn--sel" : ""}`}
                                    style={nivel === n.value ? {
                                        background: n.bg,
                                        borderColor: n.color,
                                    } : {}}
                                    onClick={() => { setNivel(n.value); setError(""); }}
                                    type="button"
                                >
                                    <n.icon size={24} className="mnemo-nivel-icon" style={{ color: nivel === n.value ? n.color : "#94a3b8" }} />
                                    <span className="mnemo-nivel-label"
                                        style={nivel === n.value ? { color: n.color } : {}}
                                    >{n.label}</span>
                                    <span className="mnemo-nivel-desc">{n.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {(nombre.trim() || clasif || nivel) && (
                        <div className="mnemo-preview">
                            <span className="mnemo-preview-label">Vista previa</span>
                            <div className="mnemo-preview-chip"
                                style={clasifActual ? {
                                    borderColor: clasifActual.border,
                                    background: clasifActual.bg,
                                    color: clasifActual.color,
                                } : {}}
                            >
                                {nivelActual && <nivelActual.icon size={16} style={{ color: clasifActual?.color ?? "#94a3b8" }} />}
                                <span>{nombre.trim() || "—"}</span>
                                {clasifActual && (
                                    <span className="mnemo-preview-tag">{clasifActual.label}</span>
                                )}
                                {nivelActual && (
                                    <span className="mnemo-preview-tag">{nivelActual.label}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mnemo-footer">
                    <button className="mnemo-btn-cancel" onClick={onClose} type="button">
                        Cancelar
                    </button>
                    <button
                        className={`mnemo-btn-save ${exito ? "mnemo-btn-save--ok" : ""}`}
                        onClick={handleGuardar}
                        disabled={cargando || exito}
                        type="button"
                    >
                        {exito ? (
                            <><IoCheckmarkCircleOutline size={16} /> Guardado</>
                        ) : cargando ? (
                            <><span className="mnemo-spinner" /> Guardando…</>
                        ) : (
                            "Guardar emoción"
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}