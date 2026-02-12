import { useState, useEffect } from "react";
import "../styles/tareas.css";
import { IoAddCircleOutline } from "react-icons/io5";
import api from "../services/api";

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

            // Actualiza el estado local
            setTasks(tasks.filter(task => task.id !== taskToDelete.id));

            setTaskToDelete(null);
            setModalOpen(false);
            alert("Tarea eliminada correctamente");
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
            alert("Error al eliminar la tarea");
        }
    };

    // Función para abrir modal
    const handleFinishClick = (task) => {
        setTaskToFinish(task);
        setModalFinalizarOpen(true);
    };

    // Función para confirmar finalización/descompletar
    const handleConfirmFinish = async () => {
        if (!taskToFinish) return;

        console.log("📌 Tarea a actualizar:", taskToFinish);
        console.log("📌 ID que se enviará:", taskToFinish.id);

        try {
            const url = `/tareas/completar-tarea/${taskToFinish.id}`;
            console.log("📌 URL completa:", url);

            const response = await api.patch(url);

            console.log("✅ Respuesta del servidor:", response.data);

            // Actualiza estado local
            setTasks(tasks.map(t =>
                t.id === taskToFinish.id
                    ? { ...t, completed: !t.completed }
                    : t
            ));

            setTaskToFinish(null);
            setModalFinalizarOpen(false);
        } catch (error) {
            console.error("❌ Error completo:", error);
            console.error("❌ Respuesta del servidor:", error.response?.data);
            console.error("❌ Status:", error.response?.status);
            alert("Error al actualizar la tarea");
        }
    };


    const handleCreateClick = () => {
        setTaskToEdit(null);
        setModalTareaOpen(true);
    };

    const handleEditClick = (task) => {
        // Pasar la fecha original para que el modal pueda parsearla correctamente
        const taskForEdit = {
            ...task,
            dueDate: task.dueDateOriginal || task.dueDate
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

                // Recargar tareas
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

                    let horaFormateada = t.hora;
                    if (t.hora) {
                        horaFormateada = t.hora.substring(0, 5);
                    }

                    return {
                        id: t.id_recordatorio,
                        title: t.titulo,
                        description: t.descripcion,
                        dueDate: fechaFormateada,
                        dueTime: horaFormateada,
                        dueDateOriginal: t.fecha,
                        estado: t.estado,
                        completed: t.estado === "completada",
                    };
                });

                setTasks(tareasFormateadas);
                alert("Tarea actualizada correctamente");
            } else {
                // ===== CREAR NUEVA TAREA =====
                await api.post("/tareas/crear-tarea", {
                    titulo: tarea.title,
                    descripcion: tarea.description,
                    fecha: tarea.dueDate,
                    hora: tarea.dueTime
                });

                // Recargar las tareas desde el servidor
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

                    let horaFormateada = t.hora;
                    if (t.hora) {
                        horaFormateada = t.hora.substring(0, 5);
                    }

                    return {
                        id: t.id_recordatorio,
                        title: t.titulo,
                        description: t.descripcion,
                        dueDate: fechaFormateada,
                        dueTime: horaFormateada,
                        dueDateOriginal: t.fecha,
                        estado: t.estado,
                        completed: t.estado === "completada",
                    };
                });

                setTasks(tareasFormateadas);
                alert("Tarea creada correctamente");
            }

            setModalTareaOpen(false);
        } catch (error) {
            console.error("Error al guardar tarea:", error);

            // Si hay errores de validación del backend, lanzarlos para que el modal los capture
            if (error.response?.data?.errores) {
                throw error;
            } else {
                alert("Error al guardar la tarea");
            }
        }
    };

    // ===== FILTRADO Y BÚSQUEDA =====
    const filteredTasks = tasks.filter(task => {
        const match = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === "pending") {
            return match && task.estado === "pendiente";
        }

        if (activeFilter === "completed") {
            return match && task.estado === "completada";
        }

        if (activeFilter === "expired") {
            return match && task.estado === "vencida";
        }

        return match; // all
    });


    const pendingTasks = tasks.filter(t => t.estado === "pendiente");

    // ===== PAGINACIÓN =====
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTasks = filteredTasks.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const getEmptyStateContent = () => {
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

        // all y completed
        return {
            title: "No hay tareas",
            message: "Crea una nueva tarea para comenzar",
        };
    };


    useEffect(() => {
        const obtenerTareas = async () => {
            try {
                const response = await api.get("/tareas/obtener-tareas");

                // 🔁 Mapeo backend → frontend
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

                    // Formatear hora a HH:MM
                    let horaFormateada = t.hora;
                    if (t.hora) {
                        horaFormateada = t.hora.substring(0, 5); // De "14:00:00" a "14:00"
                    }

                    return {
                        id: t.id_recordatorio,
                        title: t.titulo,
                        description: t.descripcion,
                        dueDate: fechaFormateada,
                        dueTime: horaFormateada,
                        dueDateOriginal: t.fecha, // Guardar original para editar
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

                {/* ===== TÍTULO ===== */}
                <div className="tareas-title-bar">
                    <div className="tareas-title">
                        <h1>Mis tareas</h1>
                        <p>{pendingTasks.length} tareas pendientes</p>
                    </div>
                </div>

                {/* ===== FILA 1: ACCIONES ===== */}
                <div className="tareas-row fila-unica">
                    {/* IZQUIERDA */}
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

                    {/* DERECHA */}
                    <div className="bloque-der">
                        <div className="search-container">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Buscar tareas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                                        {/* Cada acción en su propia celda */}
                                        <td>
                                            <button
                                                title="Editar"
                                                onClick={() => handleEditClick(task)} // abre el modal con la tarea
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