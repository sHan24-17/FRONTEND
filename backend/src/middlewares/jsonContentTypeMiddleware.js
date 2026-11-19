const ApiError = require('../utils/apiError');

/**
 * Middleware para verificar que peticiones con cuerpo incluyan Content-Type: application/json.
 * No bloquea peticiones GET, HEAD, OPTIONS ni peticiones DELETE sin cuerpo.
 */
const jsonContentTypeMiddleware = (req, res, next) => {
    const metodosConCuerpo = ['POST', 'PUT', 'PATCH'];

    if (metodosConCuerpo.includes(req.method)) {
        const contentLength = req.headers['content-length'];
        const isChunked = req.headers['transfer-encoding'] === 'chunked';

        // Si la petición contiene cuerpo (content-length > 0 o transfer-encoding chunked)
        if ((contentLength && parseInt(contentLength, 10) > 0) || isChunked) {
            const contentType = req.headers['content-type'] || '';
            if (!contentType.toLowerCase().includes('application/json')) {
                return next(ApiError.badRequest('El encabezado Content-Type debe ser application/json para peticiones con cuerpo'));
            }
        }
    }

    next();
};

module.exports = jsonContentTypeMiddleware;
