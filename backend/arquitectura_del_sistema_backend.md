# Documentación de Arquitectura del Backend

Este documento define la arquitectura de software, los estándares de diseño, la estructura de directorios y las prácticas de seguridad para el desarrollo del backend utilizando **Node.js**, **Express** y **PostgreSQL**.

---

## 1. Estilos Arquitectónicos

El sistema se fundamenta en tres estilos arquitectónicos principales que garantizan escalabilidad, desacoplamiento y facilidad de mantenimiento:

1. **Cliente-Servidor:** Separa las responsabilidades entre los consumidores de información (Frontend Web, Apps Móviles, servicios externos) y el proveedor de recursos y lógica de negocio (Backend API), comunicándose exclusivamente a través de la red mediante protocolos estándar (HTTP/HTTPS).
2. **Arquitectura en N-Capas (N-Tier):** Divide el sistema en capas lógicas y físicas bien definidas donde cada capa tiene una única responsabilidad y solo se comunica con sus capas adyacentes:
   * **Capa de Presentación / Enrutamiento:** Expone los puntos de entrada (Endpoints) y gestiona las peticiones HTTP.
   * **Capa de Lógica de Negocio (Controladores):** Orquesta el flujo de datos, aplica reglas de negocio y formatea las respuestas.
   * **Capa de Acceso a Datos (Modelos / Repositorios):** Abstrae la comunicación directa con el motor de base de datos.
   * **Capa de Persistencia:** Motor de base de datos relacional **PostgreSQL**.
3. **REST (Representational State Transfer):** La API se diseña bajo principios RESTful:
   * **Sin estado (Stateless):** Cada petición contiene toda la información necesaria para ser procesada, sin almacenar sesiones en el servidor.
   * **Interfaz uniforme:** Uso estricto de recursos identificados por URIs y manipulados mediante métodos HTTP estándar (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
   * **Representación de recursos:** Intercambio de datos estructurados en formato **JSON**.

---

## 2. Patrón Arquitectónico y Patrones de Diseño

### Patrón Arquitectónico: MVC (Modelo - Vista - Controlador) adaptado a API
En el contexto de una API REST, el patrón **MVC** se adapta eliminando las vistas gráficas tradicionales (HTML) y reemplazándolas por representaciones de datos en **JSON**:
* **Modelo (Model):** Representa las entidades del negocio y gestiona el acceso e integridad de los datos en PostgreSQL.
* **Vista (View):** Representada por las respuestas JSON estructuradas y los códigos de estado HTTP devueltos al cliente.
* **Controlador (Controller):** Actúa como intermediario entre las rutas (peticiones entrantes) y los modelos, procesando la lógica necesaria.

### Patrones de Diseño Implementados

1. **Singleton (Para el Modelo y Conexión a Datos):**
   * **Propósito:** Garantizar que exista una única instancia del pool de conexiones a PostgreSQL (y de los gestores de modelos base) en todo el ciclo de vida de la aplicación.
   * **Beneficio:** Evita la saturación de conexiones en la base de datos y optimiza el consumo de memoria del servidor Node.js.
2. **Repository (Para el Modelo):**
   * **Propósito:** Desacoplar la lógica de negocio de la lógica de acceso a datos. Cada modelo expone métodos semánticos (ej. `findAll()`, `findById()`, `create()`, `update()`, `delete()`) ocultando las consultas SQL subyacentes.
   * **Beneficio:** Facilita el mantenimiento, las pruebas unitarias y permite cambiar consultas SQL sin afectar a los controladores.
3. **Factory (Para la Comunicación entre Capas):**
   * **Propósito:** Proveer una interfaz centralizada para instanciar y conectar dinámicamente los repositorios, modelos y controladores sin acoplar sus implementaciones concretas.
   * **Beneficio:** Permite inyectar dependencias de forma limpia entre la capa de controladores y la capa de datos, facilitando la escalabilidad cuando se agregan nuevos módulos.

---

## 3. Estructura de Directorios del Backend

El proyecto sigue una estructura modular estricta basada en la separación de responsabilidades:

```text
backend-project/
├── src/
│   ├── server/          # Configuración e inicialización del servidor Express (Puerto 5050)
│   ├── routes/          # Definición de endpoints (un archivo por cada modelo/recurso)
│   ├── middlewares/     # Interceptores de peticiones (CORS, seguridad, validación, errores, etc.)
│   ├── controllers/     # Lógica de control y respuestas HTTP (un archivo por cada modelo)
│   ├── models/          # Definición de entidades, Singleton de BD y patrón Repository
│   └── factories/       # Fábricas para la instanciación y comunicación entre capas
├── .env                 # Variables de entorno y configuraciones globales (no versionado)
├── .env.example         # Plantilla de variables de entorno
├── .gitignore           # Exclusión de archivos sensibles (node_modules, .env)
└── package.json         # Dependencias y scripts del proyecto
```

---

## 4. Descripción Detallada de los Componentes

### A. `server/` (Servidor Principal)
* Encargado de instanciar la aplicación **Express**, registrar los middlewares globales, montar el sistema de enrutamiento y levantar el servicio escuchando en el **puerto `5050`** (configurable vía `.env`).
* Implementa el apagado elegante (*Graceful Shutdown*) para cerrar las conexiones activas de PostgreSQL antes de detener el proceso.

### B. `middlewares/` (Capa de Intercepción y Seguridad)
Toda petición pasa por una tubería (*pipeline*) de middlewares antes de llegar al controlador:
1. **Control de CORS:** Configuración estricta de orígenes permitidos (`Access-Control-Allow-Origin`), métodos autorizados y cabeceras permitidas para evitar accesos no autorizados desde dominios externos.
2. **Verificación de JSON:** Validación de que las peticiones con cuerpo (`POST`, `PUT`, `PATCH`) incluyan la cabecera `Content-Type: application/json` y contengan un payload JSON sintácticamente válido, capturando errores de parseo antes de llegar al controlador.
3. **Validación y Sanitización:**
   * *Validación:* Verificación de tipos de datos, campos obligatorios, formatos (emails, UUIDs, fechas) y rangos permitidos.
   * *Sanitización:* Limpieza de entradas (trim, escape de caracteres especiales) para prevenir ataques de inyección (XSS, SQL Injection).
4. **Versionamiento de API:** Gestión de versiones mediante prefijos en la URI (ej. `/api/v1/...`) o cabeceras personalizadas (`Accept-Version`), permitiendo evolucionar la API sin romper compatibilidad con clientes antiguos.
5. **Paginación:** Middleware que intercepta parámetros de consulta (`?page=1&limit=10`), valida que sean enteros positivos, establece límites máximos por seguridad (ej. máximo 100 registros por petición) y calcula el `offset` para las consultas SQL.
6. **Control de Excepciones (Error Handler Global):** Middleware centralizado de 4 parámetros `(err, req, res, next)` que captura cualquier error síncrono o asíncrono, registra el detalle interno en logs y devuelve una respuesta JSON estandarizada sin exponer trazas internas (*stack traces*) en producción.

### C. `routes/` (Enrutamiento Modular)
* **Regla de diseño:** Se creará **un archivo de rutas independiente por cada modelo** del sistema (ej. `usuario.routes.js`, `producto.routes.js`).
* Cada archivo define los endpoints específicos del recurso y encadena los middlewares particulares (validación de esquemas, paginación) antes de invocar al método correspondiente del controlador.

### D. `controllers/` (Controladores de Recursos)
* **Regla de diseño:** Se creará **un archivo controlador independiente por cada modelo** (ej. `usuario.controller.js`, `producto.controller.js`).
* **Acciones mínimas obligatorias:** Todo controlador debe implementar las operaciones CRUD completas:
  * `getAll` / `getById` (**GET**): Consulta de colecciones (con soporte de paginación) y recursos individuales.
  * `create` (**POST**): Creación de nuevos registros.
  * `update` (**PUT**): Actualización completa de un recurso existente.
  * `partialUpdate` (**PATCH**): Actualización parcial de atributos específicos de un recurso.
  * `delete` (**DELETE**): Eliminación física o lógica (*soft delete*) de un recurso.

#### Estándar de Códigos de Estado HTTP
Los controladores deben responder estrictamente con los códigos HTTP semánticamente correctos:
* **`200 OK`**: Peticiones `GET`, `PUT`, `PATCH` o `DELETE` exitosas que devuelven contenido.
* **`201 Created`**: Petición `POST` exitosa que ha creado un nuevo recurso.
* **`204 No Content`**: Petición `DELETE` o `PUT` exitosa sin cuerpo de respuesta.
* **`400 Bad Request`**: Error de validación, JSON malformado o parámetros inválidos.
* **`401 Unauthorized` / `403 Forbidden`**: Fallos de autenticación o falta de permisos.
* **`404 Not Found`**: El recurso solicitado por ID no existe en PostgreSQL.
* **`409 Conflict`**: Conflicto de integridad (ej. intentar registrar un correo o clave única duplicada).
* **`500 Internal Server Error`**: Error inesperado no controlado en el servidor o base de datos.

### E. `models/` (Modelos y Persistencia en PostgreSQL)
* Implementa el patrón **Singleton** para gestionar el pool de conexiones (`pg.Pool`) hacia PostgreSQL.
* Implementa el patrón **Repository** por cada entidad, encapsulando todas las operaciones SQL.

---

## 5. Flujo de una Petición (Diagrama de Arquitectura)

```text
[ Cliente HTTP ]
       │
       ▼
[ Server Express (:5050) ]
       │
       ▼
[ Middlewares Globales ] ──► (CORS -> Verificación JSON -> Versionamiento)
       │
       ▼
[ Routes (por Modelo) ] ───► (Middlewares de Ruta: Paginación, Validación/Sanitización)
       │
       ▼
[ Controller (por Modelo) ] ◄──(Usa Factory)──► [ Model / Repository (Singleton) ]
       │                                                  │
       │                                                  ▼
       │                                         [ Base de Datos PostgreSQL ]
       ▼
[ Middleware de Excepciones ] (Si ocurre un error en cualquier paso)
       │
       ▼
[ Respuesta JSON + Código HTTP ]
```

---

## 6. Buenas Prácticas de Programación Segura

Para proteger la integridad del sistema y los datos en PostgreSQL, se aplican las siguientes medidas:

1. **Consultas Parametrizadas (Prepared Statements):** Prohibición absoluta de concatenar strings en consultas SQL. Todas las interacciones con PostgreSQL deben usar marcadores de posición (`$1, $2, ...`) para erradicar el riesgo de **Inyección SQL**.
2. **Cabeceras de Seguridad HTTP:** Uso de `helmet` para configurar cabeceras seguras (prevención de Clickjacking, Sniffing de MIME types, ocultamiento de `X-Powered-By`).
3. **Principio de Mínimo Privilegio en BD:** El usuario de PostgreSQL configurado en el backend solo tendrá permisos `SELECT`, `INSERT`, `UPDATE`, `DELETE` sobre las tablas necesarias, sin permisos de administración (`SUPERUSER` o `DROP TABLE`).
4. **Limitación de Tamaño de Payload:** Restricción del tamaño máximo del cuerpo JSON (ej. `express.json({ limit: '10kb' })`) para mitigar ataques de Denegación de Servicio (DoS).
5. **Rate Limiting:** Limitación de peticiones por IP en ventanas de tiempo determinadas para prevenir ataques de fuerza bruta.
6. **Gestión Segura de Secretos:** Ninguna credencial, puerto o cadena de conexión estará escrita en el código fuente (*hardcoded*); todo reside en variables de entorno.

---

## 7. Configuraciones Globales (`.env`)

Todas las configuraciones globales del entorno deben centralizarse en un archivo `.env` en la raíz del proyecto:

```env
# ==========================================
# CONFIGURACIÓN DEL SERVIDOR
# ==========================================
NODE_ENV=development
PORT=5050
API_VERSION=v1

# ==========================================
# CONFIGURACIÓN DE BASE DE DATOS (POSTGRESQL)
# ==========================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_base_datos
DB_USER=usuario_backend
DB_PASSWORD=contraseña_segura_aqui
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# ==========================================
# SEGURIDAD Y CORS
# ==========================================
CORS_ORIGIN=http://localhost:3000
JSON_BODY_LIMIT=10kb
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==========================================
# PAGINACIÓN POR DEFECTO
# ==========================================
DEFAULT_PAGE=1
DEFAULT_LIMIT=10
MAX_LIMIT=100
```