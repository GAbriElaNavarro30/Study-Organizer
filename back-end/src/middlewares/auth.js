import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usar variable de entorno
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado" });
  }
};
