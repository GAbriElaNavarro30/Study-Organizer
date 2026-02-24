import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoBarChartOutline, IoArrowForwardOutline } from "react-icons/io5";
import "../styles/ResultadoPrevio.css";

export function ResultadoPrevio() {
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verificar = async () => {
            try {
                const res = await fetch("http://localhost:3000/estilosaprendizaje/resultado-guardado", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setResultado(data);
                }
            } catch {
                setResultado(null);
            } finally {
                setCargando(false);
            }
        };
        verificar();
    }, []);

    if (cargando || !resultado) return null;

    const verResultados = () => {
        // Pasamos el resultado como state igual que cuando se termina el test
        navigate("/resultados-test-estilos-aprendizaje", { state: resultado });
    };

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
                            {/*Tu perfil dominante es <strong>{resultado.perfil_dominante}</strong>. */}
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