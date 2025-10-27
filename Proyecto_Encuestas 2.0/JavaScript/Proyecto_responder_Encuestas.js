document.addEventListener('DOMContentLoaded', inicializarResponderEncuesta);

let encuestaActual = null; 

// a. inicialización y gestión de modal

function inicializarResponderEncuesta() {
    // verifica si hay un id de encuesta guardado para responder directamente
    const idDirecto = localStorage.getItem('encuestaIdResponder');
    if (idDirecto) {
        cargarEncuestaParaResponder(parseInt(idDirecto));
        localStorage.removeItem('encuestaIdResponder'); 
    } else {
        // si no hay id directo, muestra el modal de seleccion de encuestas pendientes
        cargarListaPendientes();
        mostrarModalSeleccion();
    }
}

function mostrarModalSeleccion() {
    cargarListaPendientes();
    document.getElementById('modal-seleccion-encuesta').classList.remove('modal-oculto');
}

function ocultarModalSeleccion() {
    document.getElementById('modal-seleccion-encuesta').classList.add('modal-oculto');
}

function cargarListaPendientes() {
    const correo = localStorage.getItem('userCorreo');
    const rol = localStorage.getItem('userRol');
    const encuestas = JSON.parse(localStorage.getItem('encuestas') || '[]');
    const respuestas = JSON.parse(localStorage.getItem('respuestas') || '[]');
    const listaContainer = document.getElementById('lista-encuestas-pendientes');
    listaContainer.innerHTML = '';

    if (!correo || !rol) {
        listaContainer.innerHTML = `<p>error: inicie sesión para ver encuestas.</p>`;
        return;
    }
    
    // filtra las encuestas a las que el usuario tiene acceso (por rol o correo)
    const encuestasAcceso = encuestas.filter(e => 
        e.activa && (
            (Array.isArray(e.destino) && e.destino.includes(rol)) || 
            (typeof e.destino === 'string' && e.destino === correo)
        )
    );

    if (encuestasAcceso.length === 0) {
        listaContainer.innerHTML = `<p>no hay encuestas activas dirigidas a usted.</p>`;
        return;
    }

    // filtra las encuestas que el usuario aun no ha respondido
    const encuestasPendientes = encuestasAcceso.filter(e => {
        const yaRespondio = respuestas.some(r => 
            r.encuestaId === e.id && r.usuarioCorreo === correo
        );
        return !yaRespondio;
    });
    
    if (encuestasPendientes.length === 0) {
        listaContainer.innerHTML = `<p>¡felicidades! ha respondido todas las encuestas disponibles.</p>`;
        return;
    }

    // genera el html para la lista de encuestas pendientes en el modal
    encuestasPendientes.forEach(e => {
        const cardHTML = `
            <div class="pendiente-card" onclick="cargarEncuestaParaResponder(${e.id})">
                <h4>${e.titulo}</h4>
                <p>${e.descripcion ? e.descripcion.substring(0, 50) + '...' : 'sin descripción'}</p>
                <span class="btn-seleccionar">responder <i class="fas fa-chevron-right"></i></span>
            </div>
        `;
        listaContainer.innerHTML += cardHTML;
    });
}

// b. carga y generación del formulario

function cargarEncuestaParaResponder(id) {
    const encuestas = JSON.parse(localStorage.getItem('encuestas') || '[]');
    encuestaActual = encuestas.find(e => e.id === id);
    
    if (!encuestaActual) {
        alert("encuesta no encontrada.");
        return;
    }
    
    // cierra el modal de seleccion
    ocultarModalSeleccion(); 

    // 1. aplicar estilos dinámicos de la encuesta al contenedor
    const colorFondo = encuestaActual.color_fondo || '#ffffff';
    const colorDetalles = encuestaActual.color_detalles || '#B22222';
    const responseContainer = document.querySelector('.response-container');
    
    responseContainer.style.backgroundColor = colorFondo;

    // 2. cargar titulo y descripcion de la encuesta
    document.getElementById('titulo-encuesta-responder').textContent = encuestaActual.titulo;
    document.getElementById('descripcion-encuesta-responder').textContent = 
        encuestaActual.descripcion || "por favor, complete todas las preguntas.";
    
    document.getElementById('btn-enviar-respuestas').style.display = 'block';

    // 3. generar preguntas del formulario dinámicamente
    const container = document.getElementById('preguntas-responder-container');
    container.innerHTML = ''; 
    
    encuestaActual.preguntas.forEach((pregunta, index) => {
        const numero = index + 1;
        let inputHTML = '';
        const required = 'required'; 

        switch (pregunta.tipo) {
              case 'radio':
                  inputHTML = pregunta.opciones.map(opcion => `
                      <label class="opcion-label">
                          <input type="radio" name="q${pregunta.id}" value="${opcion}" ${required}>
                          ${opcion}
                      </label>
                  `).join('');
                  break;
                  
              case 'checkbox':
                  inputHTML = pregunta.opciones.map(opcion => `
                      <label class="opcion-label">
                          <input type="checkbox" name="q${pregunta.id}" value="${opcion}">
                          ${opcion}
                      </label>
                  `).join('');
                  break;
                  
              case 'texto':
                  const maxLength = pregunta.limiteCaracteres || 255;
                  inputHTML = `
                      <textarea 
                          name="q${pregunta.id}" 
                          rows="3" 
                          maxlength="${maxLength}" 
                          placeholder="escriba su respuesta aquí (máx. ${maxLength} caracteres)" 
                          ${required}
                      ></textarea>
                  `;
                  break;
        }

        const preguntaCardHTML = `
            <div class="pregunta-responder-card" style="border-left-color: ${colorDetalles};">
                <h3>${numero}. ${pregunta.texto}</h3>
                <div class="pregunta-inputs">
                    ${inputHTML}
                </div>
            </div>
        `;
        container.innerHTML += preguntaCardHTML;
    });
}

// c. guardado de respuestas

function guardarRespuestas() {
    if (!encuestaActual) {
        alert("error: no hay una encuesta válida cargada.");
        return;
    }
    
    const correoUsuario = localStorage.getItem('userCorreo');
    if (!correoUsuario) {
         alert("debe iniciar sesión para enviar respuestas.");
         return;
    }
    
    const formulario = document.getElementById('formulario-respuestas');
    const datosFormulario = new FormData(formulario);
    const respuestasRecopiladas = {};
    
    // validar y agrupar las respuestas antes de guardar
    let isValid = true;
    encuestaActual.preguntas.forEach(pregunta => {
        const nombreCampo = `q${pregunta.id}`;
        
        if (pregunta.tipo === 'checkbox') {
            const values = datosFormulario.getAll(nombreCampo);
            respuestasRecopiladas[nombreCampo] = values;
            if (values.length === 0) {
                 alert(`la pregunta #${pregunta.id} (opción múltiple) requiere al menos una selección.`);
                 isValid = false;
            }
        } else {
            const value = datosFormulario.get(nombreCampo);
            respuestasRecopiladas[nombreCampo] = value;
            if (!value) {
                 alert(`la pregunta #${pregunta.id} es obligatoria.`);
                 isValid = false;
            }
        }
    });

    if (!isValid) return;

    // crear el objeto de respuesta con los datos recopilados
    const nuevaRespuesta = {
        id: Date.now(),
        encuestaId: encuestaActual.id,
        usuarioCorreo: correoUsuario,
        fecha: new Date().toISOString(),
        respuestas: respuestasRecopiladas
    };

    // guardar el objeto de respuesta en localstorage
    const respuestasGuardadas = JSON.parse(localStorage.getItem('respuestas') || '[]');
    respuestasGuardadas.push(nuevaRespuesta);
    localStorage.setItem('respuestas', JSON.stringify(respuestasGuardadas));
    
    alert("¡respuestas enviadas con éxito! gracias por participar.");
    
    // limpia la encuesta actual y redirige a la página principal
    encuestaActual = null;
    window.location.href = 'Proyecto_Pagina_Principal.html';
}