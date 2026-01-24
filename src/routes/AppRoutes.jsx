import { HashRouter, Routes, Route, Link } from 'react-router-dom';

import { Layout } from "../layouts/Layout";
import { LayoutLR } from "../layouts/LayoutLR";
import { LayoutL } from "../layouts/LayoutL";

import { Inicio } from "../pages/Inicio";
import { ManualUsuario } from "../pages/ManualUsuario";
import { Contactanos } from "../pages/Contactanos";
import { Login } from "../pages/Login";
import { Registro } from "../pages/Registro";
import { OlvidarC } from "../pages/OlvidarC";

export function AppRoutes() {
    return (
         <HashRouter>
            <Routes>
                {/* ----------------------- Rutas publicas ------------------------- */}
                
                <Route path="/" element={<Layout><Inicio /></Layout>}/>
                <Route path="/manual-usuario" element={<Layout><ManualUsuario /></Layout>}/>
                <Route path="/contactanos" element={<Layout><Contactanos /></Layout>}/>
                <Route path="/registrarse" element={<LayoutLR><Registro /></LayoutLR>}/>
                <Route path="/login" element={<LayoutL><Login /></LayoutL>}/>
                <Route path="/olvidar-contrasena" element={<LayoutL><OlvidarC /></LayoutL>}/>

                {/* ----------------------- Rutas protegidas ------------------------- */}
            </Routes>
         </HashRouter>
    )
}
