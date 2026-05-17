/**
 * @file Administrador.js
 * @description Entidad concreta que representa a un Administrador de la EPS.
 */
class Administrador extends Usuario {
    constructor(id, nombre, email, password) {
        super(id, nombre, email, password, 'ADMINISTRADOR');
    }
}
