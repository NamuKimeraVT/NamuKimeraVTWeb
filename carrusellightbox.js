function createLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay hidden';
    overlay.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Cerrar">×</button>
            <div class="lightbox-media"></div>
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
        mediaContainer: overlay.querySelector('.lightbox-media'),
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
    let mediaItems = [];
    let currentLightboxIndex = 0;
    let currentMediaElement = null;

    function clearMedia() {
        if (currentMediaElement) {
            if (currentMediaElement.tagName === 'VIDEO' || currentMediaElement.tagName === 'AUDIO') {
                currentMediaElement.pause();
                currentMediaElement.src = '';
                currentMediaElement.load();
            }
        }
        lightbox.mediaContainer.innerHTML = '';
        currentMediaElement = null;
    }

    function buildMediaElement(item) {
        const type = item.type;
        const src = item.src;
        const captionText = item.caption || item.alt || '';
        const isGif = (value) => typeof value === 'string' && value.trim().toLowerCase().endsWith('.gif');
        const hasGifSource = item.sources && item.sources.some((source) => isGif(source.src));

        if (type === 'video' && (isGif(src) || hasGifSource)) {
            const gifSrc = isGif(src) ? src : item.sources.find((source) => isGif(source.src))?.src;
            const img = document.createElement('img');
            img.className = 'lightbox-image';
            img.alt = item.alt || '';
            img.src = gifSrc || src;
            return { element: img, caption: captionText };
        }

        if (type === 'video') {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '72vh';
            video.style.borderRadius = '12px';
            if (item.sources && item.sources.length) {
                item.sources.forEach((source) => {
                    const sourceEl = document.createElement('source');
                    sourceEl.src = source.src;
                    if (source.type) sourceEl.type = source.type;
                    video.appendChild(sourceEl);
                });
            } else if (src) {
                video.src = src;
            }
            return { element: video, caption: captionText };
        }

        if (type === 'audio') {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.style.width = '100%';
            audio.style.maxWidth = '100%';
            audio.style.margin = '0 auto';
            audio.style.display = 'block';
            if (item.sources && item.sources.length) {
                item.sources.forEach((source) => {
                    const sourceEl = document.createElement('source');
                    sourceEl.src = source.src;
                    if (source.type) sourceEl.type = source.type;
                    audio.appendChild(sourceEl);
                });
            } else if (src) {
                audio.src = src;
            }
            return { element: audio, caption: captionText };
        }

        const img = document.createElement('img');
        img.className = 'lightbox-image';
        img.alt = item.alt || '';
        img.src = src;
        return { element: img, caption: captionText };
    }

    function updateLightbox() {
        const item = mediaItems[currentLightboxIndex];
        if (!item) return;

        clearMedia();
        const media = buildMediaElement(item);
        currentMediaElement = media.element;
        lightbox.mediaContainer.appendChild(media.element);

        if (item.link) {
            currentMediaElement.style.cursor = 'pointer';
            currentMediaElement.addEventListener('click', () => {
                if (item.target === '_blank') {
                    window.open(item.link, '_blank');
                } else {
                    window.location.href = item.link;
                }
            });
        }

        lightbox.caption.textContent = media.caption;
        lightbox.counter.textContent = `${currentLightboxIndex + 1} de ${mediaItems.length}`;
        lightbox.overlay.classList.remove('hidden');
    }

    function closeLightbox() {
        lightbox.overlay.classList.add('hidden');
        clearMedia();
    }

    function showNextLightbox() {
        if (!mediaItems.length) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % mediaItems.length;
        updateLightbox();
    }

    function showPrevLightbox() {
        if (!mediaItems.length) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + mediaItems.length) % mediaItems.length;
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
        open(list, startIndex) {
            mediaItems = list;
            currentLightboxIndex = Math.max(0, Math.min(startIndex, mediaItems.length - 1));
            updateLightbox();
        },
    };
}

function createCarousel(carousel) {
    const track = carousel.querySelector('.carousel-track');
    const prevButton = carousel.querySelector('.carousel-button.prev');
    const nextButton = carousel.querySelector('.carousel-button.next');
    if (!track || !prevButton || !nextButton) return;

    const items = Array.from(track.children).filter((child) => child instanceof HTMLElement);
    if (!items.length) return;

    let currentIndex = 0;
    const lightboxController = window.__lightboxController;

    function updateCarousel() {
        if (!items.length) return;
        // Obtenemos el ancho real del contenedor del carrusel
        const rect = carousel.getBoundingClientRect();
        const width = rect.width || carousel.clientWidth || 0;
        
        if (width > 0) {
            track.style.transform = `translateX(-${currentIndex * width}px)`;
        }
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

    const mediaItems = items
        .map((item) => {
            let media = item.querySelector('img, video, audio');
            if (!media) return null;

            const isGif = (value) => typeof value === 'string' && value.trim().toLowerCase().endsWith('.gif');
            const videoToImg = (videoEl) => {
                const src = videoEl.src || Array.from(videoEl.querySelectorAll('source')).map((source) => source.src)[0] || null;
                if (isGif(src) || Array.from(videoEl.querySelectorAll('source')).some((source) => isGif(source.src))) {
                    const img = document.createElement('img');
                    img.src = src || Array.from(videoEl.querySelectorAll('source')).map((source) => source.src)[0] || '';
                    img.alt = videoEl.alt || videoEl.getAttribute('data-caption') || '';
                    img.style.width = '100%';
                    img.style.display = 'block';
                    videoEl.parentNode.replaceChild(img, videoEl);
                    return img;
                }
                return videoEl;
            };

            if (media.tagName.toLowerCase() === 'video') {
                media = videoToImg(media);
            }

            const type = media.tagName.toLowerCase();
            const src = media.src || Array.from(media.querySelectorAll('source')).map((source) => source.src)[0] || null;
            const sources = Array.from(media.querySelectorAll('source')).map((source) => ({ src: source.src, type: source.type })).filter(Boolean);
            const caption = media.alt || media.getAttribute('data-caption') || '';
            const linkEl = item.querySelector('a[href]');
            const link = linkEl ? linkEl.href : null;
            const target = linkEl ? linkEl.target : null;

            return {
                element: media,
                type,
                src,
                sources,
                alt: media.alt || '',
                caption,
                link,
                target,
            };
        })
        .filter(Boolean);

    items.forEach((item, itemIndex) => {
        const linkEl = item.querySelector('a[href]');
        if (!linkEl) return;
        linkEl.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!lightboxController) return;
            lightboxController.open(mediaItems, itemIndex);
        });
    });

    mediaItems.forEach((itemData, itemIndex) => {
        const mediaElement = itemData.element;
        mediaElement.style.cursor = 'pointer';
        mediaElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!lightboxController) return;
            lightboxController.open(mediaItems, itemIndex);
        });
    });

    // Eventos nativos de redimensionamiento
    window.addEventListener('resize', updateCarousel);
    window.addEventListener('load', updateCarousel);

    // SOLUCIÓN EXTRA: Usar ResizeObserver para recalcular cuando el carrusel sea visible en el DOM
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            updateCarousel();
        });
        resizeObserver.observe(carousel);
    }

    // Ejecución inicial con un pequeño retraso por si el DOM no calculó dimensiones
    updateCarousel();
    setTimeout(updateCarousel, 100);
}

window.addEventListener('DOMContentLoaded', () => {
    window.__lightboxController = initLightbox();
    document.querySelectorAll('.carousel').forEach(createCarousel);
});