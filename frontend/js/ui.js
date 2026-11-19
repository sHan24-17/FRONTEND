/**
 * Módulo de interfaz de usuario (UI Helpers)
 * Componentes modales nativos (<dialog>), Toasts, Tablas responsivas y Estados visuales
 */

export class UI {
    /**
     * Sistema de Notificaciones Toast flotantes
     */
    static showToast(mensaje, tipo = 'info', duracion = 4000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo} animate-fade-in`;

        const iconos = {
            success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        };

        toast.innerHTML = `
            <span class="toast-icon">${iconos[tipo] || iconos.info}</span>
            <span class="toast-message">${this.escapeHtml(mensaje)}</span>
            <button type="button" class="toast-close" aria-label="Cerrar notificación">&times;</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => toast.remove(), 250);
        });

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.isConnected) {
                toast.classList.add('animate-fade-out');
                setTimeout(() => toast.remove(), 250);
            }
        }, duracion);
    }

    /**
     * Sanitiza cadenas HTML para prevenir XSS en la vista
     */
    static escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Formatea valores de celdas según el tipo definido en la configuración
     */
    static formatCellValue(value, format, row) {
        if (value === null || value === undefined || value === '') {
            return `<span class="text-muted">-</span>`;
        }

        switch (format) {
            case 'currency':
                return `<span class="font-mono font-semibold">$${parseFloat(value).toFixed(2)}</span>`;

            case 'badge-boolean': {
                const isActive = value === true || value === 'true';
                return `<span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">
                    ${isActive ? 'Activo' : 'Inactivo'}
                </span>`;
            }

            case 'badge-role': {
                const roles = {
                    admin: 'badge-purple',
                    moderador: 'badge-blue',
                    usuario: 'badge-gray',
                    auditor: 'badge-yellow'
                };
                const rolClass = roles[String(value).toLowerCase()] || 'badge-gray';
                return `<span class="badge ${rolClass}">${this.escapeHtml(value)}</span>`;
            }

            case 'badge-category':
                return `<span class="badge badge-indigo">${this.escapeHtml(value)}</span>`;

            case 'badge-stock': {
                const stock = parseInt(value, 10);
                let stockClass = 'badge-success';
                if (stock <= 5) stockClass = 'badge-danger';
                else if (stock <= 20) stockClass = 'badge-yellow';
                return `<span class="badge ${stockClass}">${stock} unid.</span>`;
            }

            case 'code':
                return `<code class="code-badge">${this.escapeHtml(value)}</code>`;

            case 'date': {
                try {
                    const date = new Date(value);
                    return `<span class="text-secondary">${date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>`;
                } catch {
                    return this.escapeHtml(value);
                }
            }

            case 'image': {
                const url = value || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80';
                return `
                    <div class="thumb-container">
                        <img src="${this.escapeHtml(url)}" alt="Miniatura" class="table-thumb" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'">
                    </div>
                `;
            }

            default:
                return this.escapeHtml(value);
        }
    }

    /**
     * Renderiza la tabla completa de registros
     */
    static renderTable(containerId, entityConfig, items, onEdit, onDelete, onQuickToggle) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                    </div>
                    <h3>No se encontraron registros</h3>
                    <p class="text-secondary">No hay elementos disponibles con los filtros actuales o la base de datos está vacía.</p>
                </div>
            `;
            return;
        }

        let tableHtml = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${entityConfig.columns.map(col => `
                                <th style="${col.width ? `width: ${col.width};` : ''}">${col.label}</th>
                            `).join('')}
                            <th class="text-right" style="width: 140px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        items.forEach(item => {
            tableHtml += `<tr data-id="${item.id}">`;
            entityConfig.columns.forEach(col => {
                const rawValue = item[col.key];
                const formatted = this.formatCellValue(rawValue, col.format, item);
                tableHtml += `<td>${formatted}</td>`;
            });

            tableHtml += `
                <td class="text-right table-actions">
                    <button type="button" class="btn-action btn-edit" title="Editar registro" data-action="edit" data-id="${item.id}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" class="btn-action btn-delete" title="Eliminar registro" data-action="delete" data-id="${item.id}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </td>
            </tr>`;
        });

        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHtml;

        // Delegación de eventos para botones de acción
        container.querySelectorAll('button[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = items.find(i => String(i.id) === String(id));
                if (item && onEdit) onEdit(item);
            });
        });

        container.querySelectorAll('button[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = items.find(i => String(i.id) === String(id));
                if (item && onDelete) onDelete(item);
            });
        });
    }

    /**
     * Muestra estado de carga (Skeleton o Spinner) en la tabla
     */
    static showTableLoading(containerId, colCount = 6) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let rowsHtml = '';
        for (let i = 0; i < 5; i++) {
            rowsHtml += `<tr>`;
            for (let c = 0; c < colCount; c++) {
                rowsHtml += `<td><div class="skeleton-shimmer skeleton-cell"></div></td>`;
            }
            rowsHtml += `<td><div class="skeleton-shimmer skeleton-cell" style="width: 80px; margin-left: auto;"></div></td></tr>`;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="data-table">
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renderiza controles de paginación
     */
    static renderPagination(containerId, pagination, onPageChange, onLimitChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!pagination || pagination.totalRegistros === 0) {
            container.innerHTML = '';
            return;
        }

        const { paginaActual, limitePorPagina, totalRegistros, totalPaginas } = pagination;
        const inicio = (paginaActual - 1) * limitePorPagina + 1;
        const fin = Math.min(paginaActual * limitePorPagina, totalRegistros);

        container.innerHTML = `
            <div class="pagination-info">
                Mostrando <span class="font-semibold">${inicio}</span> a <span class="font-semibold">${fin}</span> de <span class="font-semibold">${totalRegistros}</span> registros
            </div>
            <div class="pagination-controls">
                <div class="limit-selector">
                    <label for="page-limit-select" class="text-secondary text-sm">Por página:</label>
                    <select id="page-limit-select" class="form-select form-select-sm">
                        <option value="5" ${limitePorPagina === 5 ? 'selected' : ''}>5</option>
                        <option value="10" ${limitePorPagina === 10 ? 'selected' : ''}>10</option>
                        <option value="25" ${limitePorPagina === 25 ? 'selected' : ''}>25</option>
                        <option value="50" ${limitePorPagina === 50 ? 'selected' : ''}>50</option>
                        <option value="100" ${limitePorPagina === 100 ? 'selected' : ''}>100</option>
                    </select>
                </div>
                <div class="page-buttons">
                    <button type="button" class="btn btn-outline btn-sm" id="btn-page-first" ${paginaActual <= 1 ? 'disabled' : ''} title="Primera página">
                        &laquo;
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" id="btn-page-prev" ${paginaActual <= 1 ? 'disabled' : ''} title="Página anterior">
                        Anterior
                    </button>
                    <span class="page-number-indicator">
                        Página <strong>${paginaActual}</strong> de <strong>${totalPaginas || 1}</strong>
                    </span>
                    <button type="button" class="btn btn-outline btn-sm" id="btn-page-next" ${paginaActual >= totalPaginas ? 'disabled' : ''} title="Página siguiente">
                        Siguiente
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" id="btn-page-last" ${paginaActual >= totalPaginas ? 'disabled' : ''} title="Última página">
                        &raquo;
                    </button>
                </div>
            </div>
        `;

        // Eventos
        const limitSelect = container.querySelector('#page-limit-select');
        limitSelect?.addEventListener('change', (e) => {
            if (onLimitChange) onLimitChange(parseInt(e.target.value, 10));
        });

        container.querySelector('#btn-page-first')?.addEventListener('click', () => {
            if (paginaActual > 1 && onPageChange) onPageChange(1);
        });

        container.querySelector('#btn-page-prev')?.addEventListener('click', () => {
            if (paginaActual > 1 && onPageChange) onPageChange(paginaActual - 1);
        });

        container.querySelector('#btn-page-next')?.addEventListener('click', () => {
            if (paginaActual < totalPaginas && onPageChange) onPageChange(paginaActual + 1);
        });

        container.querySelector('#btn-page-last')?.addEventListener('click', () => {
            if (paginaActual < totalPaginas && onPageChange) onPageChange(totalPaginas);
        });
    }

    /**
     * Diálogo Modal de Formulario (Creación / Edición)
     * Construido sobre el elemento nativo <dialog> de HTML5
     */
    static openFormModal(entityConfig, item = null, onSave) {
        const isEditing = Boolean(item);
        const dialog = document.getElementById('entity-form-dialog');
        if (!dialog) return;

        const titleElem = dialog.querySelector('#dialog-title');
        titleElem.textContent = isEditing 
            ? `Editar ${entityConfig.singular} #${item.id}` 
            : `Crear Nuevo ${entityConfig.singular}`;

        const formBody = dialog.querySelector('#dialog-form-body');
        formBody.innerHTML = '';

        // Generar campos según metadata de la entidad
        entityConfig.fields.forEach(f => {
            const fieldId = `form-field-${f.name}`;
            const group = document.createElement('div');
            group.className = 'form-group';

            let currentValue = '';
            if (isEditing) {
                currentValue = item[f.name] !== undefined ? item[f.name] : '';
            } else if (f.default !== undefined) {
                currentValue = f.default;
            }

            if (f.type === 'checkbox') {
                const isChecked = currentValue === true || currentValue === 'true';
                group.innerHTML = `
                    <label class="checkbox-container">
                        <input type="checkbox" id="${fieldId}" name="${f.name}" ${isChecked ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-label">${f.label}</span>
                    </label>
                `;
            } else if (f.type === 'select') {
                const optionsHtml = f.options.map(opt => `
                    <option value="${opt.value}" ${String(opt.value) === String(currentValue) ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('');

                group.innerHTML = `
                    <label for="${fieldId}" class="form-label">${f.label} ${f.required ? '<span class="text-danger">*</span>' : ''}</label>
                    <select id="${fieldId}" name="${f.name}" class="form-select" ${f.required ? 'required' : ''}>
                        ${optionsHtml}
                    </select>
                `;
            } else if (f.type === 'textarea') {
                group.innerHTML = `
                    <label for="${fieldId}" class="form-label">${f.label} ${f.required ? '<span class="text-danger">*</span>' : ''}</label>
                    <textarea id="${fieldId}" name="${f.name}" class="form-textarea" rows="3" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}>${UI.escapeHtml(currentValue)}</textarea>
                `;
            } else {
                group.innerHTML = `
                    <label for="${fieldId}" class="form-label">${f.label} ${f.required ? '<span class="text-danger">*</span>' : ''}</label>
                    <input type="${f.type}" id="${fieldId}" name="${f.name}" value="${UI.escapeHtml(currentValue)}" class="form-input" 
                        placeholder="${f.placeholder || ''}" 
                        ${f.required ? 'required' : ''}
                        ${f.step ? `step="${f.step}"` : ''}
                        ${f.min !== undefined ? `min="${f.min}"` : ''}
                        ${f.minLength ? `minlength="${f.minLength}"` : ''}
                        ${f.maxLength ? `maxlength="${f.maxLength}"` : ''}>
                `;
            }

            formBody.appendChild(group);
        });

        // Configurar acción del formulario
        const form = dialog.querySelector('#entity-form');
        form.onsubmit = async (e) => {
            e.preventDefault();

            // Recolectar datos
            const formData = {};
            entityConfig.fields.forEach(f => {
                const elem = form.elements[f.name];
                if (!elem) return;

                if (f.type === 'checkbox') {
                    formData[f.name] = elem.checked;
                } else if (f.type === 'number') {
                    formData[f.name] = f.step === '1' ? parseInt(elem.value, 10) : parseFloat(elem.value);
                } else {
                    formData[f.name] = elem.value.trim();
                }
            });

            // Botón de submit en estado de carga
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            try {
                await onSave(formData, isEditing, item?.id);
                dialog.close();
            } catch (error) {
                UI.showToast(error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        };

        // Abrir modal con soporte nativo
        dialog.showModal();
    }

    /**
     * Modal nativo para Confirmación de Eliminación
     */
    static openConfirmDialog({ title, message, confirmText = 'Eliminar', onConfirm }) {
        const dialog = document.getElementById('confirm-dialog');
        if (!dialog) return;

        dialog.querySelector('#confirm-dialog-title').textContent = title;
        dialog.querySelector('#confirm-dialog-desc').textContent = message;

        const confirmBtn = dialog.querySelector('#confirm-dialog-action');
        confirmBtn.textContent = confirmText;

        // Limpiar listeners previos
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener('click', async () => {
            newConfirmBtn.disabled = true;
            newConfirmBtn.textContent = 'Procesando...';
            try {
                await onConfirm();
                dialog.close();
            } catch (error) {
                UI.showToast(error.message, 'error');
            } finally {
                newConfirmBtn.disabled = false;
                newConfirmBtn.textContent = confirmText;
            }
        });

        dialog.showModal();
    }
}
