/**
 * @file AutorizacionDAO.js
 * @description Data Access Object especifico para la entidad SolicitudAutorizacion.
 */
class AutorizacionDAO extends BaseDAO {
    constructor() {
        super("fsfb_autorizaciones");
    }

    /**
     * Define las autorizaciones semilla iniciales.
     */
    cargarSemillaInicial() {
        return [
            {
                id: 5001,
                pacienteId: 1,
                pacienteNombre: "Juan Esteban Rivera",
                procedimiento: "Electrocardiograma de Esfuerzo",
                costo: 180000,
                justificacion: "Control preventivo de cardiologia por palpitaciones.",
                aprobado: "APROBADO",
                historialAprobaciones: [
                    {
                        rol: "MEDICO_GENERAL",
                        decision: "APROBADO",
                        detalle: "Aprobado por el Medico General (Costo \$180.000 <= \$200.000)",
                        timestamp: "10:15:30 AM"
                    }
                ]
            },
            {
                id: 5002,
                pacienteId: 1,
                pacienteNombre: "Juan Esteban Rivera",
                procedimiento: "Resonancia Magnetica de Cerebro con Contraste",
                costo: 850000,
                justificacion: "Cefalea persistente refractaria a analgesicos comunes.",
                aprobado: "APROBADO",
                historialAprobaciones: [
                    {
                        rol: "MEDICO_GENERAL",
                        decision: "PASADO",
                        detalle: "El costo \$850.000 excede el limite del Medico General (\$200.000). Elevando caso.",
                        timestamp: "11:20:10 AM"
                    },
                    {
                        rol: "ESPECIALISTA",
                        decision: "APROBADO",
                        detalle: "Aprobado por el Especialista (Costo \$850.000 <= \$1.000.000)",
                        timestamp: "11:20:12 AM"
                    }
                ]
            }
        ];
    }

    /**
     * Obtiene todas las solicitudes de un paciente.
     * @param {number|string} pacienteId 
     * @returns {Array}
     */
    obtenerPorPaciente(pacienteId) {
        const solicitudes = this.obtenerTodos();
        return solicitudes.filter(s => String(s.pacienteId) === String(pacienteId));
    }
}
