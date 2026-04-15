import "../styles/bienvenida.css";
import inspiracion from "../assets/imagenes/fondo-frases.jpeg";
import { useBienvenida } from "../hooks/useBienvenida";

export function Bienvenida() {
    const { usuario, frase, cargandoFrase } = useBienvenida();

    return (
        <main className="bienvenida-container">
            <section className="bienvenida-perfil">
                <div className="perfil-foto">
                    <div className="perfil-foto-ring">
                        <img src={usuario?.foto_perfil} alt="Foto de perfil" />
                    </div>
                </div>
                <div className="perfil-info">
                    <h2 className="perfil-saludo">
                        Bienvenid@, <span className="perfil-nombre">{usuario?.nombre} {usuario?.apellido}</span>
                    </h2>
                    <span className="perfil-rol">{usuario?.rol_texto}</span>
                    <p className="perfil-descripcion">{usuario?.descripcion}</p>
                </div>
                <div className="perfil-deco-circle perfil-deco-1"></div>
                <div className="perfil-deco-circle perfil-deco-2"></div>
            </section>

            <section className="bienvenida-frase-principal">
                <p>
                    Disfruta de tu experiencia con <strong>Study Organizer</strong>,
                    un espacio diseñado para ti, con calma, organización y claridad.
                </p>
            </section>

            <section className="bienvenida-inspiracion">
                <img src={inspiracion} alt="Inspiración" />
                <div className="inspiracion-overlay">
                    <p>{cargandoFrase ? "Cargando frase del día..." : `"${frase}"`}</p>
                </div>
            </section>
        </main>
    );
}