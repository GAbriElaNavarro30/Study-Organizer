import { useState } from "react";
import "../styles/tareas.css";
import { IoAddCircleOutline } from "react-icons/io5";

import {
    CheckCircle2,
    Plus,
    Search,
    Clock,
    Flag,
    Pencil,
    Trash2,
    Inbox,
} from "lucide-react";

const initialTasks = [
    {
        id: 1,
        title: "Revisar propuesta del cliente",
        description: "Analizar los requisitos y preparar respuesta detallada",
        completed: false,
        priority: "high",
        dueDate: "Hoy",
        category: "Trabajo",
    },
    {
        id: 2,
        title: "Actualizar documentación del proyecto",
        description: "Incluir los nuevos endpoints de la API",
        completed: false,
        priority: "medium",
        dueDate: "Mañana",
        category: "Trabajo",
    },
    {
        id: 3,
        title: "Reunión con el equipo de diseño",
        description: "Discutir cambios en la interfaz de usuario",
        completed: false,
        priority: "high",
        dueDate: "Hoy",
        category: "Reuniones",
    },
    {
        id: 4,
        title: "Preparar presentación mensual",
        completed: true,
        priority: "medium",
        dueDate: "Completado",
        category: "Trabajo",
    },
];

export function Tareas() {
    const [tasks, setTasks] = useState(initialTasks);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const filteredTasks = tasks.filter(task => {
        const match = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === "pending") return match && !task.completed;
        if (activeFilter === "completed") return match && task.completed;
        return match;
    });

    const pendingTasks = filteredTasks.filter(t => !t.completed);

    /* ===== PAGINACIÓN ===== */
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTasks = filteredTasks.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className="contenedor-tareas-principal">
            <div className="tareas-page">

                {/* ===== TÍTULO ===== */}
                <div className="tareas-title">
                    <h1>Mis tareas</h1>
                    <p>{pendingTasks.length} tareas pendientes</p>
                </div>

                {/* ===== FILA 1: ACCIONES ===== */}
                <div className="tareas-row fila-unica">
                    {/* IZQUIERDA */}
                    <div className="bloque-izq">
                        <button className="btn-primary">
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
                            <h3>No hay tareas</h3>
                            <p>Crea una nueva tarea para comenzar</p>
                        </div>
                    ) : (
                        <table className="tareas-table">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>{task.title}</td>
                                        <td>{task.description || "-"}</td>
                                        <td>{task.dueDate}</td>
                                        <td>
                                            <span className={`estado ${task.completed ? "completado" : "pendiente"}`}>
                                                {task.completed ? "Completada" : "Pendiente"}
                                            </span>
                                        </td>
                                        <td className="acciones">
                                            <button title="Editar">
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                title="Cambiar estado"
                                                onClick={() => toggleTask(task.id)}
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                className="delete"
                                                title="Eliminar"
                                                onClick={() => deleteTask(task.id)}
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
                    {/* Botón Anterior */}
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        &lt;
                    </button>

                    {/* Botones de páginas */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`page-btn ${currentPage === page ? "active" : ""}`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}

                    {/* Botón Siguiente */}
                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        &gt;
                    </button>
                </div>


            </div>
        </div>
    );
}
