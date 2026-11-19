const cors = require('cors');

/**
 * Middleware para la configuración y control de CORS
 * Permite localhost / 127.0.0.1 en cualquier puerto (para desarrollo y Live Server)
 * y respeta la configuración de CORS_ORIGIN
 */
const corsOptions = {
    origin: (origin, callback) => {
        const envOrigin = process.env.CORS_ORIGIN || '*';
        const allowedOrigins = envOrigin.split(',').map(o => o.trim());

        // Permitir solicitudes sin origen (como clientes REST, curl o apps de escritorio)
        // o si coincide con '*' o con localhost / 127.0.0.1 en cualquier puerto
        if (
            !origin ||
            allowedOrigins.includes('*') ||
            allowedOrigins.includes(origin) ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error(`Origen bloqueado por CORS: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
