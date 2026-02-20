import { Router } from "express";
import { db } from "../config/db.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router(); 