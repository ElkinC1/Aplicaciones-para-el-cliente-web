document.addEventListener('DOMContentLoaded', function() {

    const formulario = document.getElementById('registroFormulario');
    const mensajeDiv = document.getElementById('validacionMensaje');
    
    function mostrarMensaje(texto, tipo) {
        mensajeDiv.textContent = texto;
        mensajeDiv.classList.remove('mensaje-oculto', 'mensaje-error', 'mensaje-exito');
        mensajeDiv.classList.add('mensaje-' + tipo);
    }

    function ocultarMensaje() {
        mensajeDiv.classList.add('mensaje-oculto');
    }

    function obtenerFechaActualFormatoHTML() {
        const hoy = new Date();
        const anio = hoy.getFullYear(); 
        const mes = String(hoy.getMonth() + 1).padStart(2, '0'); 
        const dia = String(hoy.getDate()).padStart(2, '0'); 

        //Se cambia a YYYY-MM-DD para que funcione la comparación de fechas
        return `${anio}-${mes}-${dia}`;
    }

    formulario.addEventListener('submit', function(event) {
        event.preventDefault(); 
        ocultarMensaje(); 
        
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const cedula = document.getElementById('cedula').value.trim();
        const estadoCivil = document.getElementById('estadoCivil').value;
        const telefono=document.getElementById('numero').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const terminos = document.getElementById('campoCondiciones').checked;
        
        const fechaNacimiento = document.getElementById('fechaNacimiento').value; 
        const fechaTope = obtenerFechaActualFormatoHTML(); 

        let formularioEsValido = true;
        let mensajeError = "";

        //Validaciones

        // validacion nombre
        if (nombre === "") {
            formularioEsValido = false;
            mensajeError = "Por favor, ingresa tu Nombre Completo.";
        } 
        
        // validacion cedula
        else if (/\D/.test(cedula)) {
            formularioEsValido = false;
            mensajeError = "El número de Cédula solo debe contener dígitos (0-9).";
        }
        
        // validacion estado civil
        else if (estadoCivil === "") {
            formularioEsValido = false;
            mensajeError = "Debes seleccionar un Estado Civil.";
        }
        
        // Validacion correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) { // Si NO es válido
            formularioEsValido = false;
            mensajeError="Introduzca un correo valido.";
        }
        
        // Validacion numero de telefono
        else if (telefono.length === 0) {
            formularioEsValido = false;
            mensajeError = "Ingreso incorrecto.";
        } 
        
        else if (telefono.length === 10) {
            if (!telefono.startsWith('09')) {
                formularioEsValido = false;
                mensajeError = "El numero de telefono deberia de empezar con 09.";
            }
        } 
        
        // Validacion direccion
        else if (direccion === "") {
            formularioEsValido = false;
            mensajeError = "Ingrese una dirección.";
        } 
        
        // validacion terminos y condiciones
        else if (terminos === false) {
            formularioEsValido = false;
            mensajeError = "Debes aceptar los términos y condiciones.";
        }

        // validacion fecha de nacimiento
        else if (fechaNacimiento > fechaTope) {
            formularioEsValido = false;
            mensajeError = "La Fecha de Nacimiento no puede ser una fecha futura.";
        }
        
    
        if (formularioEsValido == true) {
            mostrarMensaje('Has sido registrado con exito SoftwareFriend!', 'exito'); 

        } else {
            mostrarMensaje("Error: " + mensajeError, "error");
        }
    });
});