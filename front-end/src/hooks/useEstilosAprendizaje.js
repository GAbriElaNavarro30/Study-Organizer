// src/hooks/useEstilosAprendizaje.js
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    IoEyeOutline,
    IoHeadsetOutline,
    IoBookOutline,
    IoHandLeftOutline,
} from "react-icons/io5";

// ─── DATOS ────────────────────────────────────────────────────────────────────

export const VARK_DATA = {
    V: {
        name: "Visual",
        icon: IoEyeOutline,
        desc: "Aprenden mejor a través de imágenes, diagramas, gráficos y otros elementos visuales. El uso de presentaciones visuales, mapas conceptuales y videos es altamente beneficioso para estos estudiantes. Son capaces de recordar y comprender mejor la información cuando pueden verla representada de manera gráfica.",
        barColor: "#4A90C4",
    },
    A: {
        name: "Auditivo",
        icon: IoHeadsetOutline,
        desc: "Aprenden mejor mediante el sentido del oído. Para ellos, las explicaciones verbales, las discusiones y las lecturas en voz alta son herramientas valiosas. También pueden beneficiarse del uso de grabaciones de audio y la repetición verbal de la información.",
        barColor: "#5A8FB8",
    },
    R: {
        name: "Lectura/Escritura",
        icon: IoBookOutline,
        desc: "Aprenden mejor a través de la lectura y la escritura. Toman notas detalladas, subrayan la información clave y realizan resúmenes para procesar y retener el contenido. Los materiales escritos, como libros de texto y apuntes, son fundamentales para su aprendizaje.",
        barColor: "#4A9E70",
    },
    K: {
        name: "Kinestésico",
        icon: IoHandLeftOutline,
        desc: "Aprenden mejor a través del movimiento y la práctica práctica. Necesitan participar físicamente en la experiencia de aprendizaje, realizar actividades prácticas, experimentar y tocar objetos. El aprendizaje basado en la experiencia y el trabajo práctico es esencial para estos estudiantes.",
        barColor: "#B8842A",
    },
};

export const NAV_SECTIONS = [
    { label: "¿Qué son los estilos?", id: "seccion-fundamentos" },
    { label: "El Modelo VARK",        id: "seccion-modelo" },
    { label: "Historia",              id: "seccion-historia" },
    { label: "Las 4 modalidades",     id: "seccion-modalidades" },
    { label: "Sobre el test",         id: "seccion-test" },
];

// ─── HOOK ────────────────────────────────────────────────────────────────────

export function useEstilosAprendizaje() {
    const navigate = useNavigate();

    const [phase, setPhase]               = useState("info");
    const [muted, setMuted]               = useState(true);
    const [activeSection, setActiveSection] = useState(0);

    const iframeRef   = useRef(null);
    const scrollingRef = useRef(false);
    const mobileNavRef = useRef(null);

    // ─── Scroll al inicio al montar ───
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ─── IntersectionObserver para resaltar sección activa ───
    useEffect(() => {
        if (phase !== "info") return;
        const observers = [];

        NAV_SECTIONS.forEach((section, index) => {
            const el = document.getElementById(section.id);
            if (!el) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !scrollingRef.current) {
                            setActiveSection(index);
                            scrollMobileNavToIndex(index);
                        }
                    });
                },
                { rootMargin: "-15% 0px -55% 0px", threshold: 0 }
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, [phase]);

    // ─── Centrar el ítem activo en la nav móvil ───
    const scrollMobileNavToIndex = (index) => {
        if (!mobileNavRef.current) return;
        const navEl = mobileNavRef.current;
        const items = navEl.querySelectorAll(".mobile-nav-item");
        if (items[index]) {
            const item = items[index];
            navEl.scrollTo({
                left: item.offsetLeft - navEl.offsetWidth / 2 + item.offsetWidth / 2,
                behavior: "smooth",
            });
        }
    };

    // ─── Silenciar/activar música ───
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

    // ─── Navegar a una sección con scroll suave ───
    const irASeccion = (index) => {
        scrollingRef.current = true;
        setActiveSection(index);
        scrollMobileNavToIndex(index);
        const el = document.getElementById(NAV_SECTIONS[index].id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => { scrollingRef.current = false; }, 900);
    };

    // ─── Ir al test ───
    const iniciarTest = () => {
        navigate("/test-estilos-aprendizaje");
    };

    return {
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
    };
}