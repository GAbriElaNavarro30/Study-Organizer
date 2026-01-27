import React, { useState, useEffect } from "react";
import "../styles/modalUsuario.css"; // crea un CSS propio para este modal
import { IoClose } from "react-icons/io5";

export function ModalUsuario({ isOpen, onClose, onSubmit, tipo, usuario }) {
    const [formData, setFormData] = useState({
        nombre: "",
        correo: "",
        rol: "",
        telefono: "",
        genero: ""
    });

    // Si estamos editando, rellenamos el formulario con los datos del usuario
    useEffect(() => {
        if (tipo === "editar" && usuario) {
            setFormData({
                nombre: usuario.nombre || "",
                correo: usuario.correo || "",
                rol: usuario.rol || "",
                telefono: usuario.telefono || "",
                genero: usuario.genero || ""
            });
        } else {
            setFormData({
                nombre: "",
                correo: "",
                rol: "",
                telefono: "",
                genero: ""
            });
        }
    }, [usuario, tipo, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); // aquí llamas a tu API o función de guardado
        onClose(); // cerrar modal
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-create-update">
            <div className="modal-container-create-update" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <IoClose />
                </button>
                <h2>{tipo === "editar" ? "Editar Usuario" : "Nuevo Usuario"}</h2>
                <hr className="linea-separadora-create-update" />

                <form onSubmit={handleSubmit} className="modal-form-create-update">
                    {/* 1ra fila: Nombre */}
                    <div className="fila">
                        <label>
                            Nombre
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    {/* 2da fila: Fecha de nacimiento y teléfono */}
                    <div className="fila">
                        <label>
                            Fecha de nacimiento
                            <input
                                type="date"
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Teléfono
                            <input
                                type="text"
                                name="telefono"
                                placeholder="Ej. 5512345678"
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    {/* 3ra fila: Género estilo Facebook */}
                    <div className="fila genero-fb">
                        <span className="titulo-fila-create-update">Género</span>
                        <div className="radios-container">
                            <label className={`radio-btn ${formData.genero === "Mujer" ? "activo" : ""}`}>
                                <input
                                    type="radio"
                                    name="genero"
                                    value="Mujer"
                                    checked={formData.genero === "Mujer"}
                                    onChange={handleChange}
                                />
                                <span>Mujer</span>
                            </label>
                            <label className={`radio-btn ${formData.genero === "Hombre" ? "activo" : ""}`}>
                                <input
                                    type="radio"
                                    name="genero"
                                    value="Hombre"
                                    checked={formData.genero === "Hombre"}
                                    onChange={handleChange}
                                />
                                <span>Hombre</span>
                            </label>
                            <label className={`radio-btn ${formData.genero === "Otro" ? "activo" : ""}`}>
                                <input
                                    type="radio"
                                    name="genero"
                                    value="Otro"
                                    checked={formData.genero === "Otro"}
                                    onChange={handleChange}
                                />
                                <span>Otro</span>
                            </label>
                        </div>
                    </div>


                    {/* 4ta fila: Correo */}
                    <div className="fila">
                        <label>
                            Correo electrónico:
                            <input
                                type="email"
                                name="correo"
                                placeholder="correo@ejemplo.com"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    {/* 5ta fila: Contraseña y confirmar contraseña */}
                    <div className="fila">
                        <label>
                            Contraseña:
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required={tipo === "crear"} // obligatorio solo al crear
                            />
                        </label>
                        <label>
                            Confirmar contraseña:
                            <input
                                type="password"
                                name="confirmarPassword"
                                placeholder="••••••••"
                                value={formData.confirmarPassword}
                                onChange={handleChange}
                                required={tipo === "crear"}
                            />
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="modal-buttons-create-update">
                        <button type="submit" className="btn btn-nuevo-create-update">
                            {tipo === "editar" ? "Actualizar" : "Guardar"}
                        </button>
                        <button type="button" className="btn btn-pdf-create-update" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
