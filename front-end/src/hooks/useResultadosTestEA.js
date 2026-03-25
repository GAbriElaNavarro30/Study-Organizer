// src/hooks/useResultadosTestEA.js
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";

// ─── CONFIGURACIÓN POR PERFIL ─────────────────────────────────────────────────
import {
    IoEyeOutline, IoHeadsetOutline, IoBookOutline, IoHandLeftOutline,
} from "react-icons/io5";

export const PERFIL_CONFIG = {
    V: { nombre: "Visual",            Icon: IoEyeOutline,     color: "#1C5A90", colorLight: "#D6E8F5", colorMid: "#3A7CB8", cssKey: "v",
         descripcion: "Aprendes mejor cuando la información se presenta de forma visual. Los diagramas, mapas mentales, colores e imágenes son tus mejores aliados para comprender y retener conceptos." },
    A: { nombre: "Auditivo",          Icon: IoHeadsetOutline, color: "#3A6A8C", colorLight: "#D0E3F5", colorMid: "#5A8FB8", cssKey: "a",
         descripcion: "Procesas mejor la información a través del sonido y el habla. Las explicaciones orales, debates y escuchar contenido te permite conectar y recordar ideas con facilidad." },
    R: { nombre: "Lector / Escritor", Icon: IoBookOutline,    color: "#1E6A42", colorLight: "#C8E8CE", colorMid: "#3D8A5E", cssKey: "r",
         descripcion: "Tu fortaleza está en el texto. Leer, tomar notas y escribir resúmenes son tus herramientas naturales para organizar y profundizar en cualquier tema." },
    K: { nombre: "Kinestésico",       Icon: IoHandLeftOutline, color: "#7A4A0A", colorLight: "#EDD8B0", colorMid: "#A06C1A", cssKey: "k",
         descripcion: "Aprendes con la experiencia directa. La práctica, los ejercicios reales y el movimiento te permiten comprender conceptos de forma profunda y duradera." },
};

export const NOMBRES_PERFILES = {
    V: "Visual", A: "Auditivo", R: "Lector / Escritor", K: "Kinestésico",
    VA: "Visual — Auditivo", VR: "Visual — Lector", VK: "Visual — Kinestésico",
    AR: "Auditivo — Lector", AK: "Auditivo — Kinestésico", KR: "Kinestésico — Lector",
    VAR: "Visual · Auditivo · Lector", VAK: "Visual · Auditivo · Kinestésico",
    VRK: "Visual · Lector · Kinestésico", ARK: "Auditivo · Lector · Kinestésico",
    VARK: "Multimodal",
};

export const NAV_SECTIONS = [
    { label: "Tu perfil",       id: "sec-perfil" },
    { label: "Puntajes",        id: "sec-puntajes" },
    { label: "Desglose",        id: "sec-desglose" },
    { label: "Recomendaciones", id: "sec-recomendaciones" },
    { label: "Historial",       id: "sec-historial" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getLetras(perfil) {
    return perfil.split("").filter((l) => ["V", "A", "R", "K"].includes(l));
}

export function getPrimary(letras) {
    return PERFIL_CONFIG[letras[0]] || PERFIL_CONFIG["V"];
}

// ─── HOOK ────────────────────────────────────────────────────────────────────

export function useResultadosTestEA() {
    const location = useLocation();
    const navigate = useNavigate();

    const [datos, setDatos]                 = useState(null);
    const [cargando, setCargando]           = useState(true);
    const [animado, setAnimado]             = useState(false);
    const [activeSection, setActiveSection] = useState(0);
    const [historial, setHistorial]         = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(true);

    // ── Cargar datos ──
    useEffect(() => {
        // Caso 1: vienen por navigate() con state (justo después de terminar el test)
        if (location.state?.perfil_dominante) {
            setDatos(location.state);
            setCargando(false);
            setTimeout(() => setAnimado(true), 120);
            return;
        }

        // Caso 2: el usuario entra directo a la página — carga el resultado guardado
        const cargar = async () => {
            try {
                const { data } = await api.get("/estilosaprendizaje/resultado-guardado");
                setDatos({
                    perfil_dominante: data.perfil_dominante,
                    puntajes:         data.puntajes,
                    porcentajes:      data.porcentajes,
                    recomendaciones:  data.recomendaciones || {},
                });
            } catch {
                setDatos(null);
            } finally {
                setCargando(false);
                setTimeout(() => setAnimado(true), 120);
            }
        };
        cargar();
    }, [location.state]);

    // ── Cargar historial ──
    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                const { data } = await api.get("/estilosaprendizaje/historial");
                setHistorial(data.historial || []);
            } catch {
                setHistorial([]);
            } finally {
                setCargandoHistorial(false);
            }
        };
        cargarHistorial();
    }, []);

    // ── IntersectionObserver para nav activo ──
    useEffect(() => {
        if (!animado) return;
        const observers = [];
        NAV_SECTIONS.forEach((s, i) => {
            const el = document.getElementById(s.id);
            if (!el) return;
            const obs = new IntersectionObserver(
                (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(i); }); },
                { rootMargin: "-10% 0px -55% 0px", threshold: 0 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, [animado]);

    // ── Scroll al inicio al montar ──
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // ── Navegación entre secciones ──
    const irA = (i) => {
        setActiveSection(i);
        document.getElementById(NAV_SECTIONS[i].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // ── Derivados calculados a partir de datos ──
    const derivados = datos ? (() => {
        const { perfil_dominante, puntajes, porcentajes = {}, recomendaciones } = datos;
        const letras       = getLetras(perfil_dominante);
        const primary      = getPrimary(letras);
        const nombrePerfil = NOMBRES_PERFILES[perfil_dominante] || "Multimodal";
        const esMultimodal = perfil_dominante === "VARK";
        const tieneRecs    = recomendaciones && typeof recomendaciones === "object" && Object.keys(recomendaciones).length > 0;
        // Siempre muestra historial; oculta recomendaciones si no las hay
        const navVisible   = NAV_SECTIONS.filter(s =>
            s.id !== "sec-recomendaciones" || tieneRecs
        );
        return { perfil_dominante, puntajes, porcentajes, recomendaciones, letras, primary, nombrePerfil, esMultimodal, tieneRecs, navVisible };
    })() : null;

    return {
        // Estado
        datos,
        cargando,
        animado,
        activeSection,
        historial,
        cargandoHistorial,

        // Derivados (null si no hay datos)
        ...derivados,

        // Navegación
        navigate,
        irA,
    };
}