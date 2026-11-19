-- ============================================================================
-- SCRIPT DE BASE DE DATOS: BD_DP_PRUEBA
-- Motor: PostgreSQL / pgAdmin 4
-- Descripción: Creación de tabla 'productos' e inserción de 10,000 registros
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PASO 1: CREAR BASE DE DATOS
-- NOTA: Ejecutar este comando conectado a la base de datos por defecto 'postgres'.
-- En pgAdmin, también puedes hacer clic derecho en 'Databases' -> 'Create' -> 'Database...'
-- ----------------------------------------------------------------------------
CREATE DATABASE "BD_DP_PRUEBA"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- ----------------------------------------------------------------------------
-- PASO 2: CONECTARSE A LA NUEVA BASE DE DATOS
-- En pgAdmin: Despliega el servidor, haz clic derecho sobre 'BD_DP_PRUEBA' y abre el 'Query Tool'.
-- Si usas psql en consola: \c BD_DP_PRUEBA
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- PASO 3: CREAR TABLA 'productos'
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS productos;

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    estado BOOLEAN DEFAULT TRUE,
    "url-imagen" VARCHAR(500),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices recomendados para optimizar búsquedas por código y categoría
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_categoria ON productos(categoria);

-- ----------------------------------------------------------------------------
-- PASO 4: INSERTAR 10,000 PRODUCTOS DE PRUEBA (ALTO RENDIMIENTO)
-- Utiliza generate_series() nativo de PostgreSQL para insertar en milisegundos
-- con datos realistas, variados y consistentes.
-- ----------------------------------------------------------------------------
INSERT INTO productos (
    codigo,
    nombre,
    descripcion,
    categoria,
    precio,
    stock,
    estado,
    "url-imagen",
    fecha_creacion
)
SELECT
    -- Código único con formato PROD-000001 a PROD-010000
    'PROD-' || LPAD(s.i::TEXT, 6, '0') AS codigo,

    -- Nombre dinámico combinando tipos, modelos y sufijos
    (ARRAY[
        'Laptop', 'Mouse', 'Teclado', 'Monitor', 'Impresora', 
        'Smartphone', 'Tablet', 'Auriculares', 'Cargador', 'Disco Duro',
        'Cámara Web', 'Altavoz Bluetooth', 'Memoria RAM', 'Router Wi-Fi', 'Micrófono'
    ])[1 + (s.i % 15)] || ' ' ||
    (ARRAY[
        'Pro', 'Ultra', 'Gamer', 'Max', 'Lite', 
        'Plus', 'Eco', 'Office', 'Prime', 'Titanium'
    ])[1 + ((s.i / 15) % 10)] || ' v' || s.i AS nombre,

    -- Descripción de prueba detallada
    'Descripción del producto de prueba #' || s.i || 
    '. Diseñado para alto rendimiento, durabilidad y compatibilidad estándar en entornos de desarrollo y producción.' AS descripcion,

    -- Categorías tecnológicas
    (ARRAY[
        'Computación', 
        'Periféricos', 
        'Almacenamiento', 
        'Audio y Video', 
        'Redes', 
        'Telefonía'
    ])[1 + (s.i % 6)] AS categoria,

    -- Precio aleatorio entre 5.00 y 2500.00 con 2 decimales
    ROUND((random() * (2500.00 - 5.00) + 5.00)::NUMERIC, 2) AS precio,

    -- Stock aleatorio entre 0 y 500 unidades
    FLOOR(random() * 501)::INT AS stock,

    -- Estado booleano: ~95% activos, ~5% inactivos
    (random() > 0.05) AS estado,

    -- URL real de imagen tomada de internet según el tipo de producto
    (ARRAY[
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80', -- Laptop
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80', -- Mouse
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', -- Teclado
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', -- Monitor
        'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80', -- Impresora
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80', -- Smartphone
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80', -- Tablet
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', -- Auriculares
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80', -- Cargador
        'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80', -- Disco Duro
        'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=80', -- Cámara Web
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', -- Altavoz Bluetooth
        'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80', -- Memoria RAM
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80', -- Router Wi-Fi
        'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80'  -- Micrófono
    ])[1 + (s.i % 15)] AS "url-imagen",

    -- Fecha aleatoria generada dentro de los últimos 365 días
    NOW() - (random() * interval '365 days') AS fecha_creacion
FROM generate_series(1, 10000) AS s(i);

-- ----------------------------------------------------------------------------
-- PASO 5: VALIDACIÓN Y CONSULTAS DE COMPROBACIÓN
-- ----------------------------------------------------------------------------

-- 1. Contar el total de registros insertados (debe dar 10000):
SELECT COUNT(*) AS total_productos FROM productos;

-- 2. Visualizar los primeros 10 productos generados:
SELECT * FROM productos ORDER BY id ASC LIMIT 10;

-- 3. Resumen estadístico por categoría:
SELECT 
    categoria,
    COUNT(*) AS cantidad_productos,
    ROUND(AVG(precio), 2) AS precio_promedio,
    MIN(precio) AS precio_minimo,
    MAX(precio) AS precio_maximo,
    SUM(stock) AS stock_total
FROM productos
GROUP BY categoria
ORDER BY cantidad_productos DESC;
