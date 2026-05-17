/**
 * @file Paciente.js
 * @description Entidad concreta que representa a un Paciente afiliado.
 */
class Paciente extends Usuario {
    constructor(id, nombre, email, password, documento, telefono, direccion, genero, nacionalidad, fechaNacimiento) {
        super(id, nombre, email, password, 'PACIENTE');
        this.documento = documento;
        this.telefono = telefono;
        this.direccion = direccion;
        this.genero = genero;
        this.nacionalidad = nacionalidad;
        this.fechaNacimiento = fechaNacimiento;
    }
}
