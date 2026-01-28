import "../styles/layoutLR.css";
import logo from '../assets/imagenes/logo-header.png';
import { useNavigate } from "react-router-dom";

export function HeaderExtR() {
    const navigate = useNavigate();

    return (
        <>
            <div className="header-externo-r">
                <div className="logo-r">
                    <img src={logo} alt="" className="logo-header-r" />
                </div>

                <div className="menu-eslogan-r">
                    Organiza tu estudio, cuida tu bienestar
                </div>
            </div>
        </>
    );
}