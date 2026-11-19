/**
 * Clase personalizada para manejo de errores de la API
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, details = null) {
        return new ApiError(400, message, details);
    }

    static unauthorized(message = 'No autorizado') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Acceso prohibido') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Recurso no encontrado') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Conflicto en la solicitud') {
        return new ApiError(409, message);
    }

    static internal(message = 'Error interno del servidor') {
        return new ApiError(500, message);
    }
}

module.exports = ApiError;
