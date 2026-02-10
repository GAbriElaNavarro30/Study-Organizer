export const reglasDescripcion = [
  {
    si: (h) => h.hayLenguajeInapropiado,
    entonces: (h) =>
      `La descripción contiene palabras no permitidas: ${h.antisonantesDetectados.join(", ")}`
  },
  {
    si: (h) => h.cantidadAntisonantes >= 3,
    entonces: () =>
      "La descripción contiene lenguaje ofensivo excesivo"
  }
];