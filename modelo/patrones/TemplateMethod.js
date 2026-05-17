/**
 * @file TemplateMethod.js
 * @description Patrón Template Method para la generación de reportes oficiales de la EPS.
 *              Define el esqueleto del algoritmo de generación, permitiendo que las
 *              subclases (tipos de reporte) redefinan ciertos pasos sin cambiar la estructura.
 */

class ReporteBaseTemplate {
    constructor(datos) {
        this.datos = datos;
        this.reporteGenerado = "";
    }

    // El Método Plantilla (Template Method)
    generarReporte() {
        this.reporteGenerado = "";
        this.conectarBaseDatos();
        this.extraerDatosEspecializados();
        this.formatearCabecera();
        this.generarCuerpoReporte();
        this.formatearPieDePagina();
        return this.reporteGenerado;
    }

    // Pasos comunes (implementados en la clase base)
    conectarBaseDatos() {
        this.reporteGenerado += "[SYSTEM] Estableciendo conexión segura con la BD central de la EPS...\n";
        this.reporteGenerado += "[SYSTEM] Conexión exitosa. Autenticando credenciales de administrador...\n\n";
    }

    formatearCabecera() {
        const fecha = new Date().toLocaleDateString();
        this.reporteGenerado += "========================================================\n";
        this.reporteGenerado += `      FUNDACIÓN SANTA FE DE BOGOTÁ - REPORTE OFICIAL\n`;
        this.reporteGenerado += `      Fecha de Generación: ${fecha}\n`;
        this.reporteGenerado += "========================================================\n\n";
    }

    formatearPieDePagina() {
        this.reporteGenerado += "\n========================================================\n";
        this.reporteGenerado += "   Documento Confidencial. Uso exclusivo administrativo.\n";
        this.reporteGenerado += "========================================================\n";
    }

    // Pasos que DEBEN ser implementados por las subclases (abstractos)
    extraerDatosEspecializados() {
        throw new Error("El método extraerDatosEspecializados() debe ser implementado.");
    }

    generarCuerpoReporte() {
        throw new Error("El método generarCuerpoReporte() debe ser implementado.");
    }
}

// Subclase 1: Reporte Epidemiológico
class ReporteEpidemiologico extends ReporteBaseTemplate {
    extraerDatosEspecializados() {
        this.reporteGenerado += "[DATA] Extrayendo historial clínico, diagnósticos CIE-10 y prevalencias de enfermedades crónicas...\n";
    }

    generarCuerpoReporte() {
        this.reporteGenerado += "--- TIPO DE REPORTE: EPIDEMIOLÓGICO ---\n\n";
        this.reporteGenerado += "1. Casos Activos de Hipertensión: 45\n";
        this.reporteGenerado += "2. Pacientes Diabéticos en Control: 32\n";
        this.reporteGenerado += "3. Tasa de Infecciones Respiratorias Agudas (IRA): 12% (Últimos 30 días)\n";
        this.reporteGenerado += "4. Pacientes con sospecha de Dengue: 2\n";
        this.reporteGenerado += "\n>> ALERTA SANITARIA: NINGUNA.\n";
    }
}

// Subclase 2: Reporte Financiero
class ReporteFinanciero extends ReporteBaseTemplate {
    extraerDatosEspecializados() {
        this.reporteGenerado += "[DATA] Extrayendo facturación, recaudo de cuotas moderadoras y copagos...\n";
    }

    generarCuerpoReporte() {
        this.reporteGenerado += "--- TIPO DE REPORTE: FINANCIERO ---\n\n";
        this.reporteGenerado += "1. Ingresos por Copagos (Mes Actual): $14,500,000 COP\n";
        this.reporteGenerado += "2. Costo Operativo Consultas: $45,200,000 COP\n";
        this.reporteGenerado += "3. Citas canceladas con penalidad: 12\n";
        this.reporteGenerado += "4. Autorizaciones de alto costo aprobadas: 3 ($8,000,000 COP aprox)\n";
        this.reporteGenerado += "\n>> ESTADO FINANCIERO: ESTABLE. DÉFICIT OPERATIVO SUBSIDIADO.\n";
    }
}

// Subclase 3: Reporte de Eficiencia
class ReporteEficiencia extends ReporteBaseTemplate {
    extraerDatosEspecializados() {
        this.reporteGenerado += "[DATA] Evaluando tiempos de espera, ocupación de agendas y satisfacción (Visitor)... \n";
    }

    generarCuerpoReporte() {
        this.reporteGenerado += "--- TIPO DE REPORTE: EFICIENCIA Y CALIDAD ---\n\n";
        this.reporteGenerado += "1. Tiempo promedio de espera en sala: 14 minutos\n";
        this.reporteGenerado += "2. Ocupación de Especialistas: 89%\n";
        this.reporteGenerado += "3. Puntuación Promedio Médicos: 4.8 / 5.0 Estrellas\n";
        this.reporteGenerado += "4. Citas Atendidas a Tiempo (State Pattern): 95%\n";
        this.reporteGenerado += "\n>> RENDIMIENTO OPERATIVO: ÓPTIMO.\n";
    }
}
