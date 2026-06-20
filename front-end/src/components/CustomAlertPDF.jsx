import React from "react";
import "../styles/CustomAlert.css";
import logo from "../assets/imagenes/logotipo.png";

export function CustomAlertPDF() {
    return (
        <div className="custom-alert success">
            <div className="custom-alert-content-box">
                <img src={logo} alt="Logo" className="custom-alert-logo" />
                <div className="custom-alert-text">
                    <h2>Generando PDF...</h2>
                    <p>Por favor espera un momento.</p>
                </div>
            </div>
        </div>
    );
}