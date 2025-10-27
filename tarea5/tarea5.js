document.addEventListener('DOMContentLoaded', function() {
    // Exponer la función actividad en el scope global para que el botón onclick pueda llamarla
    window.actividad = function() {
        const resultado = document.getElementById('resultado');
        const n1 = parseFloat(document.getElementById('numero1').value);
        const n2 = parseFloat(document.getElementById('numero2').value);

        if (isNaN(n1) || isNaN(n2)) {
            resultado.innerHTML = '<p>Por favor introduce ambos números.</p>';
            return;
        }

        // Si la intención es mostrar todos los resultados, los acumulamos:
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i === 1) {
                const suma = n1 + n2;
                html += `<p>El resultado de la suma es: ${suma}</p>`;
            } else if (i === 2) {
                const resta = n1 - n2;
                html += `<p>El resultado de la resta es: ${resta}</p>`;
            } else if (i === 3) {
                const multiplicacion = n1 * n2;
                html += `<p>El resultado de la multiplicación es: ${multiplicacion}</p>`;
            } else if (i === 4) {
                const division = n2 === 0 ? 'Error (división por 0)' : (n1 / n2);
                html += `<p>El resultado de la división es: ${division}</p>`;
            } else if (i === 5) {
                const modulo = n2 === 0 ? 'Error (módulo por 0)' : (n1 % n2);
                html += `<p>El resultado del módulo es: ${modulo}</p>`;
            }
        }

        resultado.innerHTML = html;
    };

});
