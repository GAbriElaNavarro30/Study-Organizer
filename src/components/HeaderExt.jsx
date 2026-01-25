import "../styles/layout.css";
import logo from '../assets/imagenes/logo-header.png';
import { useNavigate } from "react-router-dom";

export function HeaderExt() {
  const navigate = useNavigate();
  
  return (
    <>
    <div className="header-externo-e">
        <div className="logo-e">
            <img src={logo} alt="" className="logo-header-e"/>
        </div>

        <div className="botones-e">
            <button className="btn-login-e" onClick={() => navigate("/login")}>Acceder</button>
            <button className="btn-singup-e" onClick={() => navigate("/registrarse")}>Registrarse</button>
        </div>
    </div>
    </>
  );
}