document.addEventListener("DOMContentLoaded", () => {
    fetch('nav.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el menú de navegación");
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('nav-container').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});