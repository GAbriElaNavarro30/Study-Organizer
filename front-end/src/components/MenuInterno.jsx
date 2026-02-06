import "../styles/menuInterno.css";
import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function MenuInterno() {
    const [open, setOpen] = useState(false);

    const { usuario } = useContext(AuthContext);

    // Mientras se carga la sesión, no mostrar menú
    if (!usuario) return null;

    // MENÚS SEGÚN ROL
    const menusPorRol = {
        1: [ // ADMIN
            { to: "/home", label: "Bienvenida" },
            { to: "/crud", label: "Crud" },
            { to: "/perfil", label: "Perfil" },
        ],

        2: [ // ESTUDIANTE
            { to: "/dashboard", label: "Dashboard" },
            { to: "", label: "Estilos Aprendizaje" },
            { to: "", label: "Métodos de Estudio" },
            { to: "", label: "Cursos" },
            { to: "/notas", label: "Notas" },
            { to: "/tareas", label: "Tareas" },
            { to: "/perfil", label: "Perfil" },
        ],

        3: [ // TUTOR
            { to: "/home", label: "Bienvenida" },
            { to: "", label: "Cursos Tutor" },
            { to: "/perfil", label: "Perfil" },
        ],
    };

    // MENÚ ACTUAL SEGÚN EL ROL DEL USUARIO
    const menuActual = menusPorRol[usuario.rol] || [];

    return (
        <nav className="menu-exterior-interno">

            {/* BOTÓN HAMBURGUESA */}
            <button
                className={`hamburger-interno ${open ? "open-interno" : ""}`}
                onClick={() => setOpen(!open)}
                aria-label="Menú"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* ITEMS DEL MENÚ (DINÁMICOS) */}
            <div className={`menu-items-interno ${open ? "show-interno" : ""}`}>
                {menuActual.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                            isActive
                                ? "menu-item-interno active-interno"
                                : "menu-item-interno"
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>

            <div className="menu-eslogan-interno">
                Organiza tu estudio, cuida tu bienestar
            </div>
        </nav>
    );
}