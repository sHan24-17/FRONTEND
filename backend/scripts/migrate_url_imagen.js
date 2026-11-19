const { query, pool } = require('../src/config/db');

async function migrate() {
    try {
        console.log('1. Agregando la columna "url-imagen" (VARCHAR(500)) si no existe...');
        await query('ALTER TABLE productos ADD COLUMN IF NOT EXISTS "url-imagen" VARCHAR(500);');
        console.log('Columna "url-imagen" asegurada.');

        console.log('2. Actualizando los 10,000 productos con URLs reales de imágenes desde internet...');
        const updateSql = `
            UPDATE productos
            SET "url-imagen" = CASE
                WHEN nombre ILIKE 'Laptop%' THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Mouse%' THEN 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Teclado%' THEN 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Monitor%' THEN 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Impresora%' THEN 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Smartphone%' THEN 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Tablet%' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Auriculares%' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Cargador%' THEN 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Disco Duro%' THEN 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Cámara Web%' THEN 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Altavoz Bluetooth%' THEN 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Memoria RAM%' THEN 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Router Wi-Fi%' THEN 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'
                WHEN nombre ILIKE 'Micrófono%' THEN 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80'
                ELSE 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'
            END;
        `;
        const res = await query(updateSql);
        console.log(`Filas actualizadas con éxito: ${res.rowCount}`);

        const checkRes = await query('SELECT id, codigo, nombre, categoria, "url-imagen" FROM productos ORDER BY id ASC LIMIT 5;');
        console.log('Muestra de productos actualizados:', checkRes.rows);

        const nullCheck = await query('SELECT count(*) AS total_nulos FROM productos WHERE "url-imagen" IS NULL;');
        console.log('Productos sin url-imagen:', nullCheck.rows[0].total_nulos);

        console.log('Migración completada exitosamente.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        await pool.end();
    }
}

migrate();
