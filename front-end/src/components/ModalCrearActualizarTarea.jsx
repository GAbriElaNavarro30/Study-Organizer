import { useState, useEffect } from "react";
import "../styles/modalTarea.css";
import { IoInformationCircleOutline, IoClose } from "react-icons/io5";

export function ModalCrearActualizarTarea({ isOpen, onClose, onSave, task }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

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

    // ===== CARGA EDITAR =====
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");

            if (task.dueDate) {
                const [y, m, d] = task.dueDate.split("-");
                setFecha({ day: d, month: m, year: y });
            }

            if (task.dueTime) {
                let [h, min] = task.dueTime.split(":");
                let period = "AM";

                if (parseInt(h) >= 12) {
                    period = "PM";
                    h = parseInt(h) > 12 ? String(parseInt(h) - 12) : "12";
                }

                setHora({
                    hour: h,
                    minute: min,
                    period
                });
            }
        } else {
            setTitle("");
            setDescription("");
            setFecha({ day: "", month: "", year: "" });
            setHora({ hour: "", minute: "", period: "AM" });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    // ===== GUARDAR =====
    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedDate =
            fecha.year && fecha.month && fecha.day
                ? `${fecha.year}-${fecha.month}-${fecha.day}`
                : "";

        let formattedTime = "";
        if (hora.hour && hora.minute) {
            let h = parseInt(hora.hour);

            if (hora.period === "PM" && h < 12) h += 12;
            if (hora.period === "AM" && h === 12) h = 0;

            formattedTime = `${String(h).padStart(2, "0")}:${hora.minute}`;
        }

        onSave({
            ...task,
            title,
            description,
            dueDate: formattedDate,
            dueTime: formattedTime
        });

        onClose();
    };

    return (
        <div className="modal-overlay-tarea">
            <div className="modal-contenedor-tarea">
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={onClose}
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
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nombre de la tarea"
                            required
                        />
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="campo-tarea">
                        <label>Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción opcional"
                        />
                    </div>

                    {/* FECHA Y HORA */}

                    <div className="campo-tarea">
                        <label>Fecha</label>

                        <div className="fecha-facebook">
                            <select
                                value={fecha.day}
                                onChange={(e) =>
                                    setFecha(prev => ({ ...prev, day: e.target.value }))
                                }
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
                                onChange={(e) =>
                                    setFecha(prev => ({ ...prev, month: e.target.value }))
                                }
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
                                onChange={(e) =>
                                    setFecha(prev => ({ ...prev, year: e.target.value }))
                                }
                            >
                                <option value="">Año</option>
                                {years.map(y => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* HORA FACEBOOK */}
                    <div className="campo-tarea">
                        <label>Hora</label>
                        <div className="hora-facebook">
                            <select
                                value={hora.hour}
                                onChange={(e) =>
                                    setHora(prev => ({ ...prev, hour: e.target.value }))
                                }
                            >
                                <option value="">Hora</option>
                                {hours.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>

                            <select
                                value={hora.minute}
                                onChange={(e) =>
                                    setHora(prev => ({ ...prev, minute: e.target.value }))
                                }
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
                    </div>


                    {/* BOTONES */}
                    <div className="modal-botones-tarea">
                        <button type="submit" className="btn-guardar-tarea">
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="btn-cancelar-tarea"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
