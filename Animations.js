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

    // ---------- Activation on load ----------

    _activateImmediately() {
        this.elements.forEach((el) => this._maybeActivateOnLoad(el));
    }

    _maybeActivateOnLoad(el) {
        if (!this._shouldActivateOnLoad(el)) return;
        this._activate(el);
        this._stopObservingIfOnce(el);
    }

    _shouldActivateOnLoad(el) {
        return el.dataset.onLoad === 'true' || this.onLoad;
    }

    _stopObservingIfOnce(el) {
        if (!this.once || !this.observer) return;
        this.observer.unobserve(el);
    }

    // ---------- Animation / segmentation helpers ----------

    _getAnimation(el) {
        return el.dataset.animation || this.animation;
    }

    _isTypewriter(animation) {
        return this.type === 'text' && animation === 'typewriter';
    }

    _requiresSegmentation(animation) {
        if (this.type !== 'text') return false;
        return this._segmentType(animation) !== null;
    }

    _segmentType(animation) {
        if (animation === 'letters' || this.split === 'letters') return 'letters';
        if (animation === 'words' || this.split === 'words') return 'words';
        return null;
    }

    _getPrefix() {
        return this.type === 'text' ? 'at' : 'ap';
    }

    // ---------- Preparation (runs once per element) ----------

    _prepareElements() {
        this.elements.forEach((el, index) => this._prepareElement(el, index));
    }

    _prepareElement(el, index) {
        const animation = this._getAnimation(el);
        this._applyStaggerDelay(el, index);

        if (this._isTypewriter(animation)) {
            this._prepareTypewriter(el);
            return;
        }

        if (this._requiresSegmentation(animation)) {
            this._prepareSegments(el, animation);
            return;
        }

        this._prepareSimpleAnimation(el, animation);
    }

    _applyStaggerDelay(el, index) {
        el.style.setProperty('--anim-delay', `${index * this.delayBetweenItems}ms`);
    }

    _prepareSimpleAnimation(el, animation) {
        const prefix = this._getPrefix();
        el.classList.add(`${prefix}-base`, `${prefix}-${animation}`);
        el.style.setProperty(`--${prefix}-duration`, `${this.duration}ms`);
    }

    _prepareTypewriter(el) {
        const originalText = el.textContent;
        el.dataset.originalText = originalText;
        el.textContent = '';
        el.classList.add('at-typewriter');
    }

    _prepareSegments(el, animation) {
        const type = this._segmentType(animation);
        const originalText = this._storeOriginalText(el);
        el.classList.add('at-segmented');

        const parts = this._splitText(originalText, type);
        el.innerHTML = '';
        parts.forEach((part, index) => this._appendSegment(el, part, index, animation, type));
    }

    _storeOriginalText(el) {
        const originalText = el.textContent;
        el.dataset.originalText = originalText;
        return originalText;
    }

    _splitText(text, type) {
        if (type === 'letters') return Array.from(text);
        return text.split(/(\s+)/);
    }

    _appendSegment(el, part, index, animation, type) {
        const span = this._buildSegmentSpan(part, index, animation, type);
        el.appendChild(span);
    }

    _buildSegmentSpan(part, index, animation, type) {
        const span = document.createElement('span');
        span.className = this._segmentClassName(animation);
        span.style.setProperty('--at-duration', `${this.duration}ms`);
        span.style.setProperty('--at-segment-delay', this._segmentDelay(part, index, type));
        span.textContent = part === ' ' ? '\u00A0' : part;
        return span;
    }

    _segmentClassName(animation) {
        const effective = (animation === 'letters' || animation === 'words') ? 'fade-up' : animation;
        return `at-segment at-${effective}`;
    }

    _segmentDelay(part, index, type) {
        if (type === 'words' && part.trim() === '') return '0ms';
        return `${index * this.delayBetweenSegments}ms`;
    }

    // ---------- Intersection Observer ----------

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
        entries.forEach((entry) => this._handleIntersection(entry));
    }

    _handleIntersection(entry) {
        if (entry.isIntersecting) {
            this._handleEnter(entry.target);
            return;
        }
        this._handleExit(entry.target);
    }

    _handleEnter(el) {
        this._activate(el);
        this._stopObservingIfOnce(el);
    }

    _handleExit(el) {
        if (!this.once) {
            this._deactivate(el);
        }
    }

    // ---------- Activate / deactivate ----------

    _activate(el) {
        const animation = this._getAnimation(el);

        if (this._isTypewriter(animation)) {
            this._runTypewriter(el);
            return;
        }

        if (this._requiresSegmentation(animation)) {
            this._showSegments(el);
            return;
        }

        this._showElement(el);
    }

    _showSegments(el) {
        el.querySelectorAll('.at-segment').forEach((span) => span.classList.add(this.visibleClass));
    }

    _showElement(el) {
        el.classList.add(this.visibleClass);
    }

    _deactivate(el) {
        const animation = this._getAnimation(el);

        if (this._isTypewriter(animation)) {
            this._clearTypewriterText(el);
            return;
        }

        if (this._requiresSegmentation(animation)) {
            this._hideSegments(el);
            return;
        }

        this._hideElement(el);
    }

    _clearTypewriterText(el) {
        el.textContent = '';
    }

    _hideSegments(el) {
        el.querySelectorAll('.at-segment').forEach((span) => span.classList.remove(this.visibleClass));
    }

    _hideElement(el) {
        el.classList.remove(this.visibleClass);
    }

    // ---------- Typewriter ----------

    _runTypewriter(el) {
        const originalText = el.dataset.originalText || '';
        el.textContent = '';
        this._typeCharacter(el, originalText, 0);
    }

    _typeCharacter(el, text, index) {
        if (index >= text.length) return;

        el.textContent += text[index];
        const timeoutId = setTimeout(() => this._typeCharacter(el, text, index + 1), this.typewriterSpeed);
        this._timeouts.push(timeoutId);
    }

    // ---------- Lifecycle ----------

    refresh() {
        this.destroy();
        this._init();
    }

    destroy() {
        this._disconnectObserver();
        this._clearTimeouts();
        this.elements = [];
    }

    _disconnectObserver() {
        if (!this.observer) return;
        this.observer.disconnect();
        this.observer = null;
    }

    _clearTimeouts() {
        this._timeouts.forEach((t) => clearTimeout(t));
        this._timeouts = [];
    }
}

function initPhotoAnimations() {
    return new Animations({
        selector: '.animated-photo',
        type: 'photo',
        animation: 'fade-up',
        duration: 800,
        delayBetweenItems: 100,
        threshold: 0.2,
        once: true,
        onLoad: true,
    });
}

function initTextAnimations() {
    return new Animations({
        selector: '.animated-text',
        type: 'text',
        animation: 'fade-up',
        duration: 800,
        delayBetweenItems: 100,
        threshold: 0.2,
        once: true,
        onLoad: true,
    });
}

window.addEventListener('load', () => {
    window.__animationsPhotos = initPhotoAnimations();
    window.__animationsTexts = initTextAnimations();
});