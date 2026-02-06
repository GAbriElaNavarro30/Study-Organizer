import "../styles/olvidarc.css";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { useState } from "react";
import api from "../services/api";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { HeaderExtO } from "../components/HeaderExtO";

export function RecuperarC() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token"); // token del correo

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    // ===== Modal confirmar salir =====
    const [mostrarModal, setMostrarModal] = useState(false);
    const [rutaDestino, setRutaDestino] = useState("/");

    const [alert, setAlert] = useState({
        visible: false,
        type: "success",
        title: "",
        message: "",
    });


    // 🔐 Regex de validación de contraseña
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

    // 🚫 Si no hay token
    if (!token) {
        return (
            <div className="recuperar-contrasena">
                <div className="form-recuperar">
                    <h2>Enlace inválido</h2>
                    <p className="mensaje-error">
                        El enlace de recuperación es inválido o ha expirado.
                    </p>
                    <Link to="/login" className="btn-recuperar">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    // ===== INTENTO DE SALIDA =====
    const intentarSalir = (ruta) => {
        if (password || confirmPassword) {
            setRutaDestino(ruta);
            setMostrarModal(true);
        } else {
            navigate(ruta);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        // 🔴 Campos obligatorios
        if (!password || !confirmPassword) {
            setError("Todos los campos son obligatorios");
            return;
        }

        // 🔴 Reglas de contraseña
        if (!passwordRegex.test(password)) {
            setError(
                "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)"
            );
            return;
        }

        // 🔴 Confirmación
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await api.post("/usuarios/resetear-contrasena", {
                token,
                nueva_contrasena: password,
            });

            // ✅ MOSTRAR CustomAlert SOLO EN ÉXITO
            setAlert({
                visible: true,
                type: "success",
                title: "Contraseña actualizada",
                message:
                    response.data.mensaje ||
                    "Tu contraseña se actualizó correctamente",
            });

        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.mensaje || "Error al restablecer la contraseña"
            );
        }
    };


    return (
        <>
            {/* ===== HEADER ===== */}
            <HeaderExtO onAcceder={() => intentarSalir("/login")} />

            <div className="recuperar-contrasena">
                <form className="form-recuperar" onSubmit={handleSubmit}>
                    <Link
                        to="/"
                        className="btn-volver"
                        onClick={(e) => {
                            e.preventDefault();
                            intentarSalir("/");
                        }}
                    >
                        <IoArrowBack />
                    </Link>

                    <h2>Restablecer contraseña</h2>
                    <hr className="linea-separadora-rc" />

                    <p className="texto-recuperar">
                        Ingresa tu nueva contraseña y confírmala para recuperar el acceso a tu cuenta.
                    </p>

                    <div className="campo-recuperar campo-password">
                        <label>Nueva contraseña</label>
                        <div className="input-password">
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                placeholder="Nueva contraseña"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                            />
                            <span
                                className="icono-password"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                            >
                                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
                            </span>
                        </div>
                    </div>

                    <div className="campo-recuperar campo-password">
                        <label>Confirmar contraseña</label>
                        <div className="input-password">
                            <input
                                type={mostrarConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                            />
                            <span
                                className="icono-password"
                                onClick={() =>
                                    setMostrarConfirmPassword(!mostrarConfirmPassword)
                                }
                            >
                                {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
                            </span>
                        </div>
                    </div>

                    {error && <p className="mensaje-error">{error}</p>}
                    {mensaje && <p className="mensaje-exito">{mensaje}</p>}

                    <button type="submit" className="btn-recuperar">
                        Guardar cambios
                    </button>
                </form>

                {alert.visible && (
                    <CustomAlert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        logo={logo}
                        onClose={() => {
                            setAlert({ ...alert, visible: false });
                            navigate("/login"); // redirige SOLO si fue exitoso
                        }}
                    />
                )}

                {/* ===== MODAL CONFIRMAR ===== */}
                <ModalConfirmarCancelar
                    isOpen={mostrarModal}
                    onConfirm={() => {
                        setMostrarModal(false);
                        navigate(rutaDestino);
                    }}
                    onCancel={() => setMostrarModal(false)}
                />

            </div>
        </>
    );
}
