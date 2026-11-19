# API REST MVC con Express, PostgreSQL y Middlewares

Backend estructurado según el patrón **MVC** con capas bien definidas: **EXPRESS**, **RUTAS**, **MIDDLEWARE**, **CONTROLLER** y **MODELO**.

---

## 📂 Estructura del Proyecto

```
TEST/
├── .env                              # Variables de entorno locales
├── .env.example                      # Plantilla de variables de entorno
├── init_bd_dp_prueba.sql             # Script SQL de BD y 10,000 productos (con url-imagen)
├── package.json                      # Dependencias y scripts de Node.js
├── scripts/
│   ├── migrate_url_imagen.js         # Script para agregar y poblar url-imagen en BD existente
│   └── test_api_url_imagen.js        # Suite de pruebas automatizadas del atributo url-imagen
└── src/
    ├── app.js                        # Configuración principal de Express
    ├── server.js                     # Inicialización del servidor HTTP y DB
    ├── config/
    │   └── db.js                     # Conexión mediante Pool de PostgreSQL ('pg')
    ├── models/
    │   └── productoModel.js          # MODELO: Consultas y operaciones a BD
    ├── controllers/
    │   └── productoController.js     # CONTROLADOR: Lógica CRUD (GET, POST, PUT, DELETE)
    ├── middlewares/
    │   ├── corsMiddleware.js         # Control de CORS
    │   ├── errorHandlerMiddleware.js # Control global de errores con next(err) y 404
    │   ├── paginationMiddleware.js   # Paginación fija de 100 en 100 registros
    │   ├── sanitizationMiddleware.js # Sanitización y limpieza de entradas
    │   └── validationMiddleware.js   # Validaciones de esquemas con express-validator
    ├── routes/
    │   ├── index.js                  # Enrutador principal con versionado
    │   └── v1/
    │       ├── index.js              # Enrutador versión 1
    │       └── productoRoutes.js     # RUTAS del recurso /productos
    └── utils/
        ├── apiError.js               # Clase personalizada de errores HTTP
        └── imageService.js           # Servicio de resolución y APIs de imágenes de internet
```

---

## 🚀 Puesta en Marcha

### 1. Configurar la Base de Datos
Asegúrate de haber ejecutado el script [init_bd_dp_prueba.sql](file:///D:/evilore_/Evilore%20U/Semestres/5%20Semestre/Desarrollo%20en%20Plataformas/RDA2/2.%20Semanas%207-11/TEST/init_bd_dp_prueba.sql) en pgAdmin para crear la base de datos `BD_DP_PRUEBA`, la tabla `productos` y los 10,000 registros.

### 2. Configurar el archivo `.env`
Edita el archivo [.env](file:///D:/evilore_/Evilore%20U/Semestres/5%20Semestre/Desarrollo%20en%20Plataformas/RDA2/2.%20Semanas%207-11/TEST/.env) con la contraseña de tu usuario `postgres`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_clave_de_postgres
DB_NAME=BD_DP_PRUEBA

CORS_ORIGIN=*
```

### 3. Iniciar el Servidor
```bash
# Modo desarrollo con recarga automática:
npm run dev

# Modo producción:
npm start
```

---

## 📡 Endpoints de la API (Versión 1)

Base URL: `http://localhost:3000/api/v1/productos`

| Método | Endpoint | Descripción | Middlewares Aplicados |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/productos` | Listar productos (100 en 100) | CORS, Sanitización, Validación Query, Paginación |
| **GET** | `/api/v1/productos/:id` | Obtener producto por ID | CORS, Validación de `:id` |
| **POST** | `/api/v1/productos` | Crear nuevo producto | CORS, Sanitización, Validación Body |
| **PUT** | `/api/v1/productos/:id` | Actualizar producto | CORS, Sanitización, Validación Body y `:id` |
| **DELETE** | `/api/v1/productos/:id` | Eliminar producto | CORS, Validación de `:id` |

---

### Parámetros de Consulta para `GET /api/v1/productos`
- `page`: Número de página (ej. `?page=2`). Trae del 101 al 200.
- `categoria`: Filtrar por categoría (ej. `?categoria=Computación`).
- `busqueda`: Búsqueda por texto en nombre, código o descripción (ej. `?busqueda=Monitor`).
- `activos`: Filtrar solo activos (`?activos=true`).

---

### Ejemplo de Petición `POST /api/v1/productos`
**Body (JSON) con `url-imagen` opcional o personalizada:**
```json
{
  "codigo": "PROD-999999",
  "nombre": "Monitor Gamer Curvo 27 OLED",
  "descripcion": "Resolución 2K 240Hz 0.03ms",
  "categoria": "Periféricos",
  "precio": 499.99,
  "stock": 45,
  "estado": true,
  "url-imagen": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
}
```

> **Nota sobre el atributo `url-imagen`**: Si omites `url-imagen` al registrar un producto, el servicio integrado `src/utils/imageService.js` consultará automáticamente la API de imágenes de internet (DummyJSON / Unsplash) según el nombre o categoría del producto para asignarle una URL de imagen real de forma dinámica.

---

### Migración de Base de Datos para `url-imagen`
Si ya tenías la base de datos creada anteriormente, puedes ejecutar:
```bash
npm run migrate:images
```
Este comando agrega automáticamente la columna `"url-imagen"` (VARCHAR(500)) y actualiza los 10,000 productos con URLs reales de imágenes de internet verificadas.

Para ejecutar la suite de pruebas del nuevo atributo:
```bash
node scripts/test_api_url_imagen.js
```

---

## 🛡️ Middlewares Implementados
1. **Control de CORS**: `src/middlewares/corsMiddleware.js` con soporte para orígenes permitidos por entorno.
2. **Control de Errores con `next`**: `src/middlewares/errorHandlerMiddleware.js` que captura excepciones de la aplicación, errores de restricciones de PostgreSQL (duplicidad, tipos, etc.) y genera respuestas JSON homogéneas.
3. **Validación**: `src/middlewares/validationMiddleware.js` usando `express-validator` para validar tipos, valores numéricos no negativos y requerimientos.
4. **Sanitización**: `src/middlewares/sanitizationMiddleware.js` que limpia espacios innecesarios y etiquetas maliciosas.
5. **Paginación**: `src/middlewares/paginationMiddleware.js` que calcula y fija el flujo de 100 en 100 registros.
6. **Versionado de API**: Implementado en la capa de rutas bajo el prefijo `/api/v1/`.
