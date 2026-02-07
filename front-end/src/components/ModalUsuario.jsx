import React, { useState, useEffect } from "react";
import "../styles/modalUsuario.css";
import { IoClose } from "react-icons/io5";
import bcrypt from "bcryptjs";

export function ModalUsuario({ isOpen, onClose, onSubmit, tipo, usuario, erroresBackend = {}, ...props }) {
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
    const [errors, setErrors] = useState({});

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.nombre.trim()) nuevosErrores.nombre = "El campo es obligatorio";
        if (!formData.rol) nuevosErrores.rol = "El campo es obligatorio";
        if (!formData.telefono.trim()) nuevosErrores.telefono = "El campo es obligatorio";
        if (!formData.genero) nuevosErrores.genero = "El campo es obligatorio";
        if (!formData.correo.trim()) nuevosErrores.correo = "El campo es obligatorio";

        const { day, month, year } = formData.fechaNacimiento;
        if (!day || !month || !year) {
            nuevosErrores.fechaNacimiento = "El campo es obligatorio";
        }

        // ================== VALIDAR FORMATOS ==================

        // Nombre
        const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
        if (formData.nombre && !nombreRegex.test(formData.nombre)) {
            nuevosErrores.nombre =
                "El nombre solo puede contener letras, espacios, puntos y acentos";
        }

        // Teléfono
        const telefonoRegex = /^[0-9]{10}$/;
        if (formData.telefono && !telefonoRegex.test(formData.telefono)) {
            nuevosErrores.telefono = "El teléfono debe tener 10 dígitos numéricos";
        }

        // Correo electrónico
        const correoRegex =
            /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

        if (formData.correo && !correoRegex.test(formData.correo)) {
            nuevosErrores.correo =
                "El correo electrónico no cumple con un formato válido y profesional";
        }

        const parteUsuario = formData.correo.split("@")[0] || "";
        if (parteUsuario.length > 64) {
            nuevosErrores.correo =
                "El correo no debe superar 64 caracteres antes del @";
        }

        // ================== PASSWORD (solo crear) ==================
        // PASSWORD (crear obligatorio / editar opcional)
        if (tipo === "crear" || (tipo === "editar" && formData.password)) {

            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

            if (!formData.password) {
                nuevosErrores.password = "El campo es obligatorio";
            } else if (!passwordRegex.test(formData.password)) {
                nuevosErrores.password =
                    "Debe tener mínimo 6 caracteres, mayúscula, minúscula, número y carácter especial (@ # $ ¡ *)";
            }

            if (!formData.confirmarPassword) {
                nuevosErrores.confirmarPassword = "El campo es obligatorio";
            } else if (formData.password !== formData.confirmarPassword) {
                nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
            }
        }


        // ================== FECHA DE NACIMIENTO ==================
        if (day && month && year) {
            const pad = (n) => String(n).padStart(2, "0");
            const fecha = `${year}-${pad(month)}-${pad(day)}`;

            const fechaNacimientoDate = new Date(fecha);
            const hoy = new Date();

            // No hoy ni futuro
            if (fechaNacimientoDate >= hoy) {
                nuevosErrores.fechaNacimiento =
                    "La fecha de nacimiento no puede ser hoy ni una fecha futura";
            }

            // Edad mínima
            const edadMinima = 13;
            const fechaMinima = new Date(
                hoy.getFullYear() - edadMinima,
                hoy.getMonth(),
                hoy.getDate()
            );

            if (fechaNacimientoDate > fechaMinima) {
                nuevosErrores.fechaNacimiento =
                    `Debes tener al menos ${edadMinima} años`;
            }

            // Edad máxima
            const edadMaxima = 120;
            const fechaMaxima = new Date(
                hoy.getFullYear() - edadMaxima,
                hoy.getMonth(),
                hoy.getDate()
            );

            if (fechaNacimientoDate < fechaMaxima) {
                nuevosErrores.fechaNacimiento =
                    `La edad no puede ser mayor a ${edadMaxima} años`;
            }
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const erroresCombinados = {
        ...erroresBackend,
        ...errors
    };


    // ===== EDITAR USUARIO =====
    useEffect(() => {
        if (tipo === "editar" && usuario) {
            const [year = "", month = "", day = ""] =
                usuario.fechaNacimiento?.split("-") || [];

            const normalizarGenero = (g) => {
                if (!g) return "";
                if (g.toLowerCase() === "mujer") return "Mujer";
                if (g.toLowerCase() === "hombre") return "Hombre";
                if (g.toLowerCase() === "otro") return "Otro";
                return "";
            };


            setFormData({
                nombre: usuario.nombre || "",
                correo: usuario.correo || "",
                rol: usuario.rol || "",
                telefono: usuario.telefono || "",
                genero: normalizarGenero(usuario.genero),
                fechaNacimiento: {
                    day: String(parseInt(day)),
                    month: String(parseInt(month)),
                    year: String(year),
                },
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

        setErrors(prev => ({ ...prev, [name]: null }));
    };


    // ===== SUBMIT =====
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const { day, month, year } = formData.fechaNacimiento;
        const fechaNacimiento =
            day && month && year ? `${year}-${month}-${day}` : "";

        // Construimos el payload base
        const dataEnviar = {
            ...formData,
            fechaNacimiento
        };

        // SOLO si escribió contraseña → hashearla y enviarla
        if (formData.password) {
            const salt = bcrypt.genSaltSync(10);
            dataEnviar.password = bcrypt.hashSync(formData.password, salt);
        } else {
            // Si no hay contraseña, NO se envía
            delete dataEnviar.password;
        }

        // Nunca enviamos confirmarPassword
        delete dataEnviar.confirmarPassword;

        onSubmit(dataEnviar);
    };


    useEffect(() => {
        setErrors({});
    }, [isOpen]);

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
                            />
                            {erroresCombinados.nombre && (
                                <span className="error-text">{erroresCombinados.nombre}</span>
                            )}
                        </label>
                    </div>

                    <div className="fila">
                        <label>
                            Rol
                            <select
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un rol</option>
                                <option value="Estudiante">Estudiante</option>
                                <option value="Tutor">Tutor</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                            {erroresCombinados.rol && (
                                <span className="error-text">{erroresCombinados.rol}</span>
                            )}

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
                            {erroresCombinados.telefono && (
                                <span className="error-text">{erroresCombinados.telefono}</span>
                            )}

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
                            >
                                <option value="">Año</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        {erroresCombinados.fechaNacimiento && (
                            <span className="error-text">{erroresCombinados.fechaNacimiento}</span>
                        )}
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
                        {erroresCombinados.genero && (
                            <span className="error-text">{erroresCombinados.genero}</span>
                        )}

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
                            />
                            {erroresCombinados.correo && (
                                <span className="error-text">{erroresCombinados.correo}</span>
                            )}
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

                            />
                            {erroresCombinados.password && (
                                <span className="error-text">{erroresCombinados.password}</span>
                            )}

                        </label>
                        <label>
                            Confirmar contraseña:
                            <input
                                type="password"
                                name="confirmarPassword"
                                placeholder="••••••••"
                                value={formData.confirmarPassword}
                                onChange={handleChange}

                            />

                            {erroresCombinados.confirmarPassword && (
                                <span className="error-text">{erroresCombinados.confirmarPassword}</span>
                            )}

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