class Animations {
    constructor(parameters = {}) {
        this.selector = parameters.selector || '.elemento-animado';
        this.type = parameters.type || 'foto';
        this.animation = parameters.animation || 'fade-up';
        this.split = parameters.split || 'ninguno';
        this.duration = parameters.duration ?? 800;
        this.delayBetweenItems = parameters.delayBetweenItems ?? 100;
        this.delayBetweenSegments = parameters.delayBetweenSegments ?? 30;
        this.velocityTypewriter = parameters.velocityTypewriter ?? 40;
        this.threshold = parameters.threshold ?? 0.2;
        this.rootMargin = parameters.rootMargin || '0px 0px -50px 0px';
        this.once = parameters.once !== undefined ? parameters.once : true;
        this.claseVisible = parameters.claseVisible || 'visible';
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
    }

    _requiresSegmentation() {
        return this.type === 'texto' && (this.animation === 'letras' || this.animation === 'palabras' || this.split === 'letras' || this.split === 'palabras');
    }

    _segmentType() {
        if (this.animation === 'letras' || this.split === 'letras') return 'letras';
        if (this.animation === 'palabras' || this.split === 'palabras') return 'palabras';
        return null;
    }

    _prepareElements() {
        this.elements.forEach((el, index) => {
            el.style.setProperty('--af-delay', `${index * this.delayBetweenItems}ms`);

            if (this.type === 'texto' && this.animation === 'typewriter') {
                this._prepareTypewriter(el);
                return;
            }

            if (this._requiresSegmentation()) {
                this._prepareSegments(el);
                return;
            }

            const prefijo = this.type === 'texto' ? 'at' : 'af';
            el.classList.add(`${prefijo}-base`, `${prefijo}-${this.animation}`);
            el.style.setProperty(`--${prefijo}-duracion`, `${this.duration}ms`);
        });
    }

    _prepareTypewriter(el) {
        const textoOriginal = el.textContent;
        el.dataset.textoOriginal = textoOriginal;
        el.textContent = '';
        el.classList.add('at-typewriter');
    }

    _prepareSegments(el) {
        const type = this._segmentType();
        const textoOriginal = el.textContent;
        el.dataset.textoOriginal = textoOriginal;
        el.classList.add('at-segmentado');

        const partes = type === 'letras'
            ? Array.from(textoOriginal)
            : textoOriginal.split(/(\s+)/);

        el.innerHTML = '';
        partes.forEach((parte, i) => {
            const span = document.createElement('span');
            span.className = `at-segmento at-${this.animation === 'letras' || this.animation === 'palabras' ? 'fade-up' : this.animation}`;
            span.style.setProperty('--at-duracion', `${this.duration}ms`);
            span.style.setProperty('--at-seg-delay', `${i * this.delayBetweenSegments}ms`);
            span.textContent = parte === ' ' ? '\u00A0' : parte;
            if (type === 'palabras' && parte.trim() === '') {
                span.style.setProperty('--at-seg-delay', `0ms`);
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
        if (this.type === 'texto' && this.animation === 'typewriter') {
            this._ejecutarTypewriter(el);
            return;
        }

        if (this._requiresSegmentation()) {
            el.querySelectorAll('.at-segmento').forEach((span) => span.classList.add(this.claseVisible));
            return;
        }

        el.classList.add(this.claseVisible);
    }

    _deactivate(el) {
        if (this.type === 'texto' && this.animation === 'typewriter') {
            el.textContent = '';
            return;
        }
        if (this._requiresSegmentation()) {
            el.querySelectorAll('.at-segmento').forEach((span) => span.classList.remove(this.claseVisible));
            return;
        }
        el.classList.remove(this.claseVisible);
    }

    _ejecutarTypewriter(el) {
        const textoOriginal = el.dataset.textoOriginal || '';
        el.textContent = '';
        let i = 0;

        const writeNext = () => {
            if (i >= textoOriginal.length) return;
            el.textContent += textoOriginal[i];
            i += 1;
            const t = setTimeout(writeNext, this.velocityTypewriter);
            this._timeouts.push(t);
        };

        writeNext();
    }

    refrescar() {
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

document.addEventListener('DOMContentLoaded', () => {
    window.__animationsFotos = new Animations({
        selector: '.foto-animada',
        type: 'foto',
        animation: 'fade-up',
        duration: 800,
        delayBetweenItems: 100,
        threshold: 0.2,
        once: true,
    });

    window.__animationsTextos = new Animations({
        selector: '.texto-animado',
        type: 'texto',
        animation: 'fade-up',
        duration: 800,
        delayBetweenItems: 100,
        threshold: 0.2,
        once: true,
    });
});