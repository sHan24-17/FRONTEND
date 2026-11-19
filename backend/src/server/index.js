require('dotenv').config();

const app = require('../app');
const { verificarConexion, pool, prisma } = require('../config/db');

const PORT = process.env.PORT || 5050;

const iniciarServidor = async () => {
    try {
        console.log('Iniciando servidor Express con Prisma ORM...');

        // Validar conexión con PostgreSQL mediante Prisma
        const conexionBd = await verificarConexion();
        if (!conexionBd) {
            console.warn('[ADVERTENCIA] No se pudo verificar la conexión con PostgreSQL al inicio.');
        }

        const server = app.listen(PORT, () => {
            console.log('====================================================');
            console.log(`  Servidor Express ejecutándose en el puerto ${PORT}`);
            console.log(`  ORM Implementado: Prisma ORM (v6)`);
            console.log(`  URL Base API:   http://localhost:${PORT}/api/v1`);
            console.log(`  Usuarios:       http://localhost:${PORT}/api/v1/usuarios`);
            console.log(`  Productos:      http://localhost:${PORT}/api/v1/productos`);
            console.log(`  Health Check:   http://localhost:${PORT}/`);
            console.log(`  Versión API:    ${process.env.API_VERSION || 'v1'}`);
            console.log(`  Paginación def: ${process.env.DEFAULT_LIMIT || 10} registros`);
            console.log('====================================================');
        });

        // Apagado controlado (Graceful Shutdown)
        const shutdown = async () => {
            console.log('\nCerrando servidor HTTP y conexiones de PostgreSQL...');
            server.close(async () => {
                try {
                    if (prisma) {
                        await prisma.$disconnect();
                        console.log('Cliente Prisma desconectado.');
                    }
                } catch (err) {
                    console.error('Error al desconectar Prisma:', err.message);
                }
                try {
                    if (pool && typeof pool.end === 'function') {
                        await pool.end();
                        console.log('Pool de conexiones de PostgreSQL cerrado.');
                    }
                } catch (err) {
                    console.error('Error al cerrar Pool:', err.message);
                }
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
