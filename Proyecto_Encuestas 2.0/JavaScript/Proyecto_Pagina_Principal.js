const { createApp } = Vue;

createApp({
    data() {
        return {
            usuarioActual: {
                nombre: "",
                rol: "",
                correo: "",
                inicial: ""
            },
            encuestaAbiertaId: null,
            misEncuestas: [],
            mostrarModalDetalles: false,
            preguntaSeleccionada: null
        }
    },
    async mounted() {
        const sesion = localStorage.getItem('usuarioSesion');
        if (!sesion) {
            window.location.replace("Proyecto_Ingreso.html");
            return;
        }
        
        this.usuarioActual = JSON.parse(sesion);
        this.usuarioActual.inicial = this.usuarioActual.nombre ? this.usuarioActual.nombre.charAt(0).toUpperCase() : 'U';

        // CORRECCIÓN: Nombre de función coincidente
        await this.cargarEncuestas();
    },
    computed: {
        sidebarColor() {
            const rol = (this.usuarioActual.rol || '').toUpperCase();
            if (rol === 'ESTUDIANTE') return '#1a4d2e'; 
            if (rol === 'PROFESOR') return '#0056b3';   
            return '#212529'; 
        },
        fechaActual() {
            return new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });
        }
    },
    methods: {
        async cargarEncuestas() {
            // 1. Obtener de memoria (misEncuestasNuevas es la clave que usamos al crear)
            let encuestasEnMemoria = JSON.parse(localStorage.getItem('misEncuestasNuevas'));

            // 2. Carga inicial desde JSON si el storage está vacío
            if (!encuestasEnMemoria) {
                try {
                    const respuesta = await fetch('encuestas.json'); 
                    encuestasEnMemoria = await respuesta.json();
                    localStorage.setItem('misEncuestasNuevas', JSON.stringify(encuestasEnMemoria));
                } catch (error) {
                    console.error("No se pudo cargar el JSON:", error);
                    encuestasEnMemoria = [];
                }
            }

            // 3. FILTRADO: Normalizamos correos para evitar errores de mayúsculas
            const correoSesion = (this.usuarioActual.correo || '').toLowerCase().trim();

            this.misEncuestas = encuestasEnMemoria.filter(e => {
                if (this.usuarioActual.rol === 'ADMINISTRADOR') return true;
                
                const correoCreador = (e.creadorCorreo || '').toLowerCase().trim();
                return correoCreador === correoSesion;
            });
        },

        eliminarMiEncuesta(id) {
            if(confirm("¿Estás seguro de eliminar esta encuesta? Esta acción no se puede deshacer.")) {
                let db = JSON.parse(localStorage.getItem('misEncuestasNuevas') || '[]');
                
                // Filtrar fuera la encuesta eliminada
                let nuevaListaGlobal = db.filter(e => e.id.toString() !== id.toString());
                
                // Guardar la base de datos global actualizada
                localStorage.setItem('misEncuestasNuevas', JSON.stringify(nuevaListaGlobal));
                
                // Refrescar la vista local filtrada
                this.cargarEncuestas();
            }
        },

        toggleDetalles(id) {
            this.encuestaAbiertaId = this.encuestaAbiertaId === id ? null : id;
        },

        verMasDetalles(pregunta) {
            this.preguntaSeleccionada = pregunta;
            this.mostrarModalDetalles = true;
        },

        cerrarModal() {
            this.mostrarModalDetalles = false;
            this.preguntaSeleccionada = null;
        },

        calcularPorcentaje(votos, total) {
            if (!total || total === 0) return 0;
            return Math.round((votos / total) * 100);
        },

        cerrarSesion() {
            if (confirm("¿Deseas cerrar la sesión?")) {
                localStorage.removeItem('usuarioSesion');
                window.location.replace("Proyecto_Ingreso.html");
            }
        }
    }
}).mount('#app');