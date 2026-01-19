const { createApp } = Vue;

createApp({
    data() {
        return {
            encuestas: [],
            encuestaSeleccionada: null,
            respuestasMap: {}, 
            usuarioActual: JSON.parse(localStorage.getItem('usuarioSesion')) || {}
        }
    },
    mounted() {
        if (!this.usuarioActual.correo) { window.location.replace("Proyecto_Ingreso.html"); return; }
        this.cargarEncuestas();
    },
    methods: {
        cargarEncuestas() {
            const todas = JSON.parse(localStorage.getItem('misEncuestasNuevas') || '[]');
            const respuestas = JSON.parse(localStorage.getItem('respuestas_usuarios') || '[]');
            const respondidasIds = respuestas.filter(r => r.usuarioCorreo === this.usuarioActual.correo).map(r => r.encuestaId);

            this.encuestas = todas.filter(e => {
                const esActiva = e.estado === 'Activa';
                const noRespondida = !respondidasIds.includes(e.id);
                // CORRECCIÓN: No mostrar si el usuario actual es el creador
                const noSoyElCreador = e.creadorCorreo !== this.usuarioActual.correo;
                const tienePermiso = e.acceso.tipo === 'todos' || (e.acceso.rolesPermitidos && e.acceso.rolesPermitidos.includes(this.usuarioActual.rol));
                
                return esActiva && noRespondida && noSoyElCreador && tienePermiso;
            });
        },
        seleccionarEncuesta(encuesta) {
            this.encuestaSeleccionada = encuesta;
            this.respuestasMap = {};
            encuesta.preguntas.forEach(p => { this.respuestasMap[p.id] = p.tipo === 'checkbox' ? [] : ''; });
        },
        enviarRespuestas() {
            let historial = JSON.parse(localStorage.getItem('respuestas_usuarios') || '[]');
            historial.push({ usuarioCorreo: this.usuarioActual.correo, encuestaId: this.encuestaSeleccionada.id, fecha: new Date().toISOString() });
            localStorage.setItem('respuestas_usuarios', JSON.stringify(historial));

            let db = JSON.parse(localStorage.getItem('misEncuestasNuevas') || '[]');
            const idx = db.findIndex(e => e.id === this.encuestaSeleccionada.id);

            if (idx !== -1) {
                db[idx].totalVotos = (db[idx].totalVotos || 0) + 1;
                db[idx].preguntas.forEach(p => {
                    const rUsuario = this.respuestasMap[p.id];
                    if (p.tipo !== 'texto') {
                        p.opciones.forEach(opt => {
                            const fueElegida = Array.isArray(rUsuario) ? rUsuario.includes(opt.texto) : rUsuario === opt.texto;
                            if (fueElegida) opt.votos = (opt.votos || 0) + 1;
                        });
                        if (!p.respuestasDetalle) p.respuestasDetalle = [];
                        p.respuestasDetalle.push({ nombreUsuario: this.usuarioActual.nombre, opcionElegida: Array.isArray(rUsuario) ? rUsuario.join(", ") : rUsuario });
                    }
                });
                localStorage.setItem('misEncuestasNuevas', JSON.stringify(db));
            }
            alert("¡Encuesta enviada!");
            window.location.href = 'Proyecto_Pagina_Principal.html';
        },
        volver() { this.encuestaSeleccionada ? this.encuestaSeleccionada = null : window.location.href = 'Proyecto_Pagina_Principal.html'; }
    }
}).mount('#app');