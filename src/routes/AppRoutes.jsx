import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from "../layouts/Layout";

import { Inicio } from "../pages/Inicio";
import { ManualUsuario } from "../pages/ManualUsuario";
import { Contactanos } from "../pages/Contactanos";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ----------------------- Rutas publicas ------------------------- */}
                
                <Route path="/" element={<Layout><Inicio /></Layout>}/>
                <Route path="/manual-usuario" element={<Layout><ManualUsuario /></Layout>}/>
                <Route path="/contactanos" element={<Layout><Contactanos /></Layout>}/>

                {/* ----------------------- Rutas protegidas ------------------------- */}
            </Routes>
        </BrowserRouter>
    )
}
