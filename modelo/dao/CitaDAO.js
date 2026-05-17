/**
 * @file CitaDAO.js
 * @description Data Access Object especifico para la entidad Cita.
 */
class CitaDAO extends BaseDAO {
    constructor() {
        super("fsfb_citas");
    }

    /**
     * Define las citas semilla iniciales.
     */
    cargarSemillaInicial() {
        return [
            {
                id: 101,
                pacienteId: 1,
                especialidad: "GENERAL",
                sede: "Sede Principal FSFB - Edificio Central",
                consultorio: "Consultorio 301 - Dr. Carlos Mendoza",
                medico: "Dr. Carlos Mendoza",
                fecha: "2026-05-18",
                hora: "09:30",
                costo: 5000,
                _estadoString: "PendienteConfirmacion"
            },
            {
                id: 102,
                pacienteId: 1,
                especialidad: "ESPECIALISTA",
                sede: "Centro Clinico de Especialistas FSFB",
                consultorio: "Consultorio 504 - Dra. Clara Rojas",
                medico: "Dra. Clara Rojas",
                fecha: "2026-05-20",
                hora: "11:00",
                costo: 25000,
                _estadoString: "PendientePago"
            }
        ];
    }

    /**
     * Obtiene la coleccion de citas asociadas a un paciente especifico.
     * @param {number|string} pacienteId 
     * @returns {Array}
     */
    obtenerPorPaciente(pacienteId) {
        const citas = this.obtenerTodos();
        return citas.filter(c => String(c.pacienteId) === String(pacienteId));
    }
}
