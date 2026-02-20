import { useState, useEffect, useContext } from "react";
import "../styles/dashboard.css";
import "../styles/bienvenida.css";
import perfil from "../assets/imagenes/perfil-usuario.png";
import inspiracion from "../assets/imagenes/fondo-frases.jpeg";
import { AuthContext } from "../context/AuthContext";

export function Dashboard({
    nombre = "Usuario",
    rol = "Estudiante",
    descripcion = "Este es tu espacio personal dentro de la plataforma."
}) {
    const { usuario, refrescarUsuario } = useContext(AuthContext);
    useEffect(() => {
        refrescarUsuario();
    }, []);

    /* ================= EMOCIONES ================= */
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
    const [frase, setFrase] = useState("");

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

    /* ================= RESULTADOS DE TESTS ================= */
    const [resultadosTests, setResultadosTests] = useState({
        aprendizaje: [],
        estudio: []
    });

    /* Cargar resultados guardados */
    useEffect(() => {
        const guardados = localStorage.getItem("resultadosTests");
        if (guardados) {
            setResultadosTests(JSON.parse(guardados));
        }
    }, []);

    /* Guardar cambios */
    useEffect(() => {
        localStorage.setItem(
            "resultadosTests",
            JSON.stringify(resultadosTests)
        );
    }, [resultadosTests]);

    /* Simulación de guardado (esto luego vendrá del test real) */
    const simularResultadoAprendizaje = () => {
        const nuevoResultado = {
            fecha: new Date().toLocaleDateString(),
            resultado: "Visual",
            detalle: {
                visual: 60,
                auditivo: 25,
                kinestesico: 15
            }
        };

        setResultadosTests(prev => ({
            ...prev,
            aprendizaje: [nuevoResultado, ...prev.aprendizaje]
        }));
    };

    // frases random
    useEffect(() => {
        const obtenerTipDiario = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/tip-diario", {
                    credentials: "include",
                });
                const data = await res.json();
                setFrase(data.texto);
            } catch (error) {
                console.error("Error al obtener el tip diario:", error);
            }
        };

        obtenerTipDiario();
    }, []);

    const simularResultadoEstudio = () => {
        const nuevoResultado = {
            fecha: new Date().toLocaleDateString(),
            resultado: "Pomodoro + Resúmenes"
        };

        setResultadosTests(prev => ({
            ...prev,
            estudio: [nuevoResultado, ...prev.estudio]
        }));
    };

    return (
        <main className="dashboard-container">

            {/* ===== PERFIL ===== */}
            <section className="bienvenida-perfil">
                <div className="perfil-foto">
                    <img src={usuario?.foto_perfil} alt="Foto de perfil" />
                </div>

                <div className="perfil-info">
                    <h2>Bienvenid@, {usuario?.nombre}</h2>
                    <span className="perfil-rol">{usuario?.rol_texto}</span>
                    <p className="perfil-descripcion">{usuario?.descripcion}</p>
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
                            className={`likert-opcion ${emocionSeleccionada === emocion ? "activa" : ""
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

                    <button
                        className={`likert-opcion ${mostrarInput ? "activa" : ""
                            }`}
                        onClick={() => {
                            setEmocionSeleccionada(null);
                            setMostrarInput(true);
                        }}
                    >
                        Otro
                    </button>
                </div>

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

            {/* ===== RESULTADOS DE TESTS ===== */}
            <section className="dashboard-resumen">
                <h3>Resultados de tus tests</h3>

                <div className="resumen-cards">
                    <div className="card">
                        <span>Estilo de aprendizaje</span>
                        <strong>
                            {resultadosTests.aprendizaje.length > 0
                                ? resultadosTests.aprendizaje[0].resultado
                                : "Sin realizar"}
                        </strong>
                        <button onClick={simularResultadoAprendizaje}>
                            Realizar test
                        </button>
                    </div>

                    <div className="card">
                        <span>Métodos de estudio</span>
                        <strong>
                            {resultadosTests.estudio.length > 0
                                ? resultadosTests.estudio[0].resultado
                                : "Sin realizar"}
                        </strong>
                        <button onClick={simularResultadoEstudio}>
                            Realizar test
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== FRASE INSPIRADORA ===== */}
            <section className="bienvenida-inspiracion">
                <img src={inspiracion} alt="Inspiración" />
                <div className="inspiracion-overlay">
                    <p>"{frase || "Cargando frase del día..."}"</p>
                </div>
            </section>

        </main>
    );
}