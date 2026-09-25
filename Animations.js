class Animations {
    constructor(parameters = {}) {
        this.selector = parameters.selector || '.animated-element';
        this.type = parameters.type || 'photo';
        this.animation = parameters.animation || 'fade-up';
        this.split = parameters.split || 'none';
        this.duration = parameters.duration ?? 800;
        this.delayBetweenItems = parameters.delayBetweenItems ?? 100;
        this.delayBetweenSegments = parameters.delayBetweenSegments ?? 30;
        this.typewriterSpeed = parameters.typewriterSpeed ?? 40;
        this.threshold = parameters.threshold ?? 0.2;
        this.rootMargin = parameters.rootMargin || '0px 0px -50px 0px';
        this.once = parameters.once !== undefined ? parameters.once : true;
        this.visibleClass = parameters.visibleClass || 'visible';
        this.onLoad = parameters.onLoad === true;
        this.elements = [];
        this.observer = null;
        this._timeouts = [];
        this._init();
    }

    _init() {
        this.elements = Array.from(document.querySelectorAll(this.selector));
        if (!this.elements.length) return;

        this._prepareElements();
        this._createObserver();
        this._activateImmediately();
    }

    _activateImmediately() {
        this.elements.forEach((el) => {
            if (el.dataset.onLoad === 'true' || this.onLoad) {
                this._activate(el);
                if (this.once && this.observer) {
                    this.observer.unobserve(el);
                }
            }
        });
    }

    _getAnimation(el) {
        return el.dataset.animation || this.animation;
    }

    _requiresSegmentation(animation) {
        return this.type === 'text' && (animation === 'letters' || animation === 'words' || this.split === 'letters' || this.split === 'words');
    }

    _segmentType(animation) {
        if (animation === 'letters' || this.split === 'letters') return 'letters';
        if (animation === 'words' || this.split === 'words') return 'words';
        return null;
    }

    _prepareElements() {
        this.elements.forEach((el, index) => {
            const animation = this._getAnimation(el);
            el.style.setProperty('--anim-delay', `${index * this.delayBetweenItems}ms`);

            if (this.type === 'text' && animation === 'typewriter') {
                this._prepareTypewriter(el);
                return;
            }

            if (this._requiresSegmentation(animation)) {
                this._prepareSegments(el, animation);
                return;
            }

            const prefix = this.type === 'text' ? 'at' : 'ap';
            el.classList.add(`${prefix}-base`, `${prefix}-${animation}`);
            el.style.setProperty(`--${prefix}-duration`, `${this.duration}ms`);
        });
    }

    _prepareTypewriter(el) {
        const originalText = el.textContent;
        el.dataset.originalText = originalText;
        el.textContent = '';
        el.classList.add('at-typewriter');
    }

    _prepareSegments(el, animation) {
        const type = this._segmentType(animation);
        const originalText = el.textContent;
        el.dataset.originalText = originalText;
        el.classList.add('at-segmented');

        const parts = type === 'letters'
            ? Array.from(originalText)
            : originalText.split(/(\s+)/);

        el.innerHTML = '';
        parts.forEach((part, i) => {
            const span = document.createElement('span');
            span.className = `at-segment at-${animation === 'letters' || animation === 'words' ? 'fade-up' : animation}`;
            span.style.setProperty('--at-duration', `${this.duration}ms`);
            span.style.setProperty('--at-segment-delay', `${i * this.delayBetweenSegments}ms`);
            span.textContent = part === ' ' ? '\u00A0' : part;
            if (type === 'words' && part.trim() === '') {
                span.style.setProperty('--at-segment-delay', `0ms`);
            }
            el.appendChild(span);
        });
    }

    _createObserver() {
        this.observer = new IntersectionObserver(
            (entries) => this._onIntersect(entries),
            {
                threshold: this.threshold,
                rootMargin: this.rootMargin,
            }
        );

        this.elements.forEach((el) => this.observer.observe(el));
    }

    _onIntersect(entries) {
        entries.forEach((entry) => {
            const el = entry.target;
            if (entry.isIntersecting) {
                this._activate(el);
                if (this.once) {
                    this.observer.unobserve(el);
                }
            } else if (!this.once) {
                this._deactivate(el);
            }
        });
    }

    _activate(el) {
        const animation = this._getAnimation(el);

        if (this.type === 'text' && animation === 'typewriter') {
            this._runTypewriter(el);
            return;
        }

        if (this._requiresSegmentation(animation)) {
            el.querySelectorAll('.at-segment').forEach((span) => span.classList.add(this.visibleClass));
            return;
        }

        el.classList.add(this.visibleClass);
    }

    _deactivate(el) {
        const animation = this._getAnimation(el);

        if (this.type === 'text' && animation === 'typewriter') {
            el.textContent = '';
            return;
        }
        if (this._requiresSegmentation(animation)) {
            el.querySelectorAll('.at-segment').forEach((span) => span.classList.remove(this.visibleClass));
            return;
        }
        el.classList.remove(this.visibleClass);
    }

    _runTypewriter(el) {
        const originalText = el.dataset.originalText || '';
        el.textContent = '';
        let i = 0;

        const writeNext = () => {
            if (i >= originalText.length) return;
            el.textContent += originalText[i];
            i += 1;
            const t = setTimeout(writeNext, this.typewriterSpeed);
            this._timeouts.push(t);
        };

        writeNext();
    }

    refresh() {
        this.destroy();
        this._init();
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this._timeouts.forEach((t) => clearTimeout(t));
        this._timeouts = [];
        this.elements = [];
    }
}

window.addEventListener('load', () => {
    window.__animationsPhotos = new Animations({
        selector: '.animated-photo',
        type: 'photo',
        animation: 'fade-up',
        duration: 800,
        delayBetweenItems: 100,
        threshold: 0.2,
        once: true,
        onLoad: true,
    });

    window.__animationsTexts = new Animations({
        selector: '.animated-text',
        type: 'text',
        animation: 'fade-up',
        duration: 800,
        delayBetweenItems: 100,
        threshold: 0.2,
        once: true,
        onLoad: true,
    });
});
