/**
 * @file SolicitudAutorizacion.js
 * @description Entidad que representa una solicitud de autorizacion medica a tramitar.
 */
class SolicitudAutorizacion {
    constructor(id, pacienteId, pacienteNombre, procedimiento, costo, justificacion = "") {
        this.id = id;
        this.pacienteId = pacienteId;
        this.pacienteNombre = pacienteNombre;
        this.procedimiento = procedimiento;
        this.costo = costo;
        this.justificacion = justificacion;
        this.aprobado = "PENDIENTE"; // 'PENDIENTE', 'APROBADO', 'RECHAZADO'
        this.historialAprobaciones = []; // Registro de trazabilidad de la cadena
    }

    /**
     * Agrega un paso de decision al historial de aprobaciones
     * @param {string} rolHandler 
     * @param {string} decision 
     * @param {string} detalle 
     */
    registrarPasoAprobacion(rolHandler, decision, detalle) {
        this.historialAprobaciones.push({
            rol: rolHandler,
            decision: decision,
            detalle: detalle,
            timestamp: new Date().toLocaleTimeString()
        });
    }
}
