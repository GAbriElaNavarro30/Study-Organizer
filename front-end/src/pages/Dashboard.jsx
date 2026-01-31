import { useState } from "react";
import "../styles/dashboard.css";
import "../styles/bienvenida.css";
import perfil from "../assets/imagenes/perfil-usuario.png";
import inspiracion from "../assets/imagenes/fondo-frases.jpeg";

export function Dashboard({
    nombre = "Usuario",
    rol = "Estudiante",
    descripcion = "Este es tu espacio personal dentro de la plataforma."
}) {

    const emocionesBase = [
        "Tranquilo/a",
        "Feliz",
        "Motivado/a",
        "Ansioso/a",
        "Cansado/a",
        "Estresado/a"
    ];

    const [emociones, setEmociones] = useState(emocionesBase);
    const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [emocionNueva, setEmocionNueva] = useState("");

    const agregarEmocion = () => {
        if (emocionNueva.trim() === "") return;

        setEmociones([...emociones, emocionNueva]);
        setEmocionSeleccionada(emocionNueva);
        setEmocionNueva("");
        setMostrarInput(false);
    };

    const cancelarOtro = () => {
        setMostrarInput(false);
        setEmocionNueva("");
        setEmocionSeleccionada(null);
    };

    return (
        <main className="dashboard-container">

            {/* ===== PERFIL ===== */}
            <section className="bienvenida-perfil">
                <div className="perfil-foto">
                    <img src={perfil} alt="Foto de perfil" />
                </div>

                <div className="perfil-info">
                    <h2>Bienvenid@, {nombre}</h2>
                    <span className="perfil-rol">{rol}</span>
                    <p className="perfil-descripcion">{descripcion}</p>
                </div>
            </section>

            {/* ===== FRASE INSTITUCIONAL ===== */}
            <section className="bienvenida-frase-principal">
                <p>
                    Disfruta de tu experiencia con <strong>Study Organizer</strong>,
                    un espacio diseñado para ti, con calma, organización y claridad.
                </p>
            </section>

            {/* ===== ESCALA LIKERT ===== */}
            <section className="dashboard-likert">
                <h3>¿Cómo te sientes hoy?</h3>
                <p className="likert-subtitle">
                    Selecciona la opción que mejor describa tu estado emocional
                </p>

                <div className="likert-opciones">
                    {emociones.map((emocion, index) => (
                        <button
                            key={index}
                            className={`likert-opcion ${
                                emocionSeleccionada === emocion ? "activa" : ""
                            }`}
                            onClick={() => {
                                setEmocionSeleccionada(emocion);
                                setMostrarInput(false);
                                setEmocionNueva("");
                            }}
                        >
                            {emocion}
                        </button>
                    ))}

                    {/* BOTÓN OTRO */}
                    <button
                        className={`likert-opcion ${
                            mostrarInput ? "activa" : ""
                        }`}
                        onClick={() => {
                            setEmocionSeleccionada(null);
                            setMostrarInput(true);
                        }}
                    >
                        Otro
                    </button>
                </div>

                {/* INPUT EMOCIÓN PERSONALIZADA */}
                {mostrarInput && (
                    <div className="likert-input">
                        <input
                            type="text"
                            placeholder="Escribe cómo te sientes..."
                            value={emocionNueva}
                            onChange={(e) => setEmocionNueva(e.target.value)}
                        />

                        <div className="likert-input-acciones">
                            <button
                                className="btn-agregar-dash"
                                onClick={agregarEmocion}
                            >
                                Agregar
                            </button>

                            <button
                                className="btn-cancelar-dash"
                                onClick={cancelarOtro}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* ===== RESUMEN EMOCIONAL (PLACEHOLDER) ===== */}
            <section className="dashboard-resumen">
                <h3>Emociones predominantes</h3>

                <div className="resumen-cards">
                    <div className="card">
                        <span>Tranquilidad</span>
                        <strong>45%</strong>
                    </div>
                    <div className="card">
                        <span>Motivación</span>
                        <strong>30%</strong>
                    </div>
                    <div className="card">
                        <span>Estrés</span>
                        <strong>25%</strong>
                    </div>
                </div>
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
