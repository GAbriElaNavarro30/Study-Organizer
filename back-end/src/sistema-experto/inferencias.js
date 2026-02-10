export const inferir = (hechos, reglas) => {
  const conclusiones = [];

  for (const regla of reglas) {
    if (regla.si(hechos)) {
      conclusiones.push(regla.entonces(hechos));
    }
  }

  return conclusiones;
};
