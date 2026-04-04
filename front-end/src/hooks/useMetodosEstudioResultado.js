// src/hooks/useMetodosEstudioResultado.js
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";

// ── Normalizar: array → objeto keyed por id_dimension ──
const normalizarResultados = (data) => {
  if (!data) return null;
  if (!Array.isArray(data.resultados_por_dimension)) return data;
  const obj = {};
  for (const d of data.resultados_por_dimension) {
    obj[d.id_dimension] = { nombre: d.nombre, puntaje: d.puntaje, nivel: d.nivel };
  }
  return { ...data, resultados_por_dimension: obj };
};



export function useMetodosEstudioResultado() {
  const location = useLocation();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(() =>
    normalizarResultados(
      location.state?.puntaje_global !== undefined ? location.state : null
    )
  );
  const [cargando, setCargando] = useState(!datos);
  const [animado, setAnimado] = useState(false);
  const [activeSection, setActiveSection] = useState("mer-resumen");

  const [cursosRecomendados, setCursosRecomendados] = useState(
    location.state?.cursos_recomendados || []
  );

  // ── Carga inicial ──
  useEffect(() => {
    if (!datos) cargarResultado();
    else setTimeout(() => setAnimado(true), 120);
  }, []);

  // ── IntersectionObserver para marcar sección activa en sidebar ──
  useEffect(() => {
    if (!datos || !animado) return; // 👈 espera a que el DOM esté listo

    const sectionIds = [
      "mer-resumen",
      "mer-dims",
      "mer-errores",
      "mer-recs",
      "mer-cursos", // 👈 agregado
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        threshold: [0.1, 0.3, 0.5],
        rootMargin: "-10% 0px -40% 0px",
      }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [datos, animado]);

  // ── Carga desde API si no vienen por location.state ──
  const cargarResultado = async () => {
    const id_intento = location.state?.id_intento;

    if (!id_intento) { navigate("/metodos-estudio"); return; }
    try {
      const { data } = await api.get(`/metodosestudio/resultado/${id_intento}`);
      setDatos(normalizarResultados(data));
      setCursosRecomendados(data.cursos_recomendados || []);
    } catch {
      navigate("/metodos-estudio");
    } finally {
      setCargando(false);
      setTimeout(() => setAnimado(true), 120);
    }
  };

  // ── Scroll al hacer click en el sidebar ──
  const irASeccion = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Datos derivados ──
  const {
    puntaje_global = 0,
    nivel_global = "",
    resultados_por_dimension = {},
    errores_detectados = [],
    recomendaciones = {},
    perfil_vark = "",

  } = datos || {};

  const tieneMejoras = errores_detectados.length > 0;
  const tieneRecs = Object.keys(recomendaciones).length > 0;
  const cursosRecomendados_data = datos?.cursos_recomendados || cursosRecomendados;
  const dimOrdenadas = Object.entries(resultados_por_dimension)
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  // Secciones dinámicas del sidebar
  const sidebarSections = [
    { label: "Resumen global", id: "mer-resumen" },
    { label: "Por dimensión", id: "mer-dims" },
    ...(tieneMejoras ? [{ label: "Posibles mejoras", id: "mer-errores" }] : []),
    ...(tieneRecs ? [{ label: "Recomendaciones", id: "mer-recs" }] : []),
    ...(cursosRecomendados_data.length > 0 ? [{ label: "Cursos para ti", id: "mer-cursos" }] : []),
  ];

  return {
    // Estados
    datos,
    cargando,
    animado,
    activeSection,

    // Datos derivados
    puntaje_global,
    nivel_global,
    resultados_por_dimension,
    errores_detectados,
    recomendaciones,
    cursosRecomendados: cursosRecomendados_data,
    perfil_vark,
    tieneMejoras,
    tieneRecs,
    dimOrdenadas,
    sidebarSections,

    // Acciones
    navigate,
    irASeccion,
  };
}