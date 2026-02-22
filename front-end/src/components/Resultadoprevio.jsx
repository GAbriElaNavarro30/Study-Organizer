// ResultadoPrevio.jsx
// Coloca este archivo en: src/components/ResultadoPrevio.jsx
// CSS en: src/styles/ResultadoPrevio.css

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoBarChartOutline, IoArrowForwardOutline } from "react-icons/io5";
import "../styles/ResultadoPrevio.css";

export function ResultadoPrevio() {
    const [tieneResultado, setTieneResultado] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verificar = async () => {
            try {
                const res = await fetch("http://localhost:3000/estilosaprendizaje/resultado", {
                    credentials: "include",
                });
                setTieneResultado(res.ok);
            } catch {
                setTieneResultado(false);
            }
        };
        verificar();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!tieneResultado) return null;

    return (
        <div className="resultado-previo">

            {/* Banda superior */}
            <div className="resultado-previo__header">
                <span className="resultado-previo__dot" />
                <span className="resultado-previo__etiqueta">Resultado guardado</span>
            </div>

            {/* Cuerpo */}
            <div className="resultado-previo__body">
                <div className="resultado-previo__info">
                    <div className="resultado-previo__icono">
                        <IoBarChartOutline size={20} />
                    </div>
                    <div>
                        <div className="resultado-previo__titulo">Ya has realizado este test</div>
                        <div className="resultado-previo__sub">Da clic en el botón para consultar tus resultados.</div>
                    </div>
                </div>

                <button
                    className="resultado-previo__btn"
                    onClick={() => navigate("/resultados-test-estilos-aprendizaje")}
                >
                    Resultados <IoArrowForwardOutline size={13} />
                </button>
            </div>

        </div>
    );
}