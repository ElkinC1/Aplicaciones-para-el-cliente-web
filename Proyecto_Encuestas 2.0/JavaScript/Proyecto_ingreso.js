const URL_PRINCIPAL = '../HTML/Proyecto_Pagina_Principal.html';

const USUARIOS_DE_PRUEBA = [
    { correo: 'admin@uleam.edu.ec', clave: 'admin123', rol: 'Administrador'},
    { correo: 'profesor@uleam.edu.ec', clave: 'profe123', rol: 'Profesor'},
    { correo: 'soyadmin@uleam.edu.ec', clave: 'soyadmin123', rol: 'Administrador'},
    { correo: 'profeW@uleam.edu.ec', clave: 'whinter123', rol: 'Profesor'},
    { correo: 'elkin@uleam.edu.ec', clave: 'elkin123', rol: 'Estudiante'},
    { correo: 'melany@uleam.edu.ec', clave: 'melany123', rol: 'Estudiante'}
];

// A. Logica de ingreso y roles
function mostrarMensajeError(mostrar = true) {
    const errorBox = document.getElementById('mensaje-error');
    if (errorBox) {
        errorBox.style.display = mostrar ? 'block' : 'none';
    }
}

function botonIngreso() {
    mostrarMensajeError(false);

    const correo = document.getElementById('correo').value.trim();
    const clave = document.getElementById('clave').value.trim();
    const recordar = document.getElementById('recordar-sesion').checked;

    if (!correo || !clave) {
        mostrarMensajeError(true);
        return;
    }

    const usuarioEncontrado = USUARIOS_DE_PRUEBA.find(user => 
        user.correo === correo && user.clave === clave
    );

    if (usuarioEncontrado) {
        if (recordar) {
            localStorage.setItem('userCorreo', usuarioEncontrado.correo);
            localStorage.setItem('userRol', usuarioEncontrado.rol);
        } else {
            localStorage.removeItem('userCorreo');
            localStorage.removeItem('userRol');
        }

        console.log(`Ingreso exitoso como: ${usuarioEncontrado.rol}`);
        
        window.location.href = URL_PRINCIPAL; 

    } else {
        mostrarMensajeError(true);
    }
}


// B. Funcion de mostrar/ocultar clave


function toggleClave() {
    const claveInput = document.getElementById('clave');
    const toggleButton = document.getElementById('togglePassword');
    const icon = toggleButton ? toggleButton.querySelector('i') : null; 

    if (!claveInput || !toggleButton || !icon) return; 

    if (claveInput.type === 'password') {
        claveInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        claveInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// C. funcion de mantener sesion iniciada

window.onload = function() {
    const rolGuardado = localStorage.getItem('userRol');
    const recordarCheckbox = document.getElementById('recordar-sesion');

    if (rolGuardado) {
        if (recordarCheckbox) {
            recordarCheckbox.checked = true;
        }

        window.location.href = URL_PRINCIPAL;
    } else {
        if (recordarCheckbox) {
             recordarCheckbox.checked = false;
        }
    }
};