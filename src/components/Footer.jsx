import "../styles/layout.css";
import logo from "../assets/imagenes/logotipo-footer.png";
import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">

                {/* LOGO */}
                <div className="footer-logo">
                    <img src={logo} alt="Study Organizer" />
                    <p>
                        Organiza tu estudio,<br />
                        cuida tu bienestar
                    </p>
                </div>

                {/* LINKS */}
                <div className="footer-links">
                    <h4>Plataforma</h4>
                    <Link to="/">Inicio</Link>
                    <Link to="/manual-usuario">Manual de Usuario</Link>
                    <Link to="/contactanos">Contáctanos</Link>
                </div>

                <div className="footer-links">
                    <h4>SOCIAL</h4>
                    <p>Gmail:</p>
                    <a href="mailto:studyorganizer.contactosoporte@gmail.com">
                        studyorganizer.contactosoporte@gmail.com
                    </a>
                </div>

                {/* INFO */}
                <div className="footer-info">
                    <h4>Study Organizer</h4>
                    <p>
                        Plataforma web diseñada para ayudar a los estudiantes
                        a organizar su tiempo, actividades y bienestar académico.
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} Study Organizer · Todos los derechos reservados
            </div>
        </footer>
    );
}
