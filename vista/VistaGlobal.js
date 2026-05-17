/**
 * @file VistaGlobal.js
 * @description Vista central que gestiona el DOM y actualiza los elementos visuales de la SPA.
 */
class VistaGlobal {

    /**
     * Muestra la pantalla especificada y oculta las demas con animacion suave.
     * @param {string} pantallaId 
     */
    static navegarAPantalla(pantallaId) {
        const pantallas = document.querySelectorAll(".pantalla-seccion");
        pantallas.forEach(p => {
            p.classList.remove("activa");
        });

        const pantallaDestino = document.getElementById(pantallaId);
        if (pantallaDestino) {
            pantallaDestino.classList.add("activa");
            this.logTerminal("system", `Navegando a la pantalla: [${pantallaId.toUpperCase()}]`);
        }
    }

    /**
     * Escribe un registro con formato en las consolas pedagogicas inferiores.
     * @param {string} patronTipo - 'state', 'chain', 'memento', 'visitor', 'system'
     * @param {string} mensaje 
     */
    static logTerminal(patronTipo, mensaje) {
        const logHtml = `
            <div class="terminal-log-line">
                <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                <span class="log-pattern-tag tag-${patronTipo.toLowerCase()}">${patronTipo}</span>
                <span class="log-content-msg">${mensaje}</span>
            </div>
        `;

        // Agregar a la consola de Paciente
        const consolaPaciente = document.getElementById("terminal-logs-body");
        if (consolaPaciente) {
            consolaPaciente.innerHTML += logHtml;
            consolaPaciente.scrollTop = consolaPaciente.scrollHeight;
        }

        // Agregar a la consola de Admin
        const consolaAdmin = document.getElementById("terminal-logs-body-admin");
        if (consolaAdmin) {
            consolaAdmin.innerHTML += logHtml;
            consolaAdmin.scrollTop = consolaAdmin.scrollHeight;
        }
    }

    /**
     * Limpia los logs de las consolas pedagogicas.
     */
    static limpiarConsolaLogs() {
        const c1 = document.getElementById("terminal-logs-body");
        if (c1) c1.innerHTML = "";
        const c2 = document.getElementById("terminal-logs-body-admin");
        if (c2) c2.innerHTML = "";
    }

    /**
     * Actualiza la interfaz del Paciente con sus datos.
     * @param {Object} paciente 
     */
    static renderizarDashboardPaciente(paciente) {
        const labelName = document.getElementById("user-display-name");
        const labelPill = document.getElementById("user-pill-label");
        const labelWelcome = document.getElementById("welcome-patient-name");

        if (labelName) labelName.textContent = paciente.nombre;
        if (labelPill) labelPill.textContent = paciente.nombre.split(' ')[0] + " " + (paciente.nombre.split(' ')[1] ? paciente.nombre.split(' ')[1][0] + "." : "");
        if (labelWelcome) labelWelcome.textContent = paciente.nombre;
    }

    /**
     * Renderiza la tabla de citas del Administrador
     * @param {Array} citas 
     * @param {Function} callbacks - Metodos del controlador para acciones
     */
    static renderizarTablaAdminCitas(citas, callbacks) {
        const tbody = document.getElementById("admin-citas-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (citas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No hay citas registradas en el sistema.</td></tr>`;
            return;
        }

        citas.forEach(cita => {
            // Resolver estado para obtener acciones validas
            cita.resolverEstado();
            
            let btnConfirmar = "";
            let btnPagar = "";
            let btnAtender = "";
            let btnCancelar = "";
            
            const badgeClass = this.obtenerBadgeEstado(cita.estadoNombre);

            // Generar botones solo para transiciones permitidas según el Estado Actual de la cita
            if (cita.estadoNombre === "PendienteConfirmacion") {
                btnConfirmar = `<button class="btn-state-action btn-state-confirm" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'confirmar')">Confirmar</button>`;
                btnCancelar = `<button class="btn-state-action btn-state-cancel" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'cancelar')">Cancelar</button>`;
            } else if (cita.estadoNombre === "PendientePago") {
                btnPagar = `<button class="btn-state-action btn-state-pay" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'pagar')">Pagar</button>`;
                btnCancelar = `<button class="btn-state-action btn-state-cancel" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'cancelar')">Cancelar</button>`;
            } else if (cita.estadoNombre === "ListoParaCita") {
                btnAtender = `<button class="btn-state-action btn-state-confirm" style="background-color:var(--info-purple)" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'atender')">Atender</button>`;
                btnCancelar = `<button class="btn-state-action btn-state-cancel" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'cancelar')">Cancelar</button>`;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>#${cita.id}</strong></td>
                <td>${cita.pacienteNombre || 'Juan Esteban Rivera'}</td>
                <td>${cita.especialidad}</td>
                <td>${cita.sede}<br><small>${cita.consultorio}</small></td>
                <td>${cita.fecha} - ${cita.hora}</td>
                <td><span class="status-label-badge ${badgeClass}">${cita.estadoNombre}</span></td>
                <td>
                    <div style="display:flex; gap:5px;">
                        ${btnConfirmar}
                        ${btnPagar}
                        ${btnAtender}
                        ${btnCancelar}
                        ${(btnConfirmar=="" && btnPagar=="" && btnAtender=="" && btnCancelar=="") ? '<span style="color:var(--text-muted)">Finalizado</span>' : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Renderiza las estadisticas globales del Administrador.
     */
    static renderizarEstadisticasAdmin(citas) {
        const grid = document.getElementById("admin-stats-grid");
        if (!grid) return;

        const total = citas.length;
        const pendientesConfirmar = citas.filter(c => c._estadoString === "PendienteConfirmacion").length;
        const pendientesPago = citas.filter(c => c._estadoString === "PendientePago").length;
        const listas = citas.filter(c => c._estadoString === "ListoParaCita").length;
        const atendidas = citas.filter(c => c._estadoString === "Atendida").length;
        const canceladas = citas.filter(c => c._estadoString === "Cancelada").length;

        grid.innerHTML = `
            <div class="stat-card bg-soft-blue">
                <span class="stat-icon">👥</span>
                <div class="stat-info">
                    <h5>Total Citas</h5>
                    <h3>${total}</h3>
                </div>
            </div>
            <div class="stat-card bg-soft-green">
                <span class="stat-icon">🕒</span>
                <div class="stat-info">
                    <h5>P. Confirmar</h5>
                    <h3>${pendientesConfirmar}</h3>
                </div>
            </div>
            <div class="stat-card bg-soft-orange">
                <span class="stat-icon">💰</span>
                <div class="stat-info">
                    <h5>P. Pago</h5>
                    <h3>${pendientesPago}</h3>
                </div>
            </div>
            <div class="stat-card bg-soft-cyan">
                <span class="stat-icon">🏥</span>
                <div class="stat-info">
                    <h5>Listas/Atendidas</h5>
                    <h3>${listas + atendidas}</h3>
                </div>
            </div>
        `;
    }

    /**
     * Devuelve la clase badge CSS adecuada para cada estado
     * @param {string} estadoNombre 
     */
    static obtenerBadgeEstado(estadoNombre) {
        switch (estadoNombre) {
            case "PendienteConfirmacion": return "badge-warning";
            case "PendientePago": return "badge-info";
            case "ListoParaCita": return "badge-success";
            case "Cancelada": return "badge-danger";
            case "Atendida": return "badge-purple";
            default: return "badge-warning";
        }
    }

    /**
     * Renderiza los usuarios en la tabla del directorio utilizando el Iterator proporcionado.
     * @param {UsuarioIterator} iterator 
     */
    static renderizarTablaDirectorio(iterator) {
        const tbody = document.getElementById("admin-directorio-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";
        let count = 0;

        iterator.reiniciar();
        while (iterator.tieneSiguiente()) {
            const usuario = iterator.siguiente();
            count++;
            
            let detalles = "-";
            if (usuario.tipo === "DOCTOR" || usuario.tipo === "MEDICO") {
                detalles = `Especialidad: ${usuario.especialidad || 'General'}`;
            } else if (usuario.tipo === "PACIENTE") {
                detalles = `Edad: ${usuario.fechaNacimiento ? new Date().getFullYear() - new Date(usuario.fechaNacimiento).getFullYear() : 'N/A'}`;
                if (usuario.cronico || (usuario.id % 2 === 0)) { // Mock condición de crónico
                    detalles += " | <span style='color:var(--danger-red); font-weight:bold;'>Crónico</span>";
                }
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${usuario.documento || usuario.id}</strong></td>
                <td>${usuario.nombre || 'Usuario'}</td>
                <td><span class="status-label-badge badge-info">${usuario.tipo}</span></td>
                <td><small>${detalles}</small></td>
                <td><span class="status-label-badge badge-success">Activo</span></td>
            `;
            tbody.appendChild(tr);
        }

        if (count === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No se encontraron registros para este filtro.</td></tr>`;
        }
    }
}
