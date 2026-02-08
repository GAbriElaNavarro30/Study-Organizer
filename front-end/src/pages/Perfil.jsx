import "../styles/perfil.css";
import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect, useContext } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { AuthContext } from "../context/AuthContext";
import fotoPredeterminada from "../assets/imagenes/perfil-usuario.png";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";

export function Perfil() {
    const { usuario, setUsuario } = useContext(AuthContext);

    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);

    // ===== ESTADOS BÁSICOS =====
    const [nombre, setNombre] = useState(usuario?.nombre || "");
    const [correo, setCorreo] = useState(usuario?.correo || "");
    const [telefono, setTelefono] = useState(usuario?.telefono || "");
    const [descripcion, setDescripcion] = useState(usuario?.descripcion || "");
    const [genero, setGenero] = useState("");

    const [editarFecha, setEditarFecha] = useState(false);

    // ===== FOTO PERFIL Y PORTADA =====


    const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
    const [fotoPortadaFile, setFotoPortadaFile] = useState(null);

    const fileInputRef = useRef(null);

    // ===== VISIBILIDAD DE PASSWORD =====
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    // ===== EMOJI PICKER =====
    const [showEmoji, setShowEmoji] = useState(false);

    // ===== USEEFFECT PARA CARGAR DATOS DEL USUARIO =====
    const FOTO_PREDETERMINADA = fotoPredeterminada;
    const PORTADA_PREDETERMINADA = "/portada.jpg";

    const esFotoValida = (foto) =>
        foto


    // Estados iniciales
    const [fotoPerfil, setFotoPerfil] = useState(
        esFotoValida(usuario?.foto_perfil)
            ? FOTO_PREDETERMINADA
            : usuario.foto_perfil
    );
    const [fotoPortada, setFotoPortada] = useState(
        esFotoValida(usuario?.foto_portada) ? usuario.foto_portada : PORTADA_PREDETERMINADA
    );


    // ===== ARRAYS PARA FECHA =====
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    const FECHA_VACIA = { day: "", month: "", year: "" };
    const [fechaNacimiento, setFechaNacimiento] = useState(FECHA_VACIA);

    // En useEffect
    useEffect(() => {
        if (!usuario) return;

        setNombre(usuario.nombre || "");
        setCorreo(usuario.correo || "");
        setTelefono(usuario.telefono || "");
        setGenero(usuario.genero || "Otro"); // Default "Otro" si viene vacío
        setDescripcion(usuario.descripcion || "");

        // ===== Fecha de nacimiento =====
        setFechaNacimiento(
            usuario.fecha_nacimiento || { day: "", month: "", year: "" }
        );

        setFotoPerfil(usuario.foto_perfil || FOTO_PREDETERMINADA);
        setFotoPortada(usuario.foto_portada || PORTADA_PREDETERMINADA);
    }, [usuario]);


    // ===== FUNCIONES PARA CAMBIAR FOTOS =====
    const handleCambiarFoto = () => fileInputRef.current.click();

    const handleFotoSeleccionada = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFotoPerfilFile(file);
        setFotoPerfil(URL.createObjectURL(file)); // vista previa
    };

    const handleFotoPortadaSeleccionada = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFotoPortadaFile(file);
        setFotoPortada(URL.createObjectURL(file)); // vista previa
    };

    const handleCancelar = () => {
        // Restaurar valores originales del usuario
        setNombre(usuario?.nombre || "");
        setCorreo(usuario?.correo || "");
        setTelefono(usuario?.telefono || "");
        setDescripcion(usuario?.descripcion || "");

        setFechaNacimiento(
            usuario?.fecha_nacimiento || { day: "", month: "", year: "" }
        );
        // Restaurar fotos
        setFotoPerfil(usuario?.foto_perfil || FOTO_PREDETERMINADA);
        setFotoPortada(usuario?.foto_portada || PORTADA_PREDETERMINADA);

        // Limpiar archivos seleccionados
        setFotoPerfilFile(null);
        setFotoPortadaFile(null);

        // 🔹 Resetear input file para que onChange funcione otra vez
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };



    // ===== FUNCION GUARDAR PERFIL =====
    const handleGuardar = async () => {
        try {
            const formData = new FormData();
            formData.append("nombre", nombre);
            formData.append("correo", correo);
            formData.append("telefono", telefono);
            formData.append("descripcion", descripcion);
            formData.append("genero", genero);

            if (fechaNacimiento.day && fechaNacimiento.month && fechaNacimiento.year) {
                formData.append("fechaNacimiento", JSON.stringify(fechaNacimiento));
            }

            // Archivos
            if (fotoPerfilFile) formData.append("foto_perfil", fotoPerfilFile);
            if (fotoPortadaFile) formData.append("foto_portada", fotoPortadaFile);

            const res = await fetch("http://localhost:3000/usuarios/actualizar-perfil", {
                method: "PUT",
                body: formData,
                credentials: "include", // cookies
            });

            const data = await res.json();

            if (res.ok) {
                alert("Perfil actualizado correctamente");

                // Actualizar fotos con URLs devueltas desde el backend
                if (data.fotos?.foto_perfil) setFotoPerfil(data.fotos.foto_perfil);
                if (data.fotos?.foto_portada) setFotoPortada(data.fotos.foto_portada);

                // Limpiar archivos seleccionados
                setFotoPerfilFile(null);
                setFotoPortadaFile(null);

                // Actualizar contexto global
                setUsuario(data.usuario);
            } else {
                alert(data.mensaje || "Error al actualizar perfil");
            }
        } catch (error) {
            console.error(error);
            alert("Error al actualizar perfil");
        }
    };

    // ===== FUNCION PARA HABILITAR EDICIÓN =====
    const habilitarEdicion = (e) => {
        const container = e.currentTarget.closest(".input-editable");
        const input = container?.querySelector("input");
        if (input) {
            input.disabled = !input.disabled;
            if (!input.disabled) input.focus();
        }
    };

    const obtenerFotoPerfil = () => {
        // Si hay archivo seleccionado, mostrar vista previa
        if (fotoPerfilFile) {
            return URL.createObjectURL(fotoPerfilFile);
        }

        // Si usuario tiene foto válida
        const foto = usuario?.foto_perfil;
        if (foto && foto !== "null" && foto !== "undefined" && foto !== "" && foto !== "/perfil-usuario.png") {
            return foto;
        }

        // Si nada de lo anterior, usar predeterminada
        return fotoPredeterminada;
    };

    // Modal de cancelar
    const confirmarCancelar = () => {
        handleCancelar(); // Resetea los valores
        setMostrarModalCancelar(false); // Cierra el modal
    };

    const cerrarModal = () => {
        setMostrarModalCancelar(false); // Solo cierra el modal si decide no cancelar
    };

    console.log("GENERO REAL:", JSON.stringify(genero));

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
                                <input type="text" placeholder="Nombre completo" value={nombre}
                                    onChange={(e) => setNombre(e.target.value)} disabled />
                                <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                    <FiEdit2 />
                                </button>
                            </div>
                        </div>

                        <div className="campo-usuario">
                            <label>Correo electrónico</label>
                            <div className="input-editable">
                                <input type="email" placeholder="Correo electrónico" value={correo}
                                    onChange={(e) => setCorreo(e.target.value)} disabled />
                                <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                    <FiEdit2 />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FECHA / TELÉFONO */}
                <div className="fila-form-usuario">
                    <div className="campo-usuario">
                        <label>Fecha de nacimiento</label>
                        <div className="input-editable fecha-nacimiento-usuario">
                            {/* Día */}
                            <select
                                value={fechaNacimiento.day}
                                disabled={!editarFecha}
                                onChange={(e) => setFechaNacimiento(prev => ({ ...prev, day: Number(e.target.value) }))}
                            >
                                <option value="">Día</option>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            {/* Mes */}
                            <select
                                value={fechaNacimiento.month}
                                disabled={!editarFecha}
                                onChange={(e) => setFechaNacimiento(prev => ({ ...prev, month: Number(e.target.value) }))}
                            >
                                <option value="">Mes</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>

                            {/* Año */}
                            <select
                                value={fechaNacimiento.year}
                                disabled={!editarFecha}
                                onChange={(e) => setFechaNacimiento(prev => ({ ...prev, year: Number(e.target.value) }))}
                            >
                                <option value="">Año</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            {/* Botón lápiz */}
                            <button
                                type="button"
                                className="btn-lapiz"
                                onClick={() => setEditarFecha(prev => !prev)}
                            >
                                <FiEdit2 />
                            </button>
                        </div>
                    </div>

                    <div className="campo-usuario">
                        <label>Teléfono</label>
                        <div className="input-editable">
                            <input type="tel" placeholder="Ej. 5512345678" value={telefono}
                                onChange={(e) => setTelefono(e.target.value)} disabled />
                            <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                <FiEdit2 />
                            </button>
                        </div>
                    </div>
                </div>

                {/* GÉNERO (SIN LÁPIZ, UX CORRECTA) */}
                <div className="fila-form-usuario genero-fila-usuario">
                    <label className="label-full-usuario">Género</label>
                    <div className="genero-opciones-usuario">
                        <label className="genero-box-usuario">
                            <input
                                type="radio"
                                name="genero"
                                value="Mujer"
                                checked={genero === "Mujer"}
                                onChange={(e) => setGenero(e.target.value)}
                            />
                            <span>Mujer</span>
                        </label>

                        <label className="genero-box-usuario">
                            <input
                                type="radio"
                                name="genero"
                                value="Hombre"
                                checked={genero === "Hombre"}
                                onChange={(e) => setGenero(e.target.value)}
                            />
                            <span>Hombre</span>
                        </label>

                        <label className="genero-box-usuario">
                            <input
                                type="radio"
                                name="genero"
                                value="Otro"
                                checked={genero === "Otro"}
                                onChange={(e) => setGenero(e.target.value)}
                            />
                            <span>Otro</span>
                        </label>
                    </div>

                </div>

                {/* CONTRASEÑAS */}
                <div className="fila-form-usuario">
                    <div className="campo-usuario">
                        <label>Contraseña</label>

                        <div className="input-editable input-password">
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                disabled
                            />

                            {/* OJO */}
                            <button
                                type="button"
                                className="btn-ojo"
                                onClick={() => setMostrarPassword(prev => !prev)}
                                aria-label="Mostrar u ocultar contraseña"
                            >
                                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
                            </button>

                            {/* LÁPIZ */}
                            <button
                                type="button"
                                className="btn-lapiz"
                                onClick={habilitarEdicion}
                            >
                                <FiEdit2 />
                            </button>
                        </div>
                    </div>


                    <div className="campo-usuario">
                        <label>Confirmar contraseña</label>

                        <div className="input-editable input-password">
                            <input
                                type={mostrarConfirmPassword ? "text" : "password"}
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
                    </div>

                </div>

                {/* DESCRIPCIÓN */}
                <div className="campo campo-full-usuario">
                    <label>Descripción</label>
                    <div className="textarea-wrapper">
                        <textarea
                            rows="4"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
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
                                onEmojiClick={(emoji) =>
                                    setDescripcion(prev => prev + emoji.emoji)
                                }
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

            {mostrarModalCancelar && (
                <ModalConfirmarCancelar
                    isOpen={mostrarModalCancelar}  // <<--- esto faltaba
                    onConfirm={confirmarCancelar}
                    onCancel={cerrarModal}
                    mensaje="¿Estás seguro que quieres cancelar los cambios?"
                />
            )}


        </div>
    );
}