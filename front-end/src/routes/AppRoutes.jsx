import { HashRouter, Routes, Route } from 'react-router-dom';

import { Layout } from "../layouts/Layout";
import { LayoutLR } from "../layouts/LayoutLR";
import { LayoutL } from "../layouts/LayoutL";
import { LayoutO } from "../layouts/LayoutO";
import { LayoutInterno } from "../layouts/LayoutInterno";
import { LayoutNotas } from "../layouts/LayoutNotas";

import { Inicio } from "../pages/Inicio";
import { ManualUsuario } from "../pages/ManualUsuario";
import { Contactanos } from "../pages/Contactanos";
import { Login } from "../pages/Login";
import { Registro } from "../pages/Registro";
import { OlvidarC } from "../pages/OlvidarC";
import { RecuperarC } from "../pages/RecuperarC";
import { CrudAdmin } from "../pages/CrudAdmin";
import { Perfil } from "../pages/Perfil";
import { Tareas } from "../pages/Tareas";
import { Notas } from "../pages/Notas";
import { EditorNota } from "../pages/EditorNota";
import { Bienvenida } from "../pages/Bienvenida";
import { Dashboard } from "../pages/Dashboard";
import { EstilosAprendizaje } from "../pages/EstilosAprendizaje";
import { MetodosEstudio } from "../pages/MetodosEstudio";
import { CursosE } from "../pages/CursosE";
import { CursosT } from "../pages/CursosT";
import { TestEA } from "../pages/TestEA";
import { ResultadosTestEA } from "../pages/ResultadosTestEA";

import { PrivateRoute } from "../components/PrivateRoute";

export function AppRoutes() {
    return (
        <HashRouter>
            <Routes>

                {/* ===================== RUTAS PÚBLICAS ===================== */}
                <Route path="/" element={<Layout><Inicio /></Layout>} />
                <Route path="/manual-usuario" element={<Layout><ManualUsuario /></Layout>} />
                <Route path="/contactanos" element={<Layout><Contactanos /></Layout>} />
                <Route path="/registrarse" element={<LayoutLR><Registro /></LayoutLR>} />
                <Route path="/login" element={<LayoutL><Login /></LayoutL>} />
                <Route path="/olvidar-contrasena" element={<LayoutO><OlvidarC /></LayoutO>} />
                <Route path="/recuperar-contrasena" element={<LayoutO><RecuperarC /></LayoutO>} />

                {/* ===================== RUTAS PROTEGIDAS ===================== */}
                <Route path="/home" element={
                    <PrivateRoute>
                        <LayoutInterno>
                            <Bienvenida />
                        </LayoutInterno>
                    </PrivateRoute>
                }
                />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <LayoutInterno>
                            <Dashboard />
                        </LayoutInterno>
                    </PrivateRoute>
                }
                />

                <Route path="/perfil" element={
                    <PrivateRoute>
                        <LayoutInterno>
                            <Perfil />
                        </LayoutInterno>
                    </PrivateRoute>
                }
                />

                <Route path="/crud"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CrudAdmin />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route path="/crud-administrador"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CrudAdmin />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route path="/tareas" element={
                    <PrivateRoute>
                        <LayoutInterno>
                            <Tareas />
                        </LayoutInterno>
                    </PrivateRoute>
                }
                />

                <Route path="/notas" element={
                    <PrivateRoute>
                        <LayoutInterno>
                            <Notas />
                        </LayoutInterno>
                    </PrivateRoute>
                }
                />

                <Route
                    path="/editor-nota"
                    element={
                        <PrivateRoute>
                            <LayoutNotas>
                                <EditorNota />
                            </LayoutNotas>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/estilos-aprendizaje"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <EstilosAprendizaje />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/test-estilos-aprendizaje"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <TestEA />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/resultados-test-estilos-aprendizaje"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <ResultadosTestEA />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/metodos-estudio"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <MetodosEstudio />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/cursos"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CursosE />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/cursos-tutor"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CursosT />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

            </Routes>
        </HashRouter>
    );
}
