/**
 * @file UsuarioDAO.js
 * @description Data Access Object especifico para la entidad Usuario.
 */
class UsuarioDAO extends BaseDAO {
    constructor() {
        super("fsfb_usuarios");
    }

    /**
     * Define los usuarios semilla iniciales.
     */
    cargarSemillaInicial() {
        return [
            {
                id: 1,
                nombre: "Juan Esteban Rivera",
                email: "juan@demo.com",
                password: "demo123",
                tipo: "PACIENTE",
                documento: "1000123456",
                telefono: "3001234567",
                direccion: "Calle 127 #15-30, Bogotá",
                genero: "MASCULINO",
                nacionalidad: "COLOMBIA",
                fechaNacimiento: "1998-05-14"
            },
            {
                id: 2,
                nombre: "Administrador General",
                email: "admin@santafe.com",
                password: "admin123",
                tipo: "ADMINISTRADOR"
            }
        ];
    }

    /**
     * Busca un usuario por correo electronico.
     * @param {string} email 
     * @returns {Object|null}
     */
    buscarPorEmail(email) {
        const usuarios = this.obtenerTodos();
        return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    /**
     * Busca si ya existe un paciente registrado con el documento especificado.
     * @param {string} documento 
     * @returns {Object|null}
     */
    buscarPorDocumento(documento) {
        const usuarios = this.obtenerTodos();
        return usuarios.find(u => u.tipo === "PACIENTE" && String(u.documento) === String(documento)) || null;
    }

    /**
     * Valida si las credenciales de inicio de sesion coinciden.
     * @param {string} email 
     * @param {string} password 
     * @param {string} tipo 
     * @returns {Object|null}
     */
    validarCredenciales(email, password, tipo) {
        const usuario = this.buscarPorEmail(email);
        if (usuario && usuario.password === password && usuario.tipo === tipo) {
            return usuario;
        }
        return null;
    }
}
