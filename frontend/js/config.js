/**
 * Configuración global del Frontend
 * Centraliza las URLs de la API REST y constantes del sistema
 */

export const CONFIG = {
    // URL base de la API versionada (Backend en puerto 5050)
    API_BASE_URL: 'http://localhost:5050/api/v1',
    HEALTH_URL: 'http://localhost:5050/',

    // Configuración de paginación por defecto
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        LIMIT_OPTIONS: [5, 10, 25, 50, 100]
    },

    // Definición de entidades descubiertas en el Backend
    ENTITIES: {
        usuarios: {
            id: 'usuarios',
            title: 'Gestión de Usuarios',
            singular: 'Usuario',
            endpoint: '/usuarios',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            fields: [
                { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true, minLength: 2, maxLength: 150, placeholder: 'Ej. María Gómez' },
                { name: 'email', label: 'Correo Electrónico', type: 'email', required: true, maxLength: 100, placeholder: 'maria@ejemplo.com' },
                { 
                    name: 'rol', 
                    label: 'Rol del Sistema', 
                    type: 'select', 
                    required: true,
                    options: [
                        { value: 'usuario', label: 'Usuario Estándar' },
                        { value: 'admin', label: 'Administrador' },
                        { value: 'moderador', label: 'Moderador' },
                        { value: 'auditor', label: 'Auditor' }
                    ]
                },
                { name: 'activo', label: 'Usuario Activo', type: 'checkbox', default: true }
            ],
            columns: [
                { key: 'id', label: 'ID', width: '60px' },
                { key: 'nombre', label: 'Nombre' },
                { key: 'email', label: 'Correo Electrónico' },
                { key: 'rol', label: 'Rol', format: 'badge-role' },
                { key: 'activo', label: 'Estado', format: 'badge-boolean' },
                { key: 'fecha-creacion', label: 'Fecha de Registro', format: 'date' }
            ]
        },
        productos: {
            id: 'productos',
            title: 'Gestión de Productos',
            singular: 'Producto',
            endpoint: '/productos',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
            fields: [
                { name: 'codigo', label: 'Código Único', type: 'text', required: true, minLength: 3, maxLength: 20, placeholder: 'Ej. PROD-000123' },
                { name: 'nombre', label: 'Nombre del Producto', type: 'text', required: true, minLength: 2, maxLength: 150, placeholder: 'Ej. Laptop Ultrabook Pro' },
                { 
                    name: 'categoria', 
                    label: 'Categoría', 
                    type: 'select', 
                    required: true,
                    options: [
                        { value: 'Periféricos', label: 'Periféricos' },
                        { value: 'Almacenamiento', label: 'Almacenamiento' },
                        { value: 'Audio y Video', label: 'Audio y Video' },
                        { value: 'Computación', label: 'Computación' },
                        { value: 'Telefonía', label: 'Telefonía' },
                        { value: 'Redes', label: 'Redes' }
                    ]
                },
                { name: 'precio', label: 'Precio ($ USD)', type: 'number', step: '0.01', min: 0, required: true, placeholder: '0.00' },
                { name: 'stock', label: 'Stock en Almacén', type: 'number', step: '1', min: 0, required: true, placeholder: '0' },
                { name: 'url-imagen', label: 'URL de Imagen (Opcional)', type: 'url', required: false, placeholder: 'https://images.unsplash.com/...' },
                { name: 'descripcion', label: 'Descripción Detallada', type: 'textarea', required: false, placeholder: 'Detalles del producto...' },
                { name: 'estado', label: 'Producto Disponible', type: 'checkbox', default: true }
            ],
            columns: [
                { key: 'id', label: 'ID', width: '60px' },
                { key: 'url-imagen', label: 'Foto', format: 'image', width: '60px' },
                { key: 'codigo', label: 'Código', format: 'code' },
                { key: 'nombre', label: 'Nombre' },
                { key: 'categoria', label: 'Categoría', format: 'badge-category' },
                { key: 'precio', label: 'Precio', format: 'currency' },
                { key: 'stock', label: 'Stock', format: 'badge-stock' },
                { key: 'estado', label: 'Disponible', format: 'badge-boolean' }
            ]
        }
    }
};
