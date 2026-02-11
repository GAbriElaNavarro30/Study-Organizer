import "../styles/crudAdmin.css";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import { IoAddCircleOutline, IoDocumentTextOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";

import { ModalEliminar } from "../components/ModalEliminar";
import { ModalUsuario } from "../components/ModalUsuario";
import { CustomAlert } from "../components/CustomAlert";
import { PdfUsuarios } from "../components/PdfUsuarios";

import logo from "../assets/imagenes/logotipo.png";
import { useCrudAdmin } from "../hooks/useCrudAdmin";

export function CrudAdmin() {
  const {
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
  } = useCrudAdmin();

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
              onChange={(e) => cambiarRegistrosPorPagina(e.target.value)}
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
                    <td>
                      {usuario.fecha_nacimiento
                        ? new Date(usuario.fecha_nacimiento).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
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
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
          >
            &laquo;
          </button>

          {[...Array(totalPaginas)].map((_, index) => (
            <button
              key={index}
              className={`pagina ${paginaActual === index + 1 ? "activa" : ""}`}
              onClick={() => cambiarPagina(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="pagina"
            onClick={paginaSiguiente}
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