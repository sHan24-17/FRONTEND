const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const sanitizationMiddleware = require('../middlewares/sanitizationMiddleware');
const paginationMiddleware = require('../middlewares/paginationMiddleware');
const {
    validarCrearUsuario,
    validarActualizarUsuario,
    validarIdParam,
    validarQueryUsuarios
} = require('../middlewares/validationMiddleware');

const router = Router();

/**
 * @route   GET /api/v1/usuarios
 * @desc    Obtener lista de usuarios (paginado, filtrable)
 */
router.get(
    '/',
    sanitizationMiddleware,
    validarQueryUsuarios,
    paginationMiddleware,
    usuarioController.listar
);

/**
 * @route   GET /api/v1/usuarios/:id
 * @desc    Obtener un usuario por ID
 */
router.get(
    '/:id',
    validarIdParam,
    usuarioController.obtenerPorId
);

/**
 * @route   POST /api/v1/usuarios
 * @desc    Crear un nuevo usuario
 */
router.post(
    '/',
    sanitizationMiddleware,
    validarCrearUsuario,
    usuarioController.crear
);

/**
 * @route   PUT /api/v1/usuarios/:id
 * @desc    Actualizar completamente un usuario existente
 */
router.put(
    '/:id',
    validarIdParam,
    sanitizationMiddleware,
    validarActualizarUsuario,
    usuarioController.actualizar
);

/**
 * @route   PATCH /api/v1/usuarios/:id
 * @desc    Actualizar parcialmente un usuario existente
 */
router.patch(
    '/:id',
    validarIdParam,
    sanitizationMiddleware,
    validarActualizarUsuario,
    usuarioController.partialUpdate
);

/**
 * @route   DELETE /api/v1/usuarios/:id
 * @desc    Eliminar un usuario
 */
router.delete(
    '/:id',
    validarIdParam,
    usuarioController.eliminar
);

module.exports = router;
