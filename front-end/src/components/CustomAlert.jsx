import React from "react";
import "../styles/CustomAlert.css"; // estilos separados

export function CustomAlert({ type = "success", title, message, onClose, logo }) {
  return (
    <div className={`custom-alert ${type}`}>
      <div className="custom-alert-content-box">
        {logo && (
          <img
            src={logo}
            alt="Logo"
            className="custom-alert-logo"
          />
        )}

        <div className="custom-alert-text">
          <h2>{title}</h2>
          <p>{message}</p>
        </div>

        <button className="custom-alert-button" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}