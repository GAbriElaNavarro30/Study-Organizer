import "../styles/crudAdmin.css";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import { IoAddCircleOutline, IoDocumentTextOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";

import React, { useState } from "react";
import { ModalEliminar } from "../components/ModalEliminar"; // importar el modal
import { ModalUsuario } from "../components/ModalUsuario";

export function CrudAdmin() {
    // Estado de modales
    const [modalOpen, setModalOpen] = useState(false);
    const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
    const [tipoModal, setTipoModal] = useState("crear"); // "crear" o "editar"
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    // Datos de prueba
    const [usuarios, setUsuarios] = useState([
        { id: 1, nombre: "Juan Pérez", correo: "juan@email.com", rol: "Administrador", telefono: "5512345678", genero: "Hombre" },
        { id: 2, nombre: "Ana Gómez", correo: "ana@email.com", rol: "Usuario", telefono: "5598765432", genero: "Mujer" },
        { id: 3, nombre: "Luis Ramírez", correo: "luis@email.com", rol: "Usuario", telefono: "5511122233", genero: "Hombre" },
    ]);

    // --- Modal Eliminar ---
    const abrirModalEliminar = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalOpen(true);
    };

    const cerrarModalEliminar = () => {
        setModalOpen(false);
        setUsuarioSeleccionado(null);
    };

    const confirmarEliminacion = () => {
        setUsuarios(usuarios.filter(u => u.id !== usuarioSeleccionado.id));
        cerrarModalEliminar();
    };

    // --- Modal Crear/Editar ---
    const abrirModalUsuario = (tipo, usuario = null) => {
        setTipoModal(tipo);
        setUsuarioSeleccionado(usuario);
        setModalUsuarioOpen(true);
    };

    const cerrarModalUsuario = () => setModalUsuarioOpen(false);

    const guardarUsuario = (usuario) => {
        if (tipoModal === "crear") {
            // Crear nuevo usuario
            const nuevoUsuario = { ...usuario, id: Date.now() };
            setUsuarios([...usuarios, nuevoUsuario]);
        } else if (tipoModal === "editar") {
            // Editar usuario existente
            setUsuarios(
                usuarios.map(u => u.id === usuario.id ? usuario : u)
            );
        }
        cerrarModalUsuario();
    };

    return (
        <div className="contenedor-administrador">
            <div className="contenedor-admin">
                <h1 className="titulo-admin">Administración de Usuarios</h1>

                {/* Barra superior */}
                <div className="barra-superior">
                    <div className="botones-superior">
                        <button className="btn btn-nuevo" onClick={() => abrirModalUsuario("crear")}>
                            <IoAddCircleOutline /> Nuevo
                        </button>

                        <button className="btn btn-pdf">
                            <IoDocumentTextOutline /> Exportar PDF
                        </button>
                    </div>

                    <div className="busqueda-con-icono">
                        <IoSearchOutline className="icono-busqueda" />
                        <input type="text" placeholder="Buscar usuario..." className="input-busqueda" />
                    </div>

                    <div className="mostrar-resultados">
                        <span>Mostrar</span>
                        <select className="select-registros">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <span>resultados</span>
                    </div>
                </div>

                {/* Tabla */}
                <div className="tabla-contenedor">
                    <table className="tabla-admin">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Teléfono</th>
                                <th>Género</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.correo}</td>
                                    <td>{usuario.rol}</td>
                                    <td>{usuario.telefono}</td>
                                    <td>{usuario.genero}</td>
                                    <td className="acciones-tabla">
                                        <button
                                            className="btn-icono editar"
                                            onClick={() => abrirModalUsuario("editar", usuario)}
                                        >
                                            <IoPencilOutline />
                                        </button>
                                        <button
                                            className="btn-icono eliminar"
                                            onClick={() => abrirModalEliminar(usuario)}
                                        >
                                            <IoTrashOutline />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="paginacion">
                    <button className="pagina">&laquo;</button>
                    <button className="pagina activa">1</button>
                    <button className="pagina">2</button>
                    <button className="pagina">3</button>
                    <button className="pagina">&raquo;</button>
                </div>

                {/* Modales */}
                <ModalEliminar
                    isOpen={modalOpen}
                    onClose={cerrarModalEliminar}
                    onConfirm={confirmarEliminacion}
                    nombreUsuario={usuarioSeleccionado?.nombre}
                />

                <ModalUsuario
                    isOpen={modalUsuarioOpen}
                    onClose={cerrarModalUsuario}
                    onSubmit={guardarUsuario}
                    tipo={tipoModal}
                    usuario={usuarioSeleccionado}
                />
            </div>
        </div>
    );
}
