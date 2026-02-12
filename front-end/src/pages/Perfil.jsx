import "../styles/perfil.css";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import { usePerfil } from "../hooks/usePerfil";

export function Perfil() {
    const {
        // Estados de UI
        mostrarModalCancelar,
        setMostrarModalCancelar,
        mostrarAlert,
        setMostrarAlert,
        alertConfig,
        errores,
        mostrarPassword,
        setMostrarPassword,
        mostrarConfirmPassword,
        setMostrarConfirmPassword,
        showEmoji,
        setShowEmoji,
        editarFecha,
        setEditarFecha,

        // Referencias
        fileInputRef,

        // Estados de datos
        nombre,
        correo,
        telefono,
        descripcion,
        genero,
        password,
        confirmarPassword,
        fechaNacimiento,

        // Estados de fotos
        fotoPerfil,
        fotoPortada,

        // Opciones
        days,
        months,
        years,

        // Usuario del contexto
        usuario,

        // Funciones de utilidad
        obtenerFotoPerfil,

        // Handlers
        handleCambiarFoto,
        handleFotoSeleccionada,
        handleFotoPortadaSeleccionada,
        habilitarEdicion,
        handleNombreChange,
        handleCorreoChange,
        handleTelefonoChange,
        handlePasswordChange,
        handleConfirmarPasswordChange,
        handleGeneroChange,
        handleFechaChange,
        handleDescripcionChange,
        handleEmojiClick,
        handleGuardar,
        confirmarCancelar,
        cerrarModal,
    } = usePerfil();

    return (
        <div className="contenedor-perfil-usuario">

            {/* ===== PORTADA ===== */}
            <div className="perfil-portada-usuario">
                <img src={fotoPortada} alt="Portada" className="imagen-portada-usuario" />
                <img src={obtenerFotoPerfil()} alt="Foto de perfil" className="imagen-perfil-usuario" />
            </div>

            {/* ===== INFO ===== */}
            <div className="perfil-info-usuario">
                <p className="perfil-descripcion-usuario">
                    <strong>{usuario?.rol_texto}</strong>
                </p>
                <h2 className="perfil-nombre-usuario">{usuario?.nombre}</h2>
                <p className="perfil-descripcion-usuario">
                    {usuario?.descripcion}
                </p>
            </div>

            {/* ===== FORMULARIO ===== */}
            <div className="perfil-formulario-usuario">
                <h3 className="titulo-formulario-usuario">Actualizar Perfil</h3>

                {/* FOTO + NOMBRE / EMAIL */}
                <div className="fila-form-usuario fila-foto-usuario">
                    <div className="foto-form-usuario">
                        <img src={obtenerFotoPerfil()} alt="Perfil" />
                        <button type="button" onClick={handleCambiarFoto}>Cambiar</button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFotoSeleccionada}
                            style={{ display: "none" }}
                        />
                    </div>

                    <div className="campos-columna-usuario">
                        <div className="campo-usuario">
                            <label>Nombre</label>
                            <div className="input-editable">
                                <input 
                                    type="text" 
                                    placeholder="Nombre completo" 
                                    value={nombre}
                                    onChange={handleNombreChange}
                                    disabled 
                                />
                                <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                    <FiEdit2 />
                                </button>
                            </div>
                            {errores.nombre && <p className="error-text">{errores.nombre}</p>}
                        </div>

                        <div className="campo-usuario">
                            <label>Correo electrónico</label>
                            <div className="input-editable">
                                <input 
                                    type="email" 
                                    placeholder="Correo electrónico" 
                                    value={correo}
                                    onChange={handleCorreoChange}
                                    disabled 
                                />
                                <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                    <FiEdit2 />
                                </button>
                            </div>
                            {errores.correo && <p className="error-text">{errores.correo}</p>}
                        </div>
                    </div>
                </div>

                {/* FECHA / TELÉFONO */}
                <div className="fila-form-usuario">
                    <div className="campo-usuario">
                        <label>Fecha de nacimiento</label>
                        <div className="input-editable fecha-nacimiento-usuario">
                            <select
                                value={fechaNacimiento.day}
                                disabled={!editarFecha}
                                onChange={(e) => handleFechaChange('day', e.target.value)}
                            >
                                <option value="">Día</option>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            <select
                                value={fechaNacimiento.month}
                                disabled={!editarFecha}
                                onChange={(e) => handleFechaChange('month', e.target.value)}
                            >
                                <option value="">Mes</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>

                            <select
                                value={fechaNacimiento.year}
                                disabled={!editarFecha}
                                onChange={(e) => handleFechaChange('year', e.target.value)}
                            >
                                <option value="">Año</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            <button
                                type="button"
                                className="btn-lapiz"
                                onClick={() => setEditarFecha(prev => !prev)}
                            >
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.fecha_nacimiento && <p className="error-text">{errores.fecha_nacimiento}</p>}
                    </div>

                    <div className="campo-usuario">
                        <label>Teléfono</label>
                        <div className="input-editable">
                            <input 
                                type="tel" 
                                placeholder="Ej. 5512345678" 
                                value={telefono}
                                onChange={handleTelefonoChange}
                                disabled 
                            />
                            <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.telefono && <p className="error-text">{errores.telefono}</p>}
                    </div>
                </div>

                {/* GÉNERO */}
                <div className="fila-form-usuario genero-fila-usuario">
                    <label className="label-full-usuario">Género</label>
                    <div className="genero-opciones-usuario">
                        <label className="genero-box-usuario">
                            <input
                                type="radio"
                                name="genero"
                                value="mujer"
                                checked={genero === "mujer"}
                                onChange={handleGeneroChange}
                            />
                            <span>Mujer</span>
                        </label>

                        <label className="genero-box-usuario">
                            <input
                                type="radio"
                                name="genero"
                                value="hombre"
                                checked={genero === "hombre"}
                                onChange={handleGeneroChange}
                            />
                            <span>Hombre</span>
                        </label>

                        <label className="genero-box-usuario">
                            <input
                                type="radio"
                                name="genero"
                                value="otro"
                                checked={genero === "otro"}
                                onChange={handleGeneroChange}
                            />
                            <span>Otro</span>
                        </label>
                    </div>
                    {errores.genero && <p className="error-text">{errores.genero}</p>}
                </div>

                {/* CONTRASEÑAS */}
                <div className="fila-form-usuario">
                    <div className="campo-usuario">
                        <label>Contraseña</label>
                        <div className="input-editable input-password">
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Nueva contraseña (opcional)"
                                disabled
                            />

                            <button
                                type="button"
                                className="btn-ojo"
                                onClick={() => setMostrarPassword(prev => !prev)}
                                aria-label="Mostrar u ocultar contraseña"
                            >
                                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
                            </button>

                            <button
                                type="button"
                                className="btn-lapiz"
                                onClick={habilitarEdicion}
                            >
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.password && <p className="error-text">{errores.password}</p>}
                    </div>

                    <div className="campo-usuario">
                        <label>Confirmar contraseña</label>
                        <div className="input-editable input-password">
                            <input
                                type={mostrarConfirmPassword ? "text" : "password"}
                                value={confirmarPassword}
                                onChange={handleConfirmarPasswordChange}
                                placeholder="Confirmar contraseña"
                                disabled
                            />

                            <button
                                type="button"
                                className="btn-ojo"
                                onClick={() => setMostrarConfirmPassword(prev => !prev)}
                            >
                                {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
                            </button>

                            <button
                                type="button"
                                className="btn-lapiz"
                                onClick={habilitarEdicion}
                            >
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.confirmarPassword && <p className="error-text">{errores.confirmarPassword}</p>}
                    </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="campo campo-full-usuario">
                    <label>Descripción</label>
                    <div className="textarea-wrapper">
                        <textarea
                            rows="4"
                            value={descripcion}
                            onChange={handleDescripcionChange}
                            placeholder="Escribe algo..."
                        />
                        <button
                            type="button"
                            className="btn-emoji-usuario"
                            onClick={() => setShowEmoji(!showEmoji)}
                        >
                            <BsEmojiSmile />
                        </button>
                    </div>

                    {showEmoji && (
                        <div className="emoji-picker-wrapper">
                            <EmojiPicker
                                locale="es"
                                onEmojiClick={handleEmojiClick}
                            />
                        </div>
                    )}
                </div>

                {/* FOTO PORTADA */}
                <div className="fila-form-usuario">
                    <div className="campo-usuario campo-full-usuario">
                        <label>Foto de portada</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFotoPortadaSeleccionada}
                        />
                    </div>
                </div>

                {/* BOTONES */}
                <div className="fila-botones-usuario">
                    <button className="btn-guardar-usuario" onClick={handleGuardar}>Guardar</button>
                    <button className="btn-cancelar-usuario" onClick={() => setMostrarModalCancelar(true)}>Cancelar</button>
                </div>
            </div>

            {/* MODAL CONFIRMAR CANCELAR */}
            {mostrarModalCancelar && (
                <ModalConfirmarCancelar
                    isOpen={mostrarModalCancelar}
                    onConfirm={confirmarCancelar}
                    onCancel={cerrarModal}
                    mensaje="¿Estás seguro que quieres cancelar los cambios?"
                />
            )}

            {/* CUSTOM ALERT */}
            {mostrarAlert && (
                <CustomAlert
                    type={alertConfig.type}
                    title={alertConfig.title}
                    logo={logo}
                    message={alertConfig.message}
                    onClose={() => setMostrarAlert(false)}
                />
            )}
        </div>
    );
}