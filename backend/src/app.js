const express = require('express');
const corsMiddleware = require('./middlewares/corsMiddleware');
const jsonContentTypeMiddleware = require('./middlewares/jsonContentTypeMiddleware');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandlerMiddleware');
const factory = require('./factories');

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES DE EXPRESS
// ==========================================

// 1. Control de CORS
app.use(corsMiddleware);

// 2. Registro ligero de solicitudes HTTP en consola (desarrollo)
if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        const inicio = Date.now();
        res.on('finish', () => {
            const duracion = Date.now() - inicio;
            console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracion}ms)`);
        });
        next();
    });
}

// 3. Verificación estricta de Content-Type en peticiones con cuerpo (POST, PUT, PATCH)
app.use(jsonContentTypeMiddleware);

// 4. Parseo de cuerpo JSON y URL-Encoded
const bodyLimit = process.env.JSON_BODY_LIMIT || '2mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// 5. Ruta raíz / comprobación de salud de la API
app.get('/', (req, res) => {
    res.status(200).json({
        exito: true,
        nombre: 'API REST - Sistema de Usuarios y Productos',
        version: process.env.API_VERSION || 'v1',
        endpoints: {
            usuarios: '/api/v1/usuarios',
            productos: '/api/v1/productos'
        },
        documentacion: {
            metodosDisponibles: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            paginacion: '?page=1&limit=10'
        }
    });
});

// 6. Enrutador principal (versionado /api/v1) mediante Factory
factory.inicializar(app);

// ==========================================
// CONTROL DE ERRORES (404 y Global Error Handler)
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
