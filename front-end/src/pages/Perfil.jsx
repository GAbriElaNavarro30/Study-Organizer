import "../styles/perfil.css";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { MdCameraAlt, MdZoomIn, MdZoomOut, MdCheck, MdClose } from "react-icons/md";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import { usePerfil } from "../hooks/usePerfil";

export function Perfil() {

    const {
        mostrarModalCancelar, setMostrarModalCancelar,
        mostrarAlert, setMostrarAlert,
        alertConfig, errores,
        mostrarPassword, setMostrarPassword,
        mostrarConfirmPassword, setMostrarConfirmPassword,
        showEmoji, setShowEmoji,
        editarFecha, setEditarFecha,
        fileInputPerfilRef, fileInputPortadaRef,
        nombre, apellido, correo, correo_alternativo,
        telefono, descripcion, genero,
        password, confirmarPassword, fechaNacimiento,
        fotoPerfil, fotoPortada,
        days, months, years,
        usuario,
        obtenerFotoPerfil,
        handleCambiarFotoPerfil, handleCambiarFotoPortada,
        handleFotoSeleccionada, handleFotoPortadaSeleccionada,
        habilitarEdicion,
        handleNombreChange, handleApellidoChange,
        handleCorreoChange, handleCorreoAlternativoChange,
        handleTelefonoChange, handlePasswordChange,
        handleConfirmarPasswordChange, handleGeneroChange,
        handleFechaChange, handleDescripcionChange,
        handleEmojiClick, handleGuardar,
        confirmarCancelar, cerrarModal,
        modoAjuste,
        portadaPreviewUrl,
        portadaZoom,
        portadaOffset,
        portadaImgNatural,
        portadaContainerRef,
        handlePortadaMouseDown, handlePortadaMouseMove,
        handlePortadaMouseUp,
        handlePortadaTouchStart, handlePortadaTouchMove,
        handlePortadaTouchEnd,
        handlePortadaZoomChange,
        confirmarAjustePortada, cancelarAjustePortada,
        modoAjustePerfil,
        perfilPreviewUrl,
        perfilZoom,
        perfilOffset,
        perfilImgNatural,
        handlePerfilMouseDown, handlePerfilMouseMove,
        handlePerfilMouseUp,
        handlePerfilTouchStart, handlePerfilTouchMove,
        handlePerfilTouchEnd,
        handlePerfilZoomChange,
        confirmarAjustePerfil, cancelarAjustePerfil,
    } = usePerfil();

    const ALTURA_PORTADA_FINAL = 240;

    const zoomMinPortada = portadaContainerRef.current
        ? Math.max(
            portadaContainerRef.current.offsetWidth / (portadaImgNatural.w || 1),
            ALTURA_PORTADA_FINAL / (portadaImgNatural.h || 1)
        )
        : portadaZoom;

    const zoomMinPerfil = Math.max(
        140 / (perfilImgNatural.w || 1),
        140 / (perfilImgNatural.h || 1)
    );

    return (
        <div className="contenedor-perfil-usuario">

            {/* ============================================================
                PORTADA
            ============================================================ */}
            <div
                className={`perfil-portada-usuario${modoAjuste ? " portada-modo-ajuste" : ""}`}
                ref={portadaContainerRef}
            >
                {modoAjuste ? (
                    /* ── Modo ajuste ── */
                    <div
                        className="portada-ajuste-area"
                        onMouseDown={handlePortadaMouseDown}
                        onMouseMove={handlePortadaMouseMove}
                        onMouseUp={handlePortadaMouseUp}
                        onMouseLeave={handlePortadaMouseUp}
                        onTouchStart={handlePortadaTouchStart}
                        onTouchMove={handlePortadaTouchMove}
                        onTouchEnd={handlePortadaTouchEnd}
                    >
                        <img
                            src={portadaPreviewUrl}
                            draggable={false}
                            className="portada-ajuste-img"
                            style={{
                                left: portadaOffset.x,
                                top: portadaOffset.y,
                                width: portadaImgNatural.w * portadaZoom,
                                height: portadaImgNatural.h * portadaZoom,
                            }}
                            alt="Ajuste portada"
                        />
                        <div className="portada-ajuste-guias" />
                    </div>
                ) : (
                    /* ── Modo normal: solo renderiza la img si hay foto real.
                       Si fotoPortada es null se muestra el fondo degradado CSS ── */
                    fotoPortada && (
                        <img
                            src={fotoPortada}
                            className="imagen-portada-usuario"
                            alt=""
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    )
                )}

                {/* Barra controles ajuste */}
                {modoAjuste && (
                    <div className="portada-ajuste-barra">
                        <span className="portada-ajuste-hint">Arrastra para reposicionar</span>
                        <div className="portada-ajuste-zoom">
                            <button type="button" className="btn-ajuste-zoom"
                                onClick={() => handlePortadaZoomChange(portadaZoom - 0.05)}>
                                <MdZoomOut />
                            </button>
                            <input
                                type="range"
                                className="portada-zoom-slider"
                                min={zoomMinPortada}
                                max={zoomMinPortada * 3}
                                step={0.01}
                                value={portadaZoom}
                                onChange={(e) => handlePortadaZoomChange(e.target.value)}
                            />
                            <button type="button" className="btn-ajuste-zoom"
                                onClick={() => handlePortadaZoomChange(portadaZoom + 0.05)}>
                                <MdZoomIn />
                            </button>
                        </div>
                        <div className="portada-ajuste-acciones">
                            <button type="button" className="btn-ajuste-cancelar" onClick={cancelarAjustePortada}>
                                <MdClose /> Cancelar
                            </button>
                            <button type="button" className="btn-ajuste-confirmar" onClick={confirmarAjustePortada}>
                                <MdCheck /> Aplicar
                            </button>
                        </div>
                    </div>
                )}

                {/* Botón cambiar portada */}
                {!modoAjuste && (
                    <button type="button" className="btn-cambiar-portada"
                        onClick={handleCambiarFotoPortada} title="Cambiar foto de portada">
                        <MdCameraAlt />
                        <span>Cambiar portada</span>
                    </button>
                )}

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputPortadaRef}
                    onChange={handleFotoPortadaSeleccionada}
                    style={{ display: "none" }}
                />

                {/* ============================================================
                    FOTO DE PERFIL
                ============================================================ */}
                <div className="contenedor-foto-perfil-usuario">
                    {modoAjustePerfil ? (
                        <div className="perfil-ajuste-wrapper">
                            <div
                                className="perfil-ajuste-circulo"
                                onMouseDown={handlePerfilMouseDown}
                                onMouseMove={handlePerfilMouseMove}
                                onMouseUp={handlePerfilMouseUp}
                                onMouseLeave={handlePerfilMouseUp}
                                onTouchStart={handlePerfilTouchStart}
                                onTouchMove={handlePerfilTouchMove}
                                onTouchEnd={handlePerfilTouchEnd}
                            >
                                <img
                                    src={perfilPreviewUrl}
                                    draggable={false}
                                    className="perfil-ajuste-img"
                                    style={{
                                        left: perfilOffset.x,
                                        top: perfilOffset.y,
                                        width: perfilImgNatural.w * perfilZoom,
                                        height: perfilImgNatural.h * perfilZoom,
                                    }}
                                    alt="Ajuste perfil"
                                />
                            </div>
                            <div className="perfil-ajuste-controles">
                                <div className="perfil-ajuste-zoom-fila">
                                    <button type="button" className="btn-ajuste-zoom-perfil"
                                        onClick={() => handlePerfilZoomChange(perfilZoom - 0.05)}>
                                        <MdZoomOut />
                                    </button>
                                    <input
                                        type="range"
                                        className="perfil-zoom-slider"
                                        min={zoomMinPerfil}
                                        max={zoomMinPerfil * 4}
                                        step={0.01}
                                        value={perfilZoom}
                                        onChange={(e) => handlePerfilZoomChange(e.target.value)}
                                    />
                                    <button type="button" className="btn-ajuste-zoom-perfil"
                                        onClick={() => handlePerfilZoomChange(perfilZoom + 0.05)}>
                                        <MdZoomIn />
                                    </button>
                                </div>
                                <div className="perfil-ajuste-acciones">
                                    <button type="button" className="btn-perfil-cancelar"
                                        onClick={cancelarAjustePerfil} title="Cancelar">
                                        <MdClose />
                                    </button>
                                    <button type="button" className="btn-perfil-confirmar"
                                        onClick={confirmarAjustePerfil} title="Aplicar">
                                        <MdCheck />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <img
                                src={obtenerFotoPerfil()}
                                alt="Foto de perfil"
                                className="imagen-perfil-usuario"
                            />
                            <button type="button" className="btn-cambiar-perfil"
                                onClick={handleCambiarFotoPerfil} title="Cambiar foto de perfil">
                                <MdCameraAlt />
                            </button>
                        </>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputPerfilRef}
                        onChange={handleFotoSeleccionada}
                        style={{ display: "none" }}
                    />
                </div>
            </div>

            {/* ============================================================
                INFO
            ============================================================ */}
            <div className="perfil-info-usuario">
                <p className="perfil-descripcion-usuario">
                    <strong>{usuario?.rol_texto}</strong>
                </p>
                <h2 className="perfil-nombre-usuario">
                    {usuario?.nombre} {usuario?.apellido}
                </h2>
                <p className="perfil-descripcion-usuario">{usuario?.descripcion}</p>
            </div>

            {/* ============================================================
                FORMULARIO
            ============================================================ */}
            <div className="perfil-formulario-usuario">
                <h3 className="titulo-formulario-usuario">Actualizar Perfil</h3>

                <div className="fila-form-usuario fila-foto-usuario">
                    <div className="campos-columna-usuario">
                        <div className="fila-form-usuario">
                            <div className="campo-usuario">
                                <label>Nombre</label>
                                <div className="input-editable">
                                    <input type="text" placeholder="Nombre" value={nombre}
                                        onChange={handleNombreChange} disabled />
                                    <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                        <FiEdit2 />
                                    </button>
                                </div>
                                {errores.nombre && <p className="error-text">{errores.nombre}</p>}
                            </div>
                            <div className="campo-usuario">
                                <label>Apellido</label>
                                <div className="input-editable">
                                    <input type="text" placeholder="Apellido" value={apellido}
                                        onChange={handleApellidoChange} disabled />
                                    <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                        <FiEdit2 />
                                    </button>
                                </div>
                                {errores.apellido && <p className="error-text">{errores.apellido}</p>}
                            </div>
                        </div>

                        <div className="fila-form-usuario">
                            <div className="campo-usuario">
                                <label>Correo electrónico</label>
                                <div className="input-editable">
                                    <input type="email" placeholder="Correo electrónico" value={correo}
                                        onChange={handleCorreoChange} disabled />
                                    <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                        <FiEdit2 />
                                    </button>
                                </div>
                                {errores.correo && <p className="error-text">{errores.correo}</p>}
                            </div>
                            <div className="campo-usuario">
                                <label>Correo electrónico alternativo (Opcional)</label>
                                <div className="input-editable">
                                    <input type="email" placeholder="Correo electrónico alternativo"
                                        value={correo_alternativo} onChange={handleCorreoAlternativoChange} disabled />
                                    <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                        <FiEdit2 />
                                    </button>
                                </div>
                                {errores.correo_alternativo && (
                                    <p className="error-text">{errores.correo_alternativo}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fila-form-usuario">
                    <div className="campo-usuario">
                        <label>Fecha de nacimiento</label>
                        <div className="input-editable fecha-nacimiento-usuario">
                            <select value={fechaNacimiento.day} disabled={!editarFecha}
                                onChange={(e) => handleFechaChange("day", e.target.value)}>
                                <option value="">Día</option>
                                {days.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select value={fechaNacimiento.month} disabled={!editarFecha}
                                onChange={(e) => handleFechaChange("month", e.target.value)}>
                                <option value="">Mes</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <select value={fechaNacimiento.year} disabled={!editarFecha}
                                onChange={(e) => handleFechaChange("year", e.target.value)}>
                                <option value="">Año</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button type="button" className="btn-lapiz"
                                onClick={() => setEditarFecha((prev) => !prev)}>
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.fecha_nacimiento && (
                            <p className="error-text">{errores.fecha_nacimiento}</p>
                        )}
                    </div>
                    <div className="campo-usuario">
                        <label>Teléfono</label>
                        <div className="input-editable">
                            <input type="tel" placeholder="Ej. 5512345678" value={telefono}
                                onChange={handleTelefonoChange} disabled />
                            <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.telefono && <p className="error-text">{errores.telefono}</p>}
                    </div>
                </div>

                <div className="fila-form-usuario genero-fila-usuario">
                    <label className="label-full-usuario">Género</label>
                    <div className="genero-opciones-usuario">
                        {["mujer", "hombre", "otro"].map((opcion) => (
                            <label key={opcion} className="genero-box-usuario">
                                <input type="radio" name="genero" value={opcion}
                                    checked={genero === opcion} onChange={handleGeneroChange} />
                                <span>{opcion.charAt(0).toUpperCase() + opcion.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                    {errores.genero && <p className="error-text">{errores.genero}</p>}
                </div>

                <div className="fila-form-usuario">
                    <div className="campo-usuario">
                        <label>Contraseña</label>
                        <div className="input-editable input-password">
                            <input type={mostrarPassword ? "text" : "password"} value={password}
                                onChange={handlePasswordChange} placeholder="Nueva contraseña (opcional)" disabled />
                            <button type="button" className="btn-ojo"
                                onClick={() => setMostrarPassword((prev) => !prev)}>
                                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
                            </button>
                            <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.password && <p className="error-text">{errores.password}</p>}
                    </div>
                    <div className="campo-usuario">
                        <label>Confirmar contraseña</label>
                        <div className="input-editable input-password">
                            <input type={mostrarConfirmPassword ? "text" : "password"} value={confirmarPassword}
                                onChange={handleConfirmarPasswordChange} placeholder="Confirmar contraseña" disabled />
                            <button type="button" className="btn-ojo"
                                onClick={() => setMostrarConfirmPassword((prev) => !prev)}>
                                {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
                            </button>
                            <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                <FiEdit2 />
                            </button>
                        </div>
                        {errores.confirmarPassword && (
                            <p className="error-text">{errores.confirmarPassword}</p>
                        )}
                    </div>
                </div>

                <div className="campo campo-full-usuario">
                    <label>Descripción</label>
                    <div className="textarea-wrapper">
                        <textarea rows="4" value={descripcion} onChange={handleDescripcionChange}
                            placeholder="Escribe algo..." />
                        <button type="button" className="btn-emoji-usuario"
                            onClick={() => setShowEmoji(!showEmoji)}>
                            <BsEmojiSmile />
                        </button>
                    </div>
                    {showEmoji && (
                        <div className="emoji-picker-wrapper">
                            <EmojiPicker locale="es" onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                </div>

                <div className="fila-botones-usuario">
                    <button className="btn-guardar-usuario" onClick={handleGuardar}>Guardar</button>
                    <button className="btn-cancelar-usuario" onClick={() => setMostrarModalCancelar(true)}>
                        Cancelar
                    </button>
                </div>
            </div>

            {/* ============================================================
                MODALES Y ALERTAS
            ============================================================ */}
            {mostrarModalCancelar && (
                <ModalConfirmarCancelar
                    isOpen={mostrarModalCancelar}
                    onConfirm={confirmarCancelar}
                    onCancel={cerrarModal}
                    mensaje="¿Estás seguro que quieres cancelar los cambios?"
                />
            )}

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