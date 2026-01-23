import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from "../layouts/Layout";

import { Inicio } from "../pages/Inicio";
import { ManualUsuario } from "../pages/ManualUsuario";
import { Contactanos } from "../pages/Contactanos";
import { Login } from "../pages/Login";
import { Registro } from "../pages/Registro";

export function AppRoutes() {
    return (
         <HashRouter>
            <Routes>
                {/* ----------------------- Rutas publicas ------------------------- */}
                
                <Route path="/" element={<Layout><Inicio /></Layout>}/>
                <Route path="/manual-usuario" element={<Layout><ManualUsuario /></Layout>}/>
                <Route path="/contactanos" element={<Layout><Contactanos /></Layout>}/>
                <Route path="/login" element={<Layout><Login /></Layout>}/>
                <Route path="/registrarse" element={<Layout><Registro /></Layout>}/>

                {/* ----------------------- Rutas protegidas ------------------------- */}
            </Routes>
         </HashRouter>
    )
}
