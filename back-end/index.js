// index.js - punto de arranque, enciende el backend
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

// enciende el servidor
app.listen(PORT, () => { // recibe peticiones
  console.log(`Servidor corriendo en puerto ${PORT}`);
});