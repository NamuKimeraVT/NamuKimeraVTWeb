const formulario = document.getElementById('form-contacto');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Obtener los valores de los inputs de tu HTML
    const datosFormulario = {
        nombre: document.getElementById('input-nombre').value,
        correo: document.getElementById('input-correo').value,
        mensaje: document.getElementById('input-mensaje').value
    };

    try {
        // Enviar datos al servidor Flask local
        const respuesta = await fetch('http://127.0.0.1:5000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosFormulario)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert("¡Mensaje enviado correctamente!");
            formulario.reset(); // Limpia el formulario
        } else {
            alert("Hubo un error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
});