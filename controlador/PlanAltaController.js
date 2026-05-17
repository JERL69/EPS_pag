/**
 * @file PlanAltaController.js
 * @description Controlador que implementa el patron Memento para editar, guardar e historializar planes de alta medica.
 */
class PlanAltaController {
    constructor(planAltaDAO) {
        this.planAltaDAO = planAltaDAO;
        this.caretaker = new HistorialPlanesAlta(); // Caretaker global del modulo Memento
        this.planActivo = null; // Entidad de Dominio PlanAlta activa en edicion
    }

    /**
     * Lista los planes de alta del paciente e inicializa la UI
     */
    listarPlanesAltaPaciente(pacienteId) {
        const container = document.getElementById("planes-alta-stack");
        if (!container) return;

        container.innerHTML = "";
        const planes = this.planAltaDAO.obtenerPorPaciente(pacienteId);

        if (planes.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">No cuentas con planes de alta de hospitalización vigentes.</p>`;
            return;
        }

        planes.forEach(pData => {
            // Instanciar entidad Originator de Dominio
            const plan = new PlanAlta(
                pData.id,
                pData.pacienteId,
                pData.diagnostico,
                pData.medicamentos,
                pData.recomendaciones,
                pData.proximoControl
            );
            plan.ultimaActualizacion = pData.ultimaActualizacion;

            const card = document.createElement("div");
            card.className = "plan-egreso-card";
            card.innerHTML = `
                <h4>🩺 ${plan.diagnostico}</h4>
                <div class="plan-info-row">📋 Última mod: <strong>${plan.ultimaActualizacion}</strong></div>
                <div class="plan-info-row">💊 Prescripción: <em>${plan.medicamentos.substring(0, 50)}...</em></div>
                <button class="btn-edit-plan-alta" onclick="app.planAltaController.cargarPlanEnEditor(${plan.id})">Editar e Historializar</button>
            `;
            container.appendChild(card);
        });

        // Cargar por defecto el primer plan en el editor para demostracion didáctica
        if (planes.length > 0 && !this.planActivo) {
            this.cargarPlanEnEditor(planes[0].id);
        }
    }

    /**
     * Carga los detalles del plan seleccionado en el panel editor interactivo
     * @param {number|string} planId 
     */
    cargarPlanEnEditor(planId) {
        const pData = this.planAltaDAO.obtenerPorId(planId);
        if (!pData) return;

        // Instanciar Originator en memoria
        this.planActivo = new PlanAlta(
            pData.id,
            pData.pacienteId,
            pData.diagnostico,
            pData.medicamentos,
            pData.recomendaciones,
            pData.proximoControl
        );
        this.planActivo.ultimaActualizacion = pData.ultimaActualizacion;

        // Llenar campos del Formulario Editor
        document.getElementById("memento-plan-id").textContent = `#${this.planActivo.id}`;
        document.getElementById("memento-input-diagnostico").value = this.planActivo.diagnostico;
        document.getElementById("memento-input-medicamentos").value = this.planActivo.medicamentos;
        document.getElementById("memento-input-recomendaciones").value = this.planActivo.recomendaciones;
        document.getElementById("memento-input-control").value = this.planActivo.proximoControl;

        // Renderizar la pila del Caretaker
        this.renderizarHistorialMementos();
        VistaGlobal.logTerminal("memento", `Plan de Alta #${planId} cargado en el editor interactivo.`);
    }

    /**
     * Guarda modificaciones al Plan de Alta actual creando previamente un Memento de resguardo.
     */
    guardarCambiosPlan() {
        if (!this.planActivo) {
            alert("Error: No hay ningún plan de alta activo en el editor.");
            return;
        }

        // 1. CAPTURAR MEMENTO RESPALDO del estado anterior (Originator crea Memento)
        const mementoRespaldo = this.planActivo.guardarMemento();

        // 2. REGISTRAR EN EL CARETAKER (Caretaker almacena Memento)
        this.caretaker.guardar(this.planActivo.id, mementoRespaldo);

        // 3. MUTAR EL ESTADO DEL ORIGINATOR con los nuevos datos ingresados en el Formulario
        this.planActivo.diagnostico = document.getElementById("memento-input-diagnostico").value.trim();
        this.planActivo.medicamentos = document.getElementById("memento-input-medicamentos").value.trim();
        this.planActivo.recomendaciones = document.getElementById("memento-input-recomendaciones").value.trim();
        this.planActivo.proximoControl = document.getElementById("memento-input-control").value.trim();
        this.planActivo.ultimaActualizacion = new Date().toLocaleTimeString();

        // 4. PERSISTIR ACTUALIZACIÓN EN DAO
        const dataParaDAO = {
            id: this.planActivo.id,
            pacienteId: this.planActivo.pacienteId,
            diagnostico: this.planActivo.diagnostico,
            medicamentos: this.planActivo.medicamentos,
            recomendaciones: this.planActivo.recomendaciones,
            proximoControl: this.planActivo.proximoControl,
            ultimaActualizacion: this.planActivo.ultimaActualizacion
        };
        this.planAltaDAO.actualizar(dataParaDAO);

        alert("¡Plan de alta actualizado exitosamente! El estado previo fue resguardado en el Caretaker.");

        // Refrescar vistas
        this.listarPlanesAltaPaciente(app.authController.usuarioActivo.id);
        this.renderizarHistorialMementos();
    }

    /**
     * Ejecuta la operacion deshacer extrayendo el memento del caretaker y restaurando el originator.
     */
    ejecutarDeshacerPlan() {
        if (!this.planActivo) return;

        // 1. EXTRAER EL ÚLTIMO MEMENTO DEL CARETAKER
        const mementoAnterior = this.caretaker.deshacer(this.planActivo.id);

        if (!mementoAnterior) {
            alert("Información: No hay más estados guardados en el historial (Caretaker vacío) para deshacer.");
            return;
        }

        // 2. RESTAURAR EL ORIGINATOR CON EL MEMENTO (Originator restaura Memento)
        this.planActivo.restaurarMemento(mementoAnterior);

        // 3. PERSISTIR EN EL DAO
        const dataParaDAO = {
            id: this.planActivo.id,
            pacienteId: this.planActivo.pacienteId,
            diagnostico: this.planActivo.diagnostico, // Se mantiene el diagnostico base
            medicamentos: this.planActivo.medicamentos,
            recomendaciones: this.planActivo.recomendaciones,
            proximoControl: this.planActivo.proximoControl,
            ultimaActualizacion: this.planActivo.ultimaActualizacion
        };
        this.planAltaDAO.actualizar(dataParaDAO);

        alert("¡Deshacer completado! El Plan de Alta ha retornado exitosamente a su estado anterior.");

        // Refrescar los campos en el Formulario Editor con el estado restaurado
        document.getElementById("memento-input-medicamentos").value = this.planActivo.medicamentos;
        document.getElementById("memento-input-recomendaciones").value = this.planActivo.recomendaciones;
        document.getElementById("memento-input-control").value = this.planActivo.proximoControl;

        // Refrescar vistas
        this.listarPlanesAltaPaciente(app.authController.usuarioActivo.id);
        this.renderizarHistorialMementos();
    }

    /**
     * Dibuja de manera didáctica la lista de mementos guardados en el Caretaker
     */
    renderizarHistorialMementos() {
        const stackList = document.getElementById("mementos-stack-list");
        if (!stackList || !this.planActivo) return;

        stackList.innerHTML = "";
        const mementos = this.caretaker.obtenerHistorial(this.planActivo.id);

        if (mementos.length === 0) {
            stackList.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:11px; padding:15px 0;">El Caretaker no registra capturas previas (Historial vacío).</p>`;
            return;
        }

        // Renderizar mementos en orden inverso (el tope de la pila primero)
        const mementosReversados = [...mementos].reverse();

        mementosReversados.forEach((m, index) => {
            const num = mementos.length - index;
            const li = document.createElement("div");
            li.className = "memento-stack-item";
            li.innerHTML = `
                <span>💾 [Captura #${num}] Resp. Medicamentos</span>
                <span class="memento-time">${m.timestamp}</span>
            `;
            stackList.appendChild(li);
        });
    }
}
