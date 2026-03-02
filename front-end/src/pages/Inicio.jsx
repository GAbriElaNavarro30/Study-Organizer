import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  IoBookOutline, IoSchoolOutline, IoDocumentTextOutline,
  IoCheckboxOutline, IoLeafOutline, IoTimeOutline,
  IoHappyOutline, IoCalendarOutline, IoPhonePortraitOutline,
  IoSparklesOutline, IoChevronForwardOutline,
  IoChevronBackOutline, IoArrowForwardOutline,
  IoStarOutline, IoRocketOutline, IoShieldCheckmarkOutline,
  IoEyeOutline, IoHeadsetOutline, IoHandLeftOutline,
} from "react-icons/io5";
import { MdOutlinePsychology } from "react-icons/md";
import "../styles/inicio.css";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const modules = [
  {
    num: "01", title: "Estilos de Aprendizaje", tag: "Test VARK",
    icon: <MdOutlinePsychology />,
    desc: "Descubre si eres visual, auditivo, lector o kinestésico. Obtén un perfil detallado y recomendaciones personalizadas basadas en el modelo VARK.",
    detail: "16 preguntas · Perfil radial · Recomendaciones personalizadas",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80",
  },
  {
    num: "02", title: "Métodos de Estudio", tag: "Diagnóstico",
    icon: <IoBookOutline />,
    desc: "Identifica exactamente qué hábitos te frenan. El sistema detecta tus errores y te sugiere estrategias específicas para mejorar tu rendimiento.",
    detail: "Cuestionario diagnóstico · Errores detectados · Plan de mejora",
    img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=80",
  },
  {
    num: "03", title: "Cursos Personalizados", tag: "Por tutores",
    icon: <IoSchoolOutline />,
    desc: "Accede a cursos breves publicados por tutores y adaptados exactamente a tu perfil de aprendizaje. Aprende a tu ritmo con seguimiento de progreso.",
    detail: "Cursos por perfil · Progreso guardado · Tutores verificados",
    img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80",
  },
  {
    num: "04", title: "Notas Inteligentes", tag: "Editor rico",
    icon: <IoDocumentTextOutline />,
    desc: "Crea y organiza tus apuntes con formato completo. Dicta por voz, exporta en PDF y comparte fácilmente.",
    detail: "Editor completo · Dictado por voz · Exportar PDF",
    img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&q=80",
  },
  {
    num: "05", title: "Gestor de Tareas", tag: "Recordatorios",
    icon: <IoCheckboxOutline />,
    desc: "Define fechas límite y recibe alertas automáticas en tu correo 24h y 1h antes de cada entrega.",
    detail: "Alertas por correo · Pendiente / Vencida / Completada",
    img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=900&q=80",
  },
  {
    num: "06", title: "Registro Emocional", tag: "Bienestar",
    icon: <IoLeafOutline />,
    desc: "Registra tu estado emocional cada día. El bienestar es parte del rendimiento — aquí también cuidamos esa parte de ti.",
    detail: "Escala Likert · Emociones personalizadas · Historial diario",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  },
];

const benefits = [
  {
    icon: <IoTimeOutline />, label: "Ahorra tiempo",
    body: "Todo en un solo lugar. Sin saltar entre apps ni perder apuntes.",
    img: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=500&q=80",
  },
  {
    icon: <IoHappyOutline />, label: "Reduce el estrés",
    body: "Recordatorios automáticos y organización clara reducen la presión académica.",
    img: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80",
  },
  {
    icon: <IoCalendarOutline />, label: "Mejor organización",
    body: "Un dashboard que te muestra exactamente dónde estás y qué sigue.",
    img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80",
  },
  {
    icon: <IoPhonePortraitOutline />, label: "Desde cualquier lugar",
    body: "Responsive — disponible en celular, tablet o computadora.",
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=80",
  },
];

const steps = [
  { n: "01", title: "Regístrate", body: "Crea tu cuenta con tu correo institucional en segundos.", icon: <IoRocketOutline /> },
  { n: "02", title: "Conoce tu perfil", body: "Completa los tests VARK y de métodos de estudio.", icon: <MdOutlinePsychology /> },
  { n: "03", title: "Recibe tu plan", body: "Obtén cursos y estrategias a la medida de tu estilo.", icon: <IoStarOutline /> },
  { n: "04", title: "Organiza y avanza", body: "Gestiona tareas, notas y bienestar en un solo lugar.", icon: <IoShieldCheckmarkOutline /> },
];

const problems = [
  "Estrés y ansiedad por desorganización académica",
  "Bajo rendimiento por métodos de estudio incorrectos",
  "Desconocimiento del propio estilo de aprendizaje",
  "Tareas olvidadas y acumulación de pendientes",
  "Bienestar emocional afectado por la carga escolar",
];

const frasesPlataforma = [
  "Bienestar emocional",
  "Métodos de estudio eficientes",
  "Conoce tu estilo de aprendizaje",
  "Recibe recomendaciones según tu perfil",
  "Cursos personalizados",
  "Crea y personaliza tus notas",
  "Gestiona tus tareas",
  "Recibe recordatorios automáticos",
  "Registro emocional",
  "Libérate del estrés académico",
];

const varkBars = [
  { name: "Visual", pct: 87, iconClass: "hcb-icon-v", fillClass: "hcb-fill-v" },
  { name: "Auditivo", pct: 52, iconClass: "hcb-icon-a", fillClass: "hcb-fill-a" },
  { name: "Lector", pct: 64, iconClass: "hcb-icon-r", fillClass: "hcb-fill-r" },
  { name: "Kinestésico", pct: 39, iconClass: "hcb-icon-k", fillClass: "hcb-fill-k" },
];

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
export function Inicio() {
  const [heroIn, setHeroIn] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    autoRef.current = setInterval(() => {
      setActiveSlide(p => (p + 1) % modules.length);
    }, 5500);
    return () => clearInterval(autoRef.current);
  }, []);

  const goTo = (idx) => {
    if (isAnimating) return;
    clearInterval(autoRef.current);
    setIsAnimating(true);
    setActiveSlide(idx);
    setTimeout(() => setIsAnimating(false), 450);
    autoRef.current = setInterval(() => {
      setActiveSlide(p => (p + 1) % modules.length);
    }, 5500);
  };

  const prev = () => goTo((activeSlide - 1 + modules.length) % modules.length);
  const next = () => goTo((activeSlide + 1) % modules.length);
  const mod = modules[activeSlide];

  return (
    <div className="so-page">

      {/* MARQUEE */}
      <div className="marquee-band">
        <div className="marquee-inner" aria-hidden="true">
          {[...frasesPlataforma, ...frasesPlataforma].map((item, i) => (
            <span key={i} className="marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className={`hero${heroIn ? " in" : ""}`}>

        <div className="hero-left">
          <p className="hero-eyebrow">Plataforma académica · Educación superior</p>
          <h1 className="hero-h1">
            <span className="line l1">Organiza
              tu estudio,</span>
            <span className="line l3"><em>cuida tu bienestar.</em></span>
          </h1>
          <p className="hero-sub">
            Study Organizer es una plataforma web todo-en-uno que te ayuda a organizar tus tareas y apuntes, mejorar tus métodos de estudio según tu estilo de aprendizaje y reducir el estrés académico.
          </p>
          <div className="hero-actions">
            <Link to="/registrarse" className="btn-ghost-inicio">Registrarse</Link>
            <Link to="/login" className="btn-primary-inicio">Iniciar sesión</Link>
          </div>
        </div>

        <div className="hero-right">
          <img
            className="hero-img"
            src="https://i.pinimg.com/736x/03/ea/11/03ea11a8c5ff264c2960447bce073ece.jpg"
            alt="Estudiante en ambiente de estudio sereno"
          />
          <div className="hero-img-overlay" />
          <div className="hero-card">
            <div className="hero-card-label">Mi perfil VARK</div>
            <div className="hero-card-bars">
              {[
                { name: "Visual", pct: 87, icon: <IoEyeOutline />, iconClass: "hcb-icon-v", fillClass: "hcb-fill-v" },
                { name: "Auditivo", pct: 52, icon: <IoHeadsetOutline />, iconClass: "hcb-icon-a", fillClass: "hcb-fill-a" },
                { name: "Lector", pct: 64, icon: <IoBookOutline />, iconClass: "hcb-icon-r", fillClass: "hcb-fill-r" },
                { name: "Kinestésico", pct: 39, icon: <IoHandLeftOutline />, iconClass: "hcb-icon-k", fillClass: "hcb-fill-k" },
              ].map(({ name, pct, icon, iconClass, fillClass }) => (
                <div key={name} className="hcb-row">
                  <div className={`hcb-icon ${iconClass}`}>{icon}</div>
                  <div className="hcb-info">
                    <div className="hcb-top">
                      <span className="hcb-name">{name}</span>
                      <span className="hcb-pct">{pct}%</span>
                    </div>
                    <div className="hcb-track">
                      <div className={`hcb-fill ${fillClass}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-img-col">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80"
            alt="Estudiantes colaborando en un ambiente tranquilo"
          />
        </div>
        <div className="about-text-col">
          <p className="section-eyebrow">¿Para qué fue creado?</p>
          <h2 className="section-h2">
            Creado para resolver<br />un problema <em>real</em>
          </h2>
          <p className="section-body">
            Muchos estudiantes universitarios enfrentan el mismo ciclo: demasiadas
            materias, poco tiempo y ninguna herramienta que los ayude a estudiar
            de verdad. Acumulan tareas, olvidan fechas y aplican métodos que no funcionan.
          </p>
          <p className="section-body">
            <strong>Study Organizer</strong> nació para cambiar eso — combinando
            diagnóstico de aprendizaje, organización académica y cuidado emocional
            en un solo espacio sereno y fácil de usar.
          </p>
          <div className="problem-list">
            {problems.map(p => (
              <div key={p} className="problem-item">
                <span className="problem-dot" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES SLIDER */}
      <section className="modules">
        <div className="modules-header">
          <div>
            <p className="section-eyebrow">Funcionalidades</p>
            <h2 className="section-h2">
              Servicios que trabajan<br /><em>juntos por ti</em>
            </h2>
          </div>
          <div className="slider-nav">
            <button className="nav-btn" onClick={prev} aria-label="Anterior">
              <IoChevronBackOutline />
            </button>
            <button className="nav-btn" onClick={next} aria-label="Siguiente">
              <IoChevronForwardOutline />
            </button>
          </div>
        </div>

        <div className="slider-wrap">
          <div className="slide-image-col">
            <img key={`img-${activeSlide}`} src={mod.img} alt={mod.title} />
            <div className="slide-num-big">{mod.num}</div>
          </div>
          <div className="slide-content-col" key={`c-${activeSlide}`}>
            <span className="slide-tag">{mod.tag}</span>
            <div className="slide-icon">{mod.icon}</div>
            <h3 className="slide-title">{mod.title}</h3>
            <p className="slide-desc">{mod.desc}</p>
            <p className="slide-meta">{mod.detail}</p>
            <button className="slide-cta">
              Explorar módulo <IoArrowForwardOutline size={14} />
            </button>
          </div>
        </div>

        <div className="slider-dots">
          {modules.map((_, i) => (
            <div key={i} className={`sdot${activeSlide === i ? " active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>

        <div className="mod-tabs">
          {modules.map((m, i) => (
            <div key={i} className={`mod-tab${activeSlide === i ? " active" : ""}`} onClick={() => goTo(i)}>
              <span className="mod-tab-icon">{m.icon}</span>
              {m.title}
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits">
        <div className="benefits-inner">
          <div className="benefits-head">
            <p className="section-eyebrow">¿Por qué usarlo?</p>
            <h2 className="section-h2">
              Beneficios que sentirás<br /><em>desde el primer día</em>
            </h2>
          </div>
          <div className="ben-grid">
            {benefits.map((b, i) => (
              <div key={i} className="ben-card">
                <div className="ben-card-img">
                  <img src={b.img} alt={b.label} />
                </div>
                <div className="ben-body">
                  <div className="ben-icon">{b.icon}</div>
                  <h3 className="ben-title">{b.label}</h3>
                  <p className="ben-text">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="steps">
        <div className="steps-inner">
          <div className="steps-head">
            <p className="section-eyebrow">Proceso</p>
            <h2 className="section-h2">¿Cómo <em>empiezo?</em></h2>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-n">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h4 className="step-title">{s.title}</h4>
                <p className="step-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="quote-section">
        <p className="quote-text">
          "La educación no es llenar un balde, sino encender un fuego."
        </p>
        <p className="quote-author">— William Butler Yeats</p>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-orb orb-1" />
        <div className="cta-orb orb-2" />
        <div className="cta-inner">
          <p className="section-eyebrow" style={{ justifyContent: "center" }}>
            Empieza hoy
          </p>
          <h2 className="cta-h2">
            Tu mejor semestre<br />comienza <em>aquí.</em>
          </h2>
          <p className="cta-sub">
            Únete a Study Organizer y descubre lo que es estudiar con propósito,
            claridad y sin estrés.
          </p>
          <div className="cta-btns">
            <button className="btn-primary">
              <IoSparklesOutline style={{ marginRight: 6 }} />
              Crear cuenta gratuita
            </button>
            <button className="btn-outline">
              Iniciar sesión
            </button>
          </div>


          <p className="cta-note">Sin costo · Acceso inmediato · Para estudiantes universitarios</p>
        </div>
      </section>

    </div>
  );
}

export default Inicio;