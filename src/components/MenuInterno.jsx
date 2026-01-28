import "../styles/menuInterno.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export function MenuInterno() {
    const [open, setOpen] = useState(false);

    const [openLogout, setOpenLogout] = useState(false);

    return (
        <nav className="menu-exterior-interno">
            {/* HAMBURGUESA */}
            <button
                className={`hamburger-interno ${open ? "open-interno" : ""}`}
                onClick={() => setOpen(!open)}
                aria-label="Menú"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* ITEMS */}
            <div className={`menu-items-interno ${open ? "show-interno" : ""}`}>
                <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Bienvenida
                </NavLink>

                <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Estilos Aprendizaje
                </NavLink>

                <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Métodos de Estudio
                </NavLink>

                <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Cursos
                </NavLink>

                <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Cursos Tutor
                </NavLink>

                <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Notas
                </NavLink>

                <NavLink
                    to="/tareas"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Tareas
                </NavLink>

                <NavLink
                    to="/crud"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Crud
                </NavLink>

                <NavLink
                    to="/perfil"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        isActive
                            ? "menu-item-interno active-interno"
                            : "menu-item-interno"
                    }
                >
                    Perfil
                </NavLink>

            </div>

            <div className="menu-eslogan-interno">
                Organiza tu estudio, cuida tu bienestar
            </div>
        </nav>

    );
}