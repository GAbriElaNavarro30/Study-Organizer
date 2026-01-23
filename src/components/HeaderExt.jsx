import "../styles/layout.css";
import logo from '../assets/imagenes/logo-header.png';

export function HeaderExt() {
  return (
    <>
    <div className="header-externo">
        <div className="logo">
            <img src={logo} alt="" className="logo-header"/>
        </div>

        <div className="botones">
            <button className="btn-login">Acceder</button>
            <button className="btn-singup">Registrarse</button>
        </div>
    </div>
    </>
  );
}