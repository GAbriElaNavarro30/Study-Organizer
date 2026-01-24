import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/imagenes/logo-header.png";
import { IoPersonCircleOutline, IoLogOutOutline } from "react-icons/io5";

export function HeaderInterno() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    /* Cerrar menú al hacer click fuera */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="header-interno">
            <div className="logotipo-interno">
                <img src={logo} alt="" className="logo-header" />
            </div>

            <div className="eslogan-interno">
                Organiza tu estudio, cuida tu bienestar
            </div>

            <div className="info-usuario" ref={menuRef}>
                <span className="nombre-usuario">
                    Gabriela del Goretti Navarro Basurto
                </span>

                <div
                    className="avatar-usuario"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    <img src="/avatar-default.png" alt="Foto de perfil" />
                </div>

                {menuAbierto && (
                    <div className="menu-usuario">
                        <button onClick={() => navigate("/perfil")}>
                            <IoPersonCircleOutline className="icono-menu" />
                            Perfil
                        </button>

                        <button
                            className="cerrar-sesion"
                            onClick={() => {
                                setMenuAbierto(false);
                                navigate("/login");
                            }}
                        >
                            <IoLogOutOutline className="icono-menu" />
                            Cerrar sesión
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}