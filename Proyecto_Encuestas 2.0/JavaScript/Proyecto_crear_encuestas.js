document.addEventListener('DOMContentLoaded', () => {
    // Inicializa el contador de ID de pregunta desde el almacenamiento local.
    preguntaIdCounter = parseInt(localStorage.getItem('preguntaIdCounter') || '1'); 
});

let preguntaIdCounter = 1; 

// A. Logica de interfaz


function aplicarEstilos() {
    const colorFondoEncuesta = document.getElementById('color-fondo').value;
    const colorDetalles = document.getElementById('color-detalles').value;

    const encuestaCard = document.querySelector('body');
    if (encuestaCard) {
        encuestaCard.style.backgroundColor = colorFondoEncuesta;
        const tituloEditor = document.querySelector('.page-background');
    }

    // Aplica el color de acento a los bordes de la izquierda de las tarjetas de pregunta.
    document.querySelectorAll('.pregunta-card').forEach(card => {
        card.style.borderLeftColor = colorDetalles; 
    });
    
    // Aplica el color de acento a los iconos de opcion.
    document.querySelectorAll('.opcion-item i.fa-fw').forEach(icon => {
        icon.style.color = colorDetalles;
    });
    
    // Sincroniza el color del boton principal de publicar.
    document.querySelector('.btn-publish').style.backgroundColor = colorDetalles; 
}
function mostrarModalPregunta() {
    document.getElementById('modal-tipo-pregunta').classList.remove('modal-oculto');
}

function ocultarModalPregunta() {
    document.getElementById('modal-tipo-pregunta').classList.add('modal-oculto');
}

function toggleOpcionesConfig() {
    const config = document.getElementById('opciones-config-seccion');
    config.classList.toggle('opciones-config-oculta'); 
}



// B. Gestion de preguntas


function agregarPregunta(tipo) {
    ocultarModalPregunta(); 
    const container = document.getElementById('preguntas-container');
    const idUnico = 'pregunta-' + preguntaIdCounter++;
    localStorage.setItem('preguntaIdCounter', preguntaIdCounter); // Guarda el nuevo contador.
    
    let opcionesHTML = '';
    
    if (tipo === 'radio' || tipo === 'checkbox') {
        opcionesHTML = `
            <div id="opciones-container-${idUnico}" class="opciones-container">
                <div class="opcion-item">
                    <i class="fas fa-fw ${tipo === 'radio' ? 'fa-circle' : 'fa-square'}"></i>
                    <input type="text" placeholder="Opción 1" class="opcion-texto" required>
                    <button type="button" class="btn-remover-opcion" onclick="this.parentNode.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <button type="button" class="btn-agregar-opcion" onclick="agregarOpcion('${idUnico}', '${tipo}')">
                <i class="fas fa-plus"></i> Agregar otra opción
            </button>
        `;
    } 
    else if (tipo === 'texto') {
        opcionesHTML = `
            <div class="opcion-item input-texto-opcion">
                <i class="fas fa-align-left fa-fw"></i>
                <label>Máx. Caracteres:</label>
                <input type="number" class="input-caracteres" value="255" min="1" max="1000">
            </div>
        `;
    }

    const preguntaHTML = `
        <div class="pregunta-card" data-id="${idUnico}" data-tipo="${tipo}">
            <div class="pregunta-card-content">
                <div class="pregunta-header">
                    <input type="text" class="input-pregunta-texto" placeholder="Escribe tu pregunta aquí..." required>
                    
                    <div class="pregunta-acciones">
                        <button type="button" title="Mover Arriba" class="btn-mover" onclick="moverPregunta('${idUnico}', 'up')"><i class="fas fa-arrow-up"></i></button>
                        <button type="button" title="Mover Abajo" class="btn-mover" onclick="moverPregunta('${idUnico}', 'down')"><i class="fas fa-arrow-down"></i></button>
                        <button type="button" title="Eliminar Pregunta" class="btn-remover-pregunta" onclick="removerPregunta('${idUnico}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                
                <div class="pregunta-body">
                    ${opcionesHTML}
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', preguntaHTML);
}

function agregarOpcion(preguntaId, tipo) {
    const opcionesContainer = document.getElementById(`opciones-container-${preguntaId}`);
    const tipoIcono = tipo === 'radio' ? 'fa-circle' : 'fa-square';

    const nuevaOpcionHTML = `
        <div class="opcion-item">
            <i class="fas fa-fw ${tipoIcono}"></i>
            <input type="text" placeholder="Nueva Opción" class="opcion-texto" required>
            <button type="button" class="btn-remover-opcion" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    opcionesContainer.insertAdjacentHTML('beforeend', nuevaOpcionHTML);
}

function removerPregunta(id) {
    if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
        document.querySelector(`[data-id="${id}"]`).remove();
    }
}

function moverPregunta(id, direction) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (!card) return;

    if (direction === 'up') {
        const prev = card.previousElementSibling;
        if (prev) {
            card.parentNode.insertBefore(card, prev); // Mueve el elemento hacia arriba en la lista.
        }
    } else if (direction === 'down') {
        const next = card.nextElementSibling;
        if (next) {
            card.parentNode.insertBefore(next, card); 
        }
    }
}



//LÓGICA DE GUARDADO Y PUBLICACIÓN


function guardarEncuesta(activar = false, destino = null) {
    const titulo = document.getElementById('titulo-encuesta').value.trim();
    const preguntasCards = document.querySelectorAll('#preguntas-container .pregunta-card');
    
    // Validar el título y que exista al menos una pregunta.
    if (!titulo || preguntasCards.length === 0) {
        alert("El título y al menos una pregunta son obligatorios.");
        return false;
    }
    
    const preguntasArray = [];
    
    for (let i = 0; i < preguntasCards.length; i++) {
        const card = preguntasCards[i];
        const tipo = card.getAttribute('data-tipo');
        const texto = card.querySelector('.input-pregunta-texto').value.trim(); 
        const opciones = [];
        let limiteCaracteres = null;

        if (!texto) {
            alert(`El texto de la Pregunta #${i + 1} es obligatorio.`);
            return false;
        }

        if (tipo === 'radio' || tipo === 'checkbox') {
            const inputsOpciones = card.querySelectorAll('.opcion-texto');
            inputsOpciones.forEach(input => {
                if (input.value.trim()) {
                    opciones.push(input.value.trim());
                }
            });
            if (opciones.length < 1) {
                alert(`La Pregunta #${i + 1} requiere al menos una opción.`);
                return false; 
            }
        } else if (tipo === 'texto') {
            limiteCaracteres = card.querySelector('.input-caracteres').value;
        }
        
        preguntasArray.push({
            id: `q${i + 1}`,
            texto: texto,
            tipo: tipo,
            opciones: opciones, 
            limiteCaracteres: limiteCaracteres
        });
    }

    // Carga las encuestas existentes del almacenamiento local.
    const encuestasGuardadas = JSON.parse(localStorage.getItem('encuestas') || '[]');
    const nuevoId = encuestasGuardadas.length > 0 ? encuestasGuardadas[encuestasGuardadas.length - 1].id + 1 : 1;
    
    const nuevaEncuesta = {
        id: nuevoId,
        titulo: titulo,
        descripcion: document.getElementById('descripcion-encuesta').value.trim() || null,
        creador: localStorage.getItem('userCorreo') || 'anonimo@uleam.edu.ec',
        color_fondo: document.getElementById('color-fondo').value,
        color_detalles: document.getElementById('color-detalles').value,
        activa: activar, // Determina si la encuesta está lista para responder.
        destino: destino,
        preguntas: preguntasArray
    };
    
    encuestasGuardadas.push(nuevaEncuesta);
    localStorage.setItem('encuestas', JSON.stringify(encuestasGuardadas));
    
    if (!activar) {
        alert(`Encuesta "${titulo}" guardada como borrador.`);
    }
    
    return true; 
}


function publicarEncuesta() {
    // Recopila los roles y/o el correo individual como destino.
    const rolesSeleccionados = Array.from(document.querySelectorAll('#opciones-config-seccion input[name="destino"]:checked'))
                                       .map(checkbox => checkbox.value);
    const correoIndividual = document.getElementById('correo-destino').value.trim();
    
    // Se requiere un destino.
    if (rolesSeleccionados.length === 0 && !correoIndividual) {
        alert("Debes seleccionar al menos un grupo de destino o ingresar un correo individual.");
        return;
    }

    let destinoFinal = correoIndividual ? correoIndividual : rolesSeleccionados;
    
    // Guarda la encuesta marcándola como activa.
    const guardada = guardarEncuesta(true, destinoFinal); 
    
    if (guardada) {
        let mensajeDestino = Array.isArray(destinoFinal) 
                             ? destinoFinal.join(', ')
                             : destinoFinal;
                             
        alert(`Encuesta publicada y enviada a: ${mensajeDestino}!`);
        // Redirecciona al panel principal.
        window.location.href = 'Proyecto_Pagina_Principal.html';
    }
}