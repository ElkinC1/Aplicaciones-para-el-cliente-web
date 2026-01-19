const { createApp } = Vue;

createApp({
    data() {
        return {
            // Datos para el Login (v-model en tu HTML)
            correo: '',
            clave: '',
            verClave: false,
            error: false,
            mensajeError: '',
            recordar: false,
            
            // Datos para el Registro
            mostrarRegistro: false,
            nuevoUsuario: {
                nombre: '',
                correo: '',
                clave: '',
                repetir_clave: '',
                rol: ''
            },
            
            // Sistema de Frases Random
            fraseActual: '',
            listaFrases: [
                "No hay texto.",
                "¿Dormir? no gracias, prefiero programar.",
                "Hola mundo.",
                "Los lentes son parte del outfit de un programador.",
                "El que hace mas goles gana el partido.",
                "Uleam >>> cualquier universidad.",
                "Usa el poder de las encuestas con sabiduria.",
                "No respondas encuestas bajo el efecto del insomnio.",
                "Software es clave.",
                "El conocimiento es libertad.",
                "Ya lo ves la vida es asi, tu te vas y yo me quedo aqui.",
            ]
        }
    },

    mounted() {
        this.generarFraseAleatoria();
        
        const sesion = localStorage.getItem('usuarioSesion');
        if (sesion) {
            window.location.replace("Proyecto_Pagina_Principal.html");
        }

        // Bloqueo del botón "Atrás" para evitar regresar a sesiones cerradas
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function () {
            window.history.go(1);
        };
    },

    methods: {
        generarFraseAleatoria() {
            const indice = Math.floor(Math.random() * this.listaFrases.length);
            this.fraseActual = this.listaFrases[indice];
        },

        async validarIngreso() {
                this.error = false;
                try {
                    let usuariosJSON = [];
                    

                    try {
                        const response = await fetch('../JavaScript/usuarios.json');
                        if (response.ok) {
                            const data = await response.json();
                            usuariosJSON = data.usuarios;
                        }
                    } catch (fetchError) {
console.warn("No se pudo cargar el JSON local (esto es normal si no usas un servidor). Usando solo datos de LocalStorage.");
                    }

                    const registradosLocal = JSON.parse(localStorage.getItem('usuarios') || '[]');

                    const masterAdmin = { 
                        id: 0, correo: 'admin@uleam.edu.ec', clave: 'Admin123', 
                        nombre: 'Admin General', rol: 'ADMINISTRADOR', inicial: 'A' 
                    };

                    const dbCompleta = [masterAdmin, ...usuariosJSON, ...registradosLocal];

                    const usuario = dbCompleta.find(u => 
                        u.correo.toLowerCase() === this.correo.toLowerCase() && 
                        u.clave === this.clave
                    );

                    if (usuario) {
                        usuario.rol = usuario.rol.toUpperCase();
                        localStorage.setItem('usuarioSesion', JSON.stringify(usuario));
                        window.location.replace('Proyecto_Pagina_Principal.html');
                    } else {
                        this.mensajeError = "Correo o contraseña incorrectos.";
                        this.error = true;
                    }
                } catch (e) {
                    this.mensajeError = "Error crítico en el sistema de acceso.";
                    this.error = true;
                }
            },
        registrarUsuario() {
            const { nombre, correo, clave, repetir_clave, rol } = this.nuevoUsuario;

            if (!nombre || !correo || !clave || !repetir_clave || !rol) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            const correoL = correo.toLowerCase();

            // Validación de dominios @live para estudiantes
            if (rol === 'Estudiante' && !correoL.endsWith("@live.uleam.edu.ec")) {
                alert("Los estudiantes deben usar correo @live.uleam.edu.ec");
                return;
            }
            if ((rol === 'Profesor' || rol === 'Administrador') && !correoL.endsWith("@uleam.edu.ec")) {
                alert("Docentes y Administrativos deben usar correo @uleam.edu.ec");
                return;
            }

            // Regex de seguridad para contraseña
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passRegex.test(clave)) {
                alert("Contraseña débil. Debe tener:\n- Al menos 8 caracteres\n- Una letra Mayúscula\n- Una letra Minúscula\n- Al menos un Número");
                return;
            }

            if (clave !== repetir_clave) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            let usuariosDB = JSON.parse(localStorage.getItem('usuarios') || '[]');
            if (usuariosDB.some(u => u.correo === correoL)) {
                alert("Este correo ya está registrado.");
                return;
            }

            // Guardar con formato compatible para la sidebar
            usuariosDB.push({ 
                id: Date.now(),
                nombre, 
                correo: correoL, 
                clave, 
                rol: rol.toUpperCase(),
                inicial: nombre.charAt(0).toUpperCase()
            });

            localStorage.setItem('usuarios', JSON.stringify(usuariosDB));
            alert(rol + " " + nombre + " ¡Cuenta creada!");
            this.mostrarRegistro = false;
            this.nuevoUsuario = { nombre: '', correo: '', clave: '', repetir_clave: '', rol: '' };
        }
    }
}).mount('#app');