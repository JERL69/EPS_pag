/**
 * @file AuthController.js
 * @description Controlador para flujos de autenticacion, registro en multiples pasos y recuperacion.
 */
class AuthController {
    constructor(usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
        this.usuarioActivo = null;
        this.rolLoginActivo = "PACIENTE"; // 'PACIENTE' o 'ADMINISTRADOR'
        this.captchaCompleto = false;
    }

    /**
     * Alterna el estado del Captcha e interactua con el boton del Formulario Paso 1
     */
    toggleCaptcha(checked) {
        this.captchaCompleto = checked;
        const errorMsg = document.getElementById("error-captcha");
        
        if (checked) {
            if (errorMsg) errorMsg.style.display = "none";
            VistaGlobal.logTerminal("system", "reCAPTCHA superado con éxito. Estado: [COMPLETO].");
        } else {
            if (errorMsg) errorMsg.style.display = "block";
        }
        this.validarBotonPaso1();
    }

    /**
     * Evalua si se cumplen las condiciones para habilitar la validacion de documento
     */
    validarBotonPaso1() {
        const docNum = document.getElementById("reg-doc-number").value.trim();
        const btn = document.getElementById("btn-submit-paso1");
        
        if (this.captchaCompleto && docNum.length >= 6) {
            btn.disabled = false;
            btn.className = "btn-auth-primary-submit";
        } else {
            btn.disabled = true;
            btn.className = "btn-auth-submit-disabled";
        }
    }

    /**
     * Procesa el primer paso de registro: valida si ya existe un afiliado previo.
     */
    procesarRegistroPaso1() {
        const documento = document.getElementById("reg-doc-number").value.trim();
        const tipoDoc = document.getElementById("reg-doc-type").value;

        VistaGlobal.logTerminal("system", `Validando documento de identidad: [${tipoDoc} ${documento}]`);

        const usuarioExistente = this.usuarioDAO.buscarPorDocumento(documento);
        if (usuarioExistente) {
            alert(`Error: Ya existe un paciente afiliado registrado con el documento especificado (${documento}). Intenta iniciar sesion.`);
            VistaGlobal.logTerminal("system", `Validacion fallida: Documento ${documento} ya esta registrado.`);
            return;
        }

        // Si no existe, permite continuar al paso 2 de detalles
        VistaGlobal.logTerminal("system", `Validacion exitosa: Documento libre. Avanzando al Formulario de Afiliacion.`);
        VistaGlobal.navegarAPantalla("pantalla-register-form");
    }

    /**
     * Registra un nuevo paciente en la base de datos (localStorage)
     */
    registrarNuevoPaciente() {
        const nombres = document.getElementById("reg-form-nombres").value.trim();
        const apellido1 = document.getElementById("reg-form-apellido1").value.trim();
        const apellido2 = document.getElementById("reg-form-apellido2").value.trim();
        const fechaNac = document.getElementById("reg-form-birthdate").value;
        const genero = document.getElementById("reg-form-gender").value;
        const nacionalidad = document.getElementById("reg-form-nationality").value;
        const email = document.getElementById("reg-form-email").value.trim();
        const telefono = document.getElementById("reg-form-phone").value.trim();
        const password = document.getElementById("reg-form-password").value;
        const direccion = document.getElementById("reg-form-address").value.trim();
        const documento = document.getElementById("reg-doc-number").value.trim();

        // Verificar si el correo ya existe
        const emailExistente = this.usuarioDAO.buscarPorEmail(email);
        if (emailExistente) {
            alert(`Error: El correo electronico ${email} ya esta registrado en la EPS.`);
            return;
        }

        const nuevoId = new Date().getTime();
        const nombreCompleto = `${nombres} ${apellido1} ${apellido2}`.trim();

        const nuevoPaciente = new Paciente(
            nuevoId,
            nombreCompleto,
            email,
            password,
            documento,
            telefono,
            direccion,
            genero,
            nacionalidad,
            fechaNac
        );

        this.usuarioDAO.insertar(nuevoPaciente);
        VistaGlobal.logTerminal("system", `Nuevo Paciente afiliado con exito: [${nombreCompleto}] (ID: ${nuevoId})`);
        
        alert("¡Afiliación Completada! Ahora puedes iniciar sesión con tu cuenta.");
        
        // Reset campos y navegar al Login
        this.resetCamposRegistro();
        VistaGlobal.navegarAPantalla("pantalla-login");
    }

    resetCamposRegistro() {
        document.getElementById("reg-doc-number").value = "";
        document.getElementById("captcha-checkbox").checked = false;
        this.captchaCompleto = false;
        this.validarBotonPaso1();

        document.getElementById("reg-form-nombres").value = "";
        document.getElementById("reg-form-apellido1").value = "";
        document.getElementById("reg-form-apellido2").value = "";
        document.getElementById("reg-form-birthdate").value = "";
        document.getElementById("reg-form-gender").value = "";
        document.getElementById("reg-form-email").value = "";
        document.getElementById("reg-form-phone").value = "";
        document.getElementById("reg-form-password").value = "";
        document.getElementById("reg-form-address").value = "";
    }

    /**
     * Alterna el rol seleccionado en la pantalla de inicio de sesion.
     */
    cambiarRolLogin(rol) {
        this.rolLoginActivo = rol;
        document.getElementById("tab-rol-paciente").classList.toggle("active", rol === "PACIENTE");
        document.getElementById("tab-rol-admin").classList.toggle("active", rol === "ADMINISTRADOR");
        VistaGlobal.logTerminal("system", `Rol seleccionado para iniciar sesion: [${rol}]`);
    }

    /**
     * Valida e ingresa al usuario en el sistema.
     */
    ejecutarLogin() {
        const email = document.getElementById("login-input-email").value.trim();
        const pass = document.getElementById("login-input-password").value;

        const usuario = this.usuarioDAO.validarCredenciales(email, pass, this.rolLoginActivo);
        
        if (!usuario) {
            alert("Error: Credenciales de inicio de sesión inválidas o rol incorrecto. Revisa e intenta de nuevo.");
            VistaGlobal.logTerminal("system", `Intento fallido de login para: [${email}] como [${this.rolLoginActivo}]`);
            return;
        }

        this.autenticarUsuario(usuario);
    }

    /**
     * Simula el inicio de sesion a través de Google OAuth API
     */
    simularGoogleLogin() {
        VistaGlobal.logTerminal("system", "Iniciando peticion de autenticacion OAuth2.0 con Google API...");
        
        // Simular secuencia de popups
        alert("Conectando con Google Accounts... Autenticando token preferido...");
        
        // Cargar por defecto al paciente Demo
        const pacienteDemo = this.usuarioDAO.buscarPorEmail("juan@demo.com");
        if (pacienteDemo) {
            VistaGlobal.logTerminal("system", "Google token validado con exito. Vinculado a: juan@demo.com");
            this.autenticarUsuario(pacienteDemo);
        } else {
            alert("Error: El usuario Demo de Google no se encuentra precargado.");
        }
    }

    /**
     * Establece la sesion activa e inicia el ruteo correspondiente al rol.
     * @param {Object} usuario 
     */
    autenticarUsuario(usuario) {
        this.usuarioActivo = usuario;
        VistaGlobal.logTerminal("system", `Sesion iniciada correctamente. Bienvenido ${usuario.nombre}.`);

        if (usuario.tipo === "PACIENTE") {
            VistaGlobal.renderizarDashboardPaciente(usuario);
            VistaGlobal.navegarAPantalla("pantalla-paciente-dashboard");
            
            // Cargar por defecto la primera seccion del Panel
            app.citaController.cargarSedesYCalcularCita();
            app.citaController.listarCitasPaciente(usuario.id);
            app.autorizacionController.listarAutorizacionesPaciente(usuario.id);
            app.planAltaController.listarPlanesAltaPaciente(usuario.id);
            app.resultadoController.listarResultadosPaciente(usuario.id);
            
            mostrarSubModuloPaciente('dashboard-home');
        } else if (usuario.tipo === "ADMINISTRADOR") {
            VistaGlobal.navegarAPantalla("pantalla-admin-dashboard");
            
            // Cargar modulo admin
            app.citaController.listarCitasAdmin();
            app.autorizacionController.listarAutorizacionesAdmin();
            
            mostrarSubModuloAdmin('admin-dashboard-home');
        }
    }

    /**
     * Simula el envio de un correo de recuperacion
     */
    simularRecuperacionContrasena() {
        const email = document.getElementById("recover-input-email").value.trim();
        VistaGlobal.logTerminal("system", `Solicitud de recuperacion recibida para: [${email}]`);
        
        alert(`Se ha enviado un correo electrónico de recuperación a ${email} con un enlace de restauración encriptado.`);
        
        document.getElementById("recover-input-email").value = "";
        VistaGlobal.navegarAPantalla("pantalla-login");
    }

    /**
     * Reseta la sesion activa y vuelve a la pantalla inicial.
     */
    cerrarSesion() {
        VistaGlobal.logTerminal("system", `Cerrando sesion activa de: [${this.usuarioActivo ? this.usuarioActivo.nombre : 'Usuario'}]`);
        this.usuarioActivo = null;
        document.getElementById("login-input-email").value = "";
        document.getElementById("login-input-password").value = "";
        VistaGlobal.navegarAPantalla("pantalla-auth-welcome");
    }
}
