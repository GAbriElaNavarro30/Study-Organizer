import "../styles/modalTarea.css";
import { IoInformationCircleOutline, IoClose } from "react-icons/io5";
import logo from "../assets/imagenes/logotipo.png";
import { CustomAlert } from "./CustomAlert";
import { ModalConfirmarCancelar } from "./ModalConfirmarCancelar";
import { useModalCrearActualizarTarea } from "../hooks/useModalCrearActualizarTarea";

export function ModalCrearActualizarTarea({ isOpen, onClose, onSave, task }) {
    const {
        // Estados
        title,
        description,
        fecha,
        hora,
        errors,
        alert,
        showCancelModal,

        // Listas
        days,
        months,
        years,
        hours,
        minutes,

        // Funciones
        closeAlert,
        handleClose,
        handleConfirmCancel,
        handleTitleChange,
        handleDescriptionChange,
        handleFechaChange,
        handleHoraChange,
        handleSubmit,
        setShowCancelModal,
    } = useModalCrearActualizarTarea({ isOpen, onClose, onSave, task });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-tarea">
            <div className="modal-contenedor-tarea">
                {/* ===== CUSTOM ALERT ===== */}
                {alert.show && (
                    <CustomAlert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={closeAlert}
                        logo={logo}
                    />
                )}

                {/* ===== MODAL CONFIRMAR CANCELAR ===== */}
                <ModalConfirmarCancelar
                    isOpen={showCancelModal}
                    onCancel={() => setShowCancelModal(false)}
                    onConfirm={handleConfirmCancel}
                />

                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={handleClose}
                    aria-label="Cerrar"
                >
                    <IoClose />
                </button>

                <h2>{task ? "Actualizar Tarea" : "Nueva Tarea"}</h2>

                <hr />

                <div className="aviso-recordatorio">
                    <IoInformationCircleOutline className="icono-aviso" />
                    <p>
                        Se enviarán recordatorios por correo electrónico un{" "}
                        <strong>día antes a las 11:59 p. m.</strong> y una{" "}
                        <strong>hora antes</strong> de la fecha y hora programadas
                        para esta tarea.
                    </p>
                </div>

                <form className="modal-form-tarea" onSubmit={handleSubmit}>
                    {/* TÍTULO */}
                    <div className="campo-tarea">
                        <label>Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Nombre de la tarea"
                            maxLength={100}
                        />
                        {errors.titulo && (
                            <span className="error-mensaje">{errors.titulo}</span>
                        )}
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="campo-tarea">
                        <label>Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="Descripción de la tarea"
                            maxLength={500}
                        />
                        {errors.descripcion && (
                            <span className="error-mensaje">{errors.descripcion}</span>
                        )}
                    </div>

                    {/* FECHA */}
                    <div className="campo-tarea">
                        <label>Fecha</label>

                        <div className="fecha-facebook">
                            <select
                                value={fecha.day}
                                onChange={(e) => handleFechaChange("day", e.target.value)}
                            >
                                <option value="">Día</option>
                                {days.map(d => (
                                    <option
                                        key={d}
                                        value={String(d).padStart(2, "0")}
                                    >
                                        {d}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={fecha.month}
                                onChange={(e) => handleFechaChange("month", e.target.value)}
                            >
                                <option value="">Mes</option>
                                {months.map((m, i) => (
                                    <option
                                        key={i}
                                        value={String(i + 1).padStart(2, "0")}
                                    >
                                        {m}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={fecha.year}
                                onChange={(e) => handleFechaChange("year", e.target.value)}
                            >
                                <option value="">Año</option>
                                {years.map(y => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.fecha && (
                            <span className="error-mensaje">{errors.fecha}</span>
                        )}
                    </div>

                    {/* HORA */}
                    <div className="campo-tarea">
                        <label>Hora</label>
                        <div className="hora-facebook">
                            <select
                                value={hora.hour}
                                onChange={(e) => handleHoraChange("hour", e.target.value)}
                            >
                                <option value="">Hora</option>
                                {hours.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>

                            <select
                                value={hora.minute}
                                onChange={(e) => handleHoraChange("minute", e.target.value)}
                            >
                                <option value="">Min</option>
                                {minutes.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>

                            <select
                                value={hora.period}
                                onChange={(e) => handleHoraChange("period", e.target.value)}
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                        {errors.hora && (
                            <span className="error-mensaje">{errors.hora}</span>
                        )}
                    </div>

                    {/* BOTONES */}
                    <div className="modal-botones-tarea">
                        <button type="submit" className="btn-guardar-tarea">
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="btn-cancelar-tarea"
                            onClick={handleClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}