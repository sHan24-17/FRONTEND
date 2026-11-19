const { Pool } = require('pg');
const { prisma, verificarConexion: verificarPrisma } = require('./prisma');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'BD_DP_PRUEBA',
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
});

pool.on('error', (err) => {
    console.error('Error inesperado en cliente inactivo del pool PostgreSQL:', err);
});

// Función de verificación que valida tanto Prisma como el Pool
const verificarConexion = async () => {
    const prismaOk = await verificarPrisma();
    if (!prismaOk) {
        return false;
    }
    return true;
};

module.exports = {
    prisma,
    pool,
    query: (text, params) => pool.query(text, params),
    verificarConexion
};
