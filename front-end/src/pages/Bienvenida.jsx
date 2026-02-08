import "../styles/bienvenida.css";
import perfil from "../assets/imagenes/perfil-usuario.png";
import inspiracion from "../assets/imagenes/fondo-frases.jpeg";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function Bienvenida({
    nombre = "Usuario",
    rol = "Estudiante",
    descripcion = "Este es tu espacio personal dentro de la plataforma."
}) {
    const { usuario } = useContext(AuthContext);

    return (
        <main className="bienvenida-container">

            {/* ===== PERFIL ===== */}
            <section className="bienvenida-perfil">
                <div className="perfil-foto">
                    <img src={usuario?.foto_perfil} alt="Foto de perfil" />
                </div>

                <div className="perfil-info">
                    <div className="perfil-saludo-bienvenida">
                        <h2>Bienvenid@, {usuario?.nombre}</h2>
                    </div>

                    <span className="perfil-rol">{usuario?.rol_texto}</span>

                    <p className="perfil-descripcion">
                        {usuario?.descripcion}
                    </p>
                </div>

            </section>

            {/* ===== FRASE INSTITUCIONAL ===== */}
            <section className="bienvenida-frase-principal">
                <p>
                    Disfruta de tu experiencia con <strong>Study Organizer</strong>,
                    un espacio diseñado para ti, con calma, organización y claridad.
                </p>
            </section>

            {/* ===== FRASE INSPIRADORA ===== */}
            <section className="bienvenida-inspiracion">
                <img src={inspiracion} alt="Inspiración" />
                <div className="inspiracion-overlay">
                    <p>
                        “La organización es el primer paso hacia la tranquilidad.”
                    </p>
                </div>
            </section>

        </main>
    );
}