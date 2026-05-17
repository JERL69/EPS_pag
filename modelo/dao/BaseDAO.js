/**
 * @file BaseDAO.js
 * @description Clase base abstracta para el patron Data Access Object (DAO).
 *              Simula persistencia utilizando localStorage del navegador.
 */
class BaseDAO {
    constructor(keyStorage) {
        if (this.constructor === BaseDAO) {
            throw new Error("No se puede instanciar la clase abstracta BaseDAO directamente.");
        }
        this.keyStorage = keyStorage;
        this.inicializarLocalStorage();
    }

    /**
     * Inicializa la coleccion en localStorage si no existe.
     */
    inicializarLocalStorage() {
        if (!localStorage.getItem(this.keyStorage)) {
            const semilla = this.cargarSemillaInicial();
            localStorage.setItem(this.keyStorage, JSON.stringify(semilla));
        }
    }

    /**
     * Carga los registros semilla iniciales. Debe ser sobreescrito.
     * @returns {Array}
     */
    cargarSemillaInicial() {
        return [];
    }

    /**
     * Obtiene todos los registros almacenados en el storage.
     * @returns {Array}
     */
    obtenerTodos() {
        try {
            return JSON.parse(localStorage.getItem(this.keyStorage)) || [];
        } catch (e) {
            console.error("Error leyendo desde localStorage para clave: " + this.keyStorage, e);
            return [];
        }
    }

    /**
     * Guarda la coleccion de registros en localStorage.
     * @param {Array} registros 
     */
    guardarTodos(registros) {
        try {
            localStorage.setItem(this.keyStorage, JSON.stringify(registros));
            return true;
        } catch (e) {
            console.error("Error escribiendo en localStorage para clave: " + this.keyStorage, e);
            return false;
        }
    }

    /**
     * Obtiene un registro unico por su identificador.
     * @param {number|string} id 
     */
    obtenerPorId(id) {
        const registros = this.obtenerTodos();
        return registros.find(r => String(r.id) === String(id)) || null;
    }

    /**
     * Inserta un nuevo registro en la base de datos.
     * @param {Object} registro 
     */
    insertar(registro) {
        const registros = this.obtenerTodos();
        registros.push(registro);
        this.guardarTodos(registros);
        return registro;
    }

    /**
     * Actualiza un registro existente.
     * @param {Object} registroActualizado 
     */
    actualizar(registroActualizado) {
        const registros = this.obtenerTodos();
        const index = registros.findIndex(r => String(r.id) === String(registroActualizado.id));
        if (index !== -1) {
            registros[index] = registroActualizado;
            this.guardarTodos(registros);
            return true;
        }
        return false;
    }

    /**
     * Elimina un registro por su ID.
     * @param {number|string} id 
     */
    eliminar(id) {
        let registros = this.obtenerTodos();
        const longitudInicial = registros.length;
        registros = registros.filter(r => String(r.id) !== String(id));
        if (registros.length < longitudInicial) {
            this.guardarTodos(registros);
            return true;
        }
        return false;
    }
}
