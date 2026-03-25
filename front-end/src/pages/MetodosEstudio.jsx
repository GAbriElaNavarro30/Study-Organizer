// src/pages/MetodosEstudio/MetodosEstudio.jsx
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoBookOutline, IoHardwareChipOutline, IoTimeOutline,
  IoCheckmarkCircleOutline, IoArrowForwardOutline,
  IoListOutline, IoFlashOutline, IoAnalyticsOutline,
  IoVolumeMuteOutline, IoMusicalNotesOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import "../styles/metodos-estudio.css";

const DIMENSIONES = [
  { id: 1, nombre: "Actitud ante el estudio",        desc: "Motivación, disposición y concentración" },
  { id: 2, nombre: "Lugar de estudio",               desc: "Ambiente, orden y condiciones físicas" },
  { id: 3, nombre: "Estado físico y bienestar",      desc: "Sueño, alimentación y energía" },
  { id: 4, nombre: "Plan de trabajo",                desc: "Organización, metas y cronogramas" },
  { id: 5, nombre: "Técnicas de estudio",            desc: "Subrayado, mapas mentales, resúmenes" },
  { id: 6, nombre: "Preparación para exámenes",      desc: "Repaso, anticipación y manejo del estrés" },
  { id: 7, nombre: "Trabajos académicos",            desc: "Planificación, fuentes y calidad" },
  { id: 8, nombre: "Gestión del tiempo",             desc: "Prioridades, bloques y equilibrio" },
  { id: 9, nombre: "Uso de recursos de aprendizaje", desc: "Plataformas, bibliografía y grupos" },
];

const ERRORES_COMUNES = [
  "Estudiar sin un plan o cronograma definido",
  "Dejar todo para el día anterior al examen",
  "Estudiar en ambientes con distracciones constantes",
  "Memorizar mecánicamente sin comprender los conceptos",
  "No tomar descansos adecuados entre sesiones de estudio",
  "Depender de un solo recurso o resumen para todos los temas",
];

const RECOMENDACIONES = [
  { icon: <IoTimeOutline size={20}/>,            texto: "Establece horarios fijos de estudio y respétalos como compromisos" },
  { icon: <IoHardwareChipOutline size={20}/>,           texto: "Usa técnicas activas: mapas mentales, autoevaluación, enseñar el tema" },
  { icon: <IoCheckmarkCircleOutline size={20}/>, texto: "Divide el material en bloques pequeños con metas claras por sesión" },
  { icon: <IoBookOutline size={20}/>,            texto: "Combina múltiples fuentes adaptadas a tu estilo de aprendizaje" },
];

const NAV_SECTIONS = [
  { label: "¿Qué se evalúa?", id: "mei-evalua"   },
  { label: "¿Cómo funciona?", id: "mei-funciona" },
  { label: "Errores comunes", id: "mei-errores"  },
  { label: "Recomendaciones", id: "mei-recs"     },
  { label: "Comenzar",        id: "mei-cta"      },
];

export function MetodosEstudio() {
<>
</> 
  /*const navigate     = useNavigate();
  const iframeRef    = useRef(null);
  const mobileRef    = useRef(null);
  const scrollingRef = useRef(false);

  const [muted,         setMuted]         = useState(true);
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

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (iframeRef.current) {
        const base = "https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0";
        iframeRef.current.src = next ? base + "&mute=1" : base + "&mute=0";
      }
      return next;
    });
  };

  return (
    <div className={`mei-app ${animado ? "mei-animated" : ""}`}>

      <iframe ref={iframeRef}
        src="https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0&mute=1"
        allow="autoplay" style={{ display: "none" }} title="background-music"
      />
      <button className="mei-mute-btn" onClick={toggleMute} title={muted ? "Activar música" : "Silenciar"}>
        {muted ? <IoVolumeMuteOutline size={20}/> : <IoMusicalNotesOutline size={20}/>}
      </button>

      {/* HEADER */ /*}
      /*<div className="mei-header">
        <div className="mei-header-left">
          <h1 className="mei-header-title">
            Descubre tus <em>hábitos de estudio</em>
          </h1>
          <p className="mei-header-subtitle">
            Evalúa tus métodos, identifica errores y recibe recomendaciones
            personalizadas basadas en tu perfil VARK.
          </p>
        </div>
        <div className="mei-header-right">
          <div className="mei-header-stat"><IoListOutline size={15}/> 36 preguntas</div>
          <div className="mei-header-stat"><IoTimeOutline size={15}/> ~8–10 minutos</div>
          <div className="mei-header-stat"><IoAnalyticsOutline size={15}/> Modelo CHTE</div>
        </div>
      </div>

      {/* NAV MÓVIL */ /*}
      <nav className="mei-mobile-nav" ref={mobileRef}>
        {NAV_SECTIONS.map((s, i) => (
          <button key={i} className={`mei-mobile-item ${activeSection === i ? "active" : ""}`} onClick={() => irASeccion(i)}>
            {s.label}
          </button>
        ))}
      </nav>

      {/* LAYOUT */ /*}
      <div className="mei-layout">
        <aside className="mei-sidebar">
          <div className="mei-sidebar-label">Contenido</div>
          <nav className="mei-sidebar-nav">
            {NAV_SECTIONS.map((s, i) => (
              <div key={i} className={`mei-sidebar-item ${activeSection === i ? "active" : ""}`} onClick={() => irASeccion(i)}>
                <span className="mei-sidebar-dot"/> {s.label}
              </div>
            ))}
          </nav>
          <div className="mei-sidebar-divider"/>
          <div className="mei-sidebar-label">Dimensiones</div>
          <div className="mei-sidebar-dims">
            {DIMENSIONES.map((d) => (
              <div key={d.id} className="mei-sidebar-dim">
                <span className="mei-sidebar-dim-num">{String(d.id).padStart(2,"0")}</span>
                <span className="mei-sidebar-dim-name">{d.nombre}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="mei-main">
          <div className="mei-banner">
            <div className="mei-chip"><IoListOutline size={14}/><span>36 preguntas</span></div>
            <div className="mei-chip"><IoTimeOutline size={14}/><span>~8–10 minutos</span></div>
            <div className="mei-chip"><IoFlashOutline size={14}/><span>Resultados inmediatos</span></div>
            <div className="mei-chip"><IoAnalyticsOutline size={14}/><span>Modelo CHTE</span></div>
          </div>

          {/* ── QUÉ SE EVALÚA ── */ /*}
          <div id="mei-evalua" className="mei-card">
            <div className="mei-card-inner">
              <div className="mei-card-body">
                <div className="mei-card-tag">¿Qué se evalúa?</div>
                <h2 className="mei-card-title">9 dimensiones de tus hábitos académicos</h2>
                <p className="mei-card-text">
                  El test analiza <strong>36 preguntas</strong> distribuidas en 9 dimensiones
                  clave con escala Likert. Cada dimensión revela una faceta distinta de tus hábitos de estudio.
                </p>
                <div className="mei-dims-grid">
                  {DIMENSIONES.map((d) => (
                    <div key={d.id} className="mei-dim-card">
                      <span className="mei-dim-num">{String(d.id).padStart(2,"0")}</span>
                      <div>
                        <p className="mei-dim-nombre">{d.nombre}</p>
                        <p className="mei-dim-desc">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mei-card-image-side">
                <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80" alt="Estudiante"/>
                <div className="mei-card-image-overlay"/>
              </div>
            </div>
          </div>

          {/* ── CÓMO FUNCIONA ── */ /*}
          <div id="mei-funciona" className="mei-card">
            <div className="mei-card-inner mei-reverse">
              <div className="mei-card-image-side">
                <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80" alt="Persona estudiando"/>
                <div className="mei-card-image-overlay"/>
              </div>
              <div className="mei-card-body">
                <div className="mei-card-tag">¿Cómo funciona?</div>
                <h2 className="mei-card-title">Cuatro pasos hacia el rendimiento óptimo</h2>
                <div className="mei-steps">
                  {[
                    { n:"01", t:"Responde el test",     d:"36 preguntas sobre tus hábitos actuales. Solo una opción por pregunta." },
                    { n:"02", t:"Análisis inteligente", d:"El sistema experto evalúa tus respuestas dimensión por dimensión." },
                    { n:"03", t:"Errores detectados",   d:"Identificamos los hábitos que afectan tu rendimiento académico." },
                    { n:"04", t:"Recomendaciones VARK", d:"Sugerencias personalizadas según tu estilo de aprendizaje dominante." },
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
            </div>
          </div>

          {/* ── ERRORES COMUNES ── */ /*}
          <div id="mei-errores" className="mei-card">
            <div className="mei-card-body" style={{ padding: "40px" }}>
              <div className="mei-card-tag">Errores comunes</div>
              <h2 className="mei-card-title">¿Cuáles son los errores más frecuentes?</h2>
              <p className="mei-card-text" style={{ marginBottom: 24 }}>
                Estos son los hábitos negativos que más afectan el rendimiento académico de los estudiantes:
              </p>
              <ul className="mei-error-list">
                {ERRORES_COMUNES.map((e, i) => (
                  <li key={i} className="mei-error-item">
                    <span className="mei-error-dot"/>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RECOMENDACIONES ── */ /*}
          <div id="mei-recs" className="mei-card">
            <div className="mei-card-body" style={{ padding: "40px" }}>
              <div className="mei-card-tag">Hábitos efectivos</div>
              <h2 className="mei-card-title">Claves para un estudio de calidad</h2>
              <p className="mei-card-text" style={{ marginBottom: 24 }}>
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
                <IoFlashOutline size={15}/>
                <span>Basado en el <strong>CHTE</strong> · Álvarez &amp; Fernández (TEA Ediciones, 2013).</span>
              </div>
            </div>
          </div>

          {/* ── CTA ── */ /*}
          <div id="mei-cta" className="mei-card">
            <div className="mei-card-body" style={{ padding: "40px", textAlign: "center" }}>
              <div className="mei-card-tag">Comenzar</div>
              <h2 className="mei-card-title">¿Listo para conocer tus hábitos?</h2>
              <p className="mei-card-text" style={{ maxWidth: 480, margin: "0 auto 32px" }}>
                El test toma aproximadamente <strong>8–10 minutos</strong>. Recibirás un análisis
                detallado con errores detectados y recomendaciones personalizadas.
              </p>
              <div className="mei-cta-btns">
                <button className="mei-start-btn" onClick={() => navigate("/test-metodos-estudio")}>
                  Iniciar test <IoArrowForwardOutline size={16}/>
                </button>
                <button className="mei-start-btn mei-start-btn--outline" onClick={() => navigate("/historial-metodos-estudio")}>
                  Ver mis intentos anteriores
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  ); */
}