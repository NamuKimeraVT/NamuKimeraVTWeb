document.addEventListener("DOMContentLoaded", () => {
    fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el pie de página");
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});