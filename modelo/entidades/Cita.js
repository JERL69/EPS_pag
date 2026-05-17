/**
 * @file Cita.js
 * @description Entidad que representa una cita medica y actua como Contexto en el patron State.
 */
class Cita {
    constructor(id, pacienteId, especialidad, sede, consultorio, medico, fecha, hora, costo, estadoString = "PendienteConfirmacion") {
        this.id = id;
        this.pacienteId = pacienteId;
        this.especialidad = especialidad;
        this.sede = sede;
        this.consultorio = consultorio;
        this.medico = medico;
        this.fecha = fecha;
        this.hora = hora;
        this.costo = costo;
        this._estadoString = estadoString;
        this.state = null; // Resolvido perezosamente en base al string
    }

    /**
     * Resuelve perezosamente la clase de estado concreta cargada en el ambito global
     */
    resolverEstado() {
        if (!this.state) {
            try {
                switch (this._estadoString) {
                    case "PendienteConfirmacion":
                        this.state = new PendienteConfirmacionState(this);
                        break;
                    case "PendientePago":
                        this.state = new PendientePagoState(this);
                        break;
                    case "ListoParaCita":
                        this.state = new ListoParaCitaState(this);
                        break;
                    case "Atendida":
                        this.state = new AtendidaState(this);
                        break;
                    case "Cancelada":
                        this.state = new CanceladaState(this);
                        break;
                    default:
                        this.state = new PendienteConfirmacionState(this);
                }
            } catch (e) {
                console.error("Error al resolver el estado, es posible que las clases State no se hayan cargado aun: ", e);
            }
        }
        return this.state;
    }

    /**
     * Permite cambiar la instancia de estado activo.
     * @param {CitaState} nuevoEstado 
     */
    cambiarEstado(nuevoEstado) {
        this.state = nuevoEstado;
        this._estadoString = nuevoEstado.getNombreEstado();
    }

    // Delegacion de comportamiento del patron State
    confirmar() {
        this.resolverEstado();
        if (this.state) {
            return this.state.confirmar();
        }
        return false;
    }

    pagar() {
        this.resolverEstado();
        if (this.state) {
            return this.state.pagar();
        }
        return false;
    }

    cancelar() {
        this.resolverEstado();
        if (this.state) {
            return this.state.cancelar();
        }
        return false;
    }

    atender() {
        this.resolverEstado();
        if (this.state) {
            return this.state.atender();
        }
        return false;
    }

    get estadoNombre() {
        return this._estadoString;
    }
}
