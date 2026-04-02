// src/hooks/useMetodosEstudio.js
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NAV_SECTIONS = [
    { label: "Introducción", id: "mei-intro" },
    { label: "¿Qué se evalúa?", id: "mei-evalua" },
    { label: "¿Cómo funciona?", id: "mei-funciona" },
    { label: "Errores comunes", id: "mei-errores" },
    { label: "Recomendaciones", id: "mei-recs" },
    { label: "Comenzar", id: "mei-cta" },
];

export function useMetodosEstudio() {
    const navigate = useNavigate();
    const mobileRef = useRef(null);
    const scrollingRef = useRef(false);

    const [activeSection, setActiveSection] = useState(0);
    const [animado, setAnimado] = useState(false);

    // ── Animación de entrada y scroll al top ──
    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => setAnimado(true), 80);
    }, []);

    // ── IntersectionObserver — detecta qué sección está visible ──
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

    // ── Centra el item activo en el nav móvil ──
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

    // ── Scroll programático al hacer click en sidebar o nav móvil ──
    const irASeccion = (index) => {
        scrollingRef.current = true;
        setActiveSection(index);
        scrollMobileNav(index);
        document.getElementById(NAV_SECTIONS[index].id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
        // Liberar bloqueo cuando termina el scroll
        setTimeout(() => { scrollingRef.current = false; }, 900);
    };

    return {
        // Refs
        mobileRef,

        // Estados
        activeSection,
        animado,

        // Constantes
        NAV_SECTIONS,

        // Acciones
        navigate,
        irASeccion,
    };
}