/**
 * @file PlanAltaDAO.js
 * @description Data Access Object especifico para la entidad PlanAlta.
 */
class PlanAltaDAO extends BaseDAO {
    constructor() {
        super("fsfb_planes_alta");
    }

    /**
     * Define los planes de alta semilla iniciales.
     */
    cargarSemillaInicial() {
        return [
            {
                id: 9001,
                pacienteId: 1,
                diagnostico: "Recuperacion Post-Operatoria de Apendicectomia Laparoscopica",
                medicamentos: "1. Acetaminofen 500mg cada 6 horas en caso de dolor moderado.\n2. Cefalexina 500mg cada 8 horas por 7 dias como profilaxis contra infeccion.",
                recomendaciones: "1. Reposo relativo en casa por 7 dias.\n2. Dieta blanda hipograsa y abundante hidratacion.\n3. Lavar herida quirurgica con agua y jabon neutro diariamente, secar bien.",
                proximoControl: "Control en 10 dias con Cirugia General para retiro de puntos.",
                ultimaActualizacion: "10:30:15 AM"
            }
        ];
    }

    /**
     * Obtiene los planes de alta de un paciente.
     * @param {number|string} pacienteId 
     * @returns {Array}
     */
    obtenerPorPaciente(pacienteId) {
        const planes = this.obtenerTodos();
        return planes.filter(p => String(p.pacienteId) === String(pacienteId));
    }
}
