/**
 * @file State.js
 * @description Implementacion del patron State para controlar los estados de una cita medica.
 */

/**
 * Clase base abstracta para los estados de una Cita.
 */
class CitaState {
    constructor(cita) {
        if (this.constructor === CitaState) {
            throw new Error("No se puede instanciar la clase abstracta CitaState directamente.");
        }
        this.cita = cita; // Referencia al contexto
    }

    confirmar() {
        console.warn(`Accion 'confirmar' no valida en estado ${this.getNombreEstado()}`);
        VistaGlobal.logTerminal("state", `Accion [CONFIRMAR] invalida para la cita #${this.cita.id} en estado ${this.getNombreEstado()}`);
        return false;
    }

    pagar() {
        console.warn(`Accion 'pagar' no valida en estado ${this.getNombreEstado()}`);
        VistaGlobal.logTerminal("state", `Accion [PAGAR] invalida para la cita #${this.cita.id} en estado ${this.getNombreEstado()}`);
        return false;
    }

    cancelar() {
        console.warn(`Accion 'cancelar' no valida en estado ${this.getNombreEstado()}`);
        VistaGlobal.logTerminal("state", `Accion [CANCELAR] invalida para la cita #${this.cita.id} en estado ${this.getNombreEstado()}`);
        return false;
    }

    atender() {
        console.warn(`Accion 'atender' no valida en estado ${this.getNombreEstado()}`);
        VistaGlobal.logTerminal("state", `Accion [ATENDER] invalida para la cita #${this.cita.id} en estado ${this.getNombreEstado()}`);
        return false;
    }

    getNombreEstado() {
        throw new Error("El metodo getNombreEstado() debe ser implementado.");
    }
}

/**
 * Estado: Pendiente de Confirmacion
 */
class PendienteConfirmacionState extends CitaState {
    confirmar() {
        VistaGlobal.logTerminal("state", `Cita #${this.cita.id} CONFIRMADA. Transicionando a: PendientePagoState`);
        this.cita.cambiarEstado(new PendientePagoState(this.cita));
        return true;
    }

    cancelar() {
        VistaGlobal.logTerminal("state", `Cita #${this.cita.id} CANCELADA. Transicionando a: CanceladaState`);
        this.cita.cambiarEstado(new CanceladaState(this.cita));
        return true;
    }

    getNombreEstado() {
        return "PendienteConfirmacion";
    }
}

/**
 * Estado: Pendiente de Pago
 */
class PendientePagoState extends CitaState {
    pagar() {
        VistaGlobal.logTerminal("state", `Copago de \$${this.cita.costo.toLocaleString()} RECIBIDO para cita #${this.cita.id}. Transicionando a: ListoParaCitaState`);
        this.cita.cambiarEstado(new ListoParaCitaState(this.cita));
        return true;
    }

    cancelar() {
        VistaGlobal.logTerminal("state", `Cita #${this.cita.id} CANCELADA sin cargo. Transicionando a: CanceladaState`);
        this.cita.cambiarEstado(new CanceladaState(this.cita));
        return true;
    }

    getNombreEstado() {
        return "PendientePago";
    }
}

/**
 * Estado: Listo para Cita (Confirmada y Pagada)
 */
class ListoParaCitaState extends CitaState {
    atender() {
        VistaGlobal.logTerminal("state", `Cita #${this.cita.id} ATENDIDA por especialista. Transicionando a: AtendidaState`);
        this.cita.cambiarEstado(new AtendidaState(this.cita));
        return true;
    }

    cancelar() {
        VistaGlobal.logTerminal("state", `Cita #${this.cita.id} CANCELADA. Copago sera abonado como saldo. Transicionando a: CanceladaState`);
        this.cita.cambiarEstado(new CanceladaState(this.cita));
        return true;
    }

    getNombreEstado() {
        return "ListoParaCita";
    }
}

/**
 * Estado: Atendida (Finalizado)
 */
class AtendidaState extends CitaState {
    getNombreEstado() {
        return "Atendida";
    }
}

/**
 * Estado: Cancelada (Finalizado)
 */
class CanceladaState extends CitaState {
    getNombreEstado() {
        return "Cancelada";
    }
}
