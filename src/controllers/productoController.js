const ProductoModel = require('../models/productoModel');
const ApiError = require('../utils/apiError');
const { obtenerImagenReal } = require('../utils/imageService');

/**
 * Controlador de Productos: Gestiona las operaciones HTTP CRUD
 */
class ProductoController {
    /**
     * GET /api/v1/productos
     * Listado con paginación configurable y filtros
     */
    static async listar(req, res, next) {
        try {
            const { page, limit, offset } = req.pagination;
            const { categoria, busqueda, activos } = req.query;

            const soloActivos = activos === 'true';

            const { productos, total } = await ProductoModel.listar({
                limit,
                offset,
                categoria,
                busqueda,
                soloActivos
            });

            const totalPaginas = Math.ceil(total / limit) || 1;

            res.status(200).json({
                exito: true,
                codigoEstado: 200,
                mensaje: 'Productos obtenidos correctamente',
                paginacion: {
                    paginaActual: page,
                    limitePorPagina: limit,
                    totalRegistros: total,
                    totalPaginas,
                    tienePaginaSiguiente: page < totalPaginas,
                    tienePaginaAnterior: page > 1
                },
                datos: productos
            });
        } catch (error) {
            next(error); // Pasa al middleware de control de errores
        }
    }

    /**
     * GET /api/v1/productos/:id
     * Obtener un único producto por su ID
     */
    static async obtenerPorId(req, res, next) {
        try {
            const { id } = req.params;
            const producto = await ProductoModel.obtenerPorId(id);

            if (!producto) {
                return next(ApiError.notFound(`No se encontró ningún producto con el ID ${id}`));
            }

            res.status(200).json({
                exito: true,
                codigoEstado: 200,
                mensaje: 'Producto encontrado',
                datos: producto
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/productos
     * Registrar un nuevo producto
     */
    static async crear(req, res, next) {
        try {
            const { codigo, nombre, descripcion, categoria, precio, stock, estado } = req.body;
            let urlImagen = req.body['url-imagen'] !== undefined ? req.body['url-imagen'] : req.body.url_imagen;

            // Verificar si el código ya está registrado
            const productoExistente = await ProductoModel.obtenerPorCodigo(codigo);
            if (productoExistente) {
                return next(ApiError.conflict(`El código de producto '${codigo}' ya está en uso`));
            }

            // Si no se proporcionó url-imagen, obtener automáticamente una URL real de imagen desde internet/APIs
            if (!urlImagen || typeof urlImagen !== 'string' || urlImagen.trim() === '') {
                urlImagen = await obtenerImagenReal(nombre, categoria);
            }

            const nuevoProducto = await ProductoModel.crear({
                codigo,
                nombre,
                descripcion,
                categoria,
                precio,
                stock,
                estado: estado !== undefined ? estado : true,
                urlImagen
            });

            res.status(201).json({
                exito: true,
                codigoEstado: 201,
                mensaje: 'Producto creado exitosamente',
                datos: nuevoProducto
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/productos/:id
     * Actualización completa de un producto
     */
    static async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const campos = req.body;

            // Comprobar existencia previa
            const productoExistente = await ProductoModel.obtenerPorId(id);
            if (!productoExistente) {
                return next(ApiError.notFound(`No se puede actualizar: no existe el producto con ID ${id}`));
            }

            // Si se intenta cambiar el código, validar que no choque con otro producto
            if (campos.codigo && campos.codigo !== productoExistente.codigo) {
                const conMismoCodigo = await ProductoModel.obtenerPorCodigo(campos.codigo);
                if (conMismoCodigo && conMismoCodigo.id !== parseInt(id, 10)) {
                    return next(ApiError.conflict(`El código '${campos.codigo}' ya pertenece a otro producto`));
                }
            }

            const productoActualizado = await ProductoModel.actualizar(id, campos);

            res.status(200).json({
                exito: true,
                codigoEstado: 200,
                mensaje: 'Producto actualizado exitosamente',
                datos: productoActualizado
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/productos/:id
     * Actualización parcial de un producto
     */
    static async partialUpdate(req, res, next) {
        return ProductoController.actualizar(req, res, next);
    }

    /**
     * DELETE /api/v1/productos/:id
     * Eliminar físicamente un producto
     */
    static async eliminar(req, res, next) {
        try {
            const { id } = req.params;

            const productoEliminado = await ProductoModel.eliminar(id);
            if (!productoEliminado) {
                return next(ApiError.notFound(`No se puede eliminar: el producto con ID ${id} no existe`));
            }

            res.status(200).json({
                exito: true,
                codigoEstado: 200,
                mensaje: 'Producto eliminado exitosamente',
                datos: productoEliminado
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductoController;
