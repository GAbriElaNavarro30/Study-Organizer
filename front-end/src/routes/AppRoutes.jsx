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
import { PreguntasFrecuentes } from "../pages/PreguntasFrecuentes";
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
import { EditorCurso } from "../pages/EditorCurso";
import { CursoDetalle } from "../pages/CursoDetalle";
import { CursoVisor } from "../pages/CursoVisor";
import { CursoVisorTutor } from "../pages/CursoVisorTutor";
import { CursoResultado } from "../pages/CursoResultado.jsx";
import { HistorialResultadoCurso } from "../pages/HistorialResultadoCurso.jsx";
import { HistorialResultadoEstudianteCurso } from "../pages/HistorialResultadoEstudianteCurso.jsx";
import { TestEA } from "../pages/TestEA";
import { ResultadosTestEA } from "../pages/ResultadosTestEA";
import { CorreoAlternativo } from "../pages/CorreoAlternativo";
import { MetodosEstudioTest } from "../pages/MetodosEstudioTest";
import { MetodosEstudioResultado } from "../pages/MetodosEstudioResultado";
import { MetodosEstudioHistorial } from "../pages/MetodosEstudioHistorial";


import { PrivateRoute } from "../components/PrivateRoute";

export function AppRoutes() {
    return (
        <HashRouter>
            <Routes>

                {/* ===================== RUTAS PÚBLICAS ===================== */}
                <Route path="/" element={<Layout><Inicio /></Layout>} />
                <Route path="/manual-usuario" element={<Layout><ManualUsuario /></Layout>} />
                <Route path="/contactanos" element={<Layout><Contactanos /></Layout>} />
                <Route path="/preguntas-frecuentes" element={<Layout><PreguntasFrecuentes /></Layout>} />
                <Route path="/registrarse" element={<LayoutLR><Registro /></LayoutLR>} />
                <Route path="/login" element={<LayoutL><Login /></LayoutL>} />
                <Route path="/olvidar-contrasena" element={<LayoutO><OlvidarC /></LayoutO>} />
                <Route path="/correo-alternativo" element={<LayoutO><CorreoAlternativo /></LayoutO>} />
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

                <Route
                    path="/editor-curso"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <EditorCurso />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/cursos-detalle"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CursoDetalle />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/cursos-visor"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CursoVisor />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/cursos-visor-tutor"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CursoVisorTutor />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/cursos/resultado"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <CursoResultado />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/historial-resultados-estudiante"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <HistorialResultadoCurso />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/historial-resultados-estudiante-curso"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <HistorialResultadoEstudianteCurso />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/test-metodos-estudio"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <MetodosEstudioTest />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/resultado-metodos-estudio/"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <MetodosEstudioResultado />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/historial-metodos-estudio"
                    element={
                        <PrivateRoute>
                            <LayoutInterno>
                                <MetodosEstudioHistorial />
                            </LayoutInterno>
                        </PrivateRoute>
                    }
                />

            </Routes>
        </HashRouter>
    );
}
