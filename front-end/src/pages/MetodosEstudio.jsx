// src/pages/MetodosEstudio/MetodosEstudio.jsx
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoBookOutline, IoHardwareChipOutline, IoTimeOutline,
  IoCheckmarkCircleOutline, IoArrowForwardOutline,
  IoListOutline, IoFlashOutline,
} from "react-icons/io5";
import "../styles/metodos-estudio.css";
import { ResultadoPrevioME } from "../components/ResultadoPrevioME";

const DIMENSIONES = [
  { id: 1, nombre: "Actitud ante el estudio",         desc: "Motivación, disposición y nivel concentración" },
  { id: 2, nombre: "Lugar de estudio",                desc: "Condiciones del ambiente, orden y factores físicos" },
  { id: 3, nombre: "Estado físico y bienestar",       desc: "Calidad del sueño, alimentación y nivel de energía" },
  { id: 4, nombre: "Plan de trabajo",                 desc: "Organización, establecimiento de metas y cronogramas" },
  { id: 5, nombre: "Técnicas de estudio",             desc: "Uso de estrategias como subrayado, mapas mentales y resúmenes" },
  { id: 6, nombre: "Preparación para exámenes",       desc: "Repaso, anticipación y manejo del estrés" },
  { id: 7, nombre: "Trabajos académicos",             desc: "Planificación, uso de fuentes y calidad del trabajo" },
  { id: 8, nombre: "Gestión del tiempo",              desc: "Establecimiento de prioridades, organización de bloques y equilibrio" },
  { id: 9, nombre: "Uso de recursos de aprendizaje",  desc: "Uso de plataformas, bibliografía y trabajo colaborativo" },
];

const ERRORES_COMUNES = [
  "Estudiar sin un plan o cronograma definido",
  "Dejar todo para el día anterior al examen",
  "Estudiar en ambientes con distracciones constantes",
  "Memorizar mecánicamente sin comprender los conceptos",
  "No tomar descansos adecuados entre sesiones de estudio",
  "Depender de un solo recurso o material para aprender",
];

const RECOMENDACIONES = [
  { icon: <IoTimeOutline size={18} />,         texto: "Establecer horarios fijos de estudio y respetarlos como compromisos" },
  { icon: <IoHardwareChipOutline size={18} />, texto: "Utilizar técnicas activas como mapas mentales, autoevaluación o la enseñanza del contenido" },
  { icon: <IoCheckmarkCircleOutline size={18}/>,texto: "Dividir el material en bloques pequeños con objetivos claros por sesión" },
  { icon: <IoBookOutline size={18} />,         texto: "Combinar múltiples fuentes de aprendizaje, adaptadas al estilo de aprendizaje" },
];

const NAV_SECTIONS = [
  { label: "Introducción",     id: "mei-intro"    },
  { label: "¿Qué se evalúa?", id: "mei-evalua"   },
  { label: "¿Cómo funciona?", id: "mei-funciona" },
  { label: "Errores comunes", id: "mei-errores"  },
  { label: "Recomendaciones", id: "mei-recs"     },
  { label: "Comenzar",        id: "mei-cta"      },
];

export function MetodosEstudio() {
  const navigate     = useNavigate();
  const mobileRef    = useRef(null);
  const scrollingRef = useRef(false);

  const [activeSection, setActiveSection] = useState(0);
  const [animado,       setAnimado]       = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setAnimado(true), 80);
  }, []);

  useEffect(() => {
    const observers = [];
    NAV_SECTIONS.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && !scrollingRef.current) {
              setActiveSection(i);
              scrollMobileNav(i);
            }
          });
        },
        { rootMargin: "-15% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollMobileNav = (index) => {
    if (!mobileRef.current) return;
    const items = mobileRef.current.querySelectorAll(".mei-mobile-item");
    if (items[index]) {
      const item = items[index];
      mobileRef.current.scrollTo({
        left: item.offsetLeft - mobileRef.current.offsetWidth / 2 + item.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  };

  const irASeccion = (index) => {
    scrollingRef.current = true;
    setActiveSection(index);
    scrollMobileNav(index);
    document.getElementById(NAV_SECTIONS[index].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { scrollingRef.current = false; }, 900);
  };

  return (
    <div className={`mei-app ${animado ? "mei-animated" : ""}`}>

      {/* ── HEADER ── */}
      <div className="mei-header">
        <div className="mei-header-left">
          <h1 className="mei-header-title">
            Evalúa tus <em>métodos de estudio</em>
          </h1>
          <p className="mei-header-subtitle">
            Identifica los hábitos que frenan tu rendimiento académico y recibe recomendaciones
            personalizadas alineadas con tu perfil VARK.
          </p>
        </div>
        <div className="mei-header-right">
          <div className="mei-header-stat"><IoListOutline size={14} /> 36 preguntas</div>
          <div className="mei-header-stat"><IoTimeOutline size={14} /> ~10–15 minutos</div>
        </div>
      </div>

      {/* ── NAV MÓVIL ── */}
      <nav className="mei-mobile-nav" ref={mobileRef}>
        {NAV_SECTIONS.map((s, i) => (
          <button
            key={i}
            className={`mei-mobile-item ${activeSection === i ? "active" : ""}`}
            onClick={() => irASeccion(i)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* ── LAYOUT ── */}
      <div className="mei-layout">

        {/* SIDEBAR */}
        <aside className="mei-sidebar">
          <div className="mei-sidebar-label">Contenido</div>
          <nav className="mei-sidebar-nav">
            {NAV_SECTIONS.map((s, i) => (
              <div
                key={i}
                className={`mei-sidebar-item ${activeSection === i ? "active" : ""}`}
                onClick={() => irASeccion(i)}
              >
                <span className="mei-sidebar-dot" /> {s.label}
              </div>
            ))}
          </nav>
          <div className="mei-sidebar-divider" />
          <div className="mei-sidebar-label">Dimensiones</div>
          <div className="mei-sidebar-dims">
            {DIMENSIONES.map((d) => (
              <div key={d.id} className="mei-sidebar-dim">
                <span className="mei-sidebar-dim-num">{String(d.id).padStart(2, "0")}</span>
                <span className="mei-sidebar-dim-name">{d.nombre}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main className="mei-main">
          <div className="mei-banner">
            <div className="mei-chip"><IoListOutline  size={13} /><span>36 preguntas</span></div>
            <div className="mei-chip"><IoTimeOutline  size={13} /><span>~10–15 minutos</span></div>
            <div className="mei-chip"><IoFlashOutline size={13} /><span>Resultados inmediatos</span></div>
          </div>

          {/* ── INTRODUCCIÓN ── */}
          <div id="mei-intro" className="mei-card mei-card--dark">
            <div className="mei-card-inner">
              <div className="mei-card-body">
                <div className="mei-card-tag">Introducción</div>
                <h2 className="mei-card-title">¿Qué son los métodos y hábitos de estudio?</h2>
                <p className="mei-card-text">
                  Los <strong>métodos de estudio</strong> son las estrategias y técnicas que utilizas para aprender,
                  organizar y retener información. Los <strong>hábitos de estudio</strong> son los patrones
                  de comportamiento que repites al momento de estudiar: cuándo, cómo, dónde y con qué recursos lo haces.
                </p>
                <p className="mei-card-text" style={{ marginTop: 14 }}>
                  Ambos determinan en gran medida <strong>tu rendimiento académico</strong>. No basta con
                  dedicar muchas horas al estudio si los métodos que usas no son efectivos o si tus hábitos
                  interfieren con tu concentración y retención.
                </p>
              </div>
              <div className="mei-card-image-side">
                <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80" alt="Estudiante tomando notas" />
                <div className="mei-card-image-overlay" />
              </div>
            </div>
            <div className="mei-intro-grid">
              <div className="mei-intro-item">
                <div className="mei-intro-item-num">01</div>
                <p className="mei-intro-item-title">¿Por qué es importante analizarlos?</p>
                <p className="mei-intro-item-desc">
                  Muchos estudiantes estudian de forma ineficiente sin saberlo. Identificar qué hábitos
                  te perjudican es el primer paso para mejorar tu rendimiento de forma sostenida.
                </p>
              </div>
              <div className="mei-intro-item">
                <div className="mei-intro-item-num">02</div>
                <p className="mei-intro-item-title">¿Qué obtienes con este test?</p>
                <p className="mei-intro-item-desc">
                  Un diagnóstico detallado de 9 dimensiones clave, errores detectados en tus hábitos
                  actuales y recomendaciones según tu perfil VARK.
                </p>
              </div>
              <div className="mei-intro-item">
                <div className="mei-intro-item-num">03</div>
                <p className="mei-intro-item-title">Fundamento académico</p>
                <p className="mei-intro-item-desc">
                  Basado en el <strong>CHTE</strong> de Álvarez y Fernández, y en el <strong>LASSI</strong>,
                  dos de los instrumentos más utilizados y validados para evaluar hábitos de estudio.
                </p>
              </div>
              <div className="mei-intro-item">
                <div className="mei-intro-item-num">04</div>
                <p className="mei-intro-item-title">Integración con tu perfil VARK</p>
                <p className="mei-intro-item-desc">
                  Las recomendaciones que recibirás están alineadas con tu estilo de aprendizaje
                  dominante, haciendo el diagnóstico más preciso y útil para ti.
                </p>
              </div>
            </div>
          </div>

          {/* ── QUÉ SE EVALÚA ── */}
          <div id="mei-evalua" className="mei-card mei-card--accent">
            <div className="mei-card-inner mei-card-inner--reverse">
              <div className="mei-card-image-side">
                <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80" alt="Libros y materiales de estudio" />
                <div className="mei-card-image-overlay" />
              </div>
              <div className="mei-card-body">
                <div className="mei-card-tag">¿Qué se evalúa?</div>
                <h2 className="mei-card-title">9 dimensiones de tus hábitos académicos</h2>
                <p className="mei-card-text">
                  El test analiza <strong>36 preguntas</strong> distribuidas en 9 dimensiones
                  clave con respuestas en escala Likert. Cada dimensión revela una faceta distinta de tus hábitos de estudio.
                </p>
              </div>
            </div>
            <div className="mei-dims-grid">
              {DIMENSIONES.map((d) => (
                <div key={d.id} className="mei-dim-card">
                  <span className="mei-dim-num">{String(d.id).padStart(2, "0")}</span>
                  <div>
                    <p className="mei-dim-nombre">{d.nombre}</p>
                    <p className="mei-dim-desc">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CÓMO FUNCIONA ── */}
          <div id="mei-funciona" className="mei-card">
            <div className="mei-card-inner">
              <div className="mei-card-body">
                <div className="mei-card-tag">¿Cómo funciona?</div>
                <h2 className="mei-card-title">Cuatro pasos hacia el rendimiento óptimo</h2>
                <p className="mei-card-text" style={{ marginBottom: 8 }}>
                  El proceso es simple, rápido y completamente personalizado.
                </p>
                <div className="mei-steps">
                  {[
                    { n: "01", t: "Responde el test",   d: "36 preguntas sobre tus hábitos actuales con escala de frecuencia." },
                    { n: "02", t: "Análisis",           d: "El sistema evalúa tus respuestas dimensión por dimensión." },
                    { n: "03", t: "Errores detectados", d: "Identificamos los hábitos y métodos que afectan tu rendimiento académico." },
                    { n: "04", t: "Recomendaciones",    d: "Sugerencias adaptadas a tu perfil de aprendizaje VARK dominante." },
                  ].map(s => (
                    <div key={s.n} className="mei-step">
                      <span className="mei-step-num">{s.n}</span>
                      <div>
                        <p className="mei-step-title">{s.t}</p>
                        <p className="mei-step-desc">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mei-card-image-side">
                <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80" alt="Persona organizando su estudio" />
                <div className="mei-card-image-overlay" />
              </div>
            </div>
          </div>

          {/* ── ERRORES COMUNES ── */}
          <div id="mei-errores" className="mei-card">
            <div className="mei-card-inner mei-card-inner--reverse">
              <div className="mei-card-image-side">
                <img src="https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=600&q=80" alt="Estudiante estresado frente al escritorio" />
                <div className="mei-card-image-overlay" />
              </div>
              <div className="mei-card-body">
                <div className="mei-card-tag">Errores comunes</div>
                <h2 className="mei-card-title">¿Cuáles son los errores más frecuentes?</h2>
                <p className="mei-card-text" style={{ marginBottom: 20 }}>
                  Estos son los métodos y hábitos negativos que más afectan el rendimiento académico de los estudiantes:
                </p>
                <ul className="mei-error-list">
                  {ERRORES_COMUNES.map((e, i) => (
                    <li key={i} className="mei-error-item">
                      <span className="mei-error-dot">{i + 1}</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── RECOMENDACIONES ── */}
          <div id="mei-recs" className="mei-card">
            <div className="mei-card-inner">
              <div className="mei-card-body">
                <div className="mei-card-tag">Hábitos efectivos</div>
                <h2 className="mei-card-title">Claves para un estudio de calidad</h2>
                <p className="mei-card-text" style={{ marginBottom: 20 }}>
                  Independientemente de tu perfil, estos hábitos marcan una diferencia real:
                </p>
                <div className="mei-recs-grid">
                  {RECOMENDACIONES.map((r, i) => (
                    <div key={i} className="mei-rec-card">
                      <span className="mei-rec-icon">{r.icon}</span>
                      <p>{r.texto}</p>
                    </div>
                  ))}
                </div>
                <div className="mei-tooltip">
                  <IoFlashOutline size={14} />
                  <span>
                    Basado en el CHTE y en el LASSI, instrumentos utilizados para evaluar métodos y hábitos de estudio.
                  </span>
                </div>
              </div>
              <div className="mei-card-image-side">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" alt="Grupo de estudiantes colaborando" />
                <div className="mei-card-image-overlay" />
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div id="mei-cta" className="mei-card">
            <div className="mei-card-body" style={{ textAlign: "center" }}>
              <div className="mei-card-tag">Comenzar</div>
              <h2 className="mei-card-title">¿Listo para conocer tus hábitos?</h2>
              <p className="mei-card-text" style={{ maxWidth: 460, margin: "0 auto 24px" }}>
                El test toma aproximadamente <strong>10–15 minutos</strong>. Recibirás un análisis
                detallado con errores detectados y recomendaciones personalizadas.
              </p>

              {/* ── Banner resultado previo (solo si ya respondió) ── */}
              <ResultadoPrevioME />

              <div className="mei-cta-btns" style={{ marginTop: 20 }}>
                <button className="mei-start-btn" onClick={() => navigate("/test-metodos-estudio")}>
                  Comenzar evaluación <IoArrowForwardOutline size={15} />
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}