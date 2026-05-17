/**
 * @file Memento.js
 * @description Implementacion del patron Memento para guardar y restaurar estados de PlanAlta.
 */

/**
 * Clase Memento que almacena una copia inmutable del estado del Plan de Alta.
 */
class PlanAltaMemento {
    constructor(id, medicamentos, recomendaciones, proximoControl, timestamp) {
        this._id = id;
        this._medicamentos = medicamentos;
        this._recomendaciones = recomendaciones;
        this._proximoControl = proximoControl;
        this._timestamp = timestamp;
    }

    // Getters para mantener la encapsulacion e inmutabilidad
    get id() { return this._id; }
    get medicamentos() { return this._medicamentos; }
    get recomendaciones() { return this._recomendaciones; }
    get proximoControl() { return this._proximoControl; }
    get timestamp() { return this._timestamp; }
}

/**
 * Clase Caretaker (Guardián) que administra la pila de mementos para los planes de alta.
 */
class HistorialPlanesAlta {
    constructor() {
        this.mementos = {}; // Diccionario: { planId: [Memento1, Memento2, ...] }
    }

    /**
     * Guarda un memento en la pila de historial de un plan
     * @param {number|string} planId 
     * @param {PlanAltaMemento} memento 
     */
    guardar(planId, memento) {
        if (!this.mementos[planId]) {
            this.mementos[planId] = [];
        }
        this.mementos[planId].push(memento);
        VistaGlobal.logTerminal("memento", `Memento GUARDADO para Plan #${planId} a las ${memento.timestamp}. Historial: ${this.mementos[planId].length} estados.`);
    }

    /**
     * Saca el ultimo memento de la pila para restaurarlo
     * @param {number|string} planId 
     * @returns {PlanAltaMemento|null}
     */
    deshacer(planId) {
        const pila = this.mementos[planId];
        if (pila && pila.length > 0) {
            const memento = pila.pop();
            VistaGlobal.logTerminal("memento", `Memento RESTAURADO para Plan #${planId} del historial a las ${memento.timestamp}. Restantes: ${pila.length}.`);
            return memento;
        }
        VistaGlobal.logTerminal("memento", `No hay mementos para deshacer en el Plan #${planId}.`);
        return null;
    }

    /**
     * Obtiene la lista actual de mementos guardados para un plan (para la UI pedagógica)
     * @param {number|string} planId 
     * @returns {PlanAltaMemento[]}
     */
    obtenerHistorial(planId) {
        return this.mementos[planId] || [];
    }

    /**
     * Limpia la pila para un plan
     * @param {number|string} planId 
     */
    limpiarHistorial(planId) {
        this.mementos[planId] = [];
    }
}
