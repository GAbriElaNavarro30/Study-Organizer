// components/BannerApoyoEmocional.jsx
import { IoHeartOutline } from "react-icons/io5";
import "../styles/bannerApoyo.css"; // ← o donde tengas tus estilos

export function BannerApoyoEmocional({ visible }) {
    if (!visible) return null;

    return (
        <div className="banner-apoyo">
            <div className="banner-apoyo-icono">
                <IoHeartOutline size={28} color="#e11d48" />
            </div>
            <div className="banner-apoyo-texto">
                <p className="banner-apoyo-titulo">
                    Hemos notado que estos días no han sido fáciles.
                </p>
                <p className="banner-apoyo-body">
                    Hablar con un especialista puede ayudarte a sentirte mejor.
                    No tienes que pasar por esto solo.
                </p>
            </div>
        </div>
    );
}