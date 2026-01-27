import "../styles/crudAdmin.css";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import { IoAddCircleOutline, IoDocumentTextOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";

export function CrudAdmin() {
    return (
        <div className="contenedor-administrador">
            <div className="contenedor-admin">
                <h1 className="titulo-admin">Administración de Usuarios</h1>

                <div className="barra-superior">
                    <button className="btn btn-nuevo">
                        <IoAddCircleOutline />
                        Nuevo
                    </button>

                    <button className="btn btn-pdf">
                        <IoDocumentTextOutline />
                        Exportar PDF
                    </button>

                    <div className="busqueda-con-icono">
                        <IoSearchOutline className="icono-busqueda" />
                        <input type="text" placeholder="Buscar usuario..." className="input-busqueda" />
                    </div>


                    <div className="mostrar-resultados">
                        <span>Mostrar</span>
                        <select className="select-registros">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <span>resultados</span>
                    </div>
                </div>


                <div className="tabla-contenedor">
                    <table className="tabla-admin">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Teléfono</th>
                                <th>Género</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Juan Pérez</td>
                                <td>juan@email.com</td>
                                <td>Administrador</td>
                                <td>5512345678</td>
                                <td>Hombre</td>
                                <td className="acciones-tabla">
                                    <button className="btn-icono editar">
                                        <IoPencilOutline />
                                    </button>
                                    <button className="btn-icono eliminar">
                                        <IoTrashOutline />
                                    </button>
                                </td>

                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Juan Pérez</td>
                                <td>juan@email.com</td>
                                <td>Administrador</td>
                                <td>5512345678</td>
                                <td>Hombre</td>
                                <td className="acciones-tabla">
                                    <button className="btn-icono editar">
                                        <IoPencilOutline />
                                    </button>
                                    <button className="btn-icono eliminar">
                                        <IoTrashOutline />
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Juan Pérez</td>
                                <td>juan@email.com</td>
                                <td>Administrador</td>
                                <td>5512345678</td>
                                <td>Hombre</td>
                                <td className="acciones-tabla">
                                    <button className="btn-icono editar">
                                        <IoPencilOutline />
                                    </button>
                                    <button className="btn-icono eliminar">
                                        <IoTrashOutline />
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Juan Pérez</td>
                                <td>juan@email.com</td>
                                <td>Administrador</td>
                                <td>5512345678</td>
                                <td>Hombre</td>
                                <td className="acciones-tabla">
                                    <button className="btn-icono editar">
                                        <IoPencilOutline />
                                    </button>
                                    <button className="btn-icono eliminar">
                                        <IoTrashOutline />
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Juan Pérez</td>
                                <td>juan@email.com</td>
                                <td>Administrador</td>
                                <td>5512345678</td>
                                <td>Hombre</td>
                                <td className="acciones-tabla">
                                    <button className="btn-icono editar">
                                        <IoPencilOutline />
                                    </button>
                                    <button className="btn-icono eliminar">
                                        <IoTrashOutline />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="paginacion">
                    <button className="pagina">&laquo;</button>
                    <button className="pagina activa">1</button>
                    <button className="pagina">2</button>
                    <button className="pagina">3</button>
                    <button className="pagina">&raquo;</button>
                </div>
            </div>
        </div>

    );
}
