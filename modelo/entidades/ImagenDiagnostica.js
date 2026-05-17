/**
 * @file ImagenDiagnostica.js
 * @description Clase concreta que representa un resultado de Imagenologia Diagnostica (Radiologia).
 */
class ImagenDiagnostica extends ResultadoMedico {
    constructor(id, pacienteId, examenNombre, fecha, costoBase, regionAnatomica, hallazgos, tecnica) {
        super(id, pacienteId, examenNombre, fecha, costoBase);
        this.regionAnatomica = regionAnatomica;
        this.hallazgos = hallazgos;
        this.tecnica = tecnica;
    }

    /**
     * Implementacion de doble despacho para el patron Visitor.
     * @param {ResultadoVisitor} visitor 
     */
    accept(visitor) {
        return visitor.visitImagen(this);
    }
}
