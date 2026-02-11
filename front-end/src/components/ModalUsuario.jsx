import "../styles/modalUsuario.css";
import { IoClose } from "react-icons/io5";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { useModalUsuario } from "../hooks/useModalUsuario";

export function ModalUsuario({ isOpen, onClose, onSubmit, tipo, usuario, erroresBackend = {}, limpiarErrorBackend, ...props }) {
    const {
        formData,
        setFormData,
        showConfirmCancel,
        setShowConfirmCancel,
        errors,
        days,
        months,
        years,
        tieneCambios,
        validarFormulario,
        handleChange,
        handleFechaChange,
        prepararDataParaEnviar
    } = useModalUsuario(tipo, usuario, isOpen, limpiarErrorBackend);

    const handleCancelar = () => {
        if (tieneCambios()) {
            setShowConfirmCancel(true);
        } else {
            onClose();
        }
    };

    const handleConfirmarCancelar = () => {
        setShowConfirmCancel(false);
        onClose();
    };

    // ✅ COMBINAR ERRORES CORRECTAMENTE - Mostrar ambos si existen
    const erroresCombinados = {};

    // Primero agregar errores del frontend
    Object.keys(errors).forEach(key => {
        erroresCombinados[key] = errors[key];
    });

    // Luego agregar/combinar errores del backend
    Object.keys(erroresBackend).forEach(key => {
        if (erroresCombinados[key]) {
            // Si ya existe error del frontend, concatenar
            erroresCombinados[key] = `${erroresCombinados[key]}. ${erroresBackend[key]}`;
        } else {
            erroresCombinados[key] = erroresBackend[key];
        }
    });

    // SOLO MOSTRAR ERRORES DEL FRONTEND
    const handleSubmit = async (e) => {
        e.preventDefault();

        const esValido = await validarFormulario();
        if (!esValido) return;

        const dataEnviar = prepararDataParaEnviar();
        onSubmit(dataEnviar);
    };

    if (!isOpen) return null;

    return (
        <>
            {isOpen && (
                <div className="modal-overlay-create-update">
                    <div className="modal-container-create-update" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="modal-close-btn"
                            onClick={handleCancelar}
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
                                        name="nombre_usuario"
                                        placeholder="Nombre"
                                        value={formData.nombre_usuario}
                                        onChange={handleChange}
                                    />
                                    {errors.nombre_usuario && (
                                        <span className="error-text">{errors.nombre_usuario}</span>
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
                                    {errors.id_rol && (
                                        <span className="error-text">{errors.id_rol}</span>
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
                                    {errors.telefono && (
                                        <span className="error-text">{errors.telefono}</span>
                                    )}
                                </label>
                            </div>

                            {/* FECHA NACIMIENTO */}
                            <div className="fila genero-fb">
                                <span className="titulo-fila-create-update">
                                    Fecha de nacimiento
                                </span>

                                <div className="fecha-nacimiento">
                                    <select
                                        value={formData.fecha_nacimiento.day}
                                        onChange={(e) => handleFechaChange('day', e.target.value)}
                                    >
                                        <option value="">Día</option>
                                        {days.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={formData.fecha_nacimiento.month}
                                        onChange={(e) => handleFechaChange('month', e.target.value)}
                                    >
                                        <option value="">Mes</option>
                                        {months.map((m, i) => (
                                            <option key={i} value={i + 1}>{m}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={formData.fecha_nacimiento.year}
                                        onChange={(e) => handleFechaChange('year', e.target.value)}
                                    >
                                        <option value="">Año</option>
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.fecha_nacimiento && (
                                    <span className="error-text">{errors.fecha_nacimiento}</span>
                                )}
                            </div>

                            {/* GÉNERO */}
                            <div className="fila genero-fb">
                                <span className="titulo-fila-create-update">Género</span>
                                <div className="radios-container">
                                    <label className={`radio-btn ${formData.genero === "mujer" ? "activo" : ""}`}>
                                        <input
                                            type="radio"
                                            name="genero"
                                            value="mujer"
                                            checked={formData.genero === "mujer"}
                                            onChange={handleChange}
                                        />
                                        <span>Mujer</span>
                                    </label>
                                    <label className={`radio-btn ${formData.genero === "hombre" ? "activo" : ""}`}>
                                        <input
                                            type="radio"
                                            name="genero"
                                            value="hombre"
                                            checked={formData.genero === "hombre"}
                                            onChange={handleChange}
                                        />
                                        <span>Hombre</span>
                                    </label>
                                    <label className={`radio-btn ${formData.genero === "otro" ? "activo" : ""}`}>
                                        <input
                                            type="radio"
                                            name="genero"
                                            value="otro"
                                            checked={formData.genero === "otro"}
                                            onChange={handleChange}
                                        />
                                        <span>Otro</span>
                                    </label>
                                </div>
                                {errors.genero && (
                                    <span className="error-text">{errors.genero}</span>
                                )}
                            </div>

                            {/* CORREO */}
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
                                    {errors.correo && (
                                        <span className="error-text">{errors.correo}</span>
                                    )}
                                </label>
                            </div>

                            {/* CONTRASEÑAS */}
                            <div className="fila">
                                <label>
                                    Contraseña:
                                    <input
                                        type="password"
                                        name="contrasena"
                                        placeholder="••••••••"
                                        value={formData.contrasena}
                                        onChange={handleChange}
                                    />
                                    {errors.contrasena && (
                                        <span className="error-text">{errors.contrasena}</span>
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
                                    {errors.confirmarPassword && (
                                        <span className="error-text">{errors.confirmarPassword}</span>
                                    )}
                                </label>
                            </div>

                            {/* BOTONES */}
                            <div className="modal-buttons-create-update">
                                <button type="submit" className="btn btn-nuevo-create-update">
                                    {tipo === "editar" ? "Actualizar" : "Guardar"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-pdf-create-update"
                                    onClick={handleCancelar}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ModalConfirmarCancelar */}
            {showConfirmCancel && (
                <ModalConfirmarCancelar
                    isOpen={showConfirmCancel}
                    onCancel={() => setShowConfirmCancel(false)}
                    onConfirm={handleConfirmarCancelar}
                    mensaje="Tienes cambios sin guardar. ¿Seguro que quieres cancelar?"
                />
            )}
        </>
    );
}