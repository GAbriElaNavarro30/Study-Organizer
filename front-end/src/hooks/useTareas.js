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

    // ===== ESTADO PARA RESULTADOS DE BÚSQUEDA =====
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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
        const taskForEdit = {
            ...task,
            dueDate: task.dueDateOriginal || task.dueDate,
            dueTime: task.dueTimeOriginal || task.dueTime
        };
        setTaskToEdit(taskForEdit);
        setModalTareaOpen(true);
    };

    const formatearTareas = (tareas) => {
        return tareas.map(t => {
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
                activo: t.activo,
            };
        });
    };

    const handleSaveTask = async (tarea) => {
        try {
            if (tarea.id) {
                // ===== EDITAR TAREA EXISTENTE =====
                await api.put(`/tareas/actualizar-tarea/${tarea.id}`, {
                    titulo: tarea.title,
                    descripcion: tarea.description,
                    fecha: tarea.dueDate,
                    hora: tarea.dueTime,
                    activo: tarea.activo 
                });

                const tareasResponse = await api.get("/tareas/obtener-tareas");
                const tareasFormateadas = formatearTareas(tareasResponse.data);

                setTasks(tareasFormateadas);
                showAlert("success", "¡Tarea actualizada!", "Los cambios se guardaron correctamente");
            } else {
                // ===== CREAR NUEVA TAREA =====
                await api.post("/tareas/crear-tarea", {
                    titulo: tarea.title,
                    descripcion: tarea.description,
                    fecha: tarea.dueDate,
                    hora: tarea.dueTime,
                    activo: tarea.activo
                });

                const tareasResponse = await api.get("/tareas/obtener-tareas");
                const tareasFormateadas = formatearTareas(tareasResponse.data);

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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

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
                const tareasFormateadas = formatearTareas(response.data.resultados);
                setSearchResults(tareasFormateadas);
            } catch (error) {
                console.error("Error al buscar tareas:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(buscarTareas);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // ===== FILTRADO CON BÚSQUEDA =====
    const filteredTasks = (() => {
        if (searchQuery.trim()) {
            const results = searchResults;

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
        if (searchQuery.trim() !== "") {
            return {
                title: "No hay resultados que coincidan con la consulta",
                message: `No se encontraron tareas para "${searchQuery}"`,
            };
        }

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

    // ===== OBTENER TAREAS =====
    useEffect(() => {
        const obtenerTareas = async () => {
            try {
                const response = await api.get("/tareas/obtener-tareas");
                const tareasFormateadas = formatearTareas(response.data);
                setTasks(tareasFormateadas);
            } catch (error) {
                console.error("Error al obtener tareas:", error);
            }
        };

        obtenerTareas();

        const interval = setInterval(obtenerTareas, 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        // Estados
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
        isSearching,
        filteredTasks,
        pendingTasks,
        totalPages,
        paginatedTasks,

        // Setters
        setActiveFilter,
        setItemsPerPage,
        setCurrentPage,
        setModalOpen,
        setModalFinalizarOpen,
        setModalTareaOpen,

        // Funciones
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