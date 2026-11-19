const ApiError = require('../utils/apiError');

/**
 * Middleware para rutas no encontradas (404)
 * Pasa el error al manejador global mediante next(error)
 */
const notFoundHandler = (req, res, next) => {
    next(ApiError.notFound(`No se encontró la ruta ${req.method} ${req.originalUrl}`));
};

/**
 * Middleware de control global de errores utilizando (err, req, res, next)
 * Captura excepciones operacionales (ApiError), errores de Prisma ORM, errores de PostgreSQL y errores inesperados.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let mensaje = err.message || 'Error interno del servidor';
    let detalles = err.details || null;

    // Manejo de error de parseo JSON malformado (express.json)
    if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && 'body' in err) {
        statusCode = 400;
        mensaje = 'El cuerpo de la petición contiene un formato JSON inválido o malformado';
        detalles = err.message;
    }

    // Manejo de errores específicos de Prisma ORM
    if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
        switch (err.code) {
            case 'P2002': // Violación de campo único (Unique constraint failed)
                statusCode = 409;
                const campos = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'campo único';
                mensaje = `Ya existe un registro con el mismo valor en: ${campos}`;
                detalles = err.meta || null;
                break;
            case 'P2025': // Registro no encontrado para actualizar o eliminar
                statusCode = 404;
                mensaje = 'El registro solicitado no fue encontrado o ya fue eliminado';
                detalles = err.meta || null;
                break;
            case 'P2003': // Fallo de clave foránea
                statusCode = 400;
                mensaje = 'Violación de restricción de clave foránea';
                detalles = err.meta || null;
                break;
            case 'P2000': // Valor demasiado largo para el tipo de columna
                statusCode = 400;
                mensaje = 'El valor proporcionado excede la longitud máxima permitida';
                detalles = err.meta || null;
                break;
            case 'P2006': // Valor inválido proporcionado
                statusCode = 400;
                mensaje = 'El valor proporcionado no es válido para este campo';
                detalles = err.meta || null;
                break;
            default:
                break;
        }
    }

    // Manejo de errores específicos de PostgreSQL nativo (pg driver)
    if (err.code && !err.code.toString().startsWith('P')) {
        switch (err.code) {
            case '23505': // Violación de unicidad
                statusCode = 409;
                mensaje = 'Ya existe un registro con ese valor único (duplicado)';
                detalles = err.detail || null;
                break;
            case '23503': // Violación de clave foránea
                statusCode = 400;
                mensaje = 'Violación de restricción de clave foránea';
                detalles = err.detail || null;
                break;
            case '23514': // Violación de restricción CHECK
                statusCode = 400;
                mensaje = 'Los datos no cumplen las restricciones de la base de datos (CHECK constraint)';
                detalles = err.detail || null;
                break;
            case '22P02': // Sintaxis de tipo inválida
                statusCode = 400;
                mensaje = 'Tipo de dato incompatible con la columna en PostgreSQL';
                detalles = err.message;
                break;
            case 'ECONNREFUSED':
                statusCode = 503;
                mensaje = 'No se pudo establecer conexión con la base de datos PostgreSQL';
                break;
            default:
                break;
        }
    }

    // Respuesta estructurada
    const respuesta = {
        exito: false,
        codigoEstado: statusCode,
        mensaje,
        ...(detalles && { detalles }),
        ...(process.env.NODE_ENV === 'development' && { pila: err.stack })
    };

    res.status(statusCode).json(respuesta);
};

module.exports = {
    notFoundHandler,
    errorHandler
};
