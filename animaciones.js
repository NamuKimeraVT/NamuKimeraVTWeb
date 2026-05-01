function createLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay hidden';
    overlay.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Cerrar">×</button>
            <img class="lightbox-image" alt="" />
            <div class="lightbox-footer">
                <span class="lightbox-caption"></span>
                <span class="lightbox-counter"></span>
            </div>
            <button class="lightbox-nav prev" aria-label="Anterior">&#10094;</button>
            <button class="lightbox-nav next" aria-label="Siguiente">&#10095;</button>
        </div>
    `;

    document.body.appendChild(overlay);

    return {
        overlay,
        image: overlay.querySelector('.lightbox-image'),
        caption: overlay.querySelector('.lightbox-caption'),
        counter: overlay.querySelector('.lightbox-counter'),
        closeButton: overlay.querySelector('.lightbox-close'),
        prevButton: overlay.querySelector('.lightbox-nav.prev'),
        nextButton: overlay.querySelector('.lightbox-nav.next'),
        backdrop: overlay.querySelector('.lightbox-backdrop'),
    };
}

function initLightbox() {
    const lightbox = createLightbox();
    let images = [];
    let currentLightboxIndex = 0;

    function updateLightbox() {
        const image = images[currentLightboxIndex];
        if (!image) return;

        lightbox.image.src = image.src;
        lightbox.image.alt = image.alt || '';
        lightbox.caption.textContent = image.alt || 'Imagen del portfolio';
        lightbox.counter.textContent = `${currentLightboxIndex + 1} de ${images.length}`;
        lightbox.overlay.classList.remove('hidden');
    }

    function closeLightbox() {
        lightbox.overlay.classList.add('hidden');
    }

    function showNextLightbox() {
        if (!images.length) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % images.length;
        updateLightbox();
    }

    function showPrevLightbox() {
        if (!images.length) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + images.length) % images.length;
        updateLightbox();
    }

    lightbox.closeButton.addEventListener('click', closeLightbox);
    lightbox.backdrop.addEventListener('click', closeLightbox);
    lightbox.nextButton.addEventListener('click', showNextLightbox);
    lightbox.prevButton.addEventListener('click', showPrevLightbox);

    window.addEventListener('keydown', (event) => {
        if (lightbox.overlay.classList.contains('hidden')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') showNextLightbox();
        if (event.key === 'ArrowLeft') showPrevLightbox();
    });

    return {
        open(imagesList, startIndex) {
            images = imagesList;
            currentLightboxIndex = Math.max(0, Math.min(startIndex, images.length - 1));
            updateLightbox();
        },
    };
}

function createCarousel(carousel) {
    const track = carousel.querySelector('.carousel-track');
    const items = Array.from(track.children);
    const prevButton = carousel.querySelector('.carousel-button.prev');
    const nextButton = carousel.querySelector('.carousel-button.next');
    let currentIndex = 0;
    const lightboxController = window.__lightboxController;

    function updateCarousel() {
        if (!items.length) return;
        const width = items[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * width}px)`;
    }

    function changeSlide(delta) {
        if (!items.length) return;
        currentIndex = (currentIndex + delta + items.length) % items.length;
        updateCarousel();
        pauseMedia();
    }

    prevButton.addEventListener('click', () => changeSlide(-1));
    nextButton.addEventListener('click', () => changeSlide(1));

    function pauseMedia() {
        items.forEach((item, index) => {
            if (index !== currentIndex) {
                const video = item.querySelector('video');
                if (video && !video.paused) video.pause();
                const audio = item.querySelector('audio');
                if (audio && !audio.paused) audio.pause();
            }
        });
    }

    items.forEach((item, index) => {
        const image = item.querySelector('img');
        if (image) {
            image.style.cursor = 'pointer';
            image.addEventListener('click', () => {
                if (!lightboxController) return;
                const images = items
                    .map((item) => item.querySelector('img'))
                    .filter(Boolean);
                const imageIndex = images.indexOf(image);
                lightboxController.open(images, imageIndex);
            });
        }
    });

    window.addEventListener('resize', updateCarousel);

    updateCarousel();
}

window.addEventListener('DOMContentLoaded', () => {
    window.__lightboxController = initLightbox();
    document.querySelectorAll('.carousel').forEach(createCarousel);
});