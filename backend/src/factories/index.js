const usuarioRoutes = require('../routes/usuarioRoutes');
const usuarioModel = require('../models/usuarioModel');
const productoRoutes = require('../routes/v1/productoRoutes');

const factory = {
    inicializar: (app) => {
        // Registrar routes de usuario (un archivo por modelo, según arquitectura)
        app.use('/api/v1/usuarios', usuarioRoutes);

        // Registrar routes de producto (un archivo por modelo, según arquitectura)
        app.use('/api/v1/productos', productoRoutes);
    }
};

module.exports = factory;