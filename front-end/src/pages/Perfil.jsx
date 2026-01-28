import "../styles/perfil.css";

import EmojiPicker from "emoji-picker-react";
import { useState, useRef } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { IoEye, IoEyeOff } from "react-icons/io5";

export function Perfil() {
    const [descripcion, setDescripcion] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    // ===== FOTO PERFIL =====
    const [fotoPerfil, setFotoPerfil] = useState("/perfil.jpg");
    const fileInputRef = useRef(null);

    const handleCambiarFoto = () => {
        fileInputRef.current.click();
    };

    const handleFotoSeleccionada = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFotoPerfil(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // ===== HABILITAR EDICIÓN =====
    // ===== HABILITAR EDICIÓN =====
    const habilitarEdicion = (e) => {
        const container = e.currentTarget.closest('.input-editable');
        const input = container?.querySelector('input');
        if (input) {
            input.disabled = !input.disabled;
            if (!input.disabled) {
                input.focus();
            }
        }
    };



    return (
        <div className="contenedor-perfil-usuario">

            {/* ===== PORTADA ===== */}
            <div className="perfil-portada-usuario">
                <img src="/portada.jpg" alt="Portada" className="imagen-portada-usuario" />
                <img src={fotoPerfil} alt="Foto de perfil" className="imagen-perfil-usuario" />
            </div>

            {/* ===== INFO ===== */}
            <div className="perfil-info-usuario">
                <h2 className="perfil-nombre-usuario">Goretti Navarro</h2>
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
                                <input type="text" placeholder="Nombre completo" disabled />
                                <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                    <FiEdit2 />
                                </button>
                            </div>
                        </div>

                        <div className="campo-usuario">
                            <label>Correo electrónico</label>
                            <div className="input-editable">
                                <input type="email" placeholder="Correo electrónico" disabled />
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
                        <div className="input-editable">
                            <input type="date" disabled />
                            <button type="button" className="btn-lapiz" onClick={habilitarEdicion}>
                                <FiEdit2 />
                            </button>
                        </div>
                    </div>

                    <div className="campo-usuario">
                        <label>Teléfono</label>
                        <div className="input-editable">
                            <input type="tel" placeholder="Ej. 5512345678" disabled />
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