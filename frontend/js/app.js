/**
 * Controlador principal de la aplicación Frontend (Vanilla JS ES6+)
 * Orquesta la navegación, gestión de estado, filtros y operaciones CRUD
 */

import { CONFIG } from './config.js';
import { api } from './api.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.currentEntityKey = 'usuarios';
        this.pagination = {
            paginaActual: CONFIG.PAGINATION.DEFAULT_PAGE,
            limitePorPagina: CONFIG.PAGINATION.DEFAULT_LIMIT,
            totalRegistros: 0,
            totalPaginas: 1
        };
        this.filters = {
            busqueda: '',
            categoria: '',
            rol: '',
            activo: ''
        };
        this.debounceTimeout = null;

        this.init();
    }

    /**
     * Inicialización de la aplicación al cargar el DOM
     */
    async init() {
        this.renderNavigation();
        this.setupEventListeners();
        this.setupDialogAccessibility();
        await this.checkBackendStatus();
        await this.loadCurrentEntity();
    }

    /**
     * Entidad actual activa
     */
    get currentEntity() {
        return CONFIG.ENTITIES[this.currentEntityKey];
    }

    /**
     * Renderiza los botones de navegación entre entidades
     */
    renderNavigation() {
        const navContainer = document.getElementById('main-nav');
        if (!navContainer) return;

        navContainer.innerHTML = '';
        Object.entries(CONFIG.ENTITIES).forEach(([key, entity]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `nav-tab ${this.currentEntityKey === key ? 'active' : ''}`;
            btn.innerHTML = `${entity.icon} <span>${entity.title}</span>`;
            btn.addEventListener('click', () => this.switchEntity(key));
            navContainer.appendChild(btn);
        });

        this.updateHeaderInfo();
    }

    /**
     * Cambia la entidad activa (Usuarios <-> Productos)
     */
    async switchEntity(entityKey) {
        if (this.currentEntityKey === entityKey) return;

        this.currentEntityKey = entityKey;
        this.pagination.paginaActual = 1;
        this.filters = { busqueda: '', categoria: '', rol: '', activo: '' };

        // Limpiar inputs de filtro
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        // Actualizar tabs visuales
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.includes(this.currentEntity.title));
        });

        this.renderDynamicFilters();
        this.updateHeaderInfo();
        await this.loadCurrentEntity();
    }

    /**
     * Actualiza el encabezado del módulo (título, descripción y botón nuevo)
     */
    updateHeaderInfo() {
        const titleElem = document.getElementById('section-title');
        const descElem = document.getElementById('section-desc');
        const addBtn = document.getElementById('btn-add-entity');

        if (titleElem) titleElem.textContent = this.currentEntity.title;
        if (descElem) {
            descElem.textContent = this.currentEntityKey === 'usuarios'
                ? 'Administración y control de usuarios, permisos y credenciales de acceso.'
                : 'Inventario de productos con stock, precios, imágenes reales y categorías.';
        }
        if (addBtn) {
            addBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Nuevo ${this.currentEntity.singular}</span>
            `;
        }
    }

    /**
     * Renderiza filtros específicos según la entidad actual
     */
    renderDynamicFilters() {
        const extraFilterContainer = document.getElementById('extra-filters-container');
        if (!extraFilterContainer) return;

        if (this.currentEntityKey === 'productos') {
            extraFilterContainer.innerHTML = `
                <select id="filter-category" class="form-select form-select-filter">
                    <option value="">Todas las Categorías</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Almacenamiento">Almacenamiento</option>
                    <option value="Audio y Video">Audio y Video</option>
                    <option value="Computación">Computación</option>
                    <option value="Telefonía">Telefonía</option>
                    <option value="Redes">Redes</option>
                </select>
                <select id="filter-activos" class="form-select form-select-filter">
                    <option value="">Todos los Estados</option>
                    <option value="true">Solo Disponibles</option>
                </select>
            `;

            extraFilterContainer.querySelector('#filter-category')?.addEventListener('change', (e) => {
                this.filters.categoria = e.target.value;
                this.pagination.paginaActual = 1;
                this.loadCurrentEntity();
            });

            extraFilterContainer.querySelector('#filter-activos')?.addEventListener('change', (e) => {
                this.filters.activos = e.target.value;
                this.pagination.paginaActual = 1;
                this.loadCurrentEntity();
            });
        } else if (this.currentEntityKey === 'usuarios') {
            extraFilterContainer.innerHTML = `
                <select id="filter-rol" class="form-select form-select-filter">
                    <option value="">Todos los Roles</option>
                    <option value="admin">Administrador</option>
                    <option value="moderador">Moderador</option>
                    <option value="usuario">Usuario Estándar</option>
                    <option value="auditor">Auditor</option>
                </select>
                <select id="filter-usuario-activo" class="form-select form-select-filter">
                    <option value="">Todos los Estados</option>
                    <option value="true">Solo Activos</option>
                    <option value="false">Inactivos</option>
                </select>
            `;

            extraFilterContainer.querySelector('#filter-rol')?.addEventListener('change', (e) => {
                this.filters.rol = e.target.value;
                this.pagination.paginaActual = 1;
                this.loadCurrentEntity();
            });

            extraFilterContainer.querySelector('#filter-usuario-activo')?.addEventListener('change', (e) => {
                this.filters.activo = e.target.value;
                this.pagination.paginaActual = 1;
                this.loadCurrentEntity();
            });
        }
    }

    /**
     * Carga los datos de la entidad actual desde la API
     */
    async loadCurrentEntity() {
        UI.showTableLoading('table-container', this.currentEntity.columns.length);

        const params = {
            page: this.pagination.paginaActual,
            limit: this.pagination.limitePorPagina,
            busqueda: this.filters.busqueda,
            categoria: this.filters.categoria,
            rol: this.filters.rol,
            activo: this.filters.activo,
            activos: this.filters.activos
        };

        try {
            const response = await api.get(this.currentEntity.endpoint, params);

            if (response.exito && response.datos) {
                // Actualizar metadata de paginación
                if (response.paginacion) {
                    this.pagination = {
                        paginaActual: response.paginacion.paginaActual,
                        limitePorPagina: response.paginacion.limitePorPagina,
                        totalRegistros: response.paginacion.totalRegistros,
                        totalPaginas: response.paginacion.totalPaginas
                    };
                }

                // Renderizar tabla y paginación
                UI.renderTable(
                    'table-container',
                    this.currentEntity,
                    response.datos,
                    (item) => this.handleEdit(item),
                    (item) => this.handleDelete(item)
                );

                UI.renderPagination(
                    'pagination-container',
                    this.pagination,
                    (newPage) => {
                        this.pagination.paginaActual = newPage;
                        this.loadCurrentEntity();
                    },
                    (newLimit) => {
                        this.pagination.limitePorPagina = newLimit;
                        this.pagination.paginaActual = 1;
                        this.loadCurrentEntity();
                    }
                );
            } else {
                throw new Error(response.mensaje || 'Error al obtener los registros');
            }
        } catch (error) {
            UI.showToast(error.message, 'error');
            UI.renderTable('table-container', this.currentEntity, [], null, null);
            UI.renderPagination('pagination-container', null);
        }
    }

    /**
     * Abre el modal para crear un nuevo registro (POST)
     */
    handleCreate() {
        UI.openFormModal(this.currentEntity, null, async (formData) => {
            const res = await api.post(this.currentEntity.endpoint, formData);
            if (res.exito || res.codigoEstado === 201) {
                UI.showToast(`${this.currentEntity.singular} creado exitosamente`, 'success');
                await this.loadCurrentEntity();
            } else {
                throw new Error(res.mensaje || 'Error al crear el registro');
            }
        });
    }

    /**
     * Abre el modal para editar un registro existente (PUT / PATCH)
     */
    handleEdit(item) {
        UI.openFormModal(this.currentEntity, item, async (formData, isEditing, id) => {
            const res = await api.put(`${this.currentEntity.endpoint}/${id}`, formData);
            if (res.exito || res.codigoEstado === 200) {
                UI.showToast(`${this.currentEntity.singular} #${id} actualizado correctamente`, 'success');
                await this.loadCurrentEntity();
            } else {
                throw new Error(res.mensaje || 'Error al actualizar el registro');
            }
        });
    }

    /**
     * Confirmación y eliminación de un registro (DELETE)
     */
    handleDelete(item) {
        const nombreMostrar = item.nombre || item.codigo || `#${item.id}`;
        UI.openConfirmDialog({
            title: `¿Eliminar ${this.currentEntity.singular}?`,
            message: `Esta acción eliminará el registro "${nombreMostrar}" (ID: ${item.id}). ¿Desea continuar?`,
            confirmText: 'Sí, Eliminar',
            onConfirm: async () => {
                const res = await api.delete(`${this.currentEntity.endpoint}/${item.id}`);
                // Recordar que DELETE en usuarios responde 204 y productos responde 200
                if (res.codigoEstado === 204 || res.exito || res.codigoEstado === 200) {
                    UI.showToast(`${this.currentEntity.singular} eliminado exitosamente`, 'success');
                    // Si eliminamos el último elemento de la página, retroceder una página si es posible
                    if (this.pagination.totalRegistros % this.pagination.limitePorPagina === 1 && this.pagination.paginaActual > 1) {
                        this.pagination.paginaActual--;
                    }
                    await this.loadCurrentEntity();
                } else {
                    throw new Error(res.mensaje || 'Error al eliminar el registro');
                }
            }
        });
    }

    /**
     * Configuración de eventos globales (búsqueda, botones de acción)
     */
    setupEventListeners() {
        // Botón nuevo registro
        const addBtn = document.getElementById('btn-add-entity');
        addBtn?.addEventListener('click', () => this.handleCreate());

        // Búsqueda en tiempo real con debounce
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.filters.busqueda = e.target.value.trim();
                this.pagination.paginaActual = 1;
                this.loadCurrentEntity();
            }, 300);
        });

        // Botón recargar
        const refreshBtn = document.getElementById('btn-refresh');
        refreshBtn?.addEventListener('click', async () => {
            await this.checkBackendStatus();
            await this.loadCurrentEntity();
            UI.showToast('Datos actualizados', 'info', 2000);
        });

        this.renderDynamicFilters();
    }

    /**
     * Mejora de accesibilidad para diálogos nativos (<dialog>)
     * Soporte de Light-dismiss al hacer clic en el backdrop
     */
    setupDialogAccessibility() {
        const dialogs = document.querySelectorAll('dialog');
        dialogs.forEach(dialog => {
            // Cerrar al hacer clic en el backdrop fuera del cuadro del modal
            dialog.addEventListener('click', (e) => {
                const rect = dialog.getBoundingClientRect();
                const clickedInDialog = (
                    rect.top <= e.clientY &&
                    e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX &&
                    e.clientX <= rect.left + rect.width
                );
                if (!clickedInDialog) {
                    dialog.close();
                }
            });

            // Botón de cancelar o cerrar dentro del modal
            dialog.querySelectorAll('[data-action="close-dialog"]').forEach(btn => {
                btn.addEventListener('click', () => dialog.close());
            });
        });
    }

    /**
     * Comprueba la conectividad con el backend y actualiza la insignia en el header
     */
    async checkBackendStatus() {
        const statusBadge = document.getElementById('backend-status');
        if (!statusBadge) return;

        const health = await api.checkHealth();
        if (health && health.exito) {
            statusBadge.className = 'status-badge status-online';
            statusBadge.innerHTML = `<span class="status-dot"></span> Backend Activo (${health.version || 'v1'})`;
        } else {
            statusBadge.className = 'status-badge status-offline';
            statusBadge.innerHTML = `<span class="status-dot"></span> Backend Desconectado`;
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
