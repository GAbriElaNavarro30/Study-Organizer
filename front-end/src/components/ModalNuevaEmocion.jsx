import {
    IoCloseOutline,
    IoCheckmarkCircleOutline,
    IoSparklesOutline,
} from "react-icons/io5";
import { useModalNuevaEmocion } from "../hooks/useModalNuevaEmocion";
import "../styles/ModalNuevaEmocion.css";

const CLASIFS = [
    { value: "positiva", label: "Positiva", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
    { value: "neutra",   label: "Neutra",   color: "#64748b", bg: "#f8fafc", border: "#cbd5e1" },
    { value: "negativa", label: "Negativa", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
];

export function ModalNuevaEmocion({ visible, onClose, onGuardar }) {
    const {
        nombre, setNombre,
        clasif, setClasif,
        cargando,
        error, setError,
        exito,
        inputRef,
        handleGuardar,
    } = useModalNuevaEmocion({ visible, onClose, onGuardar });

    if (!visible) return null;

    const clasifActual = CLASIFS.find(c => c.value === clasif);

    return (
        <>
            <div className="mnemo-overlay" aria-hidden="true" />
 
            <div className="mnemo-box" role="dialog" aria-modal="true" aria-labelledby="mnemo-titulo">

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

                <div className="mnemo-body">
                    {error && <p className="mnemo-error" role="alert">{error}</p>}

                    <div className="mnemo-field">
                        <label className="mnemo-label" htmlFor="mnemo-nombre">¿Cómo te sientes?</label>
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

                    {(nombre.trim() || clasif) && (
                        <div className="mnemo-preview">
                            <span className="mnemo-preview-label">Vista previa</span>
                            <div className="mnemo-preview-chip"
                                style={clasifActual ? {
                                    borderColor: clasifActual.border,
                                    background: clasifActual.bg,
                                    color: clasifActual.color,
                                } : {}}
                            >
                                <span>{nombre.trim() || "—"}</span>
                                {clasifActual && (
                                    <span className="mnemo-preview-tag">{clasifActual.label}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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