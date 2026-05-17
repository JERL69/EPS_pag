/**
 * @file ChainOfResponsibility.js
 * @description Implementacion del patron Chain of Responsibility para autorizaciones medicas.
 */

/**
 * Handler base abstracto para la cadena de aprobaciones.
 */
class AutorizadorHandler {
    constructor() {
        if (this.constructor === AutorizadorHandler) {
            throw new Error("No se puede instanciar la clase abstracta AutorizadorHandler directamente.");
        }
        this.nextHandler = null;
    }

    /**
     * Define el siguiente autorizador en la cadena
     * @param {AutorizadorHandler} handler 
     * @returns {AutorizadorHandler}
     */
    setNext(handler) {
        this.nextHandler = handler;
        return handler;
    }

    /**
     * Procesa la solicitud o la delega al siguiente handler.
     * @param {SolicitudAutorizacion} solicitud 
     */
    handle(solicitud) {
        if (this.nextHandler) {
            return this.nextHandler.handle(solicitud);
        }
        solicitud.aprobado = "RECHAZADO";
        solicitud.registrarPasoAprobacion("SISTEMA", "RECHAZADO", "Fin de la cadena sin resolucion. Rechazado por seguridad.");
        VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} RECHAZADA: no hay mas niveles de aprobacion.`);
        return solicitud;
    }
}

/**
 * Eslabón 1: Médico General (GP)
 * Limite: Hasta $200.000 COP
 */
class MedicoGeneralAutorizador extends AutorizadorHandler {
    constructor() {
        super();
        this.rol = "MEDICO_GENERAL";
        this.limite = 200000;
    }

    handle(solicitud) {
        if (solicitud.costo <= this.limite) {
            solicitud.aprobado = "APROBADO";
            solicitud.registrarPasoAprobacion(this.rol, "APROBADO", `Aprobado por el Medico General (Costo \$${solicitud.costo.toLocaleString()} <= \$${this.limite.toLocaleString()})`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} APROBADA en Nivel 1 (Medico General).`);
            return solicitud;
        } else {
            solicitud.registrarPasoAprobacion(this.rol, "PASADO", `El costo \$${solicitud.costo.toLocaleString()} excede el limite del Medico General (\$${this.limite.toLocaleString()}). Elevando caso.`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} excede limite de Medico General (\$${this.limite.toLocaleString()}). Elevando a Especialista.`);
            return super.handle(solicitud);
        }
    }
}

/**
 * Eslabón 2: Especialista Médico
 * Limite: Hasta $1.000.000 COP
 */
class EspecialistaAutorizador extends AutorizadorHandler {
    constructor() {
        super();
        this.rol = "ESPECIALISTA";
        this.limite = 1000000;
    }

    handle(solicitud) {
        if (solicitud.costo <= this.limite) {
            solicitud.aprobado = "APROBADO";
            solicitud.registrarPasoAprobacion(this.rol, "APROBADO", `Aprobado por el Especialista (Costo \$${solicitud.costo.toLocaleString()} <= \$${this.limite.toLocaleString()})`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} APROBADA en Nivel 2 (Especialista).`);
            return solicitud;
        } else {
            solicitud.registrarPasoAprobacion(this.rol, "PASADO", `El costo \$${solicitud.costo.toLocaleString()} excede el limite del Especialista (\$${this.limite.toLocaleString()}). Elevando caso a Junta.`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} excede limite de Especialista (\$${this.limite.toLocaleString()}). Elevando a Junta Medica.`);
            return super.handle(solicitud);
        }
    }
}

/**
 * Eslabón 3: Junta Médica
 * Limite: Hasta $5.000.000 COP
 */
class JuntaMedicaAutorizador extends AutorizadorHandler {
    constructor() {
        super();
        this.rol = "JUNTA_MEDICA";
        this.limite = 5000000;
    }

    handle(solicitud) {
        if (solicitud.costo <= this.limite) {
            solicitud.aprobado = "APROBADO";
            solicitud.registrarPasoAprobacion(this.rol, "APROBADO", `Aprobado por Junta Medica (Costo \$${solicitud.costo.toLocaleString()} <= \$${this.limite.toLocaleString()})`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} APROBADA en Nivel 3 (Junta Medica).`);
            return solicitud;
        } else {
            solicitud.registrarPasoAprobacion(this.rol, "PASADO", `El costo \$${solicitud.costo.toLocaleString()} excede el limite de la Junta Medica (\$${this.limite.toLocaleString()}). Elevando caso a Gerencia.`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} excede limite de Junta Medica (\$${this.limite.toLocaleString()}). Elevando a Gerente de Operaciones.`);
            return super.handle(solicitud);
        }
    }
}

/**
 * Eslabón 4: Gerente de Operaciones
 * Limite: Hasta $10.000.000 COP
 */
class GerenteOperacionesAutorizador extends AutorizadorHandler {
    constructor() {
        super();
        this.rol = "GERENTE_OPERACIONES";
        this.limite = 10000000;
    }

    handle(solicitud) {
        if (solicitud.costo <= this.limite) {
            solicitud.aprobado = "APROBADO";
            solicitud.registrarPasoAprobacion(this.rol, "APROBADO", `Aprobado en Nivel Gerencial por Gerente de Operaciones (Costo \$${solicitud.costo.toLocaleString()} <= \$${this.limite.toLocaleString()})`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} APROBADA en Nivel 4 (Gerencia de Operaciones).`);
            return solicitud;
        } else {
            solicitud.registrarPasoAprobacion(this.rol, "PASADO", `El costo \$${solicitud.costo.toLocaleString()} excede el presupuesto maximo permitido (\$${this.limite.toLocaleString()}). Derivando a Rechazo.`);
            VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} excede presupuesto de Gerencia (\$${this.limite.toLocaleString()}). Transicionando a Rechazo Automatico.`);
            return super.handle(solicitud);
        }
    }
}

/**
 * Eslabón 5 (Final): Rechazador Automático
 * Limite: Más de $10.000.000 COP
 */
class RechazoAutorizador extends AutorizadorHandler {
    constructor() {
        super();
        this.rol = "SISTEMA_RECHAZO";
    }

    handle(solicitud) {
        solicitud.aprobado = "RECHAZADO";
        solicitud.registrarPasoAprobacion(this.rol, "RECHAZADO", `Solicitud RECHAZADA. El costo de \$${solicitud.costo.toLocaleString()} excede el presupuesto maximo corporativo de la EPS (\$10,000,000 COP)`);
        VistaGlobal.logTerminal("chain", `Solicitud #${solicitud.id} RECHAZADA AUTOMATICAMENTE: Costo excede limite de \$10.000.000 COP.`);
        return solicitud;
    }
}

/**
 * Proveedor / Inicializador de la cadena
 */
class ChainBuilder {
    /**
     * Construye y devuelve el punto de entrada de la cadena.
     * @returns {AutorizadorHandler}
     */
    static buildChain() {
        const gp = new MedicoGeneralAutorizador();
        const specialist = new EspecialistaAutorizador();
        const board = new JuntaMedicaAutorizador();
        const manager = new GerenteOperacionesAutorizador();
        const rejecter = new RechazoAutorizador();

        gp.setNext(specialist);
        specialist.setNext(board);
        board.setNext(manager);
        manager.setNext(rejecter);

        return gp;
    }
}
