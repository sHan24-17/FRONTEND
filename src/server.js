require('dotenv').config();
const app = require('./app');
const { verificarConexion, pool } = require('./config/db');

const PORT = process.env.PORT || 5050;

const iniciarServidor = async () => {
    try {
        console.log('Iniciando servidor Express...');

        // Validar conexión con PostgreSQL
        await verificarConexion();

        const server = app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(` Servidor Express ejecutándose en el puerto ${PORT}`);
            console.log(` URL Base API:   http://localhost:${PORT}/api/v1`);
            console.log(` Usuarios:       http://localhost:${PORT}/api/v1/usuarios`);
            console.log(` Productos:      http://localhost:${PORT}/api/v1/productos`);
            console.log(` Health Check:   http://localhost:${PORT}/`);
            console.log(` Versión API:    ${process.env.API_VERSION || 'v1'}`);
            console.log(`====================================================`);
        });

        // Apagado controlado (Graceful Shutdown)
        const shutdown = async () => {
            console.log('\nCerrando servidor HTTP y conexiones de PostgreSQL...');
            server.close(async () => {
                await pool.end();
                console.log('Pool de conexiones de PostgreSQL cerrado.');
                process.exit(0);
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};

iniciarServidor();
