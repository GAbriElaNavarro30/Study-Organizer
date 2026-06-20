// ============== MOCKS PRIMERO ==============
import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockSave = jest.fn().mockResolvedValue({ insertId: 1 });

jest.unstable_mockModule('mysql2/promise', () => ({
    default: {
        createPool: jest.fn().mockReturnValue({
            query: mockQuery,
            getConnection: jest.fn().mockResolvedValue({
                release: jest.fn()
            })
        })
    }
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        genSalt: jest.fn().mockResolvedValue('salt'),
        hash: jest.fn().mockResolvedValue('hashedPassword'),
        compare: jest.fn().mockResolvedValue(false)
    }
}));

jest.unstable_mockModule('../models/Usuario.js', () => ({
    Usuario: jest.fn().mockImplementation(() => ({
        save: mockSave
    }))
}));

jest.unstable_mockModule('../config/cloudinary.js', () => ({
    default: {}
}));

jest.unstable_mockModule('../config/mailer.js', () => ({
    transporter: {
        sendMail: jest.fn().mockResolvedValue(true)
    }
}));

// ============== IMPORTS DINÁMICOS ==============
const { altaUsuario, obtenerUsuarios, buscarUsuarios, editarUsuario, eliminarUsuario } = await import('../controllers/usuarioController.js');

// ============== PU ==============
describe('PU-01 - Crear usuario con datos válidos', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockQuery.mockImplementation((sql) => {
            // El rol SÍ existe
            if (sql.includes('Rol')) {
                return Promise.resolve([[{ id_rol: 2 }]]);
            }
            // El correo NO está duplicado
            if (sql.includes('correo_electronico')) {
                return Promise.resolve([[]]);
            }
            // El teléfono NO está duplicado
            if (sql.includes('telefono')) {
                return Promise.resolve([[]]);
            }
            return Promise.resolve([[]]);
        });
    });

    test('El sistema registra correctamente un nuevo usuario con datos válidos', async () => {

        const req = {
            body: {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo_electronico: 'juan@correo.com',
                telefono: '4771234567',
                genero: 'hombre',
                contrasena: 'Admin@123',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await altaUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ mensaje: 'Usuario creado correctamente' })
        );
    });

});

describe('PU-02 - Crear usuario sin nombre', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockQuery.mockImplementation((sql) => {
            if (sql.includes('Rol')) {
                return Promise.resolve([[{ id_rol: 2 }]]);
            }
            if (sql.includes('correo_electronico')) {
                return Promise.resolve([[]]);
            }
            if (sql.includes('telefono')) {
                return Promise.resolve([[]]);
            }
            return Promise.resolve([[]]);
        });
    });

    test('El sistema rechaza el registro cuando el campo nombre está vacío', async () => {

        const req = {
            body: {
                nombre: '',
                apellido: 'Pérez',
                correo_electronico: 'juan@correo.com',
                telefono: '4771234567',
                genero: 'hombre',
                contrasena: 'Admin@123',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await altaUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        path: 'nombre',
                        message: 'El nombre es obligatorio'
                    })
                ])
            })
        );
    });

});

describe('PU-03 - Crear usuario con correo duplicado', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockQuery.mockImplementation((sql) => {
            if (sql.includes('Rol')) {
                return Promise.resolve([[{ id_rol: 2 }]]);
            }
            // Simular que el correo YA está registrado
            if (sql.includes('correo_electronico')) {
                return Promise.resolve([[{ id_usuario: 1 }]]);
            }
            if (sql.includes('telefono')) {
                return Promise.resolve([[]]);
            }
            return Promise.resolve([[]]);
        });
    });

    test('El sistema rechaza el registro cuando el correo electrónico ya está registrado', async () => {

        const req = {
            body: {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo_electronico: 'administrador@gmail.com',
                telefono: '4771234567',
                genero: 'hombre',
                contrasena: 'Admin@123',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await altaUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        path: 'correo_electronico',
                        message: 'Este correo electrónico ya está registrado'
                    })
                ])
            })
        );
    });

});

describe('PU-04 - Crear usuario con teléfono duplicado', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockQuery.mockImplementation((sql) => {
            if (sql.includes('Rol')) {
                return Promise.resolve([[{ id_rol: 2 }]]);
            }
            if (sql.includes('correo_electronico')) {
                return Promise.resolve([[]]);
            }
            // Simular que el teléfono YA está registrado
            if (sql.includes('telefono')) {
                return Promise.resolve([[{ id_usuario: 1 }]]);
            }
            return Promise.resolve([[]]);
        });
    });

    test('El sistema rechaza el registro cuando el teléfono ya está registrado', async () => {

        const req = {
            body: {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo_electronico: 'juan@correo.com',
                telefono: '4771234567',
                genero: 'hombre',
                contrasena: 'Admin@123',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await altaUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        path: 'telefono',
                        message: 'Este número de teléfono ya está registrado'
                    })
                ])
            })
        );
    });

});

describe('PU-06 - Consultar listado de usuarios', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('El sistema retorna correctamente el listado de usuarios', async () => {

        const { Usuario } = await import('../models/Usuario.js');

        Usuario.getAll = jest.fn().mockResolvedValue([
            {
                id_usuario: 1,
                nombre: 'Juan',
                apellido: 'Pérez',
                correo_electronico: 'juan@correo.com',
                telefono: '4771234567',
                genero: 'hombre',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2,
                rol: 'Estudiante'
            }
        ]);

        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await obtenerUsuarios(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    nombre: 'Juan',
                    apellido: 'Pérez'
                })
            ])
        );
    });

});

describe('PU-07 - Buscar usuario por nombre', () => {

    test('El sistema retorna los usuarios que coinciden con el criterio de búsqueda', async () => {

        const { Usuario } = await import('../models/Usuario.js');

        Usuario.search = jest.fn().mockResolvedValue([
            {
                id_usuario: 1,
                nombre: 'Juan',
                apellido: 'Pérez',
                correo_electronico: 'juan@correo.com',
                telefono: '4771234567',
                genero: 'hombre',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2,
                rol: 'Estudiante'
            }
        ]);

        const req = { query: { q: 'Juan' } };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await buscarUsuarios(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    nombre: 'Juan',
                    apellido: 'Pérez'
                })
            ])
        );
    });

});

describe('PU-08 - Búsqueda de usuario sin resultados', () => {

    test('El sistema retorna un arreglo vacío cuando no hay coincidencias', async () => {

        const { Usuario } = await import('../models/Usuario.js');

        Usuario.search = jest.fn().mockResolvedValue([]);

        const req = { query: { q: 'Ana' } };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await buscarUsuarios(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
    });

});

describe('PU-09 - Actualizar usuario con datos válidos', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockQuery.mockImplementation((sql) => {
            if (sql.includes('Rol')) {
                return Promise.resolve([[{ id_rol: 2 }]]);
            }
            if (sql.includes('correo_electronico')) {
                return Promise.resolve([[]]);
            }
            if (sql.includes('telefono')) {
                return Promise.resolve([[]]);
            }
            return Promise.resolve([[]]);
        });
    });

    test('El sistema actualiza correctamente los datos de un usuario con datos válidos', async () => {

        const { Usuario } = await import('../models/Usuario.js');
        Usuario.update = jest.fn().mockResolvedValue({ affectedRows: 1 });

        const req = {
            params: { id: 1 },
            body: {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo_electronico: 'juan@correo.com',
                telefono: '4771234567',
                genero: 'hombre',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await editarUsuario(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ mensaje: 'Usuario actualizado correctamente' })
        );
    });

});

describe('PU-10 - Actualizar usuario con correo duplicado', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockQuery.mockImplementation((sql) => {
            if (sql.includes('Rol')) {
                return Promise.resolve([[{ id_rol: 2 }]]);
            }
            // Simular que el correo YA está registrado por otro usuario
            if (sql.includes('correo_electronico')) {
                return Promise.resolve([[{ id_usuario: 99 }]]);
            }
            if (sql.includes('telefono')) {
                return Promise.resolve([[]]);
            }
            return Promise.resolve([[]]);
        });
    });

    test('El sistema rechaza la actualización cuando el correo electrónico ya está registrado', async () => {

        const req = {
            params: { id: 1 },
            body: {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo_electronico: 'administrador@correo.com',
                telefono: '4771234567',
                genero: 'hombre',
                fecha_nacimiento: '2000-05-15',
                id_rol: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await editarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        path: 'correo_electronico',
                        message: 'Este correo electrónico ya está registrado'
                    })
                ])
            })
        );
    });

});

describe('PU-11 - Eliminar usuario exitosamente', () => {

    test('El sistema elimina correctamente un usuario existente', async () => {

        const { Usuario } = await import('../models/Usuario.js');
        Usuario.delete = jest.fn().mockResolvedValue({ affectedRows: 1 });

        const req = { params: { id: 1 } };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await eliminarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Usuario eliminado correctamente' })
        );
    });

});

describe('PU-12 - Eliminar usuario que no existe', () => {

    test('El sistema responde con 404 cuando el usuario no existe', async () => {

        const { Usuario } = await import('../models/Usuario.js');
        Usuario.delete = jest.fn().mockResolvedValue({ affectedRows: 0 });

        const req = { params: { id: 9999 } };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await eliminarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Usuario no encontrado' })
        );
    });

});