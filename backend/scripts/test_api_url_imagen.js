const app = require('../src/app');
const { pool, query } = require('../src/config/db');
const http = require('http');

async function runTests() {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(3001, resolve));
    console.log('Servidor de pruebas escuchando en puerto 3001');

    const BASE_URL = 'http://localhost:3001/api/v1/productos';
    let testId1 = null;
    let testId2 = null;

    try {
        console.log('\n--- 1. PROBAR GET /api/v1/productos ---');
        const resList = await fetch(`${BASE_URL}?limit=5`);
        const dataList = await resList.json();
        console.log('Status:', resList.status);
        console.log('Primer producto obtenido:', {
            id: dataList.datos[0].id,
            nombre: dataList.datos[0].nombre,
            'url-imagen': dataList.datos[0]['url-imagen']
        });
        if (!dataList.datos[0]['url-imagen']) {
            throw new Error('El producto no tiene url-imagen');
        }

        console.log('\n--- 2. PROBAR GET /api/v1/productos/:id ---');
        const firstId = dataList.datos[0].id;
        const resDetail = await fetch(`${BASE_URL}/${firstId}`);
        const dataDetail = await resDetail.json();
        console.log('Status:', resDetail.status);
        console.log('Producto obtenido por ID:', {
            id: dataDetail.datos.id,
            nombre: dataDetail.datos.nombre,
            'url-imagen': dataDetail.datos['url-imagen']
        });
        if (!dataDetail.datos['url-imagen']) {
            throw new Error('El detalle del producto no incluye url-imagen');
        }

        console.log('\n--- 3. PROBAR POST /api/v1/productos CON url-imagen EXPLÍCITA ---');
        const nuevoProd1 = {
            codigo: 'TEST-IMG-001',
            nombre: 'Mouse Óptico Ergonómico Test',
            descripcion: 'Mouse inalámbrico para pruebas automatizadas',
            categoria: 'Periféricos',
            precio: 35.50,
            stock: 20,
            estado: true,
            'url-imagen': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
        };
        const resCreate1 = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProd1)
        });
        const dataCreate1 = await resCreate1.json();
        console.log('Status:', resCreate1.status);
        console.log('Producto creado con imagen:', {
            id: dataCreate1.datos.id,
            codigo: dataCreate1.datos.codigo,
            'url-imagen': dataCreate1.datos['url-imagen']
        });
        testId1 = dataCreate1.datos.id;
        if (dataCreate1.datos['url-imagen'] !== nuevoProd1['url-imagen']) {
            throw new Error('La url-imagen no coincide con la enviada');
        }

        console.log('\n--- 4. PROBAR POST /api/v1/productos SIN url-imagen (RESOLUCIÓN AUTOMÁTICA VÍA API) ---');
        const nuevoProd2 = {
            codigo: 'TEST-IMG-002',
            nombre: 'Laptop Gaming RTX',
            descripcion: 'Laptop de alta gama para creadores y gamers',
            categoria: 'Computación',
            precio: 1499.99,
            stock: 10,
            estado: true
            // Sin url-imagen: el servicio debe buscarlo en la API externa de productos
        };
        const resCreate2 = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProd2)
        });
        const dataCreate2 = await resCreate2.json();
        console.log('Status:', resCreate2.status);
        console.log('Producto creado con imagen auto-resuelta por API/Servicio:', {
            id: dataCreate2.datos.id,
            codigo: dataCreate2.datos.codigo,
            'url-imagen': dataCreate2.datos['url-imagen']
        });
        testId2 = dataCreate2.datos.id;
        if (!dataCreate2.datos['url-imagen'] || !dataCreate2.datos['url-imagen'].startsWith('http')) {
            throw new Error('No se generó automáticamente la URL real de imagen');
        }

        console.log('\n--- 5. PROBAR PUT /api/v1/productos/:id PARA ACTUALIZAR url-imagen ---');
        const urlActualizada = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80';
        const resUpdate = await fetch(`${BASE_URL}/${testId1}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'url-imagen': urlActualizada })
        });
        const dataUpdate = await resUpdate.json();
        console.log('Status:', resUpdate.status);
        console.log('Producto actualizado:', {
            id: dataUpdate.datos.id,
            'url-imagen': dataUpdate.datos['url-imagen']
        });
        if (dataUpdate.datos['url-imagen'] !== urlActualizada) {
            throw new Error('La url-imagen no se actualizó correctamente');
        }

        console.log('\n--- 6. PROBAR VALIDACIÓN CON URL INVÁLIDA ---');
        const resInvalido = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codigo: 'TEST-IMG-BAD',
                nombre: 'Teclado Test',
                categoria: 'Periféricos',
                precio: 20,
                stock: 5,
                'url-imagen': 'no-es-una-url-valida'
            })
        });
        const dataInvalido = await resInvalido.json();
        console.log('Status con URL inválida:', resInvalido.status);
        console.log('Respuesta de error:', dataInvalido);
        if (resInvalido.status !== 400) {
            throw new Error('La validación debería haber retornado 400 Bad Request');
        }

        console.log('\n✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE.');
    } catch (err) {
        console.error('\n❌ ERROR EN LAS PRUEBAS:', err);
    } finally {
        // Limpieza de datos de prueba
        if (testId1) await query('DELETE FROM productos WHERE id = $1', [testId1]);
        if (testId2) await query('DELETE FROM productos WHERE id = $1', [testId2]);
        console.log('Registros de prueba eliminados.');

        server.close();
        await pool.end();
    }
}

runTests();
