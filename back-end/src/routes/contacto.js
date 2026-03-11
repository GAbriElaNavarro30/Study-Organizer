import { Router } from "express";
import { enviarMensaje } from "../controllers/contactoController.js";

const router = Router();

router.post("/contactanos", enviarMensaje);

export default router;