import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
    IoImageOutline, IoCloudUploadOutline, IoTrashOutline,
    IoCheckmarkOutline, IoRefresh, IoCloseOutline,
    IoCropOutline,
} from "react-icons/io5";
import "../styles/ContentImageUpload.css";
import { useContentImageUpload, INITIAL_CROP } from "../hooks/useContentImageUpload";

/* ════════════════════════════════════════════════════════
   CROP MODAL — sin cambios
════════════════════════════════════════════════════════ */
function CropModal({ src, initialState, onApply, onCancel }) {
    const {
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
    } = useContentImageUpload(src, initialState);

    return createPortal(
        <div className="ciu-overlay">
            <div className="ciu-modal">
                <div className="ciu-modal-header">
                    <div className="ciu-modal-title">
                        <IoCropOutline size={16} />
                        <span>Ajustar recorte</span>
                    </div>
                    <div className="ciu-modal-header-actions">
                        <button className="ciu-rotate-btn" onClick={rotate} title="Rotar 90°">
                            <IoRefresh size={15} /><span>Rotar</span>
                        </button>
                        <button className="ciu-reset-btn" onClick={reset} title="Restablecer">
                            Restablecer
                        </button>
                        <button className="ciu-close-btn" onClick={onCancel} title="Cancelar">
                            <IoCloseOutline size={18} />
                        </button>
                    </div>
                </div>
                <div ref={containerRef} className="ciu-canvas-wrap">
                    {!imgLoaded && (
                        <div className="ciu-loading-overlay">
                            <div className="ciu-spinner" />
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className="ciu-canvas"
                        onMouseDown={onPointerDown}
                        onMouseMove={onPointerMove}
                        onMouseUp={onPointerUp}
                        onMouseLeave={onPointerUp}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    />
                </div>
                <div className="ciu-hints">
                    <span className="ciu-hint-pill">✦ Arrastra dentro del recorte para moverlo</span>
                    <span className="ciu-hint-pill">✦ Arrastra los puntos blancos para ajustar el tamaño</span>
                </div>
                <div className="ciu-modal-footer">
                    <div className="ciu-footer-actions" style={{ marginLeft: "auto" }}>
                        <button className="ciu-cancel-btn" onClick={onCancel} disabled={applying}>
                            Cancelar
                        </button>
                        <button className="ciu-apply-btn" onClick={() => handleApply(onApply)} disabled={applying}>
                            {applying
                                ? <><span className="ciu-inline-spinner" />Procesando…</>
                                : <><IoCheckmarkOutline size={15} />Aplicar recorte</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ════════════════════════════════════════════════════════
   CONTENT IMAGE UPLOAD
   — recibe onRequestDeleteImagen del padre (SeccionEditorPanel)
   — ya NO maneja su propio modal ni su propio ModalConfirmarEliminar
════════════════════════════════════════════════════════ */
export function ContentImageUpload({ con, onUpdate, onRequestDeleteImagen }) {
    const inputRef = useRef();
    const [drag, setDrag] = useState(false);
    const [showCrop, setShowCrop] = useState(false);

    const hasSrc = !!(con.imagen_preview || con.imagen_url || con.imagen_cropped_preview);
    const hasCropped = !!(con.imagen_cropped_preview);
    const cropSrc = con.imagen_preview || con.imagen_url || con.imagen_cropped_preview || null;

    const processFile = (file) => {
        if (!file?.type.startsWith("image/")) return;
        onUpdate({
            imagen_file: file,
            imagen_preview: URL.createObjectURL(file),
            imagen_url: "",
            imagen_crop: null,
            imagen_cropped_preview: null,
            imagen_cropped_file: null,
        });
        setShowCrop(true);
    };

    const handleCropApply = ({ dataURL, file, cropState }) => {
        onUpdate({
            imagen_crop: cropState,
            imagen_cropped_preview: dataURL,
            imagen_cropped_file: file,
        });
        setShowCrop(false);
    };

    return (
        <>
            <div className="ciu-root">
                {!hasSrc ? (
                    <div
                        className={`ciu-drop-zone${drag ? " dragging" : ""}`}
                        onClick={() => inputRef.current.click()}
                        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={(e) => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); }}
                    >
                        <IoImageOutline size={28} />
                        <p>Agregar imagen al bloque</p>
                        <small>Arrastra o haz clic · Recorta libremente</small>
                    </div>
                ) : (
                    <div className="ciu-preview-card">
                        {hasCropped ? (
                            <div className="ciu-preview-img-wrap">
                                <img
                                    src={con.imagen_cropped_preview}
                                    alt="imagen recortada"
                                    className="ciu-preview-img"
                                />
                                <div className="ciu-cropped-badge">
                                    <IoCropOutline size={11} /> Recortada
                                </div>
                            </div>
                        ) : (
                            <div className="ciu-pending-notice">
                                <IoCropOutline size={14} />
                                <span>Imagen cargada — abre el editor para recortarla</span>
                            </div>
                        )}

                        <div className="ciu-action-row">
                            <button className="ciu-action-btn" onClick={() => setShowCrop(true)}>
                                <IoCropOutline size={13} />
                                {hasCropped ? "Editar recorte" : "Recortar imagen"}
                            </button>
                            <button className="ciu-action-btn" onClick={() => inputRef.current.click()}>
                                <IoCloudUploadOutline size={13} /> Cambiar
                            </button>
                            {/*
                              ── Delega al padre: SeccionEditorPanel abre su propio
                                 ModalConfirmarEliminar y al confirmar limpia el estado
                                 del contenido + envía eliminar_imagen:true al backend ──
                            */}
                            <button
                                className="ciu-action-btn danger"
                                onClick={onRequestDeleteImagen}
                            >
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

            {showCrop && cropSrc && (
                <CropModal
                    src={cropSrc}
                    initialState={con.imagen_crop ?? INITIAL_CROP}
                    onApply={handleCropApply}
                    onCancel={() => setShowCrop(false)}
                />
            )}
            {/* ── Sin ModalConfirmarEliminar aquí — vive en SeccionEditorPanel ── */}
        </>
    );
}