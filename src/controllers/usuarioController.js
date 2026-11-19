const ApiError = require('../utils/apiError');
const usuarioModel = require('../models/usuarioModel');

/**
 * Controlador de Usuarios: Gestiona las operaciones HTTP CRUD
 * Implementa operaciones CRUD completas según estándares REST
 * Utiliza patrón Repository a través del modelo UsuarioModel
 */
class UsuarioController {
    /**
     * GET /api/v1/usuarios
     * Listado de usuarios con paginación y filtros
     */
    static async listar(req, res, next) {
        try {
            const page = req.pagination?.page || 1;
            const limit = req.pagination?.limit || 10;
            const offset = req.pagination?.offset || 0;
            const { busqueda, rol, activo } = req.query;

            const { usuarios, total } = await usuarioModel.listar({
                limit,
                offset,
                busqueda,
                rol,
                activo
            });

            const totalPaginas = Math.ceil(total / limit) || 1;

            res.status(200).json({
                exito: true,
                codigoEstado: 200,
                mensaje: 'Usuarios obtenidos correctamente',
                paginacion: {
                    paginaActual: page,
                    limitePorPagina: limit,
                    totalRegistros: total,
                    totalPaginas,
                    tienePaginaSiguiente: page < totalPaginas,
                    tienePaginaAnterior: page > 1
                },
                datos: usuarios
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/usuarios/:id
     * Obtener un único usuario por su ID
     */
    static async obtenerPorId(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await usuarioModel.obtenerPorId(id);

            if (!usuario) {
                return next(ApiError.notFound(`No se encontró ningún usuario con el ID ${id}`));
            }

            res.status(200).json({
                exito: true,
                codigoEstado: 200,
                mensaje: 'Usuario encontrado',
                datos: usuario
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/usuarios
     * Registrar un nuevo usuario
     */
    static async crear(req, res, next) {
        try {
            const { nombre, email, rol, activo } = req.body || {};
            if (!nombre) {
                return next(ApiError.badRequest('El nombre es obligatorio'));
            }
            if (!email) {
                return next(ApiError.badRequest('El correo electrónico es obligatorio'));
            }

            // Verificar si el email ya está registrado
            const usuarioExistente = await usuarioModel.obtenerPorEmail(email);
            if (usuarioExistente) {
                return next(ApiError.conflict(`El correo electrónico '${email}' ya está en uso`));
            }

            const nuevoUsuario = await usuarioModel.crear({
                nombre,
                email,
                rol: rol || 'usuario',
                activo: activo !== undefined ? activo : true
            });

            res.status(201).json({
                exito: true,
                codigoEstado: 201,
                mensaje: 'Usuario creado exitosamente',
                datos: nuevoUsuario
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/usuarios/:id
     * Actualización completa de un usuario existente
     */
    static async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const campos = req.body;

            // Comprobar existencia previa
            const usuarioExistente = await usuarioModel.obtenerPorId(id);
            if (!usuarioExistente) {
                return next(ApiError.notFound(`No se puede actualizar: no existe el usuario con ID ${id}`));
            }

            // Si se cambia el email, validar duplicidad
            if (campos.email && campos.email !== usuarioExistente.email) {
                const conMismoEmail = await usuarioModel.obtenerPorEmail(campos.email);
                if (conMismoEmail && conMismoEmail.id !== parseInt(id, 10)) {
                    return next(ApiError.conflict(`El correo '${campos.email}' ya pertenece a otro usuario`));
                }
            }

            const usuarioActualizado = await usuarioModel.actualizar(id, campos);

            res.status(200).json({
                exito: true,
                codigoEstado: 200,
                mensaje: 'Usuario actualizado exitosamente',
                datos: usuarioActualizado
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/usuarios/:id
     * Actualización parcial de un usuario
     */
    static async partialUpdate(req, res, next) {
        return UsuarioController.actualizar(req, res, next);
    }

    /**
     * DELETE /api/v1/usuarios/:id
     * Eliminación de un usuario
     */
    static async eliminar(req, res, next) {
        try {
            const { id } = req.params;

            const usuarioExistente = await usuarioModel.obtenerPorId(id);
            if (!usuarioExistente) {
                return next(ApiError.notFound(`No se puede eliminar: el usuario con ID ${id} no existe`));
            }

            await usuarioModel.eliminar(id);

            // 204 No Content para eliminación exitosa estándar REST
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UsuarioController;
