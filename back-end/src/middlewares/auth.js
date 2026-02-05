import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, "TU_SECRETO_SUPER_SEGURO");
    req.usuario = decoded; // { id_usuario, id_rol }
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado" });
  }
};
