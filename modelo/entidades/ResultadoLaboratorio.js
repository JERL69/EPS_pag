/**
 * @file ResultadoLaboratorio.js
 * @description Clase concreta que representa un resultado de laboratorio clinico.
 */
class ResultadoLaboratorio extends ResultadoMedico {
    constructor(id, pacienteId, examenNombre, fecha, costoBase, valorObtenido, unidad, rangoReferencia) {
        super(id, pacienteId, examenNombre, fecha, costoBase);
        this.valorObtenido = valorObtenido;
        this.unidad = unidad;
        this.rangoReferencia = rangoReferencia;
    }

    /**
     * Implementacion de doble despacho para el patron Visitor.
     * @param {ResultadoVisitor} visitor 
     */
    accept(visitor) {
        return visitor.visitLaboratorio(this);
    }
}
