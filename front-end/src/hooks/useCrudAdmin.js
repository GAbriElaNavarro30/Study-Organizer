import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export function useCrudAdmin() {
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

  const { usuario: usuarioAutenticado, setUsuario: setUsuarioAutenticado } = useContext(AuthContext);

  // ==================== CÁLCULOS DE PAGINACIÓN ====================
  const indiceUltimoUsuario = paginaActual * registrosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - registrosPorPagina;
  const usuariosActuales = usuarios.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const totalPaginas = Math.ceil(usuarios.length / registrosPorPagina);

  // ==================== CONVERTIR ROL ====================
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

  // ==================== OBTENER USUARIOS ====================
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

  // ==================== CARGAR USUARIOS CON BÚSQUEDA ====================
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        let response;

        if (busqueda.trim() === "") {
          response = await api.get("/usuarios/obtener-usuarios");
        } else {
          response = await api.get("/usuarios/buscar-informacion", {
            params: { q: busqueda },
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
        setPaginaActual(1); // Resetear a página 1 cuando cambia la búsqueda
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };

    cargarUsuarios();
  }, [busqueda]);

  // ==================== MODAL ELIMINAR ====================
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

  // ==================== MODAL CREAR/EDITAR ====================
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

  const limpiarErrorBackend = (campo) => {
    setErroresBackend((prev) => {
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

        // SI EL USUARIO EDITADO ES EL USUARIO AUTENTICADO, ACTUALIZAR EL CONTEXTO
        if (usuarioAutenticado && usuarioSeleccionado.id === usuarioAutenticado.id) {
          const resActualizado = await api.get("/usuarios/me");
          setUsuarioAutenticado(resActualizado.data.usuario);
        }
      }

      await obtenerUsuarios();
      cerrarModalUsuario();
    } catch (error) {
      if (error.response?.data?.errors) {
        const errores = {};

        error.response.data.errors.forEach((err) => {
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

  // ==================== PAGINACIÓN ====================
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const paginaAnterior = () => {
    setPaginaActual(paginaActual > 1 ? paginaActual - 1 : 1);
  };

  const paginaSiguiente = () => {
    setPaginaActual(paginaActual < totalPaginas ? paginaActual + 1 : totalPaginas);
  };

  const cambiarRegistrosPorPagina = (cantidad) => {
    setRegistrosPorPagina(Number(cantidad));
    setPaginaActual(1);
  };

  // ==================== EXPORTAR ====================
  return {
    // Estados
    modalOpen,
    modalUsuarioOpen,
    tipoModal,
    usuarioSeleccionado,
    usuarios,
    usuariosActuales,
    erroresBackend,
    mostrarAlert,
    mensajeAlert,
    tipoAlert,
    tituloAlert,
    busqueda,
    paginaActual,
    registrosPorPagina,
    totalPaginas,

    // Funciones Modal Eliminar
    abrirModalEliminar,
    cerrarModalEliminar,
    confirmarEliminacion,

    // Funciones Modal Usuario
    abrirModalUsuario,
    cerrarModalUsuario,
    limpiarErrorBackend,
    guardarUsuario,

    // Funciones de búsqueda y paginación
    setBusqueda,
    cambiarPagina,
    paginaAnterior,
    paginaSiguiente,
    cambiarRegistrosPorPagina,

    // Funciones de alerta
    setMostrarAlert,
  };
}