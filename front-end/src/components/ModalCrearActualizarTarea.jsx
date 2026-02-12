import { useState, useEffect } from "react";
import "../styles/modalTarea.css";
import { IoInformationCircleOutline, IoClose } from "react-icons/io5";
import logo from "../assets/imagenes/logotipo.png";
import { CustomAlert } from "./CustomAlert";
import { ModalConfirmarCancelar } from "./ModalConfirmarCancelar"; // ✅ IMPORTAR

export function ModalCrearActualizarTarea({ isOpen, onClose, onSave, task }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // ===== ERRORES =====
    const [errors, setErrors] = useState({});

    // ===== CUSTOM ALERT =====
    const [alert, setAlert] = useState({
        show: false,
        type: "error",
        title: "",
        message: ""
    });

    // ===== MODAL CONFIRMAR CANCELAR ===== ✅ NUEVO
    const [showCancelModal, setShowCancelModal] = useState(false);

    // ===== VALORES INICIALES ===== ✅ NUEVO
    const [initialValues, setInitialValues] = useState({
        title: "",
        description: "",
        fecha: { day: "", month: "", year: "" },
        hora: { hour: "", minute: "", period: "AM" }
    });

    const showAlert = (type, title, message) => {
        setAlert({ show: true, type, title, message });
    };

    const closeAlert = () => {
        setAlert({ ...alert, show: false });
    };

    // ===== FECHA =====
    const [fecha, setFecha] = useState({
        day: "",
        month: "",
        year: ""
    });

    // ===== HORA =====
    const [hora, setHora] = useState({
        hour: "",
        minute: "",
        period: "AM"
    });

    // ===== LISTAS =====
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const years = Array.from(
        { length: 10 },
        (_, i) => new Date().getFullYear() + i
    );

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from(
        { length: 60 },
        (_, i) => String(i).padStart(2, "0")
    );

    // ===== VERIFICAR SI HAY CAMBIOS ===== ✅ NUEVO
    const hasChanges = () => {
        return (
            title !== initialValues.title ||
            description !== initialValues.description ||
            fecha.day !== initialValues.fecha.day ||
            fecha.month !== initialValues.fecha.month ||
            fecha.year !== initialValues.fecha.year ||
            hora.hour !== initialValues.hora.hour ||
            hora.minute !== initialValues.hora.minute ||
            hora.period !== initialValues.hora.period
        );
    };

    // ===== MANEJAR CIERRE ===== ✅ MODIFICADO
    const handleClose = () => {
        if (hasChanges()) {
            setShowCancelModal(true);
        } else {
            onClose();
        }
    };

    // ===== CONFIRMAR CANCELACIÓN ===== ✅ NUEVO
    const handleConfirmCancel = () => {
        setShowCancelModal(false);
        onClose();
    };

    // ===== CARGA EDITAR =====
    useEffect(() => {
        if (task) {
            const taskTitle = task.title || "";
            const taskDescription = task.description || "";

            setTitle(taskTitle);
            setDescription(taskDescription);
            setErrors({});
            setAlert({ show: false, type: "error", title: "", message: "" });

            let taskFecha = { day: "", month: "", year: "" };
            let taskHora = { hour: "", minute: "", period: "AM" };

            if (task.dueDateOriginal || task.dueDate) {
                const dateObj = new Date(task.dueDateOriginal || task.dueDate);

                const year = dateObj.getUTCFullYear();
                const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                const day = String(dateObj.getUTCDate()).padStart(2, "0");

                taskFecha = { day, month, year: String(year) };
                setFecha(taskFecha);
            }

            if (task.dueTime) {
                let [h, min] = task.dueTime.split(":");
                let hourNum = parseInt(h);
                let period = "AM";
                let displayHour = hourNum;

                if (hourNum === 0) {
                    displayHour = 12;
                    period = "AM";
                } else if (hourNum === 12) {
                    displayHour = 12;
                    period = "PM";
                } else if (hourNum > 12) {
                    displayHour = hourNum - 12;
                    period = "PM";
                } else {
                    displayHour = hourNum;
                    period = "AM";
                }

                taskHora = {
                    hour: String(displayHour),
                    minute: min,
                    period
                };
                setHora(taskHora);
            }

            // ✅ GUARDAR VALORES INICIALES
            setInitialValues({
                title: taskTitle,
                description: taskDescription,
                fecha: taskFecha,
                hora: taskHora
            });
        } else {
            // CREAR NUEVA TAREA
            setTitle("");
            setDescription("");
            setFecha({ day: "", month: "", year: "" });
            setHora({ hour: "", minute: "", period: "AM" });
            setErrors({});
            setAlert({ show: false, type: "error", title: "", message: "" });

            // ✅ VALORES INICIALES VACÍOS
            setInitialValues({
                title: "",
                description: "",
                fecha: { day: "", month: "", year: "" },
                hora: { hour: "", minute: "", period: "AM" }
            });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    // ===== VALIDACIÓN =====
    const validateForm = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.titulo = "El título es obligatorio";
        } else if (title.trim().length < 3) {
            newErrors.titulo = "El título debe tener al menos 3 caracteres";
        } else if (title.trim().length > 100) {
            newErrors.titulo = "El título no puede exceder 100 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!]+$/.test(title.trim())) {
            newErrors.titulo = "El título solo puede contener letras, números y signos de puntuación básicos";
        }

        if (!description.trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        } else if (description.trim().length > 500) {
            newErrors.descripcion = "La descripción no puede exceder 500 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!\n]+$/.test(description.trim())) {
            newErrors.descripcion = "La descripción contiene caracteres no permitidos";
        }

        if (!fecha.day || !fecha.month || !fecha.year) {
            newErrors.fecha = "La fecha completa es obligatoria";
        } else {
            const fechaSeleccionada = new Date(`${fecha.year}-${fecha.month}-${fecha.day}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (isNaN(fechaSeleccionada.getTime())) {
                newErrors.fecha = "Formato de fecha inválido";
            } else if (fechaSeleccionada < hoy) {
                newErrors.fecha = "La fecha no puede ser anterior a hoy";
            }
        }

        if (!hora.hour || !hora.minute) {
            newErrors.hora = "La hora completa es obligatoria";
        } else if (fecha.day && fecha.month && fecha.year) {
            let h = parseInt(hora.hour);
            if (hora.period === "PM" && h < 12) h += 12;
            if (hora.period === "AM" && h === 12) h = 0;

            const fechaHoraSeleccionada = new Date(
                `${fecha.year}-${fecha.month}-${fecha.day}T${String(h).padStart(2, "0")}:${hora.minute}:00`
            );
            const ahora = new Date();

            if (fechaHoraSeleccionada < ahora) {
                newErrors.hora = "La fecha y hora no pueden ser anteriores a la actual";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===== GUARDAR =====
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formattedDate = `${fecha.year}-${fecha.month}-${fecha.day}`;

        let h = parseInt(hora.hour);
        if (hora.period === "PM" && h < 12) h += 12;
        if (hora.period === "AM" && h === 12) h = 0;
        const formattedTime = `${String(h).padStart(2, "0")}:${hora.minute}`;

        try {
            await onSave({
                ...task,
                title: title.trim(),
                description: description.trim(),
                dueDate: formattedDate,
                dueTime: formattedTime
            });

            onClose();
        } catch (error) {
            if (error.response?.data?.errores) {
                setErrors(error.response.data.errores);
                showAlert(
                    "error",
                    "Error del servidor",
                    "Por favor, verifica los campos marcados en rojo"
                );
            } else {
                showAlert(
                    "error",
                    "Error inesperado",
                    "Ocurrió un error al guardar la tarea. Por favor, intenta nuevamente."
                );
            }
        }
    };

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
                    onClick={handleClose} // ✅ CAMBIO AQUÍ
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
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.titulo) {
                                    setErrors(prev => ({ ...prev, titulo: "" }));
                                }
                            }}
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
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (errors.descripcion) {
                                    setErrors(prev => ({ ...prev, descripcion: "" }));
                                }
                            }}
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
                                onChange={(e) => {
                                    setFecha(prev => ({ ...prev, day: e.target.value }));
                                    if (errors.fecha) {
                                        setErrors(prev => ({ ...prev, fecha: "" }));
                                    }
                                }}
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
                                onChange={(e) => {
                                    setFecha(prev => ({ ...prev, month: e.target.value }));
                                    if (errors.fecha) {
                                        setErrors(prev => ({ ...prev, fecha: "" }));
                                    }
                                }}
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
                                onChange={(e) => {
                                    setFecha(prev => ({ ...prev, year: e.target.value }));
                                    if (errors.fecha) {
                                        setErrors(prev => ({ ...prev, fecha: "" }));
                                    }
                                }}
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
                                onChange={(e) => {
                                    setHora(prev => ({ ...prev, hour: e.target.value }));
                                    if (errors.hora) {
                                        setErrors(prev => ({ ...prev, hora: "" }));
                                    }
                                }}
                            >
                                <option value="">Hora</option>
                                {hours.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>

                            <select
                                value={hora.minute}
                                onChange={(e) => {
                                    setHora(prev => ({ ...prev, minute: e.target.value }));
                                    if (errors.hora) {
                                        setErrors(prev => ({ ...prev, hora: "" }));
                                    }
                                }}
                            >
                                <option value="">Min</option>
                                {minutes.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>

                            <select
                                value={hora.period}
                                onChange={(e) =>
                                    setHora(prev => ({ ...prev, period: e.target.value }))
                                }
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
                            onClick={handleClose} // ✅ CAMBIO AQUÍ
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}