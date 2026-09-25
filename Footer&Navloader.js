document.addEventListener("DOMContentLoaded", () => {
    fetch('nav.html')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el menú de navegación");
            return response.text();
        })
        .then(data => {
            document.getElementById('nav-container').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});

document.addEventListener("DOMContentLoaded", () => {
    fetch('navC.html')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el menú de navegación");
            return response.text();
        })
        .then(data => {
            document.getElementById('navC-container').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});

document.addEventListener("DOMContentLoaded", () => {
    fetch('navP.html')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el menú de navegación");
            return response.text();
        })
        .then(data => {
            document.getElementById('navP-container').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});

document.addEventListener("DOMContentLoaded", () => {
    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el pie de página");
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});