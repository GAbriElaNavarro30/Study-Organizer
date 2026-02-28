import "../styles/olvidarc-alterna.css";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { CustomAlert } from "../components/CustomAlert";
import { HeaderExtO } from "../components/HeaderExtO";
import logo from "../assets/imagenes/logotipo-footer.png";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { useCorreoAlternativo } from "../hooks/useCorreoAlternativo";

export function CorreoAlternativo() {
    const navigate = useNavigate();
    const {
        correo,
        errorCorreo,
        isSubmitting,
        resultado,
        enviando,
        enviado,
        mostrarAlert,
        alertData,
        mostrarModal,
        handleCorreoChange,
        handleVerificar,
        handleEnviarAlternativo,
        cerrarAlert,
        reiniciar,
        intentarSalir,
        confirmarSalida,
        cancelarSalida,
    } = useCorreoAlternativo();

    return (
        <>
            <HeaderExtO onAcceder={() => intentarSalir("/login")} />

            <div className="contenedor-olvidar-alt">
                <div className="form-olvidar-alt">
                    {/* ===== VOLVER ===== */}
                    <Link
                        to={enviado ? "/login" : "/olvidar-contrasena"}
                        className="btn-volver"
                        onClick={(e) => {
                            e.preventDefault();
                            intentarSalir(enviado ? "/login" : "/olvidar-contrasena");
                        }}
                    >
                        <IoArrowBack />
                    </Link>

                    <h2>Recuperación Alternativa</h2>
                    <hr className="linea-separadora-o-alt" />

                    {/* ===== PASO 1: Ingresar correo registrado ===== */}
                    {!resultado && (
                        <>
                            <p>
                                Ingresa el correo electrónico que registraste en el sistema.
                                Verificaremos si tienes un correo alternativo asociado.
                            </p>

                            <form onSubmit={handleVerificar}>
                                <div className="campo-olvidar-alt">
                                    <label htmlFor="correo">Correo electrónico registrado</label>
                                    <input
                                        type="email"
                                        id="correo"
                                        placeholder="ejemplo@correo.com"
                                        value={correo}
                                        onChange={handleCorreoChange}
                                        className={errorCorreo ? "input-error" : ""}
                                        disabled={isSubmitting}
                                    />
                                    {errorCorreo && (
                                        <span className="mensaje-error">{errorCorreo}</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn-recuperar-alt"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Verificando..." : "Verificar"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ===== PASO 2A: Tiene correo alternativo ===== */}
                    {resultado?.tieneAlternativo && !enviado && (
                        <>
                            <p>Encontramos un correo alternativo registrado en tu cuenta:</p>

                            <div className="correo-alternativo-box-alt">
                                <span className="correo-alternativo-valor-alt">
                                    {resultado.correoEnmascarado}
                                </span>
                            </div>

                            <p>¿Deseas que te enviemos el enlace de recuperación a ese correo?</p>

                            <div className="fila-botones-alternativo-alt">
                                <button
                                    type="button"
                                    className="btn-recuperar-alternativo"
                                    onClick={handleEnviarAlternativo}
                                    disabled={enviando}
                                >
                                    {enviando ? "Enviando..." : "Sí, enviar enlace"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-cancelar-alt"
                                    onClick={() => intentarSalir("/olvidar-contrasena")} // 👈 cambia aquí
                                    disabled={enviando}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </>
                    )}

                    {/* ===== PASO 3: Enlace enviado ===== */}
                    {enviado && (
                        <>
                            <p className="texto-confirmacion">
                                Se ha enviado el enlace de recuperación a tu correo alternativo,
                                revisa tu bandeja de entrada.
                            </p>

                            <p className="texto-reenviar">
                                ¿No recibiste el enlace?{" "}
                                <button
                                    type="button"
                                    className="link-reenviar"
                                    onClick={handleEnviarAlternativo}
                                    disabled={enviando}
                                >
                                    {enviando ? "Reenviando..." : "Reenviar"}
                                </button>
                            </p>

                            <div className="recomendacion-alt">
                                <strong>Importante:</strong> Al iniciar sesión vaya a su perfil y
                                actualice su correo principal y alternativo, para mejorar el acceso a su cuenta. Gracias.
                            </div>
                        </>
                    )}

                    {/* ===== PASO 2B: No tiene correo alternativo ===== */}
                    {resultado && !resultado.tieneAlternativo && (
                        <>
                            <div className="mensaje-sin-alternativo-alt">
                                <p>{resultado.mensaje}</p>
                            </div>

                            <a href="mailto:studyorganizer.contactosoporte@gmail.com?subject=Recuperación%20de%20cuenta%20-%20Sin%20acceso%20al%20correo"
                                className="btn-soporte-alt">Contactar a soporte</a>


                        </>
                    )}
                </div>

                {mostrarAlert && (
                    <CustomAlert
                        type={alertData.type}
                        title={alertData.title}
                        message={alertData.message}
                        logo={logo}
                        onClose={cerrarAlert}
                    />
                )}

                {/* ===== Modal Confirmar Cancelar ===== */}
                <ModalConfirmarCancelar
                    isOpen={mostrarModal}
                    onConfirm={confirmarSalida}
                    onCancel={cancelarSalida}
                    titulo="¿Abandonar el proceso?"
                    mensaje="¿Deseas abandonar el proceso?"
                />
            </div>
        </>
    );
}