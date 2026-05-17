/**
 * @file app.js
 * @description Punto de entrada principal (Orquestador) de la SPA de la EPS.
 *              Instancia los DAO, Controladores e inicializa los disparadores de eventos del DOM y bindings globales.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Instanciar Capa de Acceso a Datos (DAOs)
    const usuarioDAO = new UsuarioDAO();
    const citaDAO = new CitaDAO();
    const autorizacionDAO = new AutorizacionDAO();
    const planAltaDAO = new PlanAltaDAO();
    const resultadoDAO = new ResultadoDAO();

    // 2. Instanciar Capa de Controladores (Controllers) y exponerlos en el namespace global 'app'
    window.app = {
        authController: new AuthController(usuarioDAO),
        citaController: new CitaController(citaDAO, usuarioDAO),
        autorizacionController: new AutorizacionController(autorizacionDAO, usuarioDAO),
        planAltaController: new PlanAltaController(planAltaDAO),
        resultadoController: new ResultadoController(resultadoDAO)
    };

    // =================================================================
    // 3. Vincular Helpers de Rutas de Sub-Modulos en el Entorno Global
    // =================================================================
    window.mostrarSubModuloPaciente = function (moduloId) {
        // Resolver ID real del elemento verificando si requiere el prefijo "submodulo-"
        let elementId = moduloId;
        if (!document.getElementById(elementId)) {
            elementId = 'submodulo-' + moduloId;
        }

        // Ocultar todos los submodulos
        const submodulos = document.querySelectorAll("#pantalla-paciente-dashboard .submodulo-seccion");
        submodulos.forEach(sm => sm.classList.remove("active"));

        // Quitar clases activas en sidebar
        const navItems = document.querySelectorAll("#pantalla-paciente-dashboard .nav-item");
        navItems.forEach(item => item.classList.remove("active"));

        // Mostrar submodulo activo
        const moduloActivo = document.getElementById(elementId);
        if (moduloActivo) {
            moduloActivo.classList.add("active");
            
            // Asignar active al item correspondiente en sidebar
            const activeNav = Array.from(navItems).find(item => {
                const attr = item.getAttribute("onclick");
                return attr && attr.includes(moduloId);
            });
            if (activeNav) activeNav.classList.add("active");

            // Recargar datos especificos según el modulo
            const paciente = window.app.authController.usuarioActivo;
            if (paciente) {
                if (moduloId === 'modulo-mis-citas') {
                    window.app.citaController.listarCitasPaciente(paciente.id);
                } else if (moduloId === 'modulo-autorizaciones') {
                    window.app.autorizacionController.listarAutorizacionesPaciente(paciente.id);
                } else if (moduloId === 'modulo-planes-alta') {
                    window.app.planAltaController.listarPlanesAltaPaciente(paciente.id);
                } else if (moduloId === 'modulo-resultados' || moduloId === 'submodulo-modulo-resultados') {
                    window.app.resultadoController.listarResultadosPaciente(paciente.id);
                } else if (moduloId === 'modulo-perfil') {
                    window.prellenarPerfilPaciente();
                } else if (moduloId === 'modulo-mis-doctores') {
                    window.prellenarDoctores();
                }
            }

            VistaGlobal.logTerminal("system", `Modulo Paciente cargado: [${moduloId.toUpperCase()}]`);
        }
    };

    window.mostrarSubModuloAdmin = function (moduloId) {
        let elementId = moduloId;
        if (!document.getElementById(elementId)) {
            elementId = 'submodulo-' + moduloId;
        }

        // Ocultar submodulos admin
        const submodulos = document.querySelectorAll("#pantalla-admin-dashboard .submodulo-seccion");
        submodulos.forEach(sm => sm.classList.remove("active"));

        // Quitar activas sidebar admin
        const navItems = document.querySelectorAll("#pantalla-admin-dashboard .nav-item");
        navItems.forEach(item => item.classList.remove("active"));

        // Mostrar submodulo admin activo
        const moduloActivo = document.getElementById(elementId);
        if (moduloActivo) {
            moduloActivo.classList.add("active");

            const activeNav = Array.from(navItems).find(item => {
                const attr = item.getAttribute("onclick");
                return attr && attr.includes(moduloId);
            });
            if (activeNav) activeNav.classList.add("active");

            // Recargar segun corresponda
            if (moduloId === 'admin-citas') {
                window.app.citaController.listarCitasAdmin();
            } else if (moduloId === 'admin-autorizaciones') {
                window.app.autorizacionController.listarAutorizacionesAdmin();
            }

            VistaGlobal.logTerminal("system", `Modulo Administrador cargado: [${moduloId.toUpperCase()}]`);
        }
    };

    // =================================================================
    // 4. BINDINGS GLOBALES PARA ATRIBUTOS ONCLICK EN EL HTML
    // =================================================================
    window.navegarAPantalla = (id) => VistaGlobal.navegarAPantalla(id);
    window.cerrarCookies = () => {
        const cb = document.getElementById("cookie-banner-lobby");
        if (cb) cb.style.display = "none";
        VistaGlobal.logTerminal("system", "Cookies de navegación aceptadas de forma segura.");
    };
    window.toggleCaptcha = (cb) => {
        const val = typeof cb === 'boolean' ? cb : cb.checked;
        window.app.authController.toggleCaptcha(val);
    };
    window.validarFormPaso1 = () => window.app.authController.validarBotonPaso1();
    window.procesarRegistroPaso1 = () => window.app.authController.procesarRegistroPaso1();
    window.registrarNuevoPaciente = () => window.app.authController.registrarNuevoPaciente();
    window.cambiarRolLogin = (rol) => window.app.authController.cambiarRolLogin(rol);
    window.ejecutarLogin = () => window.app.authController.ejecutarLogin();
    window.simularGoogleLogin = () => window.app.authController.simularGoogleLogin();
    window.simularRecuperacionContrasena = () => window.app.authController.simularRecuperacionContrasena();
    
    // Citas y Filtros
    window.cargarSedesYCalcularCita = () => window.app.citaController.cargarSedesYCalcularCita();
    window.cargarConsultoriosCita = () => window.app.citaController.cargarConsultoriosCita();
    window.registrarCitaPaciente = () => window.app.citaController.registrarCitaPaciente();
    window.cerrarSesionCompleta = () => window.app.authController.cerrarSesion();
    
    window.filtrarCitasPorFecha = (fecha) => {
        const paciente = window.app.authController.usuarioActivo;
        if (paciente) {
            window.app.citaController.listarCitasPaciente(paciente.id, fecha);
            VistaGlobal.logTerminal("state", `Iterator: Filtrando listado de citas por la fecha seleccionada: [${fecha}]`);
        }
    };

    // Autorizaciones, Memento y Visitor
    window.enviarSolicitudAutorizacion = () => window.app.autorizacionController.solicitarAutorizacion();
    window.guardarPlanAltaConMemento = () => window.app.planAltaController.guardarCambiosPlan();
    window.deshacerPlanAltaMemento = () => window.app.planAltaController.ejecutarDeshacerPlan();
    window.cancelarEdicionPlan = () => window.app.planAltaController.cancelarEdicion();
    window.ejecutarFacturacionVisitor = () => window.app.resultadoController.ejecutarCalcularFacturaCopagos();
    window.ejecutarExportadorHTMLVisitor = () => window.app.resultadoController.ejecutarExportarHTMLResultados();
    window.cerrarVisorVisitor = () => {
        const visor = document.getElementById("card-visitor-output");
        if (visor) visor.style.display = "none";
    };
    window.limpiarTerminalLogs = () => VistaGlobal.limpiarConsolaLogs();

    // Patrones Iterator y Template Method (Admin)
    const ejecutarIterator = (filtro, descripcionLog) => {
        const directorio = new DirectorioEPSColeccion();
        directorio.cargarUsuariosDesdeDAO(window.app.authController.usuarioDAO);
        const iterador = directorio.crearIterador(filtro);
        VistaGlobal.renderizarTablaDirectorio(iterador);
        VistaGlobal.logTerminal("visitor", `[Iterator] Recorriendo colección usando filtro: ${descripcionLog}`); // Reutilizo clase visitor para color, o uso una nueva
    };

    window.iterarTodosLosUsuarios = () => ejecutarIterator('TODOS', 'Todos los usuarios (Pacientes, Médicos, Admin)');
    window.iterarPacientesCronicos = () => ejecutarIterator('PACIENTES_CRONICOS', 'Solo Pacientes Crónicos');
    window.iterarMedicosEspecialistas = () => ejecutarIterator('DOCTORES', 'Solo Médicos Especialistas');

    window.generarReporteTemplate = (tipo) => {
        let reporteObj;
        let nombreReporte = "";

        if (tipo === 'EPIDEMIOLOGICO') {
            reporteObj = new ReporteEpidemiologico();
            nombreReporte = "Epidemiológico";
        } else if (tipo === 'FINANCIERO') {
            reporteObj = new ReporteFinanciero();
            nombreReporte = "Financiero";
        } else if (tipo === 'EFICIENCIA') {
            reporteObj = new ReporteEficiencia();
            nombreReporte = "de Eficiencia Operativa";
        }

        if (reporteObj) {
            VistaGlobal.logTerminal("system", `[Template Method] Instanciando el esqueleto del Reporte ${nombreReporte}. Iniciando pasos...`);
            
            // Se ejecuta el método plantilla (Template Method) que orquesta todos los pasos
            const textoFinal = reporteObj.generarReporte();
            
            // Mostrar en UI
            const contenedor = document.getElementById("reporte-generado-container");
            const contenido = document.getElementById("reporte-content");
            const titulo = document.getElementById("reporte-title");
            
            if (contenedor && contenido && titulo) {
                contenedor.style.display = "block";
                titulo.textContent = `Reporte ${nombreReporte} Generado`;
                
                // Formatear el texto con saltos de línea para HTML
                contenido.innerHTML = textoFinal.replace(/\n/g, "<br>");
                
                VistaGlobal.logTerminal("system", `[Template Method] ¡Generación completada exitosamente! Se han ejecutado los métodos abstractos sobrescritos por la subclase concreta.`);
            }
        }
    };

    window.imprimirReporte = () => {
        alert("Simulando envío a impresora o exportación PDF...");
        VistaGlobal.logTerminal("system", "Enviando spool de impresión del reporte a la impresora virtual...");
    };

    // =================================================================

    // 5. GESTIÓN DEL PERFIL, CONTRASEÑA Y VALORACIONES DE MÉDICOS
    // =================================================================
    window.prellenarPerfilPaciente = () => {
        const user = window.app.authController.usuarioActivo;
        if (user) {
            document.getElementById("perfil-nombres").value = user.nombre || "Juan Esteban Rivera";
            document.getElementById("perfil-correo").value = user.correo || "juan@demo.com";
            document.getElementById("perfil-telefono").value = user.telefono || "312 456 7890";
            document.getElementById("perfil-direccion").value = user.direccion || "Calle 127 #15-32, Bogotá";
            document.getElementById("perfil-convenio").value = user.convenio || "Fiduprevisora FOMAG - La Previsora S.A.";
            document.getElementById("perfil-ciudad-nac").value = user.ciudadNac || "Bogotá D.C.";
        }
    };
    
    window.actualizarPerfilSubmit = () => {
        const user = window.app.authController.usuarioActivo;
        if (user) {
            user.nombre = document.getElementById("perfil-nombres").value;
            user.telefono = document.getElementById("perfil-telefono").value;
            user.direccion = document.getElementById("perfil-direccion").value;
            user.convenio = document.getElementById("perfil-convenio").value;
            user.ciudadNac = document.getElementById("perfil-ciudad-nac").value;
            
            window.app.authController.usuarioDAO.guardar(user.id, user);
            VistaGlobal.logTerminal("system", `Perfil del paciente '${user.nombre}' guardado exitosamente.`);
            alert("¡Tus datos de perfil han sido actualizados con éxito!");
        }
    };

    window.prellenarDoctores = () => {
        VistaGlobal.logTerminal("system", "Cargando catálogo de médicos asignados al afiliado...");
    };

    window.seleccionarEstrellasCalificar = (rating) => {
        const stars = document.querySelectorAll(".rating-stars-container .star-rating-btn");
        stars.forEach((s, idx) => {
            if (idx < rating) {
                s.classList.add("active");
                s.textContent = "★";
            } else {
                s.classList.remove("active");
                s.textContent = "☆";
            }
        });
        document.getElementById("calificar-stars-value").value = rating;
        VistaGlobal.logTerminal("visitor", `Puntuación interactiva de médico seleccionada: ${rating} estrellas.`);
    };

    window.calificarDoctorSubmit = () => {
        const doctor = document.getElementById("calificar-select-doctor").value;
        const stars = parseInt(document.getElementById("calificar-stars-value").value);
        const comentarios = document.getElementById("calificar-comentarios").value;
        
        VistaGlobal.logTerminal("visitor", `[Visitor Pattern / Review] Calificando polimórficamente a ${doctor} con ${stars} estrellas. Comentarios: "${comentarios}"`);
        alert(`¡Muchas gracias! Has calificado al ${doctor} con ${stars} estrellas con éxito.`);
        
        document.getElementById("calificar-comentarios").value = "";
        window.mostrarSubModuloPaciente("modulo-mis-doctores");
    };

    window.validarReglasPassword = () => {
        const pass = document.getElementById("pass-new").value;
        
        const hasLen = pass.length >= 12;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNum = /[0-9]/.test(pass);
        const hasSpecial = /[^A-Za-z0-9]/.test(pass);
        
        updateRuleVisual("rule-len", hasLen);
        updateRuleVisual("rule-upper", hasUpper);
        updateRuleVisual("rule-lower", hasLower);
        updateRuleVisual("rule-num", hasNum);
        updateRuleVisual("rule-special", hasSpecial);
    };
    
    function updateRuleVisual(id, isValid) {
        const el = document.getElementById(id);
        if (el) {
            if (isValid) {
                el.classList.add("valid");
                el.classList.remove("invalid");
                el.textContent = "✔️ " + el.textContent.substring(2);
            } else {
                el.classList.add("invalid");
                el.classList.remove("valid");
                el.textContent = "❌ " + el.textContent.substring(2);
            }
        }
    }
    
    window.cambiarPasswordSubmit = () => {
        const user = window.app.authController.usuarioActivo;
        if (!user) return;
        
        const oldPass = document.getElementById("pass-old").value;
        const newPass = document.getElementById("pass-new").value;
        const confirmPass = document.getElementById("pass-confirm").value;
        
        if (oldPass !== user.password) {
            alert("La contraseña antigua digitada es incorrecta.");
            return;
        }
        
        const hasLen = newPass.length >= 12;
        const hasUpper = /[A-Z]/.test(newPass);
        const hasLower = /[a-z]/.test(newPass);
        const hasNum = /[0-9]/.test(newPass);
        const hasSpecial = /[^A-Za-z0-9]/.test(newPass);
        
        if (!hasLen || !hasUpper || !hasLower || !hasNum || !hasSpecial) {
            alert("La nueva contraseña no cumple con todas las políticas de seguridad requeridas.");
            return;
        }
        
        if (newPass !== confirmPass) {
            alert("La confirmación de la contraseña nueva no coincide.");
            return;
        }
        
        user.password = newPass;
        window.app.authController.usuarioDAO.guardar(user.id, user);
        
        VistaGlobal.logTerminal("system", "Cambio seguro de contraseña completado. Caducidad programada para 90 días.");
        alert("¡Tu contraseña ha sido actualizada exitosamente!");
        
        document.getElementById("pass-old").value = "";
        document.getElementById("pass-new").value = "";
        document.getElementById("pass-confirm").value = "";
        window.validarReglasPassword();
    };

    // =================================================================
    // 6. Configurar Event Listeners Adicionales
    // =================================================================
    configurarEventosDOM();

    // 7. Iniciar la aplicacion navegando al Lobby Principal por defecto
    VistaGlobal.logTerminal("system", "Iniciando Portal EPS Fundación Santa Fe de Bogotá...");
    VistaGlobal.logTerminal("system", "Sistema cargado exitosamente. Capa DAO mapeada a LocalStorage.");
    VistaGlobal.navegarAPantalla("pantalla-lobby");
});

/**
 * Agrupa las delegaciones de eventos interactivos menores.
 */
function configurarEventosDOM() {
    // Escuchar cambios en el input de documento para activar boton de Registro paso 1
    const docInput = document.getElementById("reg-doc-number");
    if (docInput) {
        docInput.addEventListener("input", () => {
            window.app.authController.validarBotonPaso1();
        });
    }

    // Escuchar cambios de especialidad en agendamiento
    const selectTipoCita = document.getElementById("cita-select-tipo");
    if (selectTipoCita) {
        selectTipoCita.addEventListener("change", () => {
            window.app.citaController.cargarSedesYCalcularCita();
        });
    }

    // Escuchar cambios de sede para cargar consultorios y doctores
    const selectSedeCita = document.getElementById("cita-select-sede");
    if (selectSedeCita) {
        selectSedeCita.addEventListener("change", () => {
            window.app.citaController.cargarConsultoriosCita();
        });
    }

    // Ocultar banner de cookies al aceptar
    const btnAcceptCookies = document.getElementById("btn-accept-cookies");
    if (btnAcceptCookies) {
        btnAcceptCookies.addEventListener("click", () => {
            const cb = document.getElementById("cookie-banner-lobby");
            if (cb) cb.style.display = "none";
            VistaGlobal.logTerminal("system", "Políticas de tratamiento de cookies aceptadas.");
        });
    }
}
