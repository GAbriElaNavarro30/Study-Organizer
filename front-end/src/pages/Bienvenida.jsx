import "../styles/bienvenida.css";
import inspiracion from "../assets/imagenes/fondo-frases.jpeg";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export function Bienvenida() {
    const { usuario, refrescarUsuario } = useContext(AuthContext);
    const [frase, setFrase] = useState("");

    useEffect(() => {
        refrescarUsuario();
        obtenerTipDiario();
    }, []);

    const obtenerTipDiario = async () => {
        try {
            const res = await fetch("http://localhost:3000/dashboard/tip-diario", {
                credentials: "include", // ← esto envía las cookies automáticamente
            });
            const data = await res.json();
            setFrase(data.texto);
        } catch (error) {
            console.error("Error al obtener el tip diario:", error);
        }
    };

    return (
        <main className="bienvenida-container">
            <section className="bienvenida-perfil">
                <div className="perfil-foto">
                    <img src={usuario?.foto_perfil} alt="Foto de perfil" />
                </div>
                <div className="perfil-info">
                    <div className="perfil-saludo-bienvenida">
                        <h2>Bienvenid@, {usuario?.nombre}</h2>
                    </div>
                    <span className="perfil-rol">{usuario?.rol_texto}</span>
                    <p className="perfil-descripcion">{usuario?.descripcion}</p>
                </div>
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
                    <p>"{frase || "Cargando frase del día..."}"</p>
                </div>
            </section>
        </main>
    );
}