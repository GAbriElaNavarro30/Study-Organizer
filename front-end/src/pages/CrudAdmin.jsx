import "../styles/crudAdmin.css";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import { IoAddCircleOutline, IoDocumentTextOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";

import { ModalEliminar } from "../components/ModalEliminar";
import { ModalUsuario } from "../components/ModalUsuario";
import { CustomAlert } from "../components/CustomAlert";

import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import logo from "../assets/imagenes/logotipo.png";


import { PdfUsuarios } from "../components/PdfUsuarios";


export function CrudAdmin() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
    const [tipoModal, setTipoModal] = useState("crear");
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [erroresBackend, setErroresBackend] = useState({});
    const [mostrarAlert, setMostrarAlert] = useState(false);
    const [mensajeAlert, setMensajeAlert] = useState("");
    const [tipoAlert, setTipoAlert] = useState("success");
    const [tituloAlert, setTituloAlert] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(5);

    const indiceUltimoUsuario = paginaActual * registrosPorPagina;
    const indicePrimerUsuario = indiceUltimoUsuario - registrosPorPagina;
    const usuariosActuales = usuarios.slice(indicePrimerUsuario, indiceUltimoUsuario);
    const totalPaginas = Math.ceil(usuarios.length / registrosPorPagina);

    // --- Modal Eliminar ---
    const abrirModalEliminar = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalOpen(true);
    };

    const cerrarModalEliminar = () => {
        setModalOpen(false);
        setUsuarioSeleccionado(null);
    };

    const confirmarEliminacion = async () => {
        try {
            await api.delete(`/usuarios/eliminar-usuario/${usuarioSeleccionado.id}`);

            setTituloAlert("Éxito");
            setMensajeAlert("Usuario eliminado correctamente");
            setTipoAlert("success");
            setMostrarAlert(true);

            cerrarModalEliminar();
            await obtenerUsuarios();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);

            setTituloAlert("Error");
            setMensajeAlert("No se pudo eliminar el usuario");
            setTipoAlert("error");
            setMostrarAlert(true);
        }
    };

    // --- Modal Crear/Editar ---
    const abrirModalUsuario = (tipo, usuario = null) => {
        setTipoModal(tipo);
        setUsuarioSeleccionado(usuario);
        setErroresBackend({});
        setModalUsuarioOpen(true);
    };

    const cerrarModalUsuario = () => {
        setModalUsuarioOpen(false);
        setErroresBackend({});
    };

    // Función para limpiar errores individuales del backend
    const limpiarErrorBackend = (campo) => {
        setErroresBackend(prev => {
            const nuevos = { ...prev };
            delete nuevos[campo];
            return nuevos;
        });
    };

    const guardarUsuario = async (usuarioData) => {
        try {
            if (tipoModal === "crear") {
                const payload = {
                    nombre_usuario: usuarioData.nombre_usuario,
                    correo_electronico: usuarioData.correo,
                    telefono: usuarioData.telefono,
                    genero: usuarioData.genero,
                    fecha_nacimiento: usuarioData.fecha_nacimiento,
                    contrasena: usuarioData.contrasena,
                    id_rol: usuarioData.id_rol,
                };

                await api.post("/usuarios/alta-usuario", payload);

                setTituloAlert("Éxito");
                setMensajeAlert("Usuario registrado correctamente");
                setTipoAlert("success");
                setMostrarAlert(true);
            }

            if (tipoModal === "editar") {
                const payload = {
                    nombre_usuario: usuarioData.nombre_usuario,
                    correo_electronico: usuarioData.correo,
                    telefono: usuarioData.telefono,
                    genero: usuarioData.genero,
                    fecha_nacimiento: usuarioData.fecha_nacimiento,
                    id_rol: usuarioData.id_rol,
                };

                if (usuarioData.contrasena) {
                    payload.contrasena = usuarioData.contrasena;
                }

                await api.put(
                    `/usuarios/editar-usuario/${usuarioSeleccionado.id}`,
                    payload
                );

                setTituloAlert("Éxito");
                setMensajeAlert("Usuario actualizado correctamente");
                setTipoAlert("success");
                setMostrarAlert(true);
            }

            await obtenerUsuarios();
            cerrarModalUsuario();
        } catch (error) {
            if (error.response?.data?.errors) {
                const errores = {};

                error.response.data.errors.forEach(err => {
                    // Mapear nombres del backend a nombres del frontend
                    if (err.path === "correo_electronico") {
                        errores.correo = err.message;
                    } else {
                        errores[err.path] = err.message;
                    }
                });

                setErroresBackend(errores);
                return; // NO cerrar modal
            }

            console.error("Error:", error);
            setTituloAlert("Error");
            setMensajeAlert("Error al guardar usuario");
            setTipoAlert("error");
            setMostrarAlert(true);
        }
    };

    


    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                let response;

                if (busqueda.trim() === "") {
                    response = await api.get("/usuarios/obtener-usuarios");
                } else {
                    response = await api.get("/usuarios/buscar-informacion", {
                        params: { q: busqueda }
                    });
                }

                const usuariosFormateados = response.data.map((u) => ({
                    id: u.id_usuario,
                    nombre_usuario: u.nombre_usuario,
                    correo: u.correo_electronico,
                    rol: convertirRol(u.id_rol),
                    telefono: u.telefono,
                    genero: u.genero || "",
                    fecha_nacimiento: u.fecha_nacimiento,
                }));

                setUsuarios(usuariosFormateados);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            }
        };

        cargarUsuarios();
    }, [busqueda]);

    const convertirRol = (id_rol) => {
        switch (id_rol) {
            case 1:
                return "Administrador";
            case 3:
                return "Tutor";
            case 2:
                return "Estudiante";
            default:
                return null;
        }
    };

    const obtenerUsuarios = async () => {
        try {
            const response = await api.get("/usuarios/obtener-usuarios");

            const usuariosFormateados = response.data.map((u) => ({
                id: u.id_usuario,
                nombre_usuario: u.nombre_usuario,
                correo: u.correo_electronico,
                rol: convertirRol(u.id_rol),
                telefono: u.telefono,
                genero: u.genero || "",
                fecha_nacimiento: u.fecha_nacimiento,
            }));

            setUsuarios(usuariosFormateados);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    return (
        <div className="contenedor-administrador">
            <div className="contenedor-admin">
                <h1 className="titulo-admin">Administración de Usuarios</h1>

                <div className="barra-superior">
                    <div className="botones-superior">
                        <button className="btn btn-nuevo-admin" onClick={() => abrirModalUsuario("crear")}>
                            <IoAddCircleOutline /> Nuevo
                        </button>

                        <button className="btn btn-pdf-admin" onClick={() => PdfUsuarios(usuarios)}>
                            <IoDocumentTextOutline /> Exportar PDF
                        </button>
                    </div>

                    <div className="busqueda-con-icono">
                        <IoSearchOutline className="icono-busqueda" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            className="input-busqueda"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="mostrar-resultados">
                        <span>Mostrar</span>
                        <select
                            className="select-registros"
                            value={registrosPorPagina}
                            onChange={(e) => {
                                setRegistrosPorPagina(Number(e.target.value));
                                setPaginaActual(1);
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <span>resultados</span>
                    </div>
                </div>

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
                                <th>Fecha Nacimiento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosActuales.length > 0 ? (
                                usuariosActuales.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.id}</td>
                                        <td>{usuario.nombre_usuario}</td>
                                        <td>{usuario.correo}</td>
                                        <td>{usuario.rol}</td>
                                        <td>{usuario.telefono}</td>
                                        <td>{usuario.genero}</td>
                                        <td>{usuario.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toLocaleDateString("es-MX", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })
                                            : "-"}</td>
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        style={{ textAlign: "center", padding: "1rem", color: "#666" }}
                                    >
                                        Ningún resultado coincide con la búsqueda
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="paginacion">
                    <button
                        className="pagina"
                        onClick={() => setPaginaActual(paginaActual > 1 ? paginaActual - 1 : 1)}
                        disabled={paginaActual === 1}
                    >
                        &laquo;
                    </button>

                    {[...Array(totalPaginas)].map((_, index) => (
                        <button
                            key={index}
                            className={`pagina ${paginaActual === index + 1 ? "activa" : ""}`}
                            onClick={() => setPaginaActual(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        className="pagina"
                        onClick={() => setPaginaActual(paginaActual < totalPaginas ? paginaActual + 1 : totalPaginas)}
                        disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    >
                        &raquo;
                    </button>
                </div>

                <ModalEliminar
                    isOpen={modalOpen}
                    onClose={cerrarModalEliminar}
                    onConfirm={confirmarEliminacion}
                    nombreUsuario={usuarioSeleccionado?.nombre_usuario}
                />

                <ModalUsuario
                    isOpen={modalUsuarioOpen}
                    onClose={cerrarModalUsuario}
                    onSubmit={guardarUsuario}
                    tipo={tipoModal}
                    usuario={usuarioSeleccionado}
                    erroresBackend={erroresBackend}
                    limpiarErrorBackend={limpiarErrorBackend}
                />

                {mostrarAlert && (
                    <CustomAlert
                        type={tipoAlert}
                        title={tituloAlert}
                        message={mensajeAlert}
                        logo={logo}
                        onClose={() => setMostrarAlert(false)}
                    />
                )}


            </div>
        </div>
    );
}