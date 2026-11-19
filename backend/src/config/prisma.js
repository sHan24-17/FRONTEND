const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Patrón Singleton para PrismaClient
let prisma;

if (!global.__prismaInstance) {
    global.__prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });
}
prisma = global.__prismaInstance;

/**
 * Función para verificar la conexión activa a la base de datos con Prisma
 */
const verificarConexion = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('[BD - Prisma] Conectado exitosamente a PostgreSQL (BD_DP_PRUEBA)');
        return true;
    } catch (error) {
        console.error(`[BD - Prisma] Error al conectar a PostgreSQL con Prisma: ${error.message}`);
        return false;
    }
};

module.exports = {
    prisma,
    verificarConexion
};
