import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
    obtenerTareasUsuarios,
    obtenerTareas,
    completarTarea,
    crearTarea,
    actualizarTarea,
    eliminarTarea,
    buscarTarea
} from "../controllers/tareasController.js";

const router = Router();

router.get("/obtener-tareas-usuarios", verificarToken, obtenerTareasUsuarios);
router.get("/obtener-tareas", verificarToken, obtenerTareas);
router.patch("/completar-tarea/:id", verificarToken, completarTarea);
router.post("/crear-tarea", verificarToken, crearTarea);
router.put("/actualizar-tarea/:id", verificarToken, actualizarTarea);
router.delete("/eliminar-tarea/:id", verificarToken, eliminarTarea);
router.get("/buscar-tarea", verificarToken, buscarTarea);

export default router;