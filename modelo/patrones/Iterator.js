/**
 * @file Iterator.js
 * @description Patrón Iterator para recorrer la colección de usuarios del Directorio de la EPS
 *              sin exponer la representación subyacente. Permite realizar múltiples tipos de 
 *              recorridos y filtros (ej. Solo Doctores, Solo Crónicos).
 */

class UsuarioIterator {
    constructor(coleccion, tipoFiltro = 'TODOS') {
        this.coleccion = coleccion;
        this.indiceActual = 0;
        this.tipoFiltro = tipoFiltro;
        
        // Pre-filtrado interno (no altera la colección original)
        this.elementosFiltrados = this._aplicarFiltro();
    }

    _aplicarFiltro() {
        switch(this.tipoFiltro) {
            case 'PACIENTES_CRONICOS':
                // Para la demo, simulamos que algunos pacientes son crónicos si su ID termina en numero par, o algo fijo
                return this.coleccion.filter(u => u.tipo === 'PACIENTE' && (u.id % 2 === 0));
            case 'DOCTORES':
                return this.coleccion.filter(u => u.tipo === 'DOCTOR' || u.tipo === 'MEDICO');
            case 'TODOS':
            default:
                return this.coleccion;
        }
    }

    tieneSiguiente() {
        return this.indiceActual < this.elementosFiltrados.length;
    }

    siguiente() {
        if (this.tieneSiguiente()) {
            return this.elementosFiltrados[this.indiceActual++];
        }
        return null;
    }

    reiniciar() {
        this.indiceActual = 0;
    }
}

class DirectorioEPSColeccion {
    constructor() {
        this.usuarios = [];
    }

    cargarUsuariosDesdeDAO(usuarioDAO) {
        // En una app real esto leería de una BD.
        // Aquí tomamos todos los usuarios almacenados en el DAO para construir el directorio.
        // usuarioDAO almacena datos en un Map o en localStorage.
        const allUsers = usuarioDAO.obtenerTodos() || [];
        
        // Si no hay doctores, agregamos algunos de prueba para que el iterador los encuentre
        const doctoresDePrueba = [
            { id: 901, nombre: 'Dr. Alejandro Posada', tipo: 'DOCTOR', especialidad: 'Cardiología', documento: 'MED-001' },
            { id: 902, nombre: 'Dra. María Fernanda Gómez', tipo: 'DOCTOR', especialidad: 'Neurología', documento: 'MED-002' },
            { id: 903, nombre: 'Dr. Roberto Sánchez', tipo: 'DOCTOR', especialidad: 'Pediatría', documento: 'MED-003' }
        ];

        this.usuarios = [...allUsers, ...doctoresDePrueba];
    }

    // Factory Method para crear el iterador
    crearIterador(tipoFiltro = 'TODOS') {
        return new UsuarioIterator(this.usuarios, tipoFiltro);
    }
}
