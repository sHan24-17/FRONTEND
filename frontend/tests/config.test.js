import test from 'node:test';
import assert from 'node:assert/strict';

import { CONFIG } from '../js/config.js';

test('expone una URL base válida para la API', () => {
    assert.match(CONFIG.API_BASE_URL, /^https?:\/\/.+\/api\/v1$/);
    assert.match(CONFIG.HEALTH_URL, /^https?:\/\/.+\/$/);
});

test('define las entidades usuarios y productos', () => {
    assert.ok(CONFIG.ENTITIES.usuarios);
    assert.ok(CONFIG.ENTITIES.productos);
    assert.equal(CONFIG.ENTITIES.usuarios.endpoint, '/usuarios');
    assert.equal(CONFIG.ENTITIES.productos.endpoint, '/productos');
});

test('cada entidad declara campos y columnas', () => {
    for (const [key, entidad] of Object.entries(CONFIG.ENTITIES)) {
        assert.ok(Array.isArray(entidad.fields) && entidad.fields.length > 0, `${key} debe tener fields`);
        assert.ok(Array.isArray(entidad.columns) && entidad.columns.length > 0, `${key} debe tener columns`);
        assert.ok(entidad.fields.some((field) => field.required === true), `${key} debe tener al menos un campo obligatorio`);
    }
});

test('la paginación por defecto es coherente', () => {
    const { DEFAULT_PAGE, DEFAULT_LIMIT, LIMIT_OPTIONS } = CONFIG.PAGINATION;

    assert.equal(DEFAULT_PAGE, 1);
    assert.ok(DEFAULT_LIMIT >= 1);
    assert.ok(LIMIT_OPTIONS.includes(DEFAULT_LIMIT));
});
