import React, { useState, useEffect } from "react";
import "../styles/modalUsuario.css";
import { IoClose } from "react-icons/io5";

export function ModalUsuario({ isOpen, onClose, onSubmit, tipo, usuario }) {
    const [formData, setFormData] = useState({
        nombre: "",
        correo: "",
        rol: "",
        telefono: "",
        genero: "",
        fechaNacimiento: {
            day: "",
            month: "",
            year: ""
        },
        password: "",
        confirmarPassword: ""
    });

    // ===== LISTAS FECHA =====
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

    // ===== EDITAR USUARIO =====
    useEffect(() => {
        if (tipo === "editar" && usuario) {
            const [year = "", month = "", day = ""] =
                usuario.fechaNacimiento?.split("-") || [];

            setFormData({
                nombre: usuario.nombre || "",
                correo: usuario.correo || "",
                rol: usuario.rol || "",
                telefono: usuario.telefono || "",
                genero: usuario.genero || "",
                fechaNacimiento: { day, month, year },
                password: "",
                confirmarPassword: ""
            });
        } else {
            setFormData({
                nombre: "",
                correo: "",
                rol: "",
                telefono: "",
                genero: "",
                fechaNacimiento: { day: "", month: "", year: "" },
                password: "",
                confirmarPassword: ""
            });
        }
    }, [usuario, tipo, isOpen]);

    // ===== INPUT NORMAL =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ===== SUBMIT =====
    const handleSubmit = (e) => {
        e.preventDefault();

        // Convertir fecha a YYYY-MM-DD
        const { day, month, year } = formData.fechaNacimiento;
        const fechaNacimiento =
            day && month && year ? `${year}-${month}-${day}` : "";

        onSubmit({
            ...formData,
            fechaNacimiento
        });

        onClose();
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

                    <div className="fila">
                        <label>
                            Rol
                            <select
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona un rol</option>
                                <option value="Estudiante">Estudiante</option>
                                <option value="Tutor">Tutor</option>
                                <option value="Administrador">Administrador</option>
                            </select>
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

                    {/* 2da fila: Fecha de nacimiento y teléfono */}
                    {/* FECHA NACIMIENTO (FACEBOOK) */}
                    <div className="fila genero-fb">
                        <span className="titulo-fila-create-update">
                            Fecha de nacimiento
                        </span>

                        <div className="fecha-nacimiento">
                            <select
                                value={formData.fechaNacimiento.day}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        fechaNacimiento: {
                                            ...prev.fechaNacimiento,
                                            day: e.target.value
                                        }
                                    }))
                                }
                                required
                            >
                                <option value="">Día</option>
                                {days.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>

                            <select
                                value={formData.fechaNacimiento.month}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        fechaNacimiento: {
                                            ...prev.fechaNacimiento,
                                            month: e.target.value
                                        }
                                    }))
                                }
                                required
                            >
                                <option value="">Mes</option>
                                {months.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>

                            <select
                                value={formData.fechaNacimiento.year}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        fechaNacimiento: {
                                            ...prev.fechaNacimiento,
                                            year: e.target.value
                                        }
                                    }))
                                }
                                required
                            >
                                <option value="">Año</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
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
