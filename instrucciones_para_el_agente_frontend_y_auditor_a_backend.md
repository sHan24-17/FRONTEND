# Guía de Desarrollo: Auditoría del Backend (Carpeta `TEST`) y Creación del Frontend

## 1. Contexto y Objetivo Principal
El objetivo es desarrollar una aplicación **Frontend** funcional, moderna y responsiva utilizando exclusivamente **HTML5, CSS3 y JavaScript (Vanilla ES6+)** que consuma la API REST ubicada en la carpeta local **`TEST`**. 

Adicionalmente, **antes o durante la integración**, debes auditar el código del backend en `TEST`. Si detectas errores de configuración, bugs, rutas rotas o problemas de comunicación con el frontend, **estás autorizado y obligado a corregirlos** manteniendo estrictamente su arquitectura original.

---

## 2. Arquitectura y Reglas del Backend (Referencia Obligatoria)
El backend en la carpeta `TEST` está construido con **Node.js, Express y PostgreSQL** bajo las siguientes especificaciones que debes respetar al auditarlo o repararlo:

* **Puerto y Versionamiento:** Corre por defecto en `http://localhost:5050` con prefijo de versión (ej. `/api/v1/...`, verificar en `.env` o `src/server/`).
* **Estructura Modular:**
  * `src/server/`: Inicialización de Express y *Graceful Shutdown*.
  * `src/routes/`: Un archivo de rutas por cada entidad/modelo.
  * `src/middlewares/`: CORS, verificación estricta de `Content-Type: application/json`, validación/sanitización, paginación (`?page=1&limit=10`) y manejador global de errores.
  * `src/controllers/`: Operaciones CRUD completas (`getAll`, `getById`, `create`, `update` [PUT], `partialUpdate` [PATCH], `delete`).
  * `src/models/`: Patrón **Singleton** para el pool de PostgreSQL (`pg.Pool`) y patrón **Repository** con consultas parametrizadas (`$1, $2...`).
  * `src/factories/`: Inyección de dependencias entre controladores y repositorios.

---

## 3. Fase 1: Auditoría, Arreglo y Arranque del Backend (`TEST`)

Antes de escribir código del frontend, inspecciona la carpeta `TEST` siguiendo estos pasos:

1. **Inspección de Entidades y Endpoints:**
   * Revisa `src/routes/`, `src/controllers/` y `src/models/` para identificar **qué tablas/recursos existen**, qué campos requiere cada uno, sus tipos de datos y qué validaciones aplican.
2. **Verificación de Configuración y Base de Datos:**
   * Verifica que exista el archivo `.env` (basado en `.env.example`). Comprueba credenciales de PostgreSQL (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
   * Verifica que las tablas existan en PostgreSQL. Si faltan scripts SQL o migraciones, créalos/ejecútalos según los campos definidos en los modelos.
3. **Corrección de Problemas Comunes (Checklist de Reparación):**
   * **CORS (`middlewares/`):** El `.env` tiene por defecto `CORS_ORIGIN=http://localhost:3000`. Si el frontend corre en otro puerto (ej. Live Server en `5500` o `8080`), actualiza `CORS_ORIGIN` o configura el middleware para aceptar el origen local del frontend, permitiendo métodos `GET, POST, PUT, PATCH, DELETE, OPTIONS` y cabecera `Content-Type`.
   * **Errores en Fábricas o Singleton:** Asegúrate de que `factories/` instancie correctamente los repositorios y controladores sin referencias circulares o `undefined`.
   * **Verificación de JSON:** El backend exige `Content-Type: application/json` en peticiones con cuerpo. Asegúrate de que no bloquee peticiones `GET` o `DELETE` sin cuerpo.
   * **Manejo de Errores:** Verifica que los errores de PostgreSQL (ej. clave duplicada `23505` -> `409 Conflict`, sintaxis inválida -> `400 Bad Request`) sean capturados y devueltos como JSON limpio sin colgar el servidor.
4. **Prueba de Humo:** Inicia el servidor (`npm start` o `npm run dev`) y confirma que responde correctamente en el puerto configurado.

---

## 4. Fase 2: Desarrollo del Frontend (HTML, CSS y JS Vanilla)

Crea una carpeta `frontend/` (al mismo nivel que `TEST` o donde indique el usuario) con una estructura limpia y modular, **sin usar frameworks externos** (ni React, Vue, Angular o jQuery):

```text
frontend/
├── index.html          # Estructura principal y navegación entre módulos
├── css/
│   └── styles.css      # Estilos modernos (Variables CSS, Flexbox/Grid, Diseño Responsivo)
└── js/
    ├── config.js       # URL base de la API (ej. http://localhost:5050/api/v1) y constantes
    ├── api.js          # Cliente HTTP centralizado (wrapper sobre fetch)
    ├── ui.js           # Helpers de interfaz (modales, notificaciones toast, tablas, loaders)
    └── app.js          # Lógica principal, manejo de eventos y estado de cada entidad
```

### Requerimientos Técnicos del Frontend:

1. **Cliente HTTP (`js/api.js`):**
   * Usa `fetch` con `async/await`.
   * Incluye **siempre** la cabecera `'Content-Type': 'application/json'` en peticiones `POST`, `PUT` y `PATCH`.
   * Maneja explícitamente los códigos de estado HTTP del backend:
     * `200` / `201`: Procesar datos y mostrar feedback positivo.
     * `204`: Actualizar vista sin intentar hacer `response.json()` (evita errores de parseo en cuerpo vacío).
     * `400` / `404` / `409` / `500`: Extraer el mensaje de error del JSON del backend y mostrarlo al usuario mediante una alerta/toast visual.
2. **Interfaz y Funcionalidades por Entidad:**
   * **Navegación:** Un menú lateral o superior dinámico para cambiar entre las distintas entidades/modelos descubiertos en el backend.
   * **Listado y Paginación:** Tabla responsiva que consuma los parámetros de paginación del backend (`?page=1&limit=10`), con botones de *Anterior / Siguiente* y selector de límite por página.
   * **Creación (`POST`) y Edición (`PUT` / `PATCH`):** Formulario modal o panel lateral generado según los campos del modelo, con validación básica en el cliente (campos obligatorios, tipos de datos) antes de enviar.
   * **Eliminación (`DELETE`):** Botón de eliminar con diálogo de confirmación antes de ejecutar la petición.
3. **Diseño Visual (`css/styles.css`):**
   * Usa variables CSS (`:root`) para una paleta de colores limpia y profesional.
   * Incluye estados visuales claros: indicadores de carga (*spinners*), estado vacío cuando no hay registros en la BD y notificaciones tipo *Toast* para éxitos o errores.
   * Asegura que sea 100% adaptable a dispositivos móviles y escritorio.

---

## 5. Entregables Esperados al Finalizar
1. El backend en `TEST` levantado, auditado y libre de errores de conexión, CORS o CRUD.
2. La aplicación frontend completa en HTML, CSS y JS lista para abrirse en el navegador (mediante servidor local como Live Server o `npx serve`).
3. Un breve resumen técnico indicando: qué entidades se encontraron, qué fallos se corrigieron en el backend (si hubo alguno) y cómo iniciar ambos servicios.