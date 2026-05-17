/**
 * @file AutorizacionController.js
 * @description Controlador para tramitar autorizaciones medicas utilizando el patron Chain of Responsibility.
 */
class AutorizacionController {
    constructor(autorizacionDAO, usuarioDAO) {
        this.autorizacionDAO = autorizacionDAO;
        this.usuarioDAO = usuarioDAO;
        this.autorizacionSeleccionadaId = null;
    }

    /**
     * Tramita una nueva solicitud de autorizacion haciéndola pasar por la cadena
     */
    solicitarAutorizacion() {
        const procedimiento = document.getElementById("auth-input-procedimiento").value.trim();
        const costo = parseFloat(document.getElementById("auth-input-costo").value);
        const justificacion = document.getElementById("auth-input-justificacion").value.trim();
        const paciente = app.authController.usuarioActivo;

        if (!paciente) return;
        if (!procedimiento || isNaN(costo) || costo <= 0) {
            alert("Error: Por favor completa todos los campos del trámite con valores válidos.");
            return;
        }

        const nuevaId = new Date().getTime();

        // 1. Instanciar Entidad SolicitudAutorizacion
        const solicitud = new SolicitudAutorizacion(
            nuevaId,
            paciente.id,
            paciente.nombre,
            procedimiento,
            costo,
            justificacion
        );

        VistaGlobal.logTerminal("chain", `Iniciando tramite de Solicitud #${nuevaId} por valor de \$${costo.toLocaleString()} COP...`);

        // 2. Construir la Cadena de Responsabilidad y procesar
        const cadena = ChainBuilder.buildChain();
        const solicitudProcesada = cadena.handle(solicitud);

        // 3. Persistir en el DAO
        this.autorizacionDAO.insertar(solicitudProcesada);

        alert(`¡Trámite de autorización completado! Estado final del proceso: ${solicitudProcesada.aprobado}`);
        
        // Reset campos y actualizar vistas
        document.getElementById("auth-input-procedimiento").value = "";
        document.getElementById("auth-input-costo").value = "";
        document.getElementById("auth-input-justificacion").value = "";

        this.listarAutorizacionesPaciente(paciente.id);
        
        // Seleccionar por defecto la nueva autorizacion para visualizar el flujo
        this.seleccionarAutorizacion(nuevaId);
    }

    /**
     * Lista las solicitudes del paciente
     */
    listarAutorizacionesPaciente(pacienteId) {
        const container = document.getElementById("auth-requests-stack");
        if (!container) return;

        container.innerHTML = "";
        const solicitudes = this.autorizacionDAO.obtenerPorPaciente(pacienteId);

        if (solicitudes.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">No has radicado trámites de autorizaciones.</p>`;
            return;
        }

        solicitudes.forEach(s => {
            const card = document.createElement("div");
            card.className = "auth-request-pill-card";
            if (String(s.id) === String(this.autorizacionSeleccionadaId)) {
                card.classList.add("selected-auth-card");
            }

            const badgeColor = s.aprobado === "APROBADO" ? "color:var(--success-green)" : (s.aprobado === "RECHAZADO" ? "color:var(--danger-red)" : "color:var(--warning-orange)");

            card.innerHTML = `
                <div class="auth-pill-left">
                    <h5>${s.procedimiento}</h5>
                    <p>Solicitud #${s.id} | Estado: <span style="font-weight:700; ${badgeColor}">${s.aprobado}</span></p>
                </div>
                <div class="auth-pill-cost">
                    \$${s.costo.toLocaleString()}
                </div>
            `;

            card.onclick = () => this.seleccionarAutorizacion(s.id);
            container.appendChild(card);
        });

        // Si no hay seleccionada, elegir la primera disponible
        if (!this.autorizacionSeleccionadaId && solicitudes.length > 0) {
            this.seleccionarAutorizacion(solicitudes[0].id);
        }
    }

    /**
     * Muestra las solicitudes en el panel del Administrador
     */
    listarAutorizacionesAdmin() {
        const tbody = document.getElementById("admin-auth-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";
        const solicitudes = this.autorizacionDAO.obtenerTodos();

        if (solicitudes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No hay trámites pendientes de autorizaciones en el sistema.</td></tr>`;
            return;
        }

        solicitudes.forEach(s => {
            const badgeClass = s.aprobado === "APROBADO" ? "badge-success" : (s.aprobado === "RECHAZADO" ? "badge-danger" : "badge-warning");
            
            // Obtener ultimo paso
            const ultimoPaso = s.historialAprobaciones[s.historialAprobaciones.length - 1];
            const detalleProceso = ultimoPaso ? `[${ultimoPaso.rol}] ${ultimoPaso.detalle}` : "Pendiente de procesamiento";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>#${s.id}</strong></td>
                <td>${s.pacienteNombre}</td>
                <td>${s.procedimiento}</td>
                <td>\$${s.costo.toLocaleString()} COP</td>
                <td><span class="status-label-badge ${badgeClass}">${s.aprobado}</span></td>
                <td><small>${detalleProceso}</small></td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Selecciona una solicitud específica para renderizar el diagrama de nodos pedagógico
     * @param {number|string} id 
     */
    seleccionarAutorizacion(id) {
        this.autorizacionSeleccionadaId = id;
        
        // Re-estilizar las tarjetas de la lista en la UI
        document.querySelectorAll(".auth-request-pill-card").forEach(card => {
            card.classList.remove("selected-auth-card");
        });

        // Buscar y marcar activa
        this.listarAutorizacionesPaciente(app.authController.usuarioActivo.id);

        const s = this.autorizacionDAO.obtenerPorId(id);
        if (!s) return;

        this.renderizarVisualizadorFlujo(s);
    }

    /**
     * Dibuja los nodos del flujo con sus colores según el historial de aprobaciones
     * @param {Object} solicitud 
     */
    renderizarVisualizadorFlujo(solicitud) {
        const pipeline = document.getElementById("chain-visual-pipeline");
        const detailsContainer = document.getElementById("chain-process-details");
        if (!pipeline || !detailsContainer) return;

        // Limpiar
        pipeline.innerHTML = "";

        // Nodos teóricos de la cadena
        const nodos = [
            { id: "MEDICO_GENERAL", titulo: "Médico General", limite: 200000 },
            { id: "ESPECIALISTA", titulo: "Especialista", limite: 1000000 },
            { id: "JUNTA_MEDICA", titulo: "Junta Médica", limite: 5000000 },
            { id: "GERENTE_OPERACIONES", titulo: "Gerencia Op.", limite: 10000000 }
        ];

        nodos.forEach((n, idx) => {
            const paso = solicitud.historialAprobaciones.find(h => h.rol === n.id);
            let claseNodo = "";
            let icono = "⭕";

            if (paso) {
                if (paso.decision === "APROBADO") {
                    claseNodo = "green-approved";
                    icono = "✅";
                } else if (paso.decision === "PASADO") {
                    claseNodo = "purple-passed";
                    icono = "➡️";
                } else if (paso.decision === "RECHAZADO") {
                    claseNodo = "red-rejected";
                    icono = "❌";
                }
            }

            const nodeDiv = document.createElement("div");
            nodeDiv.className = `chain-step-node ${claseNodo}`;
            nodeDiv.innerHTML = `
                <div class="node-icon-circle">${icono}</div>
                <span class="node-label-title">${n.titulo}</span>
                <span class="node-label-desc">Límite: \$${(n.limite/1000)}K</span>
            `;
            pipeline.appendChild(nodeDiv);
        });

        // Dibujar el nodo especial de rechazo si fue rechazado en Nivel superior
        const pasoRechazo = solicitud.historialAprobaciones.find(h => h.rol === "SISTEMA_RECHAZO");
        if (pasoRechazo || solicitud.aprobado === "RECHAZADO") {
            const nodeDiv = document.createElement("div");
            nodeDiv.className = "chain-step-node red-rejected";
            nodeDiv.innerHTML = `
                <div class="node-icon-circle">❌</div>
                <span class="node-label-title">Rechazo EPS</span>
                <span class="node-label-desc">> \$10M</span>
            `;
            pipeline.appendChild(nodeDiv);
        }

        // Renderizar logs explicativos detallados en el panel inferior
        let logsHtml = `<strong>Bitácora de Aprobación para Procedimiento: "${solicitud.procedimiento}"</strong><br><br>`;
        solicitud.historialAprobaciones.forEach((h, index) => {
            const colorDec = h.decision === "APROBADO" ? "color:var(--success-green)" : (h.decision === "RECHAZADO" ? "color:var(--danger-red)" : "color:var(--info-purple)");
            
            logsHtml += `
                <div style="margin-bottom: 8px; font-size:11.5px; border-left: 2.5px solid ${h.decision === "APROBADO" ? 'var(--success-green)' : (h.decision === 'RECHAZADO' ? 'var(--danger-red)' : 'var(--info-purple)')}; padding-left:10px;">
                    <span style="font-weight:700;">[Nivel ${index + 1}] — ${h.rol.replace('_',' ')}</span> | 
                    Decisión: <strong style="${colorDec}">${h.decision}</strong><br>
                    Detalle: <em>${h.detalle}</em> <small style="color:var(--text-light-grey)">(${h.timestamp})</small>
                </div>
            `;
        });

        detailsContainer.innerHTML = logsHtml;
    }
}
