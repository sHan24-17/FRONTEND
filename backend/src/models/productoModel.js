const { prisma } = require('../config/prisma');

/**
 * Función formateadora para asegurar compatibilidad total con el Frontend.
 * El frontend espera 'url-imagen' y 'fecha_creacion' tal como estaban en PostgreSQL.
 */
function formatProducto(prod) {
    if (!prod) return null;
    const precioNumerico = typeof prod.precio === 'object' && prod.precio !== null && typeof prod.precio.toNumber === 'function'
        ? prod.precio.toNumber()
        : parseFloat(prod.precio);

    return {
        id: prod.id,
        codigo: prod.codigo,
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        categoria: prod.categoria,
        precio: precioNumerico,
        stock: prod.stock,
        estado: prod.estado,
        'url-imagen': prod.urlImagen || null,
        urlImagen: prod.urlImagen || null,
        url_imagen: prod.urlImagen || null,
        fecha_creacion: prod.fechaCreacion,
        'fecha-creacion': prod.fechaCreacion
    };
}

/**
 * Modelo de Acceso a Datos para la entidad 'productos' utilizando Prisma ORM (Patrón Repository)
 */
class ProductoModel {
    /**
     * Listar productos con filtros y paginación
     */
    static async listar({ limit = 10, offset = 0, categoria = null, busqueda = null, soloActivos = false }) {
        const where = {};

        if (categoria) {
            where.categoria = {
                contains: categoria,
                mode: 'insensitive'
            };
        }

        if (busqueda) {
            where.OR = [
                { nombre: { contains: busqueda, mode: 'insensitive' } },
                { codigo: { contains: busqueda, mode: 'insensitive' } },
                { descripcion: { contains: busqueda, mode: 'insensitive' } }
            ];
        }

        if (soloActivos) {
            where.estado = true;
        }

        // Conteo total y consulta paginada en paralelo mediante Prisma
        const [total, productosRaw] = await Promise.all([
            prisma.producto.count({ where }),
            prisma.producto.findMany({
                where,
                skip: parseInt(offset, 10) || 0,
                take: parseInt(limit, 10) || 10,
                orderBy: { id: 'asc' }
            })
        ]);

        return {
            productos: productosRaw.map(formatProducto),
            total
        };
    }

    /**
     * Obtener un producto por su clave primaria (ID)
     */
    static async obtenerPorId(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) return null;

        const prod = await prisma.producto.findUnique({
            where: { id: parsedId }
        });
        return formatProducto(prod);
    }

    /**
     * Obtener un producto por su código único
     */
    static async obtenerPorCodigo(codigo) {
        if (!codigo) return null;

        const prod = await prisma.producto.findUnique({
            where: { codigo: String(codigo) }
        });
        return formatProducto(prod);
    }

    /**
     * Insertar un nuevo producto
     */
    static async crear({ codigo, nombre, descripcion = null, categoria, precio, stock, estado = true, urlImagen = null }) {
        const nuevoProd = await prisma.producto.create({
            data: {
                codigo,
                nombre,
                descripcion: descripcion || null,
                categoria,
                precio: parseFloat(precio),
                stock: parseInt(stock, 10),
                estado: estado !== undefined ? Boolean(estado) : true,
                urlImagen: urlImagen || null
            }
        });

        return formatProducto(nuevoProd);
    }

    /**
     * Actualizar campos de un producto existente por ID
     */
    static async actualizar(id, campos) {
        const parsedId = parseInt(id, 10);
        const data = {};

        if (campos.codigo !== undefined) data.codigo = String(campos.codigo);
        if (campos.nombre !== undefined) data.nombre = String(campos.nombre);
        if (campos.descripcion !== undefined) data.descripcion = campos.descripcion;
        if (campos.categoria !== undefined) data.categoria = String(campos.categoria);
        if (campos.precio !== undefined) data.precio = parseFloat(campos.precio);
        if (campos.stock !== undefined) data.stock = parseInt(campos.stock, 10);
        if (campos.estado !== undefined) data.estado = Boolean(campos.estado);

        const urlImg = campos['url-imagen'] !== undefined 
            ? campos['url-imagen'] 
            : (campos.urlImagen !== undefined ? campos.urlImagen : campos.url_imagen);
            
        if (urlImg !== undefined) {
            data.urlImagen = urlImg;
        }

        const actualizado = await prisma.producto.update({
            where: { id: parsedId },
            data
        });

        return formatProducto(actualizado);
    }

    /**
     * Eliminar físicamente un producto
     */
    static async eliminar(id) {
        const parsedId = parseInt(id, 10);
        const eliminado = await prisma.producto.delete({
            where: { id: parsedId }
        });
        return formatProducto(eliminado);
    }
}

module.exports = ProductoModel;
