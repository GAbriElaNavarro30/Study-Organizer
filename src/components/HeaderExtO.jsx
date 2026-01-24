import logo from '../assets/imagenes/logo-header.png';
import "../styles/layoutO.css";
import { useNavigate } from "react-router-dom";

export function HeaderExtO() {
    const navigate = useNavigate();
    
    return (
        <div className="header-externo-o">
            <div className="logo-o">
                <img src={logo} alt="" className="logo-header-o" />
            </div>

            <div className="menu-eslogan-o">
                Organiza tu estudio, cuida tu bienestar
            </div>

            <div className="espacio-login-o">
                <span>¿Ya tienes una cuenta?</span>
                <button className="btn-login-o" onClick={() => navigate("/login")}>Acceder</button>
            </div>
        </div>
    );
}