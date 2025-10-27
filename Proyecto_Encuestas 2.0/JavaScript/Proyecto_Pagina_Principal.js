// urls constantes
const URL_INGRESO = 'Proyecto_Ingreso.html';
const URL_CREAR = 'Proyecto_crear_encuestas.html'; 
const URL_RESPONDER = 'Proyecto_responder_encuestas.html';

// mock data: estructuras de ejemplo
const MOCK_ENCUESTAS = [
    {
        id: 1,
        titulo: "Encuesta deportes favoritos",
        descripcion: "Una encuesta creada hacia los estudiantes de la uleam con el fin de descubrir en qué tipo de instituciones les gusta más un deporte u otro.",
        creador: 'profesor@uleam.edu.ec',
        tiempo_promedio: '15 sg',
        duracion: '2 días',
        preguntas: [
            { id: 1, texto: "¿qué deporte te gusta practicar más bajo la lluvia?", tipo: 'radio', opciones: ["fútbol", "básket", "vóley", "otro"] }
        ]
    },
    {
        id: 2,
        titulo: "Encuesta carrera más difícil",
        descripcion: null, 
        creador: 'admin@uleam.edu.ec',
        tiempo_promedio: '10 sg',
        duracion: '5 días',
        preguntas: [
            { id: 1, texto: "¿qué carrera piensan que es la más difícil?", tipo: 'texto' }
        ]
    }
];
const MOCK_RESPUESTAS = [
    // respuestas para encuesta 1
    { encuestaId: 1, usuarioCorreo: 'estudiante1@uleam.edu.ec', respuestas: { q1: 'fútbol' } },
    { encuestaId: 1, usuarioCorreo: 'estudiante2@uleam.edu.ec', respuestas: { q1: 'vóley' } },
    // respuestas para encuesta 2
    { encuestaId: 2, usuarioCorreo: 'estudiante3@uleam.edu.ec', respuestas: { q1: 'ingeniería civil' } },
    { encuestaId: 2, usuarioCorreo: 'estudiante4@uleam.edu.ec', respuestas: { q1: 'medicina' } },
];

// variables globales de vista
let VISTA_DASHBOARD;
let VISTA_RESULTADOS;

// funcion de inicializacion
function inicializarLocalStorage() {
    if (!localStorage.getItem('encuestas')) {
        localStorage.setItem('encuestas', JSON.stringify(MOCK_ENCUESTAS));
    }
    if (!localStorage.getItem('respuestas')) {
        localStorage.setItem('respuestas', JSON.stringify(MOCK_RESPUESTAS));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // definimos las vistas al cargar el dom
    VISTA_DASHBOARD = document.getElementById('vista-dashboard');
    VISTA_RESULTADOS = document.getElementById('vista-resultados');
    
    inicializarLocalStorage(); // asegura que existan datos
    personalizarPanel(); // carga rol y nombre, y redirige si no hay sesion
    cargarListaDeEncuestas(); // muestra las encuestas del usuario logueado
    mostrarVistaDashboard(); // asegura que el dashboard sea visible al inicio
});


// logica de roles y redirecciones
function asignarEstilosYPermisos(rol, header) {
    let colorAsignado = '#333'; 

    // limpiamos clases de rol antes de asignar la nueva
    header.classList.remove('rol-estudiante', 'rol-profesor', 'rol-administrador');
    
    switch (rol) {
        case 'Estudiante':
            colorAsignado = '#1E90FF';
            header.classList.add('rol-estudiante');
            break;

        case 'Profesor':
            colorAsignado = '#3CB371';
            header.classList.add('rol-profesor');
            break;

        case 'Administrador':
            colorAsignado = '#B22222';
            header.classList.add('rol-administrador');
            break;
    }
}


function personalizarPanel() {
    const rol = localStorage.getItem('userRol');
    const correo = localStorage.getItem('userCorreo');
    
    const header = document.getElementById('main-header'); // crucial: debe ser 'main-header'
    const mensaje = document.getElementById('mensajeBienvenida');

    if (rol && correo) {
        if (header) asignarEstilosYPermisos(rol, header);
        
        const nombreUsuario = correo.split('@')[0]; 
        if (mensaje) mensaje.textContent = `${rol} (${nombreUsuario})`; 
    } else {
        // redirige si no hay rol o correo
        window.location.href = URL_INGRESO;
    }
}
 
function cerrarSesion() {
    localStorage.removeItem('userRol');
    localStorage.removeItem('userCorreo');
    localStorage.removeItem('userName');
    window.location.href = URL_INGRESO; 
}

function crearEncuesta() {
    window.location.href = URL_CREAR;
}

function responderEncuesta() {
    window.location.href = URL_RESPONDER;
}

function cargarListaDeEncuestas() {
    const encuestasGuardadas = JSON.parse(localStorage.getItem('encuestas') || '[]');
    const usuarioCorreo = localStorage.getItem('userCorreo');
    const contenedorEncuestas = document.getElementById('encuestas-container');
    
    if (!contenedorEncuestas) return; 

    contenedorEncuestas.innerHTML = '';
    
    // filtrar encuestas por el creador logueado
    const misEncuestas = encuestasGuardadas.filter(encuesta => encuesta.creador === usuarioCorreo);

    if (misEncuestas.length === 0) {
        contenedorEncuestas.innerHTML = '<p style="padding: 20px;">no has creado ninguna encuesta todavía.</p>';
        return;
    }

    // generar el html de las tarjetas dinámicamente
    misEncuestas.forEach(encuesta => {
        const descripcionTexto = encuesta.descripcion || "– sin descripción –";
        const primeraPregunta = encuesta.preguntas[0] ? encuesta.preguntas[0].texto : 'sin preguntas definidas.';

        const cardHTML = `
            <div class="encuesta">
                <h3>${encuesta.titulo}</h3>
                <p>${descripcionTexto}</p>
                <button class="view-btn" onclick="verRespuestas(${encuesta.id})">ver respuestas</button>
                <p><strong>1.</strong> ${primeraPregunta}</p>
            </div>
        `;
        contenedorEncuestas.innerHTML += cardHTML;
    });
}


function mostrarVistaDashboard() {
    // muestra el dashboard y oculta la vista de resultados
    if (VISTA_DASHBOARD) VISTA_DASHBOARD.classList.remove('vista-oculta');
    if (VISTA_RESULTADOS) VISTA_RESULTADOS.classList.add('vista-oculta');

    const encuestasContainer = document.getElementById('encuestas-container');
    if (encuestasContainer) encuestasContainer.classList.add('visible'); 
}

function verRespuestas(id) {
    // oculta el listado y muestra la vista de resultados
    if (VISTA_DASHBOARD) VISTA_DASHBOARD.classList.add('vista-oculta');
    if (VISTA_RESULTADOS) VISTA_RESULTADOS.classList.remove('vista-oculta');
    
    cargarResultados(id); 
}

// logica de carga de resultados
function cargarResultados(encuestaId) {
    const encuestas = JSON.parse(localStorage.getItem('encuestas') || '[]');
    const respuestas = JSON.parse(localStorage.getItem('respuestas') || '[]');
    const encuesta = encuestas.find(e => e.id == encuestaId);
    const respuestasDeEstaEncuesta = respuestas.filter(r => r.encuestaId == encuestaId);
    
    if (!encuesta) {
        document.getElementById('titulo-resultados').textContent = `resultados: encuesta id ${encuestaId} (no encontrada)`;
        document.getElementById('total-respuestas').textContent = 0;
        document.getElementById('resultados-preguntas-container').innerHTML = '<p>encuesta no encontrada.</p>';
        return;
    }

    // inyectar datos generales
    document.getElementById('titulo-resultados').textContent = `resultados: ${encuesta.titulo}`;
    document.getElementById('total-respuestas').textContent = respuestasDeEstaEncuesta.length;
    document.getElementById('duracion-encuesta').textContent = encuesta.duracion || 'n/a'; 

    // generar resultados por pregunta
    const container = document.getElementById('resultados-preguntas-container');
    container.innerHTML = '';
    
    encuesta.preguntas.forEach((pregunta, index) => {
        const preguntaNum = index + 1;
        const resultadosPregunta = analizarRespuestas(pregunta, respuestasDeEstaEncuesta);
        
        let detalleHTML = '';
        if (pregunta.tipo === 'radio' || pregunta.tipo === 'checkbox') {
            detalleHTML = generarEstadisticasOpciones(resultadosPregunta.estadisticas);
            if (respuestasDeEstaEncuesta.length > 0) {
                 detalleHTML += generarTablaDetalle(resultadosPregunta.respuestasIndividuales); 
            }
        } else if (pregunta.tipo === 'texto') {
            if (respuestasDeEstaEncuesta.length > 0) {
                 detalleHTML = generarTablaDetalle(resultadosPregunta.respuestasIndividuales);
            }
        }

        const cardHTML = `
            <div class="pregunta-resultado-card">
                <div class="pregunta-header-resultados" onclick="toggleDetalle(this)">
                    <h3>${preguntaNum}. ${pregunta.texto}</h3>
                    <button class="btn-toggle-respuestas"><i class="fas fa-plus"></i></button>
                </div>
                <div class="respuestas-detalle-container">
                    ${detalleHTML || '<p style="padding: 10px 20px;">aún no hay respuestas para esta pregunta.</p>'}
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// funciones auxiliares
function analizarRespuestas(pregunta, respuestas) {
    const respuestasIndividuales = [];
    const estadisticas = {};

    respuestas.forEach(res => {
        const preguntaId = pregunta.id;
        // maneja la inconsistencia de 'q1' o '1' en mock_respuestas
        const respuestaRaw = res.respuestas[`q${preguntaId}`] || res.respuestas[preguntaId]; 
        
        const nombreSimulado = res.usuarioCorreo ? res.usuarioCorreo.split('@')[0] : 'usuario anonimo';
        respuestasIndividuales.push({ nombre: nombreSimulado, respuesta: respuestaRaw });

        if (pregunta.tipo === 'radio' || pregunta.tipo === 'checkbox') {
            const opcionesRespondidas = Array.isArray(respuestaRaw) ? respuestaRaw : [respuestaRaw];
            opcionesRespondidas.forEach(opcion => {
                if (opcion) estadisticas[opcion] = (estadisticas[opcion] || 0) + 1;
            });
        }
    });
    return { estadisticas, respuestasIndividuales };
}

function generarEstadisticasOpciones(estadisticas) {
    let html = '<h4>estadísticas de opciones</h4>';
    for (const opcion in estadisticas) {
        html += `<div class="opcion-estadistica"><span>${opcion}</span><strong>${estadisticas[opcion]}</strong></div>`;
    }
    return html;
}

function generarTablaDetalle(respuestasIndividuales) {
    let html = '<h4>respuestas individuales</h4>';
    html += '<table class="respuestas-tabla"><thead><tr><th>id</th><th>nombre</th><th>respuesta</th></tr></thead><tbody>';

    respuestasIndividuales.forEach((res, index) => {
        const respuestaFormateada = Array.isArray(res.respuesta) ? res.respuesta.join(', ') : res.respuesta;
        html += `<tr><td>${index + 1}</td><td>${res.nombre}</td><td>${respuestaFormateada || '-- sin respuesta --'}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
}

function toggleDetalle(headerElement) {
    const card = headerElement.closest('.pregunta-resultado-card');
    const detalleContainer = card.querySelector('.respuestas-detalle-container');
    const icon = card.querySelector('.btn-toggle-respuestas i');
    
    if (detalleContainer && icon) {
        detalleContainer.classList.toggle('expanded');
        
        if (detalleContainer.classList.contains('expanded')) {
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-minus');
        } else {
            icon.classList.remove('fa-minus');
            icon.classList.add('fa-plus');
        }
    }
}