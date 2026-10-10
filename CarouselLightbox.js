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

        this._storeDomRefs(overlay);
    }

    _storeDomRefs(overlay) {
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
        window.addEventListener('keydown', (event) => this._handleKeydown(event));
    }

    _handleKeydown(event) {
        if (this._isHidden()) return;
        this._runKeydownAction(event.key);
    }

    _isHidden() {
        return this.overlay.classList.contains('hidden');
    }

    _runKeydownAction(key) {
        const actions = {
            Escape: () => this.close(),
            ArrowRight: () => this.showNext(),
            ArrowLeft: () => this.showPrev(),
        };
        const action = actions[key];
        if (action) action();
    }

    static _isGif(value) {
        return typeof value === 'string' && value.trim().toLowerCase().endsWith('.gif');
    }

    // ---------- Media teardown ----------

    _clearMedia() {
        if (!this.currentMediaElement) {
            this._emptyMediaContainer();
            return;
        }
        this._stopCurrentMedia();
        this._emptyMediaContainer();
    }

    _stopCurrentMedia() {
        if (!this._isPlayableMedia()) return;
        this.currentMediaElement.pause();
        this.currentMediaElement.src = '';
        this.currentMediaElement.load();
    }

    _isPlayableMedia() {
        const tag = this.currentMediaElement.tagName;
        return tag === 'VIDEO' || tag === 'AUDIO';
    }

    _emptyMediaContainer() {
        this.mediaContainer.innerHTML = '';
        this.currentMediaElement = null;
    }

    // ---------- Media construction ----------

    _buildMediaElement(item) {
        if (this._isGifVideo(item)) return this._buildGifElement(item);
        if (item.type === 'video') return this._buildVideoElement(item);
        if (item.type === 'audio') return this._buildAudioElement(item);
        return this._buildImageElement(item);
    }

    _isGifVideo(item) {
        const isGif = Lightbox._isGif;
        const hasGifSource = item.sources && item.sources.some((source) => isGif(source.src));
        return item.type === 'video' && (isGif(item.src) || hasGifSource);
    }

    _captionFor(item) {
        return item.caption || item.alt || '';
    }

    _buildGifElement(item) {
        const isGif = Lightbox._isGif;
        const gifSrc = isGif(item.src) ? item.src : item.sources.find((source) => isGif(source.src))?.src;
        const img = document.createElement('img');
        img.className = 'lightbox-image';
        img.alt = item.alt || '';
        img.src = gifSrc || item.src;
        return { element: img, caption: this._captionFor(item) };
    }

    _buildVideoElement(item) {
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '72vh';
        video.style.borderRadius = '12px';
        this._attachSources(video, item);
        return { element: video, caption: this._captionFor(item) };
    }

    _buildAudioElement(item) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.style.width = '100%';
        audio.style.maxWidth = '100%';
        audio.style.margin = '0 auto';
        audio.style.display = 'block';
        this._attachSources(audio, item);
        return { element: audio, caption: this._captionFor(item) };
    }

    _buildImageElement(item) {
        const img = document.createElement('img');
        img.className = 'lightbox-image';
        img.alt = item.alt || '';
        img.src = item.src;
        return { element: img, caption: this._captionFor(item) };
    }

    _attachSources(mediaEl, item) {
        if (this._hasSources(item)) {
            this._appendSourceElements(mediaEl, item.sources);
            return;
        }
        this._setDirectSrc(mediaEl, item.src);
    }

    _hasSources(item) {
        return Boolean(item.sources && item.sources.length);
    }

    _appendSourceElements(mediaEl, sources) {
        sources.forEach((source) => mediaEl.appendChild(this._buildSourceElement(source)));
    }

    _buildSourceElement(source) {
        const sourceEl = document.createElement('source');
        sourceEl.src = source.src;
        if (source.type) sourceEl.type = source.type;
        return sourceEl;
    }

    _setDirectSrc(mediaEl, src) {
        if (!src) return;
        mediaEl.src = src;
    }

    // ---------- Render ----------

    _render() {
        const item = this.mediaItems[this.currentIndex];
        if (!item) return;

        this._clearMedia();
        const media = this._buildMediaElement(item);
        this._mountMedia(media);
        this._bindMediaLink(item);
        this._updateFooter(media.caption);
        this._showOverlay();
    }

    _mountMedia(media) {
        this.currentMediaElement = media.element;
        this.mediaContainer.appendChild(media.element);
    }

    _bindMediaLink(item) {
        if (!item.link) return;
        this.currentMediaElement.style.cursor = 'pointer';
        this.currentMediaElement.addEventListener('click', () => this._openLink(item));
    }

    _openLink(item) {
        if (item.target === '_blank') {
            window.open(item.link, '_blank');
            return;
        }
        window.location.href = item.link;
    }

    _updateFooter(captionText) {
        this.caption.textContent = captionText;
        this.counter.textContent = `${this.currentIndex + 1} de ${this.mediaItems.length}`;
    }

    _showOverlay() {
        this.overlay.classList.remove('hidden');
    }

    // ---------- Public API ----------

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

        this._queryDomRefs();
        if (!this._hasRequiredDom()) {
            this.valid = false;
            return;
        }

        this.items = this._collectItems();
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
        this._initialRender();
    }

    static _isGif(value) {
        return typeof value === 'string' && value.trim().toLowerCase().endsWith('.gif');
    }

    // ---------- Setup ----------

    _queryDomRefs() {
        this.track = this.carousel.querySelector('.carousel-track');
        this.prevButton = this.carousel.querySelector('.carousel-button.prev');
        this.nextButton = this.carousel.querySelector('.carousel-button.next');
    }

    _hasRequiredDom() {
        return Boolean(this.track && this.prevButton && this.nextButton);
    }

    _collectItems() {
        return Array.from(this.track.children).filter((child) => child instanceof HTMLElement);
    }

    _initialRender() {
        this.update();
        setTimeout(() => this.update(), 100);
    }

    // ---------- Video -> image (gif) normalization ----------

    _videoToImg(videoEl) {
        if (!this._isGifSource(videoEl)) return videoEl;
        return this._replaceVideoWithImage(videoEl);
    }

    _isGifSource(videoEl) {
        const isGif = Carousel._isGif;
        const sources = Array.from(videoEl.querySelectorAll('source'));
        const src = videoEl.src || sources.map((source) => source.src)[0] || null;
        return isGif(src) || sources.some((source) => isGif(source.src));
    }

    _replaceVideoWithImage(videoEl) {
        const sources = Array.from(videoEl.querySelectorAll('source'));
        const src = videoEl.src || sources.map((source) => source.src)[0] || null;
        const img = document.createElement('img');
        img.src = src || sources.map((source) => source.src)[0] || '';
        img.alt = videoEl.alt || videoEl.getAttribute('data-caption') || '';
        img.style.width = '100%';
        img.style.display = 'block';
        videoEl.parentNode.replaceChild(img, videoEl);
        return img;
    }

    // ---------- Media extraction ----------

    _extractMediaItems() {
        return this.items.map((item) => this._extractMediaItem(item)).filter(Boolean);
    }

    _extractMediaItem(item) {
        let media = item.querySelector('img, video, audio');
        if (!media) return null;

        media = this._normalizeMedia(media);
        return this._buildMediaItemData(item, media);
    }

    _normalizeMedia(media) {
        if (media.tagName.toLowerCase() !== 'video') return media;
        return this._videoToImg(media);
    }

    _buildMediaItemData(item, media) {
        const linkEl = item.querySelector('a[href]');

        return {
            element: media,
            type: media.tagName.toLowerCase(),
            src: this._getMediaSrc(media),
            sources: this._getMediaSources(media),
            alt: media.alt || '',
            caption: media.alt || media.getAttribute('data-caption') || '',
            link: linkEl ? linkEl.href : null,
            target: linkEl ? linkEl.target : null,
        };
    }

    _getMediaSrc(media) {
        return media.src || Array.from(media.querySelectorAll('source')).map((source) => source.src)[0] || null;
    }

    _getMediaSources(media) {
        return Array.from(media.querySelectorAll('source'))
            .map((source) => ({ src: source.src, type: source.type }))
            .filter(Boolean);
    }

    // ---------- Event bindings ----------

    _bindNav() {
        this.prevButton.addEventListener('click', () => this.changeSlide(-1));
        this.nextButton.addEventListener('click', () => this.changeSlide(1));
    }

    _bindMediaClicks() {
        this._bindLinkClicks();
        this._bindMediaElementClicks();
    }

    _bindLinkClicks() {
        this.items.forEach((item, itemIndex) => this._bindLinkClick(item, itemIndex));
    }

    _bindLinkClick(item, itemIndex) {
        const linkEl = item.querySelector('a[href]');
        if (!linkEl) return;
        linkEl.addEventListener('click', (event) => this._openLightboxFromEvent(event, itemIndex));
    }

    _bindMediaElementClicks() {
        this.mediaItems.forEach((itemData, itemIndex) => this._bindMediaElementClick(itemData, itemIndex));
    }

    _bindMediaElementClick(itemData, itemIndex) {
        const mediaElement = itemData.element;
        mediaElement.style.cursor = 'pointer';
        mediaElement.addEventListener('click', (event) => this._openLightboxFromEvent(event, itemIndex));
    }

    _openLightboxFromEvent(event, itemIndex) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.lightbox) return;
        this.lightbox.open(this.mediaItems, itemIndex);
    }

    _bindResize() {
        window.addEventListener('resize', () => this.update());
        window.addEventListener('load', () => this.update());
        this._bindResizeObserver();
    }

    _bindResizeObserver() {
        if (!window.ResizeObserver) return;
        const resizeObserver = new ResizeObserver(() => this.update());
        resizeObserver.observe(this.carousel);
    }

    // ---------- Rendering / state ----------

    update() {
        if (!this.items.length) return;
        const width = this._getCarouselWidth();
        this._applyTransform(width);
    }

    _getCarouselWidth() {
        const rect = this.carousel.getBoundingClientRect();
        return rect.width || this.carousel.clientWidth || 0;
    }

    _applyTransform(width) {
        if (!width) return;
        this.track.style.transform = `translateX(-${this.currentIndex * width}px)`;
    }

    pauseMedia() {
        this.items.forEach((item, index) => this._pauseItemMediaIfInactive(item, index));
    }

    _pauseItemMediaIfInactive(item, index) {
        if (index === this.currentIndex) return;
        this._pauseVideo(item);
        this._pauseAudio(item);
    }

    _pauseVideo(item) {
        const video = item.querySelector('video');
        if (video && !video.paused) video.pause();
    }

    _pauseAudio(item) {
        const audio = item.querySelector('audio');
        if (audio && !audio.paused) audio.pause();
    }

    changeSlide(delta) {
        if (!this.items.length) return;
        this.currentIndex = (this.currentIndex + delta + this.items.length) % this.items.length;
        this.update();
        this.pauseMedia();
    }
}

function initCarousels(lightbox) {
    document.querySelectorAll('.carousel').forEach((carouselEl) => new Carousel(carouselEl, lightbox));
}

window.addEventListener('DOMContentLoaded', () => {
    const lightbox = new Lightbox();
    window.__lightboxController = lightbox; // se mantiene por compatibilidad si algo más lo usa

    initCarousels(lightbox);
});