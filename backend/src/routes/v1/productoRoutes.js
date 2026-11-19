const { Router } = require('express');
const ProductoController = require('../../controllers/productoController');
const sanitizationMiddleware = require('../../middlewares/sanitizationMiddleware');
const paginationMiddleware = require('../../middlewares/paginationMiddleware');
const {
    validarCrearProducto,
    validarActualizarProducto,
    validarIdParam,
    validarQueryListado
} = require('../../middlewares/validationMiddleware');

const router = Router();

/**
 * @route   GET /api/v1/productos
 * @desc    Obtener lista de productos (paginado, filtrable)
 */
router.get(
    '/',
    sanitizationMiddleware,
    validarQueryListado,
    paginationMiddleware,
    ProductoController.listar
);

/**
 * @route   GET /api/v1/productos/:id
 * @desc    Obtener un producto por ID
 */
router.get(
    '/:id',
    validarIdParam,
    ProductoController.obtenerPorId
);

/**
 * @route   POST /api/v1/productos
 * @desc    Crear un nuevo producto
 */
router.post(
    '/',
    sanitizationMiddleware,
    validarCrearProducto,
    ProductoController.crear
);

/**
 * @route   PUT /api/v1/productos/:id
 * @desc    Actualizar completamente un producto existente
 */
router.put(
    '/:id',
    validarIdParam,
    sanitizationMiddleware,
    validarActualizarProducto,
    ProductoController.actualizar
);

/**
 * @route   PATCH /api/v1/productos/:id
 * @desc    Actualizar parcialmente un producto existente
 */
router.patch(
    '/:id',
    validarIdParam,
    sanitizationMiddleware,
    validarActualizarProducto,
    ProductoController.partialUpdate
);

/**
 * @route   DELETE /api/v1/productos/:id
 * @desc    Eliminar un producto existente
 */
router.delete(
    '/:id',
    validarIdParam,
    ProductoController.eliminar
);

module.exports = router;
