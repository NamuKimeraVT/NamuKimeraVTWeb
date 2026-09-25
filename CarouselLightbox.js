class Lightbox {
    constructor() {
        this.overlay = null;
        this.mediaContainer = null;
        this.caption = null;
        this.counter = null;
        this.closeButton = null;
        this.prevButton = null;
        this.nextButton = null;
        this.backdrop = null;

        this.mediaItems = [];
        this.currentIndex = 0;
        this.currentMediaElement = null;

        this._buildDom();
        this._bindEvents();
    }

    _buildDom() {
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

        this.overlay = overlay;
        this.mediaContainer = overlay.querySelector('.lightbox-media');
        this.caption = overlay.querySelector('.lightbox-caption');
        this.counter = overlay.querySelector('.lightbox-counter');
        this.closeButton = overlay.querySelector('.lightbox-close');
        this.prevButton = overlay.querySelector('.lightbox-nav.prev');
        this.nextButton = overlay.querySelector('.lightbox-nav.next');
        this.backdrop = overlay.querySelector('.lightbox-backdrop');
    }

    _bindEvents() {
        this.closeButton.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', () => this.close());
        this.nextButton.addEventListener('click', () => this.showNext());
        this.prevButton.addEventListener('click', () => this.showPrev());

        window.addEventListener('keydown', (event) => {
            if (this.overlay.classList.contains('hidden')) return;
            if (event.key === 'Escape') this.close();
            if (event.key === 'ArrowRight') this.showNext();
            if (event.key === 'ArrowLeft') this.showPrev();
        });
    }

    static _isGif(value) {
        return typeof value === 'string' && value.trim().toLowerCase().endsWith('.gif');
    }

    _clearMedia() {
        if (this.currentMediaElement) {
            const tag = this.currentMediaElement.tagName;
            if (tag === 'VIDEO' || tag === 'AUDIO') {
                this.currentMediaElement.pause();
                this.currentMediaElement.src = '';
                this.currentMediaElement.load();
            }
        }
        this.mediaContainer.innerHTML = '';
        this.currentMediaElement = null;
    }

    _buildMediaElement(item) {
        const { type, src } = item;
        const captionText = item.caption || item.alt || '';
        const isGif = Lightbox._isGif;
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

    _render() {
        const item = this.mediaItems[this.currentIndex];
        if (!item) return;

        this._clearMedia();
        const media = this._buildMediaElement(item);
        this.currentMediaElement = media.element;
        this.mediaContainer.appendChild(media.element);

        if (item.link) {
            this.currentMediaElement.style.cursor = 'pointer';
            this.currentMediaElement.addEventListener('click', () => {
                if (item.target === '_blank') {
                    window.open(item.link, '_blank');
                } else {
                    window.location.href = item.link;
                }
            });
        }

        this.caption.textContent = media.caption;
        this.counter.textContent = `${this.currentIndex + 1} de ${this.mediaItems.length}`;
        this.overlay.classList.remove('hidden');
    }

    open(list, startIndex) {
        this.mediaItems = list;
        this.currentIndex = Math.max(0, Math.min(startIndex, this.mediaItems.length - 1));
        this._render();
    }

    close() {
        this.overlay.classList.add('hidden');
        this._clearMedia();
    }

    showNext() {
        if (!this.mediaItems.length) return;
        this.currentIndex = (this.currentIndex + 1) % this.mediaItems.length;
        this._render();
    }

    showPrev() {
        if (!this.mediaItems.length) return;
        this.currentIndex = (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
        this._render();
    }
}

class Carousel {
    constructor(carouselEl, lightbox) {
        this.carousel = carouselEl;
        this.lightbox = lightbox;

        this.track = carouselEl.querySelector('.carousel-track');
        this.prevButton = carouselEl.querySelector('.carousel-button.prev');
        this.nextButton = carouselEl.querySelector('.carousel-button.next');

        if (!this.track || !this.prevButton || !this.nextButton) {
            this.valid = false;
            return;
        }

        this.items = Array.from(this.track.children).filter((child) => child instanceof HTMLElement);
        if (!this.items.length) {
            this.valid = false;
            return;
        }

        this.valid = true;
        this.currentIndex = 0;
        this.mediaItems = this._extractMediaItems();

        this._bindNav();
        this._bindMediaClicks();
        this._bindResize();

        this.update();
        setTimeout(() => this.update(), 100);
    }

    static _isGif(value) {
        return typeof value === 'string' && value.trim().toLowerCase().endsWith('.gif');
    }

    _videoToImg(videoEl) {
        const isGif = Carousel._isGif;
        const sources = Array.from(videoEl.querySelectorAll('source'));
        const src = videoEl.src || sources.map((source) => source.src)[0] || null;

        if (isGif(src) || sources.some((source) => isGif(source.src))) {
            const img = document.createElement('img');
            img.src = src || sources.map((source) => source.src)[0] || '';
            img.alt = videoEl.alt || videoEl.getAttribute('data-caption') || '';
            img.style.width = '100%';
            img.style.display = 'block';
            videoEl.parentNode.replaceChild(img, videoEl);
            return img;
        }
        return videoEl;
    }

    _extractMediaItems() {
        return this.items
            .map((item) => {
                let media = item.querySelector('img, video, audio');
                if (!media) return null;

                if (media.tagName.toLowerCase() === 'video') {
                    media = this._videoToImg(media);
                }

                const type = media.tagName.toLowerCase();
                const src = media.src || Array.from(media.querySelectorAll('source')).map((source) => source.src)[0] || null;
                const sources = Array.from(media.querySelectorAll('source'))
                    .map((source) => ({ src: source.src, type: source.type }))
                    .filter(Boolean);
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
    }

    _bindNav() {
        this.prevButton.addEventListener('click', () => this.changeSlide(-1));
        this.nextButton.addEventListener('click', () => this.changeSlide(1));
    }

    _bindMediaClicks() {
        this.items.forEach((item, itemIndex) => {
            const linkEl = item.querySelector('a[href]');
            if (!linkEl) return;
            linkEl.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!this.lightbox) return;
                this.lightbox.open(this.mediaItems, itemIndex);
            });
        });

        this.mediaItems.forEach((itemData, itemIndex) => {
            const mediaElement = itemData.element;
            mediaElement.style.cursor = 'pointer';
            mediaElement.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!this.lightbox) return;
                this.lightbox.open(this.mediaItems, itemIndex);
            });
        });
    }

    _bindResize() {
        window.addEventListener('resize', () => this.update());
        window.addEventListener('load', () => this.update());

        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => this.update());
            resizeObserver.observe(this.carousel);
        }
    }

    update() {
        if (!this.items.length) return;
        const rect = this.carousel.getBoundingClientRect();
        const width = rect.width || this.carousel.clientWidth || 0;

        if (width > 0) {
            this.track.style.transform = `translateX(-${this.currentIndex * width}px)`;
        }
    }

    pauseMedia() {
        this.items.forEach((item, index) => {
            if (index !== this.currentIndex) {
                const video = item.querySelector('video');
                if (video && !video.paused) video.pause();
                const audio = item.querySelector('audio');
                if (audio && !audio.paused) audio.pause();
            }
        });
    }

    changeSlide(delta) {
        if (!this.items.length) return;
        this.currentIndex = (this.currentIndex + delta + this.items.length) % this.items.length;
        this.update();
        this.pauseMedia();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const lightbox = new Lightbox();
    window.__lightboxController = lightbox; // se mantiene por compatibilidad si algo más lo usa

    document.querySelectorAll('.carousel').forEach((carouselEl) => {
        new Carousel(carouselEl, lightbox);
    });
});