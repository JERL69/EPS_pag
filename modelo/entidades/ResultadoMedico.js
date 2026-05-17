/**
 * @file ResultadoMedico.js
 * @description Clase base abstracta para resultados de examenes medicos.
 *              Declara el metodo accept(visitor) para el patron Visitor.
 */
class ResultadoMedico {
    constructor(id, pacienteId, examenNombre, fecha, costoBase) {
        if (this.constructor === ResultadoMedico) {
            throw new Error("No se puede instanciar la clase abstracta ResultadoMedico directamente.");
        }
        this.id = id;
        this.pacienteId = pacienteId;
        this.examenNombre = examenNombre;
        this.fecha = fecha;
        this.costoBase = costoBase;
    }

    /**
     * Metodo de doble despacho para aceptar un visitante.
     * @param {ResultadoVisitor} visitor 
     */
    accept(visitor) {
        throw new Error("El metodo accept(visitor) debe ser sobreescrito en las subclases.");
    }
}
