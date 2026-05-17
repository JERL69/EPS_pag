/**
 * @file ResultadoDAO.js
 * @description Data Access Object especifico para resultados medicos (Laboratorios e Imagenes).
 */
class ResultadoDAO extends BaseDAO {
    constructor() {
        super("fsfb_resultados");
    }

    /**
     * Define los resultados de examen semilla iniciales.
     */
    cargarSemillaInicial() {
        return [
            {
                id: 7001,
                pacienteId: 1,
                examenNombre: "Glucosa en Ayunas",
                fecha: "2026-05-10",
                costoBase: 45000,
                valorObtenido: "108",
                unidad: "mg/dL",
                rangoReferencia: "70 - 100 mg/dL",
                tipoClase: "LABORATORIO"
            },
            {
                id: 7002,
                pacienteId: 1,
                examenNombre: "Hemograma Completo IV",
                fecha: "2026-05-10",
                costoBase: 65000,
                valorObtenido: "14.2",
                unidad: "g/dL (Hemoglobina)",
                rangoReferencia: "13.8 - 17.2 g/dL",
                tipoClase: "LABORATORIO"
            },
            {
                id: 7003,
                pacienteId: 1,
                examenNombre: "Radiografia de Torax (PA y Lateral)",
                fecha: "2026-05-12",
                costoBase: 120000,
                regionAnatomica: "Torax y Mediastino",
                hallazgos: "Campos pulmonares bien insuflados, sin opacidades ni consolidaciones neumonicas activas. Silueta cardiomediastinal de tamaño y contornos conservados. Senos costo-diafragmaticos libres.",
                tecnica: "Radiologia Digital Directa Directa",
                tipoClase: "IMAGEN"
            }
        ];
    }

    /**
     * Obtiene todos los resultados asociados a un paciente.
     * @param {number|string} pacienteId 
     * @returns {Array}
     */
    obtenerPorPaciente(pacienteId) {
        const resultados = this.obtenerTodos();
        return resultados.filter(r => String(r.pacienteId) === String(pacienteId));
    }
}
