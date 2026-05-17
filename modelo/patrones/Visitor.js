/**
 * @file Visitor.js
 * @description Implementacion del patron Visitor para realizar operaciones en Resultados Medicos.
 */

/**
 * Interface base abstracta para los Visitantes.
 */
class ResultadoVisitor {
    constructor() {
        if (this.constructor === ResultadoVisitor) {
            throw new Error("No se puede instanciar la clase abstracta ResultadoVisitor directamente.");
        }
    }

    visitLaboratorio(labElement) {
        throw new Error("El metodo visitLaboratorio(labElement) debe ser implementado.");
    }

    visitImagen(imgElement) {
        throw new Error("El metodo visitImagen(imgElement) debe ser implementado.");
    }
}

/**
 * Visitante Concreto: FacturacionVisitor
 * Calcula el copago a pagar por cada tipo de examen.
 * - Laboratorio: Copago del 10% del costo base.
 * - Imagenología: Copago del 20% del costo base + cargo fijo por tecnología de $25.000 COP.
 */
class FacturacionVisitor extends ResultadoVisitor {
    constructor() {
        super();
        this.detalleItems = [];
        this.subtotal = 0;
        this.totalCopago = 0;
    }

    visitLaboratorio(lab) {
        const copago = lab.costoBase * 0.10;
        this.subtotal += lab.costoBase;
        this.totalCopago += copago;
        
        this.detalleItems.push({
            id: lab.id,
            nombre: lab.examenNombre,
            tipo: "Laboratorio Clínico (10% Copago)",
            costoBase: lab.costoBase,
            copago: copago,
            valores: `${lab.valorObtenido} ${lab.unidad} (Ref: ${lab.rangoReferencia})`
        });
        
        VistaGlobal.logTerminal("visitor", `FacturacionVisitor visito Lab #${lab.id} (${lab.examenNombre}). Copago: \$${copago.toLocaleString()}`);
        return copago;
    }

    visitImagen(img) {
        const cargoTecnologia = 25000;
        const copago = (img.costoBase * 0.20) + cargoTecnologia;
        this.subtotal += img.costoBase;
        this.totalCopago += copago;

        this.detalleItems.push({
            id: img.id,
            nombre: img.examenNombre,
            tipo: "Imagen Diagnóstica (20% Copago + \$25K Tec.)",
            costoBase: img.costoBase,
            copago: copago,
            valores: `Técnica: ${img.tecnica} | Región: ${img.regionAnatomica}`
        });

        VistaGlobal.logTerminal("visitor", `FacturacionVisitor visito Imagen #${img.id} (${img.examenNombre}). Copago: \$${copago.toLocaleString()}`);
        return copago;
    }

    /**
     * Devuelve una cadena formateada con la factura para mostrar en la consola/UI.
     */
    obtenerFacturaFormateada(pacienteNombre) {
        let txt = `<div class="clinical-invoice-box">`;
        txt += `<div class="invoice-header-stamp">`;
        txt += `<h4>FUNDACIÓN SANTA FE DE BOGOTÁ</h4>`;
        txt += `<p>Portal Pacientes - Factura Exámenes Clínicos</p>`;
        txt += `<p>Paciente: <strong>${pacienteNombre}</strong></p>`;
        txt += `<p>Fecha: ${new Date().toLocaleDateString()}</p>`;
        txt += `</div>`;

        this.detalleItems.forEach(item => {
            txt += `<div class="invoice-item-row">`;
            txt += `  <div>`;
            txt += `    <strong>${item.nombre}</strong><br>`;
            txt += `    <small>${item.tipo} | ${item.valores}</small>`;
            txt += `  </div>`;
            txt += `  <div style="text-align: right;">`;
            txt += `    Base: \$${item.costoBase.toLocaleString()}<br>`;
            txt += `    Copago: <strong>\$${item.copago.toLocaleString()}</strong>`;
            txt += `  </div>`;
            txt += `</div>`;
            txt += `<hr style="border: 0; border-top: 1px dashed var(--clinical-border); margin: 8px 0;">`;
        });

        txt += `<div class="invoice-totals">`;
        txt += `  <span>Copago Total a Pagar en Línea:</span>`;
        txt += `  <span>\$${this.totalCopago.toLocaleString()} COP</span>`;
        txt += `</div>`;
        txt += `</div>`;
        return txt;
    }
}

/**
 * Visitante Concreto: ExportadorHTMLVisitor
 * Genera una estructura HTML estilizada y portable de los reportes.
 */
class ExportadorHTMLVisitor extends ResultadoVisitor {
    constructor() {
        super();
        this.htmlConsolidado = "";
    }

    visitLaboratorio(lab) {
        let valorStatusClass = "status-normal";
        const valorNum = parseFloat(lab.valorObtenido);
        
        // Simular alerta si sale de rango
        if (lab.examenNombre.includes("Glucosa") && valorNum > 100) {
            valorStatusClass = "status-alerta-alta";
        }

        const html = `
        <div class="html-export-card export-lab">
            <div class="export-header">
                <span class="export-type-icon">🧪</span>
                <div class="export-title-info">
                    <h5>REPORTE DE LABORATORIO CLÍNICO</h5>
                    <h3>${lab.examenNombre}</h3>
                </div>
            </div>
            <div class="export-body">
                <div class="export-metric-row">
                    <span class="metric-lbl">Valor Obtenido:</span>
                    <span class="metric-val ${valorStatusClass}">${lab.valorObtenido} ${lab.unidad}</span>
                </div>
                <div class="export-metric-row">
                    <span class="metric-lbl">Rango de Referencia:</span>
                    <span class="metric-ref">${lab.rangoReferencia}</span>
                </div>
                <div class="export-footer-info">
                    <span>Fecha Procesamiento: ${lab.fecha}</span>
                    <span>Validado por: Bacteriólogo de Turno - FSFB</span>
                </div>
            </div>
        </div>
        `;
        this.htmlConsolidado += html;
        VistaGlobal.logTerminal("visitor", `ExportadorHTMLVisitor exporto Lab #${lab.id} (${lab.examenNombre}) a HTML.`);
        return html;
    }

    visitImagen(img) {
        const html = `
        <div class="html-export-card export-img">
            <div class="export-header">
                <span class="export-type-icon">💀</span>
                <div class="export-title-info">
                    <h5>REPORTE DE IMAGENOLOGÍA DIAGNÓSTICA</h5>
                    <h3>${img.examenNombre}</h3>
                </div>
            </div>
            <div class="export-body">
                <div class="export-metric-row">
                    <span class="metric-lbl">Técnica Utilizada:</span>
                    <span class="metric-ref-heavy">${img.tecnica}</span>
                </div>
                <div class="export-metric-row">
                    <span class="metric-lbl">Región Anatómica:</span>
                    <span class="metric-ref-heavy">${img.regionAnatomica}</span>
                </div>
                <div class="export-findings-box">
                    <strong>Hallazgos Médicos:</strong>
                    <p>${img.hallazgos}</p>
                </div>
                <div class="export-footer-info">
                    <span>Fecha Adquisición: ${img.fecha}</span>
                    <span>Interpretado por: Radiólogo Clínico - FSFB</span>
                </div>
            </div>
        </div>
        `;
        this.htmlConsolidado += html;
        VistaGlobal.logTerminal("visitor", `ExportadorHTMLVisitor exporto Imagen #${img.id} (${img.examenNombre}) a HTML.`);
        return html;
    }

    obtenerHTMLRenderizado() {
        let container = `<div class="consolidated-exports-wrapper">`;
        container += `  <div class="export-consolidated-header">`;
        container += `    <h3>Carpeta Médica Consolidada de Resultados</h3>`;
        container += `    <p>Generado por ExportadorHTMLVisitor - Sanitas EPS</p>`;
        container += `  </div>`;
        container += this.htmlConsolidado;
        container += `</div>`;
        return container;
    }
}
