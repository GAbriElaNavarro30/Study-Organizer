import "../styles/layout.css";
import logo from '../assets/imagenes/logo-header.png';
import { useNavigate } from "react-router-dom";

export function HeaderExt() {
  const navigate = useNavigate();
  
  return (
    <>
    <div className="header-externo">
        <div className="logo">
            <img src={logo} alt="" className="logo-header"/>
        </div>

        <div className="botones">
            <button className="btn-login" onClick={() => navigate("/login")}>Acceder</button>
            <button className="btn-singup" onClick={() => navigate("/registrarse")}>Registrarse</button>
        </div>
    </div>
    </>
  );
}