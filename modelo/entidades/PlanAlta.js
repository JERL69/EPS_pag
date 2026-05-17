/**
 * @file PlanAlta.js
 * @description Entidad que representa un Plan de Alta hospitalario.
 *              Actua como "Originator" (Creador) en el patron Memento.
 */
class PlanAlta {
    constructor(id, pacienteId, diagnostico, medicamentos, recomendaciones, proximoControl) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.diagnostico = diagnostico;
        this.medicamentos = medicamentos;
        this.recomendaciones = recomendaciones;
        this.proximoControl = proximoControl;
        this.ultimaActualizacion = new Date().toLocaleTimeString();
    }

    /**
     * Captura el estado actual en un Memento.
     * @returns {PlanAltaMemento}
     */
    guardarMemento() {
        return new PlanAltaMemento(
            this.id,
            this.medicamentos,
            this.recomendaciones,
            this.proximoControl,
            this.ultimaActualizacion
        );
    }

    /**
     * Restaura el estado a partir de un Memento.
     * @param {PlanAltaMemento} memento 
     */
    restaurarMemento(memento) {
        this.medicamentos = memento.medicamentos;
        this.recomendaciones = memento.recomendaciones;
        this.proximoControl = memento.proximoControl;
        this.ultimaActualizacion = memento.timestamp;
    }
}
