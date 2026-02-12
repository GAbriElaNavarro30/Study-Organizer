import { useState, useEffect } from "react";
import "../styles/tareas.css";
import { IoAddCircleOutline } from "react-icons/io5";
import api from "../services/api";
import logo from "../assets/imagenes/logotipo.png";

import {
    CheckCircle2,
    Search,
    Pencil,
    Trash2,
    Inbox,
} from "lucide-react";

import { ModalEliminarTarea } from "../components/ModalEliminarTarea";
import { ModalFinalizarTarea } from "../components/ModalFinalizarTarea";
import { ModalCrearActualizarTarea } from "../components/ModalCrearActualizarTarea";
import { CustomAlert } from "../components/CustomAlert"; // ✅ IMPORTAR

export function Tareas() {
    // ===== ESTADOS =====
    const [tasks, setTasks] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // ===== MODAL ELIMINAR =====
    const [modalOpen, setModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // ===== MODAL FINALIZAR =====
    const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
    const [taskToFinish, setTaskToFinish] = useState(null);

    // ===== MODAL CREAR - ACTUALIZAR =====
    const [modalTareaOpen, setModalTareaOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    // ===== CUSTOM ALERT ===== ✅ NUEVO
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: ""
    });

    const showAlert = (type, title, message) => {
        setAlert({ show: true, type, title, message });
    };

    const closeAlert = () => {
        setAlert({ ...alert, show: false });
    };

    // ===== FUNCIONES =====
    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;

        try {
            await api.delete(`/tareas/eliminar-tarea/${taskToDelete.id}`);

            setTasks(tasks.filter(task => task.id !== taskToDelete.id));
            setTaskToDelete(null);
            setModalOpen(false);

            // ✅ REEMPLAZAR alert() POR showAlert()
            showAlert("success", "¡Tarea eliminada!", "La tarea se ha eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
            showAlert("error", "Error", "No se pudo eliminar la tarea. Intenta nuevamente.");
        }
    };

    const handleFinishClick = (task) => {
        setTaskToFinish(task);
        setModalFinalizarOpen(true);
    };

    const handleConfirmFinish = async () => {
        if (!taskToFinish) return;

        try {
            const url = `/tareas/completar-tarea/${taskToFinish.id}`;
            const response = await api.patch(url);

            // Actualizar estado local con el nuevo estado
            setTasks(tasks.map(t =>
                t.id === taskToFinish.id
                    ? {
                        ...t,
                        completed: !t.completed,
                        estado: t.completed ? "pendiente" : "completada"
                    }
                    : t
            ));

            setTaskToFinish(null);
            setModalFinalizarOpen(false);

            // ✅ MOSTRAR ALERT
            const mensaje = taskToFinish.completed
                ? "La tarea se marcó como pendiente"
                : "La tarea se completó exitosamente";
            showAlert("success", "¡Estado actualizado!", mensaje);
        } catch (error) {
            console.error("❌ Error completo:", error);
            showAlert("error", "Error", "No se pudo actualizar el estado de la tarea");
        }
    };

    const handleCreateClick = () => {
        setTaskToEdit(null);
        setModalTareaOpen(true);
    };

    const handleEditClick = (task) => {
        const taskForEdit = {
            ...task,
            dueDate: task.dueDateOriginal || task.dueDate,
            dueTime: task.dueTimeOriginal || task.dueTime // ✅ USAR HORA ORIGINAL EN FORMATO 24H
        };
        setTaskToEdit(taskForEdit);
        setModalTareaOpen(true);
    };

    const handleSaveTask = async (tarea) => {
        try {
            if (tarea.id) {
                // ===== EDITAR TAREA EXISTENTE =====
                await api.put(`/tareas/actualizar-tarea/${tarea.id}`, {
                    titulo: tarea.title,
                    descripcion: tarea.description,
                    fecha: tarea.dueDate,
                    hora: tarea.dueTime
                });

                // Recargar tareas con formato
                const tareasResponse = await api.get("/tareas/obtener-tareas");
                const tareasFormateadas = tareasResponse.data.map(t => {
                    let fechaFormateada = t.fecha;
                    if (t.fecha) {
                        const dateObj = new Date(t.fecha);
                        const day = String(dateObj.getUTCDate()).padStart(2, "0");
                        const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                        const year = dateObj.getUTCFullYear();
                        fechaFormateada = `${day}-${month}-${year}`;
                    }

                    // ✅ FORMATEAR HORA CON AM/PM
                    let horaFormateada = t.hora;
                    if (t.hora) {
                        let [h, min] = t.hora.split(":");
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

                        horaFormateada = `${displayHour}:${min} ${period}`;
                    }

                    return {
                        id: t.id_recordatorio,
                        title: t.titulo,
                        description: t.descripcion,
                        dueDate: fechaFormateada,
                        dueTime: horaFormateada,
                        dueDateOriginal: t.fecha,
                        dueTimeOriginal: t.hora,
                        estado: t.estado,
                        completed: t.estado === "completada",
                    };
                });

                setTasks(tareasFormateadas);
                showAlert("success", "¡Tarea actualizada!", "Los cambios se guardaron correctamente");
            } else {
                // ===== CREAR NUEVA TAREA =====
                await api.post("/tareas/crear-tarea", {
                    titulo: tarea.title,
                    descripcion: tarea.description,
                    fecha: tarea.dueDate,
                    hora: tarea.dueTime
                });

                const tareasResponse = await api.get("/tareas/obtener-tareas");
                const tareasFormateadas = tareasResponse.data.map(t => {
                    let fechaFormateada = t.fecha;
                    if (t.fecha) {
                        const dateObj = new Date(t.fecha);
                        const day = String(dateObj.getUTCDate()).padStart(2, "0");
                        const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                        const year = dateObj.getUTCFullYear();
                        fechaFormateada = `${day}-${month}-${year}`;
                    }

                    // ✅ FORMATEAR HORA CON AM/PM
                    let horaFormateada = t.hora;
                    if (t.hora) {
                        let [h, min] = t.hora.split(":");
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

                        horaFormateada = `${displayHour}:${min} ${period}`;
                    }

                    return {
                        id: t.id_recordatorio,
                        title: t.titulo,
                        description: t.descripcion,
                        dueDate: fechaFormateada,
                        dueTime: horaFormateada,
                        dueDateOriginal: t.fecha,
                        dueTimeOriginal: t.hora,
                        estado: t.estado,
                        completed: t.estado === "completada",
                    };
                });

                setTasks(tareasFormateadas);
                showAlert("success", "¡Tarea creada!", "La nueva tarea se ha creado exitosamente");
            }

            setModalTareaOpen(false);
        } catch (error) {
            console.error("Error al guardar tarea:", error);

            if (error.response?.data?.errores) {
                throw error;
            } else {
                showAlert("error", "Error", "No se pudo guardar la tarea. Intenta nuevamente.");
            }
        }
    };

    // ===== ESTADO PARA RESULTADOS DE BÚSQUEDA =====
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // ===== FUNCIÓN DE BÚSQUEDA CON DEBOUNCE =====
    useEffect(() => {
        const buscarTareas = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const response = await api.get(`/tareas/buscar-tarea?q=${encodeURIComponent(searchQuery.trim())}`);
                
                // Formatear los resultados de la búsqueda
                const tareasFormateadas = response.data.resultados.map(t => {
                    let fechaFormateada = t.fecha;
                    if (t.fecha) {
                        const dateObj = new Date(t.fecha);
                        const day = String(dateObj.getUTCDate()).padStart(2, "0");
                        const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                        const year = dateObj.getUTCFullYear();
                        fechaFormateada = `${day}-${month}-${year}`;
                    }

                    let horaFormateada = t.hora;
                    if (t.hora) {
                        let [h, min] = t.hora.split(":");
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

                        horaFormateada = `${displayHour}:${min} ${period}`;
                    }

                    return {
                        id: t.id_recordatorio,
                        title: t.titulo,
                        description: t.descripcion,
                        dueDate: fechaFormateada,
                        dueTime: horaFormateada,
                        dueDateOriginal: t.fecha,
                        dueTimeOriginal: t.hora,
                        estado: t.estado,
                        completed: t.estado === "completada",
                    };
                });

                setSearchResults(tareasFormateadas);
            } catch (error) {
                console.error("Error al buscar tareas:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce: esperar 300ms después de que el usuario deje de escribir
        const timeoutId = setTimeout(buscarTareas);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // ===== FILTRADO CON BÚSQUEDA =====
    const filteredTasks = (() => {
        // Si hay búsqueda activa, usar los resultados del backend
        if (searchQuery.trim()) {
            const results = searchResults;
            
            // Aplicar filtro por estado sobre los resultados de búsqueda
            if (activeFilter === "pending") {
                return results.filter(task => task.estado === "pendiente");
            }
            if (activeFilter === "completed") {
                return results.filter(task => task.estado === "completada");
            }
            if (activeFilter === "expired") {
                return results.filter(task => task.estado === "vencida");
            }
            
            return results;
        }

        // Si no hay búsqueda, aplicar solo filtro por estado sobre todas las tareas
        if (activeFilter === "pending") {
            return tasks.filter(task => task.estado === "pendiente");
        }
        if (activeFilter === "completed") {
            return tasks.filter(task => task.estado === "completada");
        }
        if (activeFilter === "expired") {
            return tasks.filter(task => task.estado === "vencida");
        }

        return tasks;
    })();

    const pendingTasks = tasks.filter(t => t.estado === "pendiente");

    // ===== PAGINACIÓN =====
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTasks = filteredTasks.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const getEmptyStateContent = () => {
        // Si hay búsqueda activa y no hay resultados
        if (searchQuery.trim() !== "") {
            return {
                title: "No hay resultados que coincidan con la consulta",
                message: `No se encontraron tareas para "${searchQuery}"`,
            };
        }

        // Mensajes por filtro
        if (activeFilter === "pending") {
            return {
                title: "Excelente",
                message: "No hay tareas pendientes",
            };
        }

        if (activeFilter === "completed") {
            return {
                title: "No hay tareas completadas",
                message: "Finaliza tus tareas pendientes",
            };
        }

        if (activeFilter === "expired") {
            return {
                title: "No hay tareas expiradas",
                message: "Finaliza tus tareas pendientes antes de que expiren",
            };
        }

        return {
            title: "No hay tareas",
            message: "Crea una nueva tarea para comenzar",
        };
    };

    useEffect(() => {
        const obtenerTareas = async () => {
            try {
                const response = await api.get("/tareas/obtener-tareas");

                const tareasFormateadas = response.data.map(t => {
                    // Formatear fecha a DD-MM-YYYY
                    let fechaFormateada = t.fecha;
                    if (t.fecha) {
                        const dateObj = new Date(t.fecha);
                        const day = String(dateObj.getUTCDate()).padStart(2, "0");
                        const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                        const year = dateObj.getUTCFullYear();
                        fechaFormateada = `${day}-${month}-${year}`;
                    }

                    // ✅ FORMATEAR HORA A 12H CON AM/PM
                    let horaFormateada = t.hora;
                    if (t.hora) {
                        let [h, min] = t.hora.split(":");
                        let hourNum = parseInt(h);
                        let period = "AM";
                        let displayHour = hourNum;

                        // Convertir de formato 24h a 12h
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

                        horaFormateada = `${displayHour}:${min} ${period}`;
                    }

                    return {
                        id: t.id_recordatorio,
                        title: t.titulo,
                        description: t.descripcion,
                        dueDate: fechaFormateada,
                        dueTime: horaFormateada,
                        dueDateOriginal: t.fecha,
                        dueTimeOriginal: t.hora, // ✅ GUARDAR HORA ORIGINAL PARA EDITAR
                        estado: t.estado,
                        completed: t.estado === "completada",
                    };
                });

                setTasks(tareasFormateadas);
            } catch (error) {
                console.error("Error al obtener tareas:", error);
            }
        };

        obtenerTareas();

        const interval = setInterval(obtenerTareas, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="contenedor-tareas-principal">
            <div className="tareas-page">
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

                {/* ===== TÍTULO ===== */}
                <div className="tareas-title-bar">
                    <div className="tareas-title">
                        <h1>Mis tareas</h1>
                        <p>{pendingTasks.length} tareas pendientes</p>
                    </div>
                </div>

                {/* ===== FILA 1: ACCIONES ===== */}
                <div className="tareas-row fila-unica">
                    <div className="bloque-izq">
                        <button className="btn-primary" onClick={handleCreateClick}>
                            <IoAddCircleOutline size={16} /> Nuevo
                        </button>

                        <div className="filter-tabs">
                            <button
                                className={activeFilter === "all" ? "active" : ""}
                                onClick={() => setActiveFilter("all")}
                            >
                                Todas
                            </button>
                            <button
                                className={activeFilter === "pending" ? "active" : ""}
                                onClick={() => setActiveFilter("pending")}
                            >
                                Pendientes
                            </button>
                            <button
                                className={activeFilter === "completed" ? "active" : ""}
                                onClick={() => setActiveFilter("completed")}
                            >
                                Completadas
                            </button>
                            <button
                                className={activeFilter === "expired" ? "active" : ""}
                                onClick={() => setActiveFilter("expired")}
                            >
                                Vencidas
                            </button>
                        </div>
                    </div>

                    <div className="bloque-der">
                        <div className="search-container">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Buscar tareas..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className="select-container">
                            <label>Mostrar</label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                            </select>
                            <label>resultados</label>
                        </div>
                    </div>
                </div>

                {/* ===== TABLA ===== */}
                <div className="tareas-table-container">
                    {paginatedTasks.length === 0 ? (
                        <div className="empty-state">
                            <Inbox size={40} />
                            <h3>{getEmptyStateContent().title}</h3>
                            <p>{getEmptyStateContent().message}</p>
                        </div>
                    ) : (
                        <table className="tareas-table">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Estado</th>
                                    <th>Editar</th>
                                    <th>Finalizar</th>
                                    <th>Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>{task.title}</td>
                                        <td>{task.description || "-"}</td>
                                        <td>{task.dueDate}</td>
                                        <td>{task.dueTime}</td>
                                        <td>
                                            <span className={`estado ${task.estado}`}>
                                                {task.estado === "pendiente" && "Pendiente"}
                                                {task.estado === "completada" && "Completada"}
                                                {task.estado === "vencida" && "Vencida"}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                title="Editar"
                                                onClick={() => handleEditClick(task)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                disabled={task.estado === "vencida"}
                                                onClick={() => handleFinishClick(task)}
                                                className={`btn-finalizar ${task.estado}`}
                                                title={
                                                    task.estado === "vencida"
                                                        ? "Tarea vencida"
                                                        : task.completed
                                                            ? "Tarea completada"
                                                            : "Pendiente"
                                                }
                                            >
                                                <CheckCircle2 size={20} />
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                className="delete"
                                                title="Eliminar"
                                                onClick={() => handleDeleteClick(task)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ===== PAGINACIÓN ===== */}
                {filteredTasks.length > 0 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-btn ${currentPage === page ? "active" : ""}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                )}

                {/* ===== MODAL ELIMINAR ===== */}
                <ModalEliminarTarea
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    nombreTarea={taskToDelete?.title}
                />

                {/* ===== MODAL FINALIZAR ===== */}
                <ModalFinalizarTarea
                    isOpen={modalFinalizarOpen}
                    onClose={() => setModalFinalizarOpen(false)}
                    onConfirm={handleConfirmFinish}
                    tarea={taskToFinish}
                />

                {/* ===== MODAL CREAR - ACTUALIZAR ===== */}
                <ModalCrearActualizarTarea
                    isOpen={modalTareaOpen}
                    onClose={() => setModalTareaOpen(false)}
                    onSave={handleSaveTask}
                    task={taskToEdit}
                />
            </div>
        </div>
    );
}