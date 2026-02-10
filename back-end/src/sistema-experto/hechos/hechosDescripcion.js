import { palabrasAntisonantes } from "../conocimiento/palabrasAntisonantes.js";

export const generarHechosDescripcion = (descripcion = "") => {
  const texto = descripcion.toLowerCase();

  const detectadas = palabrasAntisonantes.filter(p =>
    texto.includes(p)
  );

  return {
    descripcionVacia: descripcion.trim() === "",
    antisonantesDetectados: detectadas,
    cantidadAntisonantes: detectadas.length,
    hayLenguajeInapropiado: detectadas.length > 0
  };
};
