import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const token = req.cookies.token; // busca el token en la cookies de la peticion y la lee

  // ¿existe token?
  if (!token) {
    return res.status(401).json({ mensaje: "No autenticado" }); // no ha iniiado sesion
  }

  // si existe, pero, ¿es valido?
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifica qie es valido y fue creado
    req.usuario = decoded; // guarda datos del usuario para usarse en las rutas
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado" });
  }
};