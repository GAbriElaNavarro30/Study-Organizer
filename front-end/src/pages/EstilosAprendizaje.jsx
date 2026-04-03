import "../styles/estilosaprendizaje.css";
import {
    IoListOutline,
    IoTimeOutline,
    IoFlashOutline,
    IoAnalyticsOutline,
    IoBarChartOutline,
    IoBulbOutline,
    IoArrowForwardOutline,
    IoVolumeMuteOutline,
    IoMusicalNotesOutline,
} from "react-icons/io5";

import neilFleming from "../assets/imagenes/neil-fleming.jpg";
import { ResultadoPrevio } from "../components/Resultadoprevio";
import { useEstilosAprendizaje, VARK_DATA, NAV_SECTIONS } from "../hooks/useEstilosAprendizaje";

export function EstilosAprendizaje() {
    const {
        // Referencias
        iframeRef,
        mobileNavRef,

        // Estado
        phase,
        muted,
        activeSection,

        // Handlers
        toggleMute,
        irASeccion,
        iniciarTest,
    } = useEstilosAprendizaje();

    return (
        <div className="vark-app-ea">
            {/*<iframe
                ref={iframeRef}
                src="https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0&mute=1"
                allow="autoplay"
                style={{ display: "none" }}
                title="background-music"
            />

            <button className="mute-btn-ea" onClick={toggleMute} title={muted ? "Activar música" : "Silenciar"}>
                {muted ? <IoVolumeMuteOutline size={20} /> : <IoMusicalNotesOutline size={20} />}
            </button>*/}

            {/* HEADER */}
            <div className="header-ea">
                <div className="header-left-ea">
                    <h1 className="header-title-ea">
                        Descubre tu estilo de <em>aprendizaje</em>
                    </h1>
                    <p className="header-subtitle-ea">
                        Conoce cómo tu mente procesa mejor la información y optimiza tu forma de estudiar con el modelo VARK.
                    </p>
                </div>
                <div className="header-right-ea">
                    <div className="header-stat-ea"><IoListOutline size={15} /> 16 preguntas</div>
                    <div className="header-stat-ea"><IoTimeOutline size={15} /> ~5 minutos</div>
                    <div className="header-stat-ea"><IoAnalyticsOutline size={15} /> Modelo VARK</div>
                </div>
            </div>

            {/* NAV HORIZONTAL MÓVIL */}
            {phase === "info" && (
                <nav className="mobile-nav-ea" ref={mobileNavRef}>
                    {NAV_SECTIONS.map((s, i) => (
                        <button
                            key={i}
                            className={`mobile-nav-item-ea ${activeSection === i ? "active" : ""}`}
                            onClick={() => irASeccion(i)}
                        >
                            {s.label}
                        </button>
                    ))}
                </nav>
            )}

            {/* INFO PHASE */}
            {phase === "info" && (
                <div className="info-layout-ea fade-in-ea">

                    {/* SIDEBAR */}
                    <aside className="info-sidebar-ea">
                        <div className="sidebar-label-ea">Contenido</div>
                        <nav className="sidebar-nav-ea">
                            {NAV_SECTIONS.map((s, i) => (
                                <div
                                    key={i}
                                    className={`sidebar-nav-item-ea ${activeSection === i ? "active" : ""}`}
                                    onClick={() => irASeccion(i)}
                                >
                                    <span className="sidebar-nav-dot-ea" />
                                    {s.label}
                                </div>
                            ))}
                        </nav>

                        <div className="sidebar-divider-ea" />

                        <div className="sidebar-label-ea">Modalidades</div>
                        <div className="sidebar-vark-pills-ea">
                            {Object.entries(VARK_DATA).map(([key, val]) => {
                                const Icon = val.icon;
                                return (
                                    <div key={key} className="sidebar-vark-pill-ea">
                                        <span className="sidebar-vark-pill-letter-ea" style={{ color: val.barColor }}>{key}</span>
                                        <Icon size={14} style={{ color: val.barColor }} />
                                        <span style={{ fontSize: 12, color: "#4A5568" }}>{val.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="info-main-ea">
                        <div className="info-banner-ea">
                            <div className="info-chip-ea"><IoListOutline size={16} /><span>16 preguntas</span></div>
                            <div className="info-chip-ea"><IoTimeOutline size={16} /><span>~5 minutos</span></div>
                            <div className="info-chip-ea"><IoFlashOutline size={16} /><span>Resultados inmediatos</span></div>
                            <div className="info-chip-ea"><IoAnalyticsOutline size={16} /><span>Modelo VARK</span></div>
                        </div>

                        {/* SECCIÓN: FUNDAMENTOS */}
                        <div id="seccion-fundamentos" className="card-ea">
                            <div className="card-inner-ea">
                                <div className="card-body-ea">
                                    <div className="card-tag-ea">Fundamentos</div>
                                    <h2 className="card-title-ea">¿Qué son los estilos de aprendizaje?</h2>
                                    <p className="card-text-ea">
                                        Los <strong>estilos de aprendizaje</strong> son las formas preferidas mediante las cuales cada persona percibe, procesa, almacena y recupera la información. No se trata de una capacidad fija, sino de una preferencia natural que puede variar según el contexto.
                                    </p>
                                    <br />
                                    <p className="card-text-ea">
                                        Comprender tu estilo te permite <strong>seleccionar estrategias de estudio más efectivas</strong>, reducir el esfuerzo invertido y aumentar significativamente la retención y comprensión de nuevos conocimientos.
                                    </p>
                                    <div className="tooltip-text-ea" style={{ marginTop: 20 }}>
                                        <IoBulbOutline size={16} />
                                        <span>Adaptar los métodos de enseñanza al estilo preferido puede mejorar el rendimiento académico hasta en un 30%.</span>
                                    </div>
                                </div>
                                <div className="card-image-side-ea">
                                    <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80" alt="Estudiante aprendiendo" />
                                    <div className="card-image-side-overlay-ea" />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: MODELO */}
                        <div id="seccion-modelo" className="card-ea">
                            <div className="card-inner-ea reverse-ea">
                                <div className="card-image-side-ea">
                                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" alt="Personas colaborando" />
                                    <div className="card-image-side-overlay-ea" />
                                </div>
                                <div className="card-body-ea">
                                    <div className="card-tag-ea">El Modelo</div>
                                    <h2 className="card-title-ea">¿Qué es el Modelo VARK?</h2>
                                    <p className="card-text-ea">
                                        El modelo <strong>VARK</strong> (Visual, Auditivo, Lectura/Escritura y Kinestésico) es un cuestionario de preferencias de aprendizaje diseñado para ayudar a estudiantes y educadores a identificar cómo prefieren recibir y procesar nueva información.
                                    </p>
                                    <br />
                                    <p className="card-text-ea">
                                        Es uno de los instrumentos más utilizados en contextos educativos a nivel mundial, reconocido por su simplicidad, claridad y aplicabilidad práctica en cualquier entorno de formación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: HISTORIA */}
                        <div id="seccion-historia" className="card-ea">
                            <div className="card-body-ea" style={{ padding: "40px" }}>
                                <div className="card-tag-ea">Historia</div>
                                <h2 className="card-title-ea">¿Quién lo creó?</h2>
                                <p className="card-text-ea">
                                    El modelo VARK fue desarrollado en <strong>1987</strong> por el educador neozelandés <strong>Neil D. Fleming</strong>, junto con Colleen Mills. Fleming lo introdujo como herramienta para ayudar a los docentes a entender mejor cómo aprenden sus alumnos y diseñar experiencias educativas más inclusivas y efectivas.
                                </p>
                                <div className="author-card-ea">
                                    <div className="author-avatar-ea">
                                        <img
                                            src={neilFleming}
                                            alt="Neil D. Fleming"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.parentElement.textContent = "N";
                                            }}
                                        />
                                    </div>
                                    <div className="author-info-ea">
                                        <h4>Neil D. Fleming</h4>
                                        <p>Educador e investigador neozelandés. Desarrolló el cuestionario VARK en la Universidad de Lincoln, Nueva Zelanda. Su trabajo ha influido en millones de educadores y estudiantes alrededor del mundo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: MODALIDADES */}
                        <div id="seccion-modalidades" className="card-ea">
                            <div className="card-body-ea" style={{ padding: "40px" }}>
                                <div className="card-tag-ea">Clasificación</div>
                                <h2 className="card-title-ea">Las cuatro modalidades VARK</h2>
                                <p className="card-text-ea" style={{ marginBottom: "24px" }}>
                                    El modelo clasifica las preferencias en cuatro grandes categorías, cada una con características y estrategias propias:
                                </p>
                                <div className="vark-grid-ea">
                                    {Object.entries(VARK_DATA).map(([key, val]) => {
                                        const Icon = val.icon;
                                        return (
                                            <div key={key} className={`vark-card-ea vark-${key.toLowerCase()}-ea`}>
                                                <div className="vark-emoji-ea"><Icon size={28} /></div>
                                                <div className="vark-letter-ea">{key}</div>
                                                <div className="vark-name-ea">{val.name}</div>
                                                <p className="vark-desc-ea">{val.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: SOBRE EL TEST */}
                        <div id="seccion-test" className="card-ea">
                            <div className="card-inner-ea">
                                <div className="card-body-ea">
                                    <div className="card-tag-ea">Sobre el Test</div>
                                    <h2 className="card-title-ea">¿Cómo funciona esta evaluación?</h2>
                                    <p className="card-text-ea">
                                        Este test consta de <strong>16 preguntas</strong> de opción múltiple, cada una con cuatro alternativas que corresponden a las modalidades V, A, R y K. No existen respuestas correctas o incorrectas; elige siempre la opción que refleje más tu comportamiento habitual.
                                    </p>
                                    <br />
                                    <p className="card-text-ea">
                                        Al finalizar, el sistema calculará tu <strong>perfil de preferencias</strong> mostrando la distribución de tus respuestas y destacando tu estilo dominante, junto con una descripción personalizada y recomendaciones adaptadas a ti.
                                    </p>
                                    <div className="tooltip-text-ea" style={{ marginTop: 16 }}>
                                        <IoBarChartOutline size={16} />
                                        <span>Los resultados mostrarán un gráfico de barras con la puntuación obtenida en cada una de las cuatro categorías (V, A, R, K).</span>
                                    </div>

                                    {/* ── Bloque resultado previo ── */}
                                    <ResultadoPrevio />

                                </div>
                                <div className="card-image-side-ea">
                                    <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80" alt="Persona estudiando" />
                                    <div className="card-image-side-overlay-ea" />
                                </div>
                            </div>
                        </div>

                        {/* BOTÓN COMENZAR */}
                        <div className="start-btn-wrapper-ea">
                            <button className="start-btn-ea" onClick={iniciarTest}>
                                Comenzar evaluación <IoArrowForwardOutline size={16} />
                            </button>
                        </div>

                    </main>
                </div>
            )}
        </div>
    );
}