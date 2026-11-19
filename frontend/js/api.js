/**
 * Cliente HTTP centralizado para interactuar con la API REST
 * Wrapper robusto sobre la API Fetch nativa de ES6+
 */

import { CONFIG } from './config.js';

class ApiClient {
    constructor(baseUrl = CONFIG.API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Construye la URL completa con parámetros de consulta (query params)
     */
    _buildUrl(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                url.searchParams.append(key, value);
            }
        });
        return url.toString();
    }

    /**
     * Ejecuta una petición HTTP con manejo exhaustivo de estados HTTP
     */
    async _request(endpoint, options = {}, queryParams = {}) {
        const url = this._buildUrl(endpoint, queryParams);
        const headers = {
            'Accept': 'application/json',
            ...(options.headers || {})
        };

        // Si la petición envía cuerpo (POST, PUT, PATCH), obligar Content-Type JSON
        if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase())) {
            headers['Content-Type'] = 'application/json';
            if (typeof options.body !== 'string') {
                options.body = JSON.stringify(options.body);
            }
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);

            // 1. Manejo de estado 204 No Content (sin cuerpo de respuesta)
            if (response.status === 204) {
                return {
                    exito: true,
                    codigoEstado: 204,
                    mensaje: 'Operación realizada correctamente (sin contenido)',
                    datos: null
                };
            }

            // 2. Parseo de respuesta JSON
            let responseData = null;
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                try {
                    responseData = await response.json();
                } catch {
                    responseData = null;
                }
            } else {
                const text = await response.text();
                responseData = { mensaje: text };
            }

            // 3. Manejo de estados de éxito 200 y 201
            if (response.ok) {
                return responseData || { exito: true, codigoEstado: response.status, datos: null };
            }

            // 4. Manejo de errores controlados por códigos de estado (400, 404, 409, 500, etc.)
            let mensajeError = 'Error inesperado en el servidor';
            let detalles = null;

            if (responseData) {
                mensajeError = responseData.mensaje || responseData.message || mensajeError;
                detalles = responseData.detalles || responseData.errors || null;
            }

            const error = new Error(mensajeError);
            error.status = response.status;
            error.detalles = detalles;
            error.data = responseData;

            throw error;

        } catch (error) {
            // Error de red (servidor caído o sin conexión)
            if (!error.status) {
                const networkError = new Error('No se pudo conectar con el servidor backend en ' + this.baseUrl + '. Verifique que el servicio esté activo.');
                networkError.status = 0;
                throw networkError;
            }
            throw error;
        }
    }

    /**
     * GET: Obtener recursos (colecciones con paginación o recurso individual)
     */
    async get(endpoint, queryParams = {}) {
        return this._request(endpoint, { method: 'GET' }, queryParams);
    }

    /**
     * POST: Crear nuevo recurso
     */
    async post(endpoint, data) {
        return this._request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    /**
     * PUT: Actualización completa de un recurso
     */
    async put(endpoint, data) {
        return this._request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    /**
     * PATCH: Actualización parcial de campos de un recurso
     */
    async patch(endpoint, data) {
        return this._request(endpoint, {
            method: 'PATCH',
            body: data
        });
    }

    /**
     * DELETE: Eliminación de un recurso
     */
    async delete(endpoint) {
        return this._request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Comprobar estado de salud del backend
     */
    async checkHealth() {
        try {
            const res = await fetch(CONFIG.HEALTH_URL, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                return await res.json();
            }
            return null;
        } catch {
            return null;
        }
    }
}

export const api = new ApiClient();
