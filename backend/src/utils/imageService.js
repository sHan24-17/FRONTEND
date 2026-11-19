/**
 * Servicio de obtención y validación de imágenes reales desde internet y APIs públicas.
 */

// Catálogo de URLs reales verificadas de alta calidad (Unsplash CDN) por términos clave
const IMAGENES_POR_DEFECTO = {
    laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    portatil: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    computacion: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    mouse: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    raton: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    teclado: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    pantalla: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    impresora: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80',
    printer: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80',
    smartphone: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    celular: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    telefono: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    telefonia: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    tableta: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    ipad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    auriculares: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    audifonos: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    cargador: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    charger: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    'disco duro': 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80',
    disco: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80',
    ssd: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80',
    almacenamiento: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80',
    camara: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=80',
    webcam: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=80',
    altavoz: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    bocina: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    speaker: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    audio: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    ram: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
    memoria: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
    router: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    modem: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    wifi: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    redes: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    microfono: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    mic: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    perifericos: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
};

const IMAGEN_DEFAULT_GENERAL = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80';

/**
 * Consulta la API pública de productos DummyJSON para extraer una imagen real según el término de búsqueda
 */
async function consultarApiProductos(termino) {
    if (!termino || typeof termino !== 'string') return null;

    try {
        const query = encodeURIComponent(termino.trim());
        const response = await fetch(`https://dummyjson.com/products/search?q=${query}`, {
            signal: AbortSignal.timeout(3500)
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (data.products && data.products.length > 0) {
            const prod = data.products[0];
            return prod.thumbnail || (prod.images && prod.images[0]) || null;
        }
    } catch {
        // En caso de timeout o falta de conexión, retornamos null para usar el fallback
    }

    return null;
}

/**
 * Obtiene una URL real de imagen de internet para un producto.
 * Prioridad:
 * 1. Consulta a la API externa de productos por nombre o categoría.
 * 2. Búsqueda en catálogo de imágenes reales de Unsplash por coincidencia de palabras clave.
 * 3. Imagen tecnológica por defecto de Unsplash.
 */
async function obtenerImagenReal(nombre = '', categoria = '') {
    const textoCompleto = `${nombre} ${categoria}`.toLowerCase();

    // 1. Extraer primera palabra clave del nombre para búsqueda en API
    const palabras = nombre.trim().split(/\s+/).filter(p => p.length > 2);
    const primerTermino = palabras[0] || categoria || '';

    if (primerTermino) {
        const imagenApi = await consultarApiProductos(primerTermino);
        if (imagenApi) {
            return imagenApi;
        }
    }

    // 2. Coincidencia con catálogo real verificado
    for (const [clave, url] of Object.entries(IMAGENES_POR_DEFECTO)) {
        if (textoCompleto.includes(clave)) {
            return url;
        }
    }

    // 3. Fallback genérico de imagen real
    return IMAGEN_DEFAULT_GENERAL;
}

module.exports = {
    obtenerImagenReal,
    consultarApiProductos,
    IMAGENES_POR_DEFECTO,
    IMAGEN_DEFAULT_GENERAL
};
