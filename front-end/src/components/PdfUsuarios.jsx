import React from "react";
import "./../styles/pdfUsuarios.css";
import logo from "../assets/imagenes/logo-header.png";

export function PdfUsuarios({ usuarios }) {
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toLocaleString();

  return (
    <div className="pdf-container pdf-landscape">
      {/* Header con logo y fecha */}
      <div className="pdf-header">
        <img src={logo} alt="Logo" className="pdf-logo" />

        {/* Mensaje centrado */}
        <div className="header-message">
          Organiza tu estudio, cuida tu bienestar
        </div>

        <div className="fecha">Fecha: {fechaFormateada}</div>
      </div>

      <h1 className="pdf-title">Lista de Usuarios</h1>

      {/* Tabla de usuarios */}
      <table className="pdf-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Teléfono</th>
            <th>Género</th>
            <th>Nacimiento</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.rol}</td>
              <td>{u.telefono || "-"}</td>
              <td>{u.genero || "-"}</td>
              <td>{u.fechaNacimiento ? new Date(u.fechaNacimiento).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer profesional */}
      <div className="pdf-footer">
        <div className="footer-text">
          © {fechaActual.getFullYear()} Study Organizer. Todos los derechos reservados.
        </div>
        <div className="footer-page">Página 1</div>
      </div>
    </div>
  );
}
