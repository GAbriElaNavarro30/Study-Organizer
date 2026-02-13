import "../styles/tareas.css";
import { IoAddCircleOutline } from "react-icons/io5";
import logo from "../assets/imagenes/logotipo.png";
import { CheckCircle2, Search, Pencil, Trash2, Inbox } from "lucide-react";
import { ModalEliminarTarea } from "../components/ModalEliminarTarea";
import { ModalFinalizarTarea } from "../components/ModalFinalizarTarea";
import { ModalCrearActualizarTarea } from "../components/ModalCrearActualizarTarea";
import { CustomAlert } from "../components/CustomAlert";
import { useTareas } from "../hooks/useTareas";

export function Tareas() {
    const {
        // Estados
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
        pendingTasks,
        totalPages,
        paginatedTasks,
        filteredTasks,

        // Setters
        setActiveFilter,
        setItemsPerPage,
        setCurrentPage,
        setModalOpen,
        setModalFinalizarOpen,
        setModalTareaOpen,

        // Funciones
        closeAlert,
        handleDeleteClick,
        handleConfirmDelete,
        handleFinishClick,
        handleConfirmFinish,
        handleCreateClick,
        handleEditClick,
        handleSaveTask,
        handleSearchChange,
        getEmptyStateContent,
    } = useTareas();

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