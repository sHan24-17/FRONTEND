const { prisma } = require('../config/prisma');

/**
 * Función formateadora para asegurar compatibilidad total con el Frontend.
 * El frontend espera 'fecha-creacion' tal como estaba en PostgreSQL.
 */
function formatUsuario(user) {
    if (!user) return null;
    return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: user.activo,
        'fecha-creacion': user.fechaCreacion,
        fecha_creacion: user.fechaCreacion,
        fechaCreacion: user.fechaCreacion
    };
}

let instanciaUnica;

/**
 * Modelo de Acceso a Datos con patrón Repository para la entidad 'usuarios' en PostgreSQL utilizando Prisma ORM.
 * Implementa el patrón Singleton.
 */
class UsuarioModel {
    constructor() {
        if (!instanciaUnica) {
            instanciaUnica = this;
        }
        return instanciaUnica;
    }

    /**
     * Listar todos los usuarios con paginación y filtros opcionales
     */
    async listar({ limit = 10, offset = 0, busqueda = null, rol = null, activo = null }) {
        const where = {};

        if (busqueda) {
            where.OR = [
                { nombre: { contains: busqueda, mode: 'insensitive' } },
                { email: { contains: busqueda, mode: 'insensitive' } }
            ];
        }

        if (rol) {
            where.rol = {
                contains: rol,
                mode: 'insensitive'
            };
        }

        if (activo !== null && activo !== undefined && activo !== '') {
            where.activo = (activo === 'true' || activo === true);
        }

        const [total, usuariosRaw] = await Promise.all([
            prisma.usuario.count({ where }),
            prisma.usuario.findMany({
                where,
                skip: parseInt(offset, 10) || 0,
                take: parseInt(limit, 10) || 10,
                orderBy: { id: 'asc' }
            })
        ]);

        return {
            usuarios: usuariosRaw.map(formatUsuario),
            total
        };
    }

    /**
     * Obtener un usuario por su ID
     */
    async obtenerPorId(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) return null;

        const usuario = await prisma.usuario.findUnique({
            where: { id: parsedId }
        });
        return formatUsuario(usuario);
    }

    /**
     * Obtener un usuario por su email (único)
     */
    async obtenerPorEmail(email) {
        if (!email) return null;

        const usuario = await prisma.usuario.findUnique({
            where: { email: String(email) }
        });
        return formatUsuario(usuario);
    }

    /**
     * Crear un nuevo usuario
     */
    async crear({ nombre, email, rol = 'usuario', activo = true }) {
        const nuevo = await prisma.usuario.create({
            data: {
                nombre,
                email,
                rol: rol || 'usuario',
                activo: activo !== undefined ? Boolean(activo) : true
            }
        });
        return formatUsuario(nuevo);
    }

    /**
     * Actualizar un usuario por ID
     */
    async actualizar(id, campos) {
        const parsedId = parseInt(id, 10);
        const data = {};

        if (campos.nombre !== undefined) data.nombre = String(campos.nombre);
        if (campos.email !== undefined) data.email = String(campos.email);
        if (campos.rol !== undefined) data.rol = String(campos.rol);
        if (campos.activo !== undefined) data.activo = Boolean(campos.activo);

        const actualizado = await prisma.usuario.update({
            where: { id: parsedId },
            data
        });

        return formatUsuario(actualizado);
    }

    /**
     * Eliminar un usuario por ID
     */
    async eliminar(id) {
        const parsedId = parseInt(id, 10);
        const eliminado = await prisma.usuario.delete({
            where: { id: parsedId }
        });
        return formatUsuario(eliminado);
    }
}

// Exportar instancia Singleton
const usuarioModelInstance = new UsuarioModel();
module.exports = usuarioModelInstance;
