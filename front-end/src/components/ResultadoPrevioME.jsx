// src/components/ResultadoPrevioME.jsx
import { IoBarChartOutline, IoArrowForwardOutline } from "react-icons/io5";
import "../styles/ResultadoPrevio.css"; // reutiliza los mismos estilos
import { useResultadoPrevioME } from "../hooks/useResultadoPrevioME";

export function ResultadoPrevioME() {
    const { resultado, cargando, verResultados } = useResultadoPrevioME();

    if (cargando || !resultado) return null;

    return (
        <div className="resultado-previo">
            <div className="resultado-previo__header">
                <span className="resultado-previo__dot" />
                <span className="resultado-previo__etiqueta">Resultado guardado</span>
            </div>
            <div className="resultado-previo__body">
                <div className="resultado-previo__info">
                    <div className="resultado-previo__icono">
                        <IoBarChartOutline size={20} />
                    </div>
                    <div>
                        <div className="resultado-previo__titulo">Ya has realizado este test</div>
                        <div className="resultado-previo__sub">
                            Da clic en el botón para consultar tus resultados.
                        </div>
                    </div>
                </div>
                <button className="resultado-previo__btn" onClick={verResultados}>
                    Ver resultados <IoArrowForwardOutline size={13} />
                </button>
            </div>
        </div>
    );
}