import "../styles/perfil.css";
import EmojiPicker from "emoji-picker-react";
import { useState, useRef } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import perfilPredeterminado from "../assets/imagenes/perfil-usuario.png";

export function Perfil() {
    const [descripcion, setDescripcion] = useState();
    const [showEmoji, setShowEmoji] = useState(false);

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    const { usuario } = useContext(AuthContext);
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");

    // ===== FOTO PERFIL =====
    const [fotoPerfil, setFotoPerfil] = useState(perfilPredeterminado);
    const fileInputRef = useRef(null);

    const handleCambiarFoto = () => {
        fileInputRef.current.click();
    };

    const handleFotoSeleccionada = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Subir a Cloudinary
        const formData = new FormData();
        formData.append("foto", file);

        const res = await fetch("http://localhost:3000/api/usuario/subir-foto", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (data.url) {
            setFotoPerfil(data.url); // ahora tu state tiene la URL de Cloudinary
        }
    };

    // ===== FECHA DE NACIMIENTO =====
    const [fechaNacimiento, setFechaNacimiento] = useState({
        day: "",
        month: "",
        year: ""
    });
    const [editarFecha, setEditarFecha] = useState(false);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    // ===== HABILITAR EDICIÓN INPUTS =====
    const habilitarEdicion = (e) => {
        const container = e.currentTarget.closest('.input-editable');
        const input = container?.querySelector('input');
        if (input) {
            input.disabled = !input.disabled;
            if (!input.disabled) input.focus();
        }
    };

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre || "");
            setCorreo(usuario.correo || "");
            setTelefono(usuario.telefono || "");
        }
    }, [usuario]);


    return (
        <div className="contenedor-perfil-usuario">

            {/* ===== PORTADA ===== */}
            <div className="perfil-portada-usuario">
                <img src="/portada.jpg" alt="Portada" className="imagen-portada-usuario" />
                <img src={fotoPerfil} alt="Foto de perfil" className="imagen-perfil-usuario" />
            </div>

            {/* ===== INFO ===== */}
            <div className="perfil-info-usuario">
                <h2 className="perfil-nombre-usuario">{nombre}</h2>
                <p className="perfil-descripcion-usuario">
                    Estudiante de desarrollo web apasionada por crear interfaces
                    limpias, funcionales y profesionales.
                </p>
            </div>

            {/* ===== FORMULARIO ===== */}
            <div className="perfil-formulario-usuario">
                <h3 className="titulo-formulario-usuario">Actualizar Perfil</h3>

                {/* FOTO + NOMBRE / EMAIL */}
                <div className="fila-form-usuario fila-foto-usuario">
                    <div className="foto-form-usuario">
                        <img src={fotoPerfil} alt="Perfil" />
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
                                onChange={(e) => setFechaNacimiento(prev => ({ ...prev, day: e.target.value }))}
                            >
                                <option value="">Día</option>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            {/* Mes */}
                            <select
                                value={fechaNacimiento.month}
                                disabled={!editarFecha}
                                onChange={(e) => setFechaNacimiento(prev => ({ ...prev, month: e.target.value }))}
                            >
                                <option value="">Mes</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>

                            {/* Año */}
                            <select
                                value={fechaNacimiento.year}
                                disabled={!editarFecha}
                                onChange={(e) => setFechaNacimiento(prev => ({ ...prev, year: e.target.value }))}
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
                            <input type="radio" name="genero" /> <span>Mujer</span>
                        </label>
                        <label className="genero-box-usuario">
                            <input type="radio" name="genero" /> <span>Hombre</span>
                        </label>
                        <label className="genero-box-usuario">
                            <input type="radio" name="genero" /> <span>Otro</span>
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
                        <input type="file" />
                    </div>
                </div>

                {/* BOTONES */}
                <div className="fila-botones-usuario">
                    <button className="btn-guardar-usuario">Guardar</button>
                    <button className="btn-cancelar-usuario">Cancelar</button>
                </div>
            </div>
        </div>
    );
}