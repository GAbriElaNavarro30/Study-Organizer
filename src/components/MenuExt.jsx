import "../styles/layout.css";
import { NavLink } from "react-router-dom";

export function MenuExt() {
    return (
        <>
            <nav className="menu-exterior">
                <div className="menu-items">
                    <NavLink to="/" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        Inicio
                    </NavLink>

                    <NavLink to="/manual-usuario" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        Manual Usuario
                    </NavLink>

                    <NavLink to="/contactanos" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        Contáctanos
                    </NavLink>
                </div>

                <div className="menu-eslogan">
                    Organiza tu estudio, cuida tu bienestar
                </div>
            </nav>
        </>
    );
}