/**
 * @file Usuario.js
 * @description Clase base abstracta que representa un usuario del sistema.
 */
class Usuario {
    constructor(id, nombre, email, password, tipo) {
        if (this.constructor === Usuario) {
            throw new Error("No se puede instanciar la clase abstracta Usuario directamente.");
        }
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.tipo = tipo; // 'PACIENTE' o 'ADMINISTRADOR'
    }
}
