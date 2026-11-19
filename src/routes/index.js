const { Router } = require('express');
const v1Router = require('./v1');

const router = Router();

// Enrutador de versiones (actualmente soportando v1)
router.use('/v1', v1Router);

module.exports = router;
