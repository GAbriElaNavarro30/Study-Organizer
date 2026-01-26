import { HashRouter, Routes, Route, Link } from 'react-router-dom';

import { Layout } from "../layouts/Layout";
import { LayoutLR } from "../layouts/LayoutLR";
import { LayoutL } from "../layouts/LayoutL";
import { LayoutO } from "../layouts/LayoutO";
import { LayoutInterno } from "../layouts/LayoutInterno";

import { Inicio } from "../pages/Inicio";
import { ManualUsuario } from "../pages/ManualUsuario";
import { Contactanos } from "../pages/Contactanos";
import { Login } from "../pages/Login";
import { Registro } from "../pages/Registro";
import { OlvidarC } from "../pages/OlvidarC";
import { RecuperarC } from "../pages/RecuperarC";
import { CrudAdmin } from "../pages/CrudAdmin";
import { Perfil } from "../pages/Perfil";

export function AppRoutes() {
    return (
        <HashRouter>
            <Routes>
                {/* ----------------------- Rutas publicas ------------------------- */}

                <Route path="/" element={<Layout><Inicio /></Layout>} />
                <Route path="/manual-usuario" element={<Layout><ManualUsuario /></Layout>} />
                <Route path="/contactanos" element={<Layout><Contactanos /></Layout>} />
                <Route path="/registrarse" element={<LayoutLR><Registro /></LayoutLR>} />
                <Route path="/login" element={<LayoutL><Login /></LayoutL>} />
                <Route path="/olvidar-contrasena" element={<LayoutO><OlvidarC /></LayoutO>} />
                <Route path="/recuperar-contrasena" element={<LayoutO><RecuperarC /></LayoutO>} />

                {/* ----------------------- Rutas protegidas ------------------------- */}
                <Route path="/crud-administrador" element={<LayoutInterno><CrudAdmin /></LayoutInterno>} />
                <Route path="/perfil" element={<LayoutInterno><Perfil /></LayoutInterno>} />

            </Routes>
        </HashRouter>
    )
}
