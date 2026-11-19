/**
 * Middleware para paginación dinámica configurable
 * Soporta parámetros de consulta: ?page=1&limit=10
 */
const paginationMiddleware = (req, res, next) => {
    // Página solicitada (mínimo 1)
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
        page = parseInt(process.env.DEFAULT_PAGE, 10) || 1;
    }

    const defaultLimit = parseInt(process.env.DEFAULT_LIMIT, 10) || 10;
    const maxLimit = parseInt(process.env.MAX_LIMIT, 10) || 100;

    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) {
        limit = defaultLimit;
    } else if (limit > maxLimit) {
        limit = maxLimit;
    }

    const offset = (page - 1) * limit;

    // Adjuntar parámetros de paginación calculados al objeto request
    req.pagination = {
        page,
        limit,
        offset
    };

    next();
};

module.exports = paginationMiddleware;
