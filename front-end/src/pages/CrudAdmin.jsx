import "../styles/crudAdmin.css";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import { IoAddCircleOutline, IoDocumentTextOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";

import { ModalEliminar } from "../components/ModalEliminar"; // importar el modal
import { ModalUsuario } from "../components/ModalUsuario";
import { CustomAlert } from "../components/CustomAlert";

import { useEffect, useState } from "react";
import api from "../services/api";
import logo from "../assets/imagenes/logotipo.png";

export function CrudAdmin() {
    // Estado de modales
    const [modalOpen, setModalOpen] = useState(false);
    const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
    const [tipoModal, setTipoModal] = useState("crear"); // "crear" o "editar"
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    // Datos
    const [usuarios, setUsuarios] = useState([]);
    const [erroresBackend, setErroresBackend] = useState({});

    const [mostrarAlert, setMostrarAlert] = useState(false);
    const [mensajeAlert, setMensajeAlert] = useState("");
    const [tipoAlert, setTipoAlert] = useState("success"); // success | error
    const [tituloAlert, setTituloAlert] = useState(""); // nuevo estado

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
            await api.delete(
                `/usuarios/eliminar-usuario/${usuarioSeleccionado.id}`
            );

            // ALERT ÉXITO
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
        setErroresBackend({}); // limpia
        setModalUsuarioOpen(true);
    };

    const cerrarModalUsuario = () => setModalUsuarioOpen(false);

    const guardarUsuario = async (usuario) => {
        try {
            if (tipoModal === "crear") {
                const payload = {
                    nombre_usuario: usuario.nombre,
                    correo_electronico: usuario.correo,
                    telefono: usuario.telefono,
                    genero: usuario.genero,
                    fecha_nacimiento: usuario.fechaNacimiento,
                    contrasena: usuario.password,
                    id_rol: convertirRol(usuario.rol),
                };

                await api.post("/usuarios/alta-usuario", payload);

                // ALERT DE ÉXITO
                setTituloAlert("Éxito");
                setMensajeAlert("Usuario registrado correctamente");
                setTipoAlert("success");
                setMostrarAlert(true);
            }

            if (tipoModal === "editar") {
                // aquí después irá PUT /editar-usuario/:id
            }

            await obtenerUsuarios(); // refresca tabla
            cerrarModalUsuario();

        } catch (error) {
            if (error.response?.data?.errors) {
                const errores = {};

                error.response.data.errors.forEach(err => {
                    if (err.path === "correo_electronico") {
                        errores.correo = err.message;
                    } else {
                        errores[err.path] = err.message;
                    }
                });

                setErroresBackend(errores);
                return; // NO cerramos modal
            }

            // ERROR GENERAL
            console.error("Error:", error);
            setTituloAlert("Error");
            setMensajeAlert("Error al guardar usuario");
            setTipoAlert("error");
            setMostrarAlert(true);
        }
    };

    useEffect(() => {
        obtenerUsuarios();
    }, []);



    const convertirRol = (rol) => {
        switch (rol) {
            case "Administrador":
                return 1;
            case "Tutor":
                return 2;
            case "Estudiante":
                return 3;
            default:
                return null;
        }
    };

    const obtenerUsuarios = async () => {
        try {
            const response = await api.get("/usuarios/obtener-usuarios");

            const usuariosFormateados = response.data.map((u) => ({
                id: u.id_usuario,
                nombre: u.nombre_usuario,
                correo: u.correo_electronico,
                rol: u.rol,
                telefono: u.telefono,
                genero: u.genero || "—",
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

                {/* Barra superior */}
                <div className="barra-superior">
                    <div className="botones-superior">
                        <button className="btn btn-nuevo-admin" onClick={() => abrirModalUsuario("crear")}>
                            <IoAddCircleOutline /> Nuevo
                        </button>

                        <button className="btn btn-pdf-admin">
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
                    erroresBackend={erroresBackend}
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