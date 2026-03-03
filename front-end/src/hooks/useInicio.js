import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const modules = [
  {
    num: "01", title: "Estilos de Aprendizaje", tag: "Test VARK", ruta: "/estilos-aprendizaje",
    desc: "Identifica tu estilo de aprendizaje visual, auditivo, lector o kinestésico y obtén recomendaciones de estudio basadas a tu perfil dominante con en el modelo VARK.",
    detail: "16 preguntas · Perfil radial · Recomendaciones personalizadas",
    img: "https://www.coldelvalle.edu.mx/wp-content/uploads/2022/04/4.-min-scaled.jpg",
  },
  {
    num: "02", title: "Métodos de Estudio", tag: "Diagnóstico", ruta: "/metodos-estudio",
    desc: "Identifica hábitos de estudio que pueden afectar tu desempeño académico y obtén recomendaciones para mejorar tu rendimiento.",
    detail: "Cuestionario · Errores detectados · Recomendaciones de mejora",
    img: "https://isil.pe/blog/wp-content/uploads/2024/09/que-es-un-metodo-de-estudio-1600x1066.webp",
  },
  {
    num: "03", title: "Cursos Personalizados", tag: "Por tutores", ruta: "/cursos",
    desc: "Accede a cursos informativos creados por tutores sobre estilos de aprendizaje y métodos de estudio. El sistema te sugiere cursos de acuerdo con tu estilo de aprendizaje y los métodos de estudio que necesitas mejorar.",
    detail: "Cursos por perfil · Progreso guardado · Tutores verificados",
    img: "https://www.evolmind.com/wp-content/uploads/2019/03/como-mejorar-un-curso-virtual_-las-estrategias-que-funcionan.webp",
  },
  {
    num: "04", title: "Notas", tag: "Editor rico", ruta: "/notas",
    desc: "Crea, personaliza y organiza tus notas en un solo lugar. Mantén tus apuntes ordenados, expórtalos en formato PDF y compártelos de manera sencilla.",
    detail: "Editor digital · Compartir PDF · Exportar PDF",
    img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&q=80",
  },
  {
    num: "05", title: "Gestor de Tareas", tag: "Recordatorios", ruta: "/tareas",
    desc: "Crea y organiza tus tareas académicas con fechas límite. De manera opcional, recibe recordatorios por correo electrónico un día y una hora antes de cada entrega.",
    detail: "Alertas por correo electróncio · Estado: Pendiente / Vencida / Completada",
    img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=900&q=80",
  },
  {
    num: "06", title: "Registro Emocional", tag: "Bienestar", ruta: "/dashboard",
    desc: "Registra tu estado emocional cada día. El bienestar es parte del rendimiento aquí también cuidamos esa parte de ti.",
    detail: "Escala Likert · Emociones · Registro diario",
    img: "https://gaceta.cch.unam.mx/sites/default/files/styles/imagen_articulos_1920x1080/public/2021-09/get-in-touch-with-emotions.png?h=95862f14&itok=k-0STl_X",
  },
];

export function useInicio() {
  const [heroIn, setHeroIn] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoRef = useRef(null);
  const { usuario } = useContext(AuthContext);

  // Activa la animación de entrada del hero
  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-avance del slider cada 8 segundos
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setActiveSlide(p => (p + 1) % modules.length);
    }, 8000);
    return () => clearInterval(autoRef.current);
  }, []);

  // Navega a un slide específico, reinicia el temporizador y bloquea clicks durante la animación
  const goTo = (idx) => {
    if (isAnimating) return;
    clearInterval(autoRef.current);
    setIsAnimating(true);
    setActiveSlide(idx);
    setTimeout(() => setIsAnimating(false), 450);
    autoRef.current = setInterval(() => {
      setActiveSlide(p => (p + 1) % modules.length);
    }, 8000);
  };

  const prev = () => goTo((activeSlide - 1 + modules.length) % modules.length);
  const next = () => goTo((activeSlide + 1) % modules.length);

  const currentModule = modules[activeSlide];

  return {
    heroIn,
    activeSlide,
    currentModule,
    goTo,
    prev,
    next,
    usuario,
  };
}