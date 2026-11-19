const { Router } = require('express');
const productoRoutes = require('./productoRoutes');
const usuarioRoutes = require('../usuarioRoutes');

const router = Router();

// Montar recursos de la versión 1 (un archivo por modelo)
router.use('/productos', productoRoutes);
router.use('/usuarios', usuarioRoutes);

module.exports = router;
