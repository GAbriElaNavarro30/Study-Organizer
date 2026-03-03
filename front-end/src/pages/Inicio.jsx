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
import { useInicio, modules } from "../hooks/useInicio";
import "../styles/inicio.css";

const benefits = [
  {
    icon: <IoTimeOutline />, label: "Ahorra tiempo",
    body: "Centraliza tus herramientas de estudio en un solo espacio, evitando la dispersión de información y la pérdida de apuntes.",
    img: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=500&q=80",
  },
  {
    icon: <IoHappyOutline />, label: "Reduce el estrés",
    body: "La organización estructurada y los recordatorios automáticos te ayudan a anticiparte a tus actividades y reducir la presión académica.",
    img: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80",
  },
  {
    icon: <IoCalendarOutline />, label: "Mejores resultados",
    body: "Consulta de forma clara los resultados de tus test de estilos y métodos de estudio, así como los registros de tu estado emocional a lo largo del tiempo.",
    img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80",
  },
  {
    icon: <IoPhonePortraitOutline />, label: "Desde cualquier lugar",
    body: "Plataforma responsive disponible en computadora, tablet o teléfono móvil, para acompañarte en todo momento.",
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=80",
  },
];

const steps = [
  { n: "01", title: "Regístrate", body: "Crea tu cuenta gratis con un correo electrónico vigente en segundos.", icon: <IoRocketOutline /> },
  { n: "02", title: "Conoce tu perfil", body: "Completa los tests de estilos de aprendizaje y de métodos de estudio.", icon: <MdOutlinePsychology /> },
  { n: "03", title: "Recibe recomendaciones", body: "Obtén cursos y estrategias a la medida de tu estilo de aprendizaje.", icon: <IoStarOutline /> },
  { n: "04", title: "Organiza y avanza", body: "Gestiona tareas, notas y bienestar en un solo lugar.", icon: <IoShieldCheckmarkOutline /> },
];

const problems = [
  "Reducción del estrés académico asociado a la desorganización académica",
  "Mejora de los métodos de estudio según el estilo de aprendizaje",
  "Desarrollo de la comprensión del propio estilo de aprendizaje",
  "Mejor organización de notas y gestión de tareas pendientes",
  "Apoyo en el recordatorio de tareas y actividades programadas",
  "Cuidado del bienestar emocional durante la vida universitaria",
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

// Asigna el ícono correspondiente a cada módulo según su índice
const moduleIcons = [
  <MdOutlinePsychology />,
  <IoBookOutline />,
  <IoSchoolOutline />,
  <IoDocumentTextOutline />,
  <IoCheckboxOutline />,
  <IoLeafOutline />,
];

export function Inicio() {
  const { heroIn, activeSlide, currentModule, goTo, prev, next, usuario } = useInicio();

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
            <span className="line l1">Organiza tu estudio,</span>
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

          {/* CARD VARK */}
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

          {/* CARD EMOCIÓN */}
          <div className="hero-card-mini hero-card-emotion">
            <div className="hcm-header">
              <IoLeafOutline className="hcm-icon hcm-icon-emotion" />
              <span className="hcm-label">Registro emocional</span>
            </div>
            <div className="hcm-emotion-row">
              <span className="hcm-emoji"><IoHappyOutline /></span>
              <div className="hcm-emotion-info">
                <span className="hcm-emotion-name">Feliz</span>
                <div className="hcm-emotion-scale">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className="hcm-scale-dot filled" />
                  ))}
                </div>
              </div>
            </div>
            <p className="hcm-date">Hoy, 9:14 am</p>
          </div>

          {/* CARD TAREA */}
          <div className="hero-card-mini hero-card-task">
            <div className="hcm-header">
              <IoCheckboxOutline className="hcm-icon hcm-icon-task" />
              <span className="hcm-label">Recordatorio</span>
            </div>
            <p className="hcm-task-title">Entregar ensayo de Metodología</p>
            <div className="hcm-task-footer">
              <span className="hcm-badge hcm-badge-warning">
                <IoTimeOutline /> 01/05/2026 02:00 p.m
              </span>
              <span className="hcm-task-dot" />
            </div>
          </div>

          {/* CARD NOTA */}
          <div className="hero-card-mini hero-card-note">
            <div className="hcm-header">
              <IoDocumentTextOutline className="hcm-icon hcm-icon-note" />
              <span className="hcm-label">Nota rápida</span>
            </div>
            <p className="hcm-note-text">
              La ciencia es el conjunto de conocimientos estructurados y verificables obtenidos mediante ...
            </p>
            <div className="hcm-note-tags">
              <span className="hcm-tag">Guardar</span>
              <span className="hcm-tag">Compartir</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-inner">
          <div className="about-head">
            <p className="section-eyebrow">¿Para qué fue creado?</p>
            <h2 className="about-h2">
              Creado para ayudarte a <br />resolver un problema <em>real</em>
            </h2>
          </div>
          <div className="about-grid">
            <div className="about-left">
              <div className="about-callout">
                <IoSparklesOutline className="about-callout-icon" />
                <p>
                  La vida universitaria implica múltiples responsabilidades académicas que requieren organización, constancia y buenos hábitos de estudio. Sin embargo, muchos estudiantes no cuentan con una herramienta que les ayude a gestionar sus tareas, mantener sus apuntes organizados en un solo lugar y aplicar métodos de estudio acordes a su forma de aprender, lo que puede provocar acumulación de actividades, olvido de fechas importantes y un aumento del estrés académico.
                </p>
              </div>
              <p className="section-body">
                <strong>Study Organizer</strong> nació para apoyar a los estudiantes universitarios en la organización de sus tareas, apuntes y métodos de estudio, considerando su estilo de aprendizaje y el cuidado de su bienestar emocional.
              </p>
            </div>
            <div className="about-right">
              <p className="about-list-label">Aspectos que buscamos mejorar</p>
              <div className="problem-list">
                {problems.map((p, i) => (
                  <div key={p} className="problem-item">
                    <span className="problem-num">0{i + 1}</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="about-quote-strip">
            <div className="about-quote-inner">
              <span className="about-quote-mark">"</span>
              <p className="about-quote-text">
                Aprender mejor no depende del tiempo que estudias,
                <em> sino de cómo lo haces.</em>
              </p>
              <span className="about-quote-mark about-quote-mark--close">"</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES SLIDER */}
      <section className="modules">
        <div className="modules-header">
          <div>
            <p className="section-eyebrow">Funcionalidades</p>
            <h2 className="section-h2">
              Servicios que trabajan <em>juntos por ti</em>
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
            <img key={`img-${activeSlide}`} src={currentModule.img} alt={currentModule.title} />
            <div className="slide-num-big">{currentModule.num}</div>
          </div>
          <div className="slide-content-col" key={`c-${activeSlide}`}>
            <span className="slide-tag">{currentModule.tag}</span>
            <div className="slide-icon">{moduleIcons[activeSlide]}</div>
            <h3 className="slide-title">{currentModule.title}</h3>
            <p className="slide-desc">{currentModule.desc}</p>
            <p className="slide-meta">{currentModule.detail}</p>
            <Link
              to={usuario ? currentModule.ruta : "/login"}
              className="slide-cta"
            >
              Explorar módulo <IoArrowForwardOutline size={14} />
            </Link>
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
              <span className="mod-tab-icon">{moduleIcons[i]}</span>
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
              Beneficios que experimentarás<br /><em>desde el primer día</em>
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
            {[0, 1, 2].map(i => (
              <div key={`conn-${i}`} className="step-connector">
                <div className="step-connector-dot" />
                <div className="step-connector-dot" />
                <div className="step-connector-dot" />
              </div>
            ))}
            {steps.map((s, i) => (
              <div key={i} className={`step-item${i % 2 === 1 ? " step-item--down" : ""}`}>
                <div className="step-circle-wrap">
                  <div className="step-circle-ring" />
                  <div className="step-circle">
                    <div className="step-circle-icon">{s.icon}</div>
                    <div className="step-n">{s.n}</div>
                  </div>
                </div>
                <div className="step-text">
                  <h4 className="step-title">{s.title}</h4>
                  <p className="step-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="quote-section">
        <div className="quote-inner">
          <div className="quote-line-top" />
          <span className="quote-mark">"</span>
          <p className="quote-text">
            Aprender mejor comienza por entender cómo aprendes.
          </p>
          <div className="quote-divider">
            <div className="quote-divider-line" />
            <div className="quote-divider-dot" />
            <div className="quote-divider-line" />
          </div>
          <p className="quote-author">— Study Organizer</p>
          <div className="quote-line-bottom" />
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-orb orb-1" />
        <div className="cta-orb orb-2" />
        <div className="cta-inner">
          <div className="cta-badge">
            <span className="cta-badge-dot" />
            Empieza hoy
          </div>
          <h2 className="cta-h2">
            Tu mejor semestre<br />comienza <em>aquí.</em>
          </h2>
          <p className="cta-sub">
            Únete a Study Organizer y descubre lo que es estudiar con propósito,
            claridad y sin estrés.
          </p>
          <div className="cta-btns">
            <Link to="/registrarse" className="btn-primary">
              <IoSparklesOutline style={{ fontSize: "1rem" }} />
              Registrarse
            </Link>
            <Link to="/login" className="btn-outline">
              Iniciar sesión
            </Link>
          </div>
          <p className="cta-note">
            <span>Sin costo</span>
            <span className="cta-note-sep" />
            <span>Acceso inmediato</span>
            <span className="cta-note-sep" />
            <span>Para estudiantes universitarios</span>
          </p>
        </div>
      </section>

    </div>
  );
}

export default Inicio;