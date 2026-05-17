/**
 * @file ResultadoController.js
 * @description Controlador que implementa el patron Visitor para procesar resultados clinicos polimorficamente.
 */
class ResultadoController {
    constructor(resultadoDAO) {
        this.resultadoDAO = resultadoDAO;
        this.resultadosActivos = []; // Almacena instancias concretas de dominio (Lab o Imagen)
    }

    /**
     * Carga y lista los resultados medicos del paciente, instanciando clases de Dominio concretas
     */
    listarResultadosPaciente(pacienteId) {
        const container = document.getElementById("resultados-cards-stack");
        if (!container) return;

        container.innerHTML = "";
        const rawData = this.resultadoDAO.obtenerPorPaciente(pacienteId);

        if (rawData.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">No cuentas con reportes de exámenes clínicos en el archivo.</p>`;
            return;
        }

        this.resultadosActivos = [];

        rawData.forEach(r => {
            let instanciaDominio = null;

            // Instanciar polimorficamente según el tipo de examen
            if (r.tipoClase === "LABORATORIO") {
                instanciaDominio = new ResultadoLaboratorio(
                    r.id,
                    r.pacienteId,
                    r.examenNombre,
                    r.fecha,
                    r.costoBase,
                    r.valorObtenido,
                    r.unidad,
                    r.rangoReferencia
                );
            } else if (r.tipoClase === "IMAGEN") {
                instanciaDominio = new ImagenDiagnostica(
                    r.id,
                    r.pacienteId,
                    r.examenNombre,
                    r.fecha,
                    r.costoBase,
                    r.regionAnatomica,
                    r.hallazgos,
                    r.tecnica
                );
            }

            if (instanciaDominio) {
                this.resultadosActivos.push(instanciaDominio);

                const badgeClass = r.tipoClase === "LABORATORIO" ? "badge-lab" : "badge-img";
                const labelExamen = r.tipoClase === "LABORATORIO" ? "🧪 Lab Clínico" : "💀 Imagenología";

                let detailsHtml = "";
                if (r.tipoClase === "LABORATORIO") {
                    detailsHtml = `
                        <p>🔬 Valor Obtenido: <strong>${r.valorObtenido} ${r.unidad}</strong></p>
                        <p>📋 Rango de Referencia: <span>${r.rangoReferencia}</span></p>
                    `;
                } else {
                    detailsHtml = `
                        <p>🩻 Región Anatómica: <strong>${r.regionAnatomica}</strong> | Técnica: <span>${r.tecnica}</span></p>
                        <p>📋 Hallazgos Clínicos: <span style="font-style: italic; color: var(--text-muted);">${r.hallazgos.substring(0, 100)}...</span></p>
                    `;
                }

                const card = document.createElement("div");
                card.className = "medical-result-card";
                card.innerHTML = `
                    <div class="result-card-header">
                        <h4>${r.examenNombre}</h4>
                        <span class="result-badge ${badgeClass}">${labelExamen}</span>
                    </div>
                    <div class="result-content-body">
                        <p>📅 Fecha del examen: <span>${r.fecha}</span></p>
                        <p>💳 Costo base de referencia: <span>\$${r.costoBase.toLocaleString()} COP</span></p>
                        ${detailsHtml}
                    </div>
                `;
                container.appendChild(card);
            }
        });

        // Limpiar el panel de salida del Visitor
        const outBox = document.getElementById("visitor-output-box");
        if (outBox) {
            outBox.innerHTML = `<p style="color:var(--text-muted); text-align:center; font-size:11.5px;">Elige una operación arriba para ejecutar el patrón Visitor de manera interactiva.</p>`;
        }
    }

    /**
     * OPERACIÓN VISITOR 1: Calcula copagos consolidados de exámenes
     */
    ejecutarCalcularFacturaCopagos() {
        if (this.resultadosActivos.length === 0) {
            alert("No hay resultados clínicos activos para visitar.");
            return;
        }

        // 1. Instanciar Visitante Concreto
        const visitor = new FacturacionVisitor();

        VistaGlobal.logTerminal("visitor", "Visitor: Iniciando Double-Dispatch para calculo de liquidacion de copagos...");

        // 2. Doble despacho polimórfico en cada elemento del conjunto
        this.resultadosActivos.forEach(elem => {
            elem.accept(visitor); // Despacha visitLaboratorio o visitImagen
        });

        // 3. Renderizar salida estilizada de la factura
        const outBox = document.getElementById("visitor-output-box");
        if (outBox) {
            const pacienteNombre = app.authController.usuarioActivo.nombre;
            outBox.innerHTML = visitor.obtenerFacturaFormateada(pacienteNombre);
            
            // Auto scroll a la salida
            outBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        VistaGlobal.logTerminal("visitor", `Calculo consolidado completado. Copago total liquidado: \$${visitor.totalCopago.toLocaleString()} COP.`);
    }

    /**
     * OPERACIÓN VISITOR 2: Exporta los exámenes clínicos consolidados en HTML estilizado
     */
    ejecutarExportarHTMLResultados() {
        if (this.resultadosActivos.length === 0) {
            alert("No hay resultados clínicos activos para visitar.");
            return;
        }

        // 1. Instanciar Visitante Concreto
        const visitor = new ExportadorHTMLVisitor();

        VistaGlobal.logTerminal("visitor", "Visitor: Iniciando Double-Dispatch para compilacion de exportable HTML...");

        // 2. Doble despacho polimórfico en cada elemento
        this.resultadosActivos.forEach(elem => {
            elem.accept(visitor); // Despacha visitLaboratorio o visitImagen
        });

        // 3. Renderizar reportes HTML consolidado
        const outBox = document.getElementById("visitor-output-box");
        if (outBox) {
            outBox.innerHTML = visitor.obtenerHTMLRenderizado();
            
            // Auto scroll
            outBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        VistaGlobal.logTerminal("visitor", "Compilacion de exportable HTML completada. Reportes estructurados y listos.");
    }
}
