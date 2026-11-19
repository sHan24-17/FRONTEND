/**
 * Middleware para sanitizar datos entrantes (body, query, params)
 * Elimina espacios en blanco innecesarios y previene inyecciones básicas.
 */
const sanitizeValue = (val) => {
    if (typeof val === 'string') {
        // Eliminar espacios en blanco al inicio y final
        let sanitized = val.trim();
        // Normalizar caracteres de control o etiquetas script básicas
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        return sanitized;
    }
    if (typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
            return val.map(sanitizeValue);
        }
        const cleanObj = {};
        for (const [key, item] of Object.entries(val)) {
            cleanObj[key] = sanitizeValue(item);
        }
        return cleanObj;
    }
    return val;
};

const sanitizationMiddleware = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeValue(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeValue(req.params);
    }
    next();
};

module.exports = sanitizationMiddleware;
