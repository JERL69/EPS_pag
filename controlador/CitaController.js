/**
 * @file CitaController.js
 * @description Controlador para el agendamiento y transiciones de estado de las citas (patron State).
 */
class CitaController {
    constructor(citaDAO, usuarioDAO) {
        this.citaDAO = citaDAO;
        this.usuarioDAO = usuarioDAO;
        this.fechaSeleccionada = "2026-05-14";
        this.horaSeleccionada = "09:00";
    }

    /**
     * Carga de sedes dinamica segun la especialidad seleccionada
     */
    cargarSedesYCalcularCita() {
        const tipo = document.getElementById("cita-select-tipo").value;
        const selectSede = document.getElementById("cita-select-sede");
        const costLabel = document.getElementById("cita-live-cost");

        if (!selectSede || !costLabel) return;

        // Calcular costo e imprimir tags pedagogicas
        let costo = 5000;
        let sedesHtml = "";

        if (tipo === "GENERAL") {
            costo = 5000;
            sedesHtml = `
                <option value="Sede Principal FSFB - Edificio Central">Sede Principal FSFB - Edificio Central</option>
                <option value="Unidad Médica Chicó FSFB">Unidad Médica Chicó FSFB</option>
            `;
            VistaGlobal.logTerminal("system", "Factory Method: Preparando creacion de CitaMedicinaGeneral. Copago base: \$5.000");
        } else if (tipo === "ESPECIALISTA") {
            costo = 25000;
            sedesHtml = `
                <option value="Centro Clínico de Especialistas FSFB">Centro Clínico de Especialistas FSFB</option>
                <option value="Sede Infantil FSFB - Edificio Arboleda">Sede Infantil FSFB - Edificio Arboleda</option>
            `;
            VistaGlobal.logTerminal("system", "Factory Method: Preparando creacion de CitaEspecialista. Copago base: \$25.000");
        } else if (tipo === "PROCEDIMIENTO") {
            costo = 150000;
            sedesHtml = `
                <option value="Pabellón Quirúrgico FSFB - Edificio Compensar">Pabellón Quirúrgico FSFB - Edificio Compensar</option>
                <option value="Unidad de Imágenes y Diagnóstico Complejo FSFB">Unidad de Imágenes y Diagnóstico Complejo FSFB</option>
            `;
            VistaGlobal.logTerminal("system", "Factory Method: Preparando creacion de CitaProcedimientoComplejo. Copago base: \$150.000");
        }

        costLabel.textContent = `\$${costo.toLocaleString()} COP`;
        selectSede.innerHTML = sedesHtml;
        
        this.cargarConsultoriosCita();
        this.renderizarCalendarioMock();
    }

    /**
     * Carga consultorios dinamicos según la sede elegida
     */
    cargarConsultoriosCita() {
        const sede = document.getElementById("cita-select-sede").value;
        const selectConsultorio = document.getElementById("cita-select-consultorio");
        const docInput = document.getElementById("cita-input-doctor");

        if (!selectConsultorio) return;

        if (sede.includes("Principal") || sede.includes("Chicó")) {
            selectConsultorio.innerHTML = `
                <option value="Consultorio 301 - Dr. Carlos Mendoza">Consultorio 301 - Dr. Carlos Mendoza</option>
                <option value="Consultorio 302 - Dra. Diana Torres">Consultorio 302 - Dra. Diana Torres</option>
            `;
            if (docInput) docInput.value = "Dr. Carlos Mendoza";
        } else if (sede.includes("Especialistas") || sede.includes("Infantil")) {
            selectConsultorio.innerHTML = `
                <option value="Consultorio 504 - Dra. Clara Rojas">Consultorio 504 - Dra. Clara Rojas</option>
                <option value="Consultorio 505 - Dr. Andrés Restrepo">Consultorio 505 - Dr. Andrés Restrepo</option>
            `;
            if (docInput) docInput.value = "Dra. Clara Rojas";
        } else {
            selectConsultorio.innerHTML = `
                <option value="Sala Quirúrgica 01 - Dr. Gabriel Silva">Sala Quirúrgica 01 - Dr. Gabriel Silva</option>
                <option value="Sala de Escáner 02 - Dra. Pilar Gómez">Sala de Escáner 02 - Dra. Pilar Gómez</option>
            `;
            if (docInput) docInput.value = "Dr. Gabriel Silva";
        }
    }

    /**
     * Renderiza un calendario interactivo mockeado para la UI premium.
     */
    renderizarCalendarioMock() {
        const container = document.getElementById("calendar-days");
        if (!container) return;

        container.innerHTML = "";

        // Mayo 2026 empieza en Viernes (5 celdas vacías al inicio)
        for (let i = 0; i < 5; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-day-cell inactive-month-day";
            empty.textContent = "";
            container.appendChild(empty);
        }

        // Cargar 31 días
        for (let dia = 1; dia <= 31; dia++) {
            const cell = document.createElement("div");
            cell.className = "calendar-day-cell";
            cell.textContent = dia;

            const fechaIso = `2026-05-${dia < 10 ? '0' + dia : dia}`;
            if (fechaIso === this.fechaSeleccionada) {
                cell.classList.add("active-day-selected");
            }

            cell.onclick = () => {
                document.querySelectorAll(".calendar-day-cell").forEach(c => c.classList.remove("active-day-selected"));
                cell.classList.add("active-day-selected");
                this.fechaSeleccionada = fechaIso;
                document.getElementById("selected-date-label").textContent = `${dia} de Mayo, 2026`;
                VistaGlobal.logTerminal("system", `Fecha de cita seleccionada: [${fechaIso}]`);
                this.cargarTimeSlotsMock();
            };

            container.appendChild(cell);
        }
        this.cargarTimeSlotsMock();
    }

    /**
     * Carga horas mocks para elegir en la UI.
     */
    cargarTimeSlotsMock() {
        const grid = document.getElementById("time-slots-grid");
        if (!grid) return;

        grid.innerHTML = "";
        const horas = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

        horas.forEach(h => {
            const pill = document.createElement("button");
            pill.className = "time-slot-pill";
            pill.textContent = h;

            if (h === this.horaSeleccionada) {
                pill.classList.add("active-slot-selected");
            }

            pill.onclick = () => {
                document.querySelectorAll(".time-slot-pill").forEach(p => p.classList.remove("active-slot-selected"));
                pill.classList.add("active-slot-selected");
                this.horaSeleccionada = h;
                VistaGlobal.logTerminal("system", `Hora de cita seleccionada: [${h}]`);
            };

            grid.appendChild(pill);
        });
    }

    /**
     * Agenda una cita medica concreta utilizando Factory Method implicito
     */
    registrarCitaPaciente() {
        const tipo = document.getElementById("cita-select-tipo").value;
        const sede = document.getElementById("cita-select-sede").value;
        const consultorio = document.getElementById("cita-select-consultorio").value;
        const doctor = document.getElementById("cita-input-doctor").value;
        const paciente = app.authController.usuarioActivo;

        if (!paciente) return;

        let costo = 5000;
        if (tipo === "ESPECIALISTA") costo = 25000;
        else if (tipo === "PROCEDIMIENTO") costo = 150000;

        const nuevaCitaId = new Date().getTime();

        const nuevaCitaMock = {
            id: nuevaCitaId,
            pacienteId: paciente.id,
            pacienteNombre: paciente.nombre,
            especialidad: tipo,
            sede: sede,
            consultorio: consultorio,
            medico: doctor,
            fecha: this.fechaSeleccionada,
            hora: this.horaSeleccionada,
            costo: costo,
            _estadoString: "PendienteConfirmacion" // Estado inicial
        };

        this.citaDAO.insertar(nuevaCitaMock);
        
        // Log pedagógico
        VistaGlobal.logTerminal("system", `Factory Method instancio Cita tipo [${tipo}] con Costo \$${costo.toLocaleString()}`);
        VistaGlobal.logTerminal("state", `Cita #${nuevaCitaId} instanciada en estado inicial: [PENDIENTE DE CONFIRMACION]`);

        alert("¡Cita agendada con éxito! Se ha registrado en estado 'Pendiente de Confirmación'. Puedes gestionarla en la sección 'Gestionar Citas'.");
        
        this.listarCitasPaciente(paciente.id);
        mostrarSubModuloPaciente('modulo-mis-citas');
    }

    /**
     * Lista las citas del paciente en su panel distribuidas en tres columnas de estado.
     * @param {number} pacienteId 
     * @param {string|null} filtroFecha - Opcional, para filtrar por fecha específica
     */
    listarCitasPaciente(pacienteId, filtroFecha = null) {
        const stackConfirmar = document.getElementById("stack-pendientes-confirmar");
        const stackPagar = document.getElementById("stack-pendientes-pagar");
        const stackListo = document.getElementById("stack-listo-cita");

        if (!stackConfirmar || !stackPagar || !stackListo) return;

        stackConfirmar.innerHTML = "";
        stackPagar.innerHTML = "";
        stackListo.innerHTML = "";

        let citas = this.citaDAO.obtenerPorPaciente(pacienteId);

        // Filtrar por fecha si se ha seleccionado una
        if (filtroFecha) {
            citas = citas.filter(c => c.fecha === filtroFecha);
        }

        let countConfirmar = 0;
        let countPagar = 0;
        let countListo = 0;

        citas.forEach(cData => {
            // Re-instanciar entidad de Dominio para cargar lógica de Estado
            const cita = new Cita(
                cData.id,
                cData.pacienteId,
                cData.especialidad,
                cData.sede,
                cData.consultorio,
                cData.medico,
                cData.fecha,
                cData.hora,
                cData.costo,
                cData._estadoString
            );

            // Determinar en qué columna colocar la cita
            let borderClass = "";
            let targetStack = null;

            if (cita.estadoNombre === "PendienteConfirmacion") {
                borderClass = "border-yellow";
                targetStack = stackConfirmar;
                countConfirmar++;
            } else if (cita.estadoNombre === "PendientePago") {
                borderClass = "border-green";
                targetStack = stackPagar;
                countPagar++;
            } else if (cita.estadoNombre === "ListoParaCita") {
                borderClass = "border-blue";
                targetStack = stackListo;
                countListo++;
            }

            if (!targetStack) return; // Omitir canceladas o pasadas en este tablero

            let btnPagar = "";
            let btnCancelar = "";

            if (cita.estadoNombre === "PendientePago") {
                btnPagar = `<button class="btn-gestiona-action btn-gestiona-pay" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'pagar')">Pagar Copago</button>`;
                btnCancelar = `<button class="btn-gestiona-action btn-gestiona-cancel" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'cancelar')">Cancelar</button>`;
            } else if (cita.estadoNombre === "PendienteConfirmacion" || cita.estadoNombre === "ListoParaCita") {
                btnCancelar = `<button class="btn-gestiona-action btn-gestiona-cancel" onclick="CitaController.ejecutarAccionCita(${cita.id}, 'cancelar')">Cancelar</button>`;
            }

            const card = document.createElement("div");
            card.className = `gestiona-cita-card ${borderClass}`;
            card.innerHTML = `
                <div class="gestiona-cita-card-header">
                    <span class="gestiona-cita-card-spec">${cita.especialidad}</span>
                    <span class="gestiona-cita-card-cost">\$${cita.costo.toLocaleString()}</span>
                </div>
                <div class="gestiona-cita-card-body">
                    <p>👨‍⚕️ Doctor: <span>${cita.medico}</span></p>
                    <p>📅 Fecha: <span>${cita.fecha}</span></p>
                    <p>🕒 Hora: <span>${cita.hora}</span></p>
                    <p>📍 Sede: <span>${cita.sede.split(' - ')[0]}</span></p>
                </div>
                <div class="gestiona-cita-card-actions">
                    ${btnPagar}
                    ${btnCancelar}
                </div>
            `;
            targetStack.appendChild(card);
        });

        // Colocar placeholder vacío si no hay citas en la columna
        if (countConfirmar === 0) {
            stackConfirmar.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:11px; padding:20px 0;">No tienes citas pendientes por confirmar.</p>`;
        }
        if (countPagar === 0) {
            stackPagar.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:11px; padding:20px 0;">No tienes copagos pendientes.</p>`;
        }
        if (countListo === 0) {
            stackListo.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:11px; padding:20px 0;">No tienes citas listas para tomar.</p>`;
        }
    }

    /**
     * Muestra las citas del sistema en el panel del Administrador
     */
    listarCitasAdmin() {
        const citasData = this.citaDAO.obtenerTodos();
        const citas = citasData.map(c => new Cita(
            c.id,
            c.pacienteId,
            c.especialidad,
            c.sede,
            c.consultorio,
            c.medico,
            c.fecha,
            c.hora,
            c.costo,
            c._estadoString
        ));

        // Inyectar nombre de paciente para la tabla
        citas.forEach(c => {
            const pac = this.usuarioDAO.obtenerPorId(c.pacienteId);
            c.pacienteNombre = pac ? pac.nombre : "Paciente FSFB";
        });

        VistaGlobal.renderizarTablaAdminCitas(citas);
        VistaGlobal.renderizarEstadisticasAdmin(citas);
    }

    /**
     * Ejecuta polimorficamente la accion del patron State sobre el contexto Cita.
     * Metodo accesible estaticamente por facilidad de callbacks en el DOM.
     * @param {number} citaId 
     * @param {string} accion - 'confirmar', 'pagar', 'cancelar', 'atender'
     */
    static ejecutarAccionCita(citaId, accion) {
        const dao = app.citaController.citaDAO;
        const cData = dao.obtenerPorId(citaId);
        if (!cData) return;

        const cita = new Cita(
            cData.id,
            cData.pacienteId,
            cData.especialidad,
            cData.sede,
            cData.consultorio,
            cData.medico,
            cData.fecha,
            cData.hora,
            cData.costo,
            cData._estadoString
        );

        let resultado = false;
        
        if (accion === "confirmar") resultado = cita.confirmar();
        else if (accion === "pagar") resultado = cita.pagar();
        else if (accion === "cancelar") resultado = cita.cancelar();
        else if (accion === "atender") resultado = cita.atender();

        if (resultado) {
            // Guardar el nuevo estado transicionado en el DAO
            cData._estadoString = cita.estadoNombre;
            dao.actualizar(cData);

            // Refrescar vistas segun la sesion activa
            const activeUser = app.authController.usuarioActivo;
            if (activeUser) {
                if (activeUser.tipo === "PACIENTE") {
                    app.citaController.listarCitasPaciente(activeUser.id);
                } else {
                    app.citaController.listarCitasAdmin();
                }
            }
            alert(`Acción '${accion.toUpperCase()}' ejecutada correctamente en cita #${citaId}. Estado actual: ${cita.estadoNombre}`);
        } else {
            alert(`Error: La acción '${accion.toUpperCase()}' no está permitida en el estado actual de la cita (${cita.estadoNombre}).`);
        }
    }

    /**
     * Auxiliar para formatear camelCase a dash-case
     */
    camelToDash(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
