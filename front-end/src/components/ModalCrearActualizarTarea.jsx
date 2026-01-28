import { useState, useEffect } from "react";
import "../styles/modalTarea.css";
import { IoInformationCircleOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

export function ModalCrearActualizarTarea({ isOpen, onClose, onSave, task }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");

    // Cuando se abre para editar, llenamos los campos
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setDueDate(task.dueDate || "");
            setDueTime(task.dueTime || ""); // Si luego agregas hora
        } else {
            setTitle("");
            setDescription("");
            setDueDate("");
            setDueTime("");
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...task,
            title,
            description,
            dueDate,
            dueTime,
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
                        Se enviarán recordatorios por correo electrónico un <strong>día antes a las
                            11:59 p. m.</strong> y una <strong>hora antes</strong> de la fecha y hora
                        programadas para esta tarea.
                    </p>
                </div>


                <form className="modal-form-tarea" onSubmit={handleSubmit}>
                    {/* FILA 1: TÍTULO */}
                    <div className="campo">
                        <label>Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nombre de la tarea"
                            required
                        />
                    </div>

                    {/* FILA 2: DESCRIPCIÓN */}
                    <div className="campo">
                        <label>Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción opcional"
                        />
                    </div>

                    {/* FILA 3: FECHA Y HORA */}
                    <div className="fila-campos">
                        <div className="campo">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="campo">
                            <label>Hora</label>
                            <input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="modal-botones-tarea">
                        <button type="submit" className="btn-guardar-tarea">
                            Guardar
                        </button>
                        <button type="button" className="btn-cancelar-tarea" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}