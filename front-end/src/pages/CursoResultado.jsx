// src/pages/Cursos/CursoResultado.jsx
import {
    IoTrophyOutline, IoCheckmarkCircleOutline,
    IoCloseCircleOutline, IoHomeOutline,
    IoArrowBackOutline, IoBookOutline,
    IoAnalyticsOutline, IoRibbonOutline,
    IoTimeOutline, IoRefreshOutline,
} from "react-icons/io5";
import { useCursoResultado } from "../hooks/useCursoResultado.js";

function LoadingState() {
    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center",
            justifyContent: "center", background: "#F9F5EF",
        }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <IoTrophyOutline size={52} style={{ color: "#F5A623", opacity: 0.5 }} />
                <p style={{ fontSize: 17, fontWeight: 500, color: "#4A5A6E", fontFamily: "'DM Sans',sans-serif" }}>
                    Cargando resultados...
                </p>
            </div>
        </div>
    );
}

export function CursoResultado() {
    const { resultado, curso, progreso, cargando, animado, error, navigate } = useCursoResultado();

    if (cargando) return <LoadingState />;

    if (error || !curso) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 16, background: "#F9F5EF",
            }}>
                <IoBookOutline size={44} style={{ color: "#CBD5E1" }} />
                <p style={{ color: "#4A5A6E", fontSize: 16 }}>{error || "Resultado no disponible."}</p>
                <button onClick={() => navigate("/cursos")} style={btnStyle("#1277dd")}>
                    <IoHomeOutline size={15} /> Volver a cursos
                </button>
            </div>
        );
    }

    const pct = progreso?.porcentaje ?? 100;
    const totalContenidos = progreso?.total ?? 0;
    const vistos = progreso?.vistos ?? 0;
    const aprobado = resultado ? Number(resultado.porcentaje) >= 70 : true;
    const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;

    return (
        <div style={{
            minHeight: "100vh", background: "#F9F5EF",
            fontFamily: "'DM Sans', sans-serif",
            opacity: animado ? 1 : 0, transform: animado ? "translateY(0)" : "translateY(12px)",
            transition: "opacity .4s, transform .4s",
        }}>

            {/* ── HERO ── */}
            <div style={{
                background: aprobado
                    ? "linear-gradient(135deg, #1A6E3C 0%, #2E8B57 100%)"
                    : "linear-gradient(135deg, #1A5FD4 0%, #1277dd 100%)",
                padding: "48px 24px 80px",
                textAlign: "center",
                position: "relative",
            }}>
                {/* Botón volver */}
                <button
                    onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                    style={{
                        position: "absolute", top: 20, left: 20,
                        background: "rgba(255,255,255,.15)", border: "none",
                        borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                        color: "white", fontSize: 13, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 6,
                    }}
                >
                    <IoArrowBackOutline size={14} /> Detalle
                </button>

                {/* Ícono */}
                <div style={{
                    width: 88, height: 88, borderRadius: "50%",
                    background: "rgba(255,255,255,.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                }}>
                    <IoTrophyOutline size={44} color="white" />
                </div>

                <h1 style={{ color: "white", fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>
                    {aprobado ? "¡Felicidades!" : "¡Curso completado!"}
                </h1>
                <p style={{ color: "rgba(255,255,255,.85)", fontSize: 15, margin: "0 0 4px" }}>
                    Completaste el curso
                </p>
                <p style={{ color: "white", fontSize: 18, fontWeight: 700, margin: 0 }}>
                    {curso.titulo}
                </p>
            </div>

            {/* ── CONTENIDO ── */}
            <div style={{
                maxWidth: 680, margin: "-48px auto 0",
                padding: "0 16px 48px",
                display: "flex", flexDirection: "column", gap: 16,
            }}>

                {/* Tarjeta principal — progreso */}
                <div style={cardStyle}>
                    <div style={cardHeadStyle}>
                        <IoAnalyticsOutline size={16} color="#1277dd" />
                        <span style={cardHeadTitleStyle}>Progreso del curso</span>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: "#4A5A6E" }}>Contenidos vistos</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A" }}>{pct}%</span>
                        </div>
                        <div style={{ background: "#E8EEF7", borderRadius: 8, height: 10, overflow: "hidden" }}>
                            <div style={{
                                width: `${pct}%`, height: "100%", borderRadius: 8,
                                background: "linear-gradient(90deg, #1277dd, #1A5FD4)",
                                transition: "width 1s ease",
                            }} />
                        </div>
                        <p style={{ fontSize: 12, color: "#4A5A6E", margin: "6px 0 0" }}>
                            {vistos} de {totalContenidos} contenidos completados
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <StatBox
                            icon={<IoCheckmarkCircleOutline size={20} color="#2E8B57" />}
                            label="Contenidos vistos"
                            value={vistos}
                            bg="#E6F7EF"
                        />
                        <StatBox
                            icon={<IoTimeOutline size={20} color="#1277dd" />}
                            label="Total contenidos"
                            value={totalContenidos}
                            bg="#E8F0FD"
                        />
                    </div>
                </div>

                {/* Tarjeta resultado del test (si existe) */}
                {resultado && (
                    <div style={cardStyle}>
                        <div style={cardHeadStyle}>
                            <IoRibbonOutline size={16} color={aprobado ? "#2E8B57" : "#E8A44A"} />
                            <span style={cardHeadTitleStyle}>Resultado del cuestionario</span>
                            <span style={{
                                marginLeft: "auto", fontSize: 11, fontWeight: 700,
                                padding: "3px 10px", borderRadius: 20,
                                background: aprobado ? "#E6F7EF" : "#FFF4E5",
                                color: aprobado ? "#2E8B57" : "#E8A44A",
                            }}>
                                {aprobado ? "Aprobado" : "En progreso"}
                            </span>
                        </div>

                        {/* Círculo de porcentaje */}
                        <div style={{ textAlign: "center", padding: "24px 0" }}>
                            <div style={{
                                width: 110, height: 110, borderRadius: "50%", margin: "0 auto 16px",
                                background: `conic-gradient(${aprobado ? "#2E8B57" : "#1277dd"} ${resultado.porcentaje * 3.6}deg, #E8EEF7 0deg)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                position: "relative",
                            }}>
                                <div style={{
                                    width: 82, height: 82, borderRadius: "50%",
                                    background: "white", display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <span style={{ fontSize: 22, fontWeight: 800, color: "#1A2B4A", lineHeight: 1 }}>
                                        {Number(resultado.porcentaje).toFixed(0)}%
                                    </span>
                                    <span style={{ fontSize: 10, color: "#4A5A6E" }}>correcto</span>
                                </div>
                            </div>

                            <p style={{ fontSize: 15, color: "#1A2B4A", fontWeight: 600, margin: "0 0 4px" }}>
                                {resultado.respuestas_correctas} de {resultado.total_preguntas} respuestas correctas
                            </p>
                            <p style={{ fontSize: 13, color: "#4A5A6E", margin: 0 }}>
                                {aprobado
                                    ? "¡Excelente desempeño en el cuestionario!"
                                    : "Puedes tomar el curso de nuevo para mejorar tu puntaje."}
                            </p>
                        </div>

                        {/* Detalle correctas/incorrectas */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <StatBox
                                icon={<IoCheckmarkCircleOutline size={20} color="#2E8B57" />}
                                label="Correctas"
                                value={resultado.respuestas_correctas}
                                bg="#E6F7EF"
                            />
                            <StatBox
                                icon={<IoCloseCircleOutline size={20} color="#C0392B" />}
                                label="Incorrectas"
                                value={resultado.total_preguntas - resultado.respuestas_correctas}
                                bg="#FFF0F0"
                            />
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                    <button
                        onClick={() => navigate("/cursos")}
                        style={btnStyle("#1277dd")}
                    >
                        <IoHomeOutline size={15} /> Ver más cursos
                    </button>
                    <button
                        onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                        style={btnStyle("transparent", "#1277dd", "#1277dd")}
                    >
                        <IoRefreshOutline size={15} /> Volver al detalle
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Subcomponentes ── */
function StatBox({ icon, label, value, bg }) {
    return (
        <div style={{
            background: bg, borderRadius: 12, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
        }}>
            {icon}
            <div>
                <p style={{ margin: 0, fontSize: 11, color: "#4A5A6E" }}>{label}</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1A2B4A" }}>{value}</p>
            </div>
        </div>
    );
}

/* ── Estilos helpers ── */
const cardStyle = {
    background: "white", borderRadius: 16, padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,.06)",
};

const cardHeadStyle = {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
};

const cardHeadTitleStyle = {
    fontSize: 15, fontWeight: 700, color: "#1A2B4A",
};

function btnStyle(bg, color = "white", borderColor = "transparent") {
    return {
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "13px 24px", borderRadius: 12, cursor: "pointer",
        fontSize: 15, fontWeight: 700,
        background: bg, color, border: `2px solid ${borderColor}`,
        width: "100%",
    };
}