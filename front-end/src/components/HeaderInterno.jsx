import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/imagenes/logo-header.png";
import { IoPersonCircleOutline, IoLogOutOutline } from "react-icons/io5";
import "../styles/layoutInicio.css";

import { ModalCerrarSesion } from "./ModalCerrarSesion";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function HeaderInterno() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [openLogout, setOpenLogout] = useState(false);

    const menuRef = useRef(null);
    const navigate = useNavigate();

    const { logout } = useContext(AuthContext);


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

    /* Navegar y cerrar menú */
    const handleNavigate = (ruta) => {
        setMenuAbierto(false);
        navigate(ruta);
    };

    /* Confirmar cierre de sesión */
    const handleConfirmLogout = async () => {
        setOpenLogout(false);
        setMenuAbierto(false);

        await logout();   // backend + context
        navigate("/login");
    };


    return (
        <div className="header-interno">
            <div className="logotipo-interno">
                <img src={logo} alt="Logo" className="logo-header" />
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
                        <button onClick={() => handleNavigate("/perfil")}>
                            <IoPersonCircleOutline className="icono-menu" />
                            Perfil
                        </button>

                        <button
                            className="cerrar-sesion"
                            onClick={() => {
                                setMenuAbierto(false);
                                setOpenLogout(true);
                            }}
                        >
                            <IoLogOutOutline className="icono-menu" />
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL CERRAR SESIÓN */}
            <ModalCerrarSesion
                isOpen={openLogout}
                onClose={() => setOpenLogout(false)}
                onConfirm={handleConfirmLogout}
            />
        </div>
    );
}

