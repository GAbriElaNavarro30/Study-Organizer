// hooks/useTareas.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function useTareas() {
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

    // ===== CUSTOM ALERT =====
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: ""
    });

    // ===== BÚSQUEDA =====
    const [searchResults, setSearchResults] = useState([]);

    const showAlert = (type, title, message) => {
        setAlert({ show: true, type, title, message });
    };

    const closeAlert = () => {
        setAlert({ ...alert, show: false });
    };

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
            await api.patch(`/tareas/completar-tarea/${taskToFinish.id}`);
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
            const mensaje = taskToFinish.completed
                ? "La tarea se marcó como pendiente"
                : "La tarea se completó exitosamente";
            showAlert("success", "¡Estado actualizado!", mensaje);
        } catch (error) {
            console.error("Error completo:", error);
            showAlert("error", "Error", "No se pudo actualizar el estado de la tarea");
        }
    };

    const handleCreateClick = () => {
        setTaskToEdit(null);
        setModalTareaOpen(true);
    };

    const handleEditClick = (task) => {
        setTaskToEdit({
            ...task,
            dueDate: task.dueDateOriginal || task.dueDate,
            dueTime: task.dueTimeOriginal || task.dueTime
        });
        setModalTareaOpen(true);
    };

    // ===== FORMATEAR TAREAS — campos corregidos =====
    const formatearTareas = (tareas) => {
        return tareas.map(t => {
            // Fecha: viene como fecha_tarea
            let fechaFormateada = t.fecha_tarea;
            if (t.fecha_tarea) {
                const dateObj = new Date(t.fecha_tarea);
                const day = String(dateObj.getUTCDate()).padStart(2, "0");
                const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                const year = dateObj.getUTCFullYear();
                fechaFormateada = `${day}-${month}-${year}`;
            }

            // Hora: viene como hora_tarea
            let horaFormateada = t.hora_tarea;
            if (t.hora_tarea) {
                const [h, min] = t.hora_tarea.split(":");
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
                }

                horaFormateada = `${displayHour}:${min} ${period}`;
            }

            return {
                id: t.id_tarea,                          // ← era id_recordatorio
                title: t.titulo,
                description: t.descripcion,
                dueDate: fechaFormateada,
                dueTime: horaFormateada,
                dueDateOriginal: t.fecha_tarea,          // ← era t.fecha
                dueTimeOriginal: t.hora_tarea,           // ← era t.hora
                estado: t.estado_tarea,                  // ← era t.estado
                completed: t.estado_tarea === "completada",
                activo: t.recordatorio_activo,           // ← era t.activo
            };
        });
    };

    const handleSaveTask = async (tarea) => {
        try {
            if (tarea.id) {
                await api.put(`/tareas/actualizar-tarea/${tarea.id}`, {
                    titulo: tarea.title,
                    descripcion: tarea.description,
                    fecha: tarea.dueDate,
                    hora: tarea.dueTime,
                    activo: tarea.activo
                });
                showAlert("success", "¡Tarea actualizada!", "Los cambios se guardaron correctamente");
            } else {
                await api.post("/tareas/crear-tarea", {
                    titulo: tarea.title,
                    descripcion: tarea.description,
                    fecha: tarea.dueDate,
                    hora: tarea.dueTime,
                    activo: tarea.activo
                });
                showAlert("success", "¡Tarea creada!", "La nueva tarea se ha creado exitosamente");
            }

            const tareasResponse = await api.get("/tareas/obtener-tareas");
            setTasks(formatearTareas(tareasResponse.data));
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ===== BÚSQUEDA SIN DELAY =====
    useEffect(() => {
        const buscarTareas = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const response = await api.get(`/tareas/buscar-tarea?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchResults(formatearTareas(response.data.resultados));
            } catch (error) {
                console.error("Error al buscar tareas:", error);
                setSearchResults([]);
            }
        };

        buscarTareas();
    }, [searchQuery]);

    // ===== FILTRADO =====
    const filteredTasks = (() => {
        const base = searchQuery.trim() ? searchResults : tasks;
        if (activeFilter === "pending") return base.filter(t => t.estado === "pendiente");
        if (activeFilter === "completed") return base.filter(t => t.estado === "completada");
        if (activeFilter === "expired") return base.filter(t => t.estado === "vencida");
        return base;
    })();

    const pendingTasks = tasks.filter(t => t.estado === "pendiente");

    // ===== PAGINACIÓN =====
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

    const getEmptyStateContent = () => {
        if (searchQuery.trim()) return {
            title: "No hay resultados que coincidan con la consulta",
            message: `No se encontraron tareas para "${searchQuery}"`,
        };
        if (activeFilter === "pending") return {
            title: "Excelente",
            message: "No hay tareas pendientes",
        };
        if (activeFilter === "completed") return {
            title: "No hay tareas completadas",
            message: "Finaliza tus tareas pendientes",
        };
        if (activeFilter === "expired") return {
            title: "No hay tareas expiradas",
            message: "Finaliza tus tareas pendientes antes de que expiren",
        };
        return {
            title: "No hay tareas",
            message: "Crea una nueva tarea para comenzar",
        };
    };

    // ===== OBTENER TAREAS (polling cada 30s) =====
    useEffect(() => {
        const obtenerTareas = async () => {
            try {
                const response = await api.get("/tareas/obtener-tareas");
                setTasks(formatearTareas(response.data));
            } catch (error) {
                console.error("Error al obtener tareas:", error);
            }
        };

        obtenerTareas();
        const interval = setInterval(obtenerTareas, 39000); // ← era 1000ms, muy agresivo
        return () => clearInterval(interval);
    }, []);

    return {
        tasks,
        activeFilter,
        searchQuery,
        itemsPerPage,
        currentPage,
        modalOpen,
        taskToDelete,
        modalFinalizarOpen,
        taskToFinish,
        modalTareaOpen,
        taskToEdit,
        alert,
        searchResults,
        filteredTasks,
        pendingTasks,
        totalPages,
        paginatedTasks,

        setActiveFilter,
        setItemsPerPage,
        setCurrentPage,
        setModalOpen,
        setModalFinalizarOpen,
        setModalTareaOpen,

        showAlert,
        closeAlert,
        toggleTask,
        deleteTask,
        handleDeleteClick,
        handleConfirmDelete,
        handleFinishClick,
        handleConfirmFinish,
        handleCreateClick,
        handleEditClick,
        handleSaveTask,
        handleSearchChange,
        getEmptyStateContent,
    };
}