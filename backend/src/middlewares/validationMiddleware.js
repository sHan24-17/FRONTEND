const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Middleware que evalúa los resultados de las validaciones de express-validator
 * y propaga los errores al manejador global mediante next(error)
 */
const validarResultados = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const detalles = errors.array().map(err => ({
            campo: err.path || err.param,
            mensaje: err.msg,
            valorRecibido: err.value
        }));
        return next(ApiError.badRequest('Error en los campos enviados', detalles));
    }
    next();
};

/**
 * Validaciones para crear un producto (POST)
 */
const validarCrearProducto = [
    body('codigo')
        .notEmpty().withMessage('El código del producto es obligatorio')
        .isString().withMessage('El código debe ser una cadena de texto')
        .isLength({ min: 3, max: 20 }).withMessage('El código debe tener entre 3 y 20 caracteres'),

    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser texto'),

    body('categoria')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isString().withMessage('La categoría debe ser una cadena de texto')
        .isLength({ min: 2, max: 50 }).withMessage('La categoría debe tener entre 2 y 50 caracteres'),

    body('precio')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número decimal mayor o igual a 0'),

    body('stock')
        .notEmpty().withMessage('El stock es obligatorio')
        .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),

    body('estado')
        .optional()
        .isBoolean().withMessage('El estado debe ser booleano (true o false)'),

    body('url-imagen')
        .optional({ checkFalsy: true })
        .isString().withMessage('La url-imagen debe ser una cadena de texto')
        .isURL().withMessage('La url-imagen debe ser una URL válida')
        .isLength({ max: 500 }).withMessage('La url-imagen no debe superar los 500 caracteres'),

    body('url_imagen')
        .optional({ checkFalsy: true })
        .isString().withMessage('La url_imagen debe ser una cadena de texto')
        .isURL().withMessage('La url_imagen debe ser una URL válida')
        .isLength({ max: 500 }).withMessage('La url_imagen no debe superar los 500 caracteres'),

    validarResultados
];

/**
 * Validaciones para actualizar un producto (PUT / PATCH)
 */
const validarActualizarProducto = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID en los parámetros debe ser un entero positivo'),

    body('codigo')
        .optional()
        .isString().withMessage('El código debe ser una cadena de texto')
        .isLength({ min: 3, max: 20 }).withMessage('El código debe tener entre 3 y 20 caracteres'),

    body('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser texto'),

    body('categoria')
        .optional()
        .isString().withMessage('La categoría debe ser una cadena de texto')
        .isLength({ min: 2, max: 50 }).withMessage('La categoría debe tener entre 2 y 50 caracteres'),

    body('precio')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),

    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0'),

    body('estado')
        .optional()
        .isBoolean().withMessage('El estado debe ser booleano'),

    body('url-imagen')
        .optional({ checkFalsy: true })
        .isString().withMessage('La url-imagen debe ser una cadena de texto')
        .isURL().withMessage('La url-imagen debe ser una URL válida')
        .isLength({ max: 500 }).withMessage('La url-imagen no debe superar los 500 caracteres'),

    body('url_imagen')
        .optional({ checkFalsy: true })
        .isString().withMessage('La url_imagen debe ser una cadena de texto')
        .isURL().withMessage('La url_imagen debe ser una URL válida')
        .isLength({ max: 500 }).withMessage('La url_imagen no debe superar los 500 caracteres'),

    validarResultados
];

/**
 * Validaciones para crear un usuario (POST)
 */
const validarCrearUsuario = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('email')
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido')
        .isLength({ max: 100 }).withMessage('El correo electrónico no debe exceder 100 caracteres'),

    body('rol')
        .optional()
        .isString().withMessage('El rol debe ser texto')
        .isLength({ min: 2, max: 50 }).withMessage('El rol debe tener entre 2 y 50 caracteres'),

    body('activo')
        .optional()
        .isBoolean().withMessage('El campo activo debe ser booleano'),

    validarResultados
];

/**
 * Validaciones para actualizar un usuario (PUT / PATCH)
 */
const validarActualizarUsuario = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo mayor a 0'),

    body('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('email')
        .optional()
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido')
        .isLength({ max: 100 }).withMessage('El correo electrónico no debe exceder 100 caracteres'),

    body('rol')
        .optional()
        .isString().withMessage('El rol debe ser texto')
        .isLength({ min: 2, max: 50 }).withMessage('El rol debe tener entre 2 y 50 caracteres'),

    body('activo')
        .optional()
        .isBoolean().withMessage('El campo activo debe ser booleano'),

    validarResultados
];

/**
 * Validación para endpoints con parámetro :id
 */
const validarIdParam = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo mayor a 0'),
    validarResultados
];

/**
 * Validación para parámetros de búsqueda en listado de productos (GET)
 */
const validarQueryListado = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor o igual a 1'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100'),
    query('categoria')
        .optional()
        .isString().withMessage('La categoría de filtro debe ser texto'),
    query('busqueda')
        .optional()
        .isString().withMessage('El término de búsqueda debe ser texto'),
    validarResultados
];

/**
 * Validación para parámetros de búsqueda en listado de usuarios (GET)
 */
const validarQueryUsuarios = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor o igual a 1'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100'),
    query('busqueda')
        .optional()
        .isString().withMessage('El término de búsqueda debe ser texto'),
    validarResultados
];

module.exports = {
    validarCrearProducto,
    validarActualizarProducto,
    validarCrearUsuario,
    validarActualizarUsuario,
    validarIdParam,
    validarQueryListado,
    validarQueryUsuarios
};
