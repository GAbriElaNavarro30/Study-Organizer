import "../styles/layout.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export function MenuExt() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="menu-exterior">
            {/* HAMBURGUESA */}
            <button
                className={`hamburger ${open ? "open" : ""}`}
                onClick={() => setOpen(!open)}
                aria-label="Menú"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* ITEMS */}
            <div className={`menu-items ${open ? "show" : ""}`}>
                <NavLink to="/" onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    Inicio
                </NavLink>

                <NavLink to="/manual-usuario" onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    Manual Usuario
                </NavLink>

                <NavLink to="/contactanos" onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    Contáctanos
                </NavLink>
            </div>

            <div className="menu-eslogan">
                Organiza tu estudio, cuida tu bienestar
            </div>
        </nav>
    );
}