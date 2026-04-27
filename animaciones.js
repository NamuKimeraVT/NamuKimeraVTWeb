const contenido = document.getElementById("content");

// ===== Demo media (sin URLs externas) =====
// Imágenes: SVG inline como data URI.
// Videos/Audios: deja src vacío o reemplaza con rutas locales:
//   video: "./media/demo.mp4"
//   audio: "./media/demo.mp3"
const svgData = (title, a = "#e9ff70", b = "#7cf7ff", c = "#ff5c7a") => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="${a}" stop-opacity=".95"/>
              <stop offset=".52" stop-color="${b}" stop-opacity=".75"/>
              <stop offset="1" stop-color="${c}" stop-opacity=".65"/>
            </linearGradient>
            <radialGradient id="r" cx="30%" cy="30%" r="70%">
              <stop offset="0" stop-color="#ffffff" stop-opacity=".22"/>
              <stop offset="1" stop-color="#000000" stop-opacity="0"/>
            </radialGradient>
            <filter id="n">
              <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
              <feColorMatrix type="matrix" values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 .18 0"/>
            </filter>
          </defs>
          <rect width="1400" height="900" fill="#0b0c10"/>
          <rect width="1400" height="900" fill="url(#g)" opacity=".55"/>
          <circle cx="340" cy="280" r="240" fill="url(#r)"/>
          <circle cx="1040" cy="210" r="280" fill="url(#r)" opacity=".75"/>
          <path d="M-40 720 C 180 610, 320 870, 560 750 C 780 640, 910 820, 1180 700 C 1300 640, 1440 690, 1480 720 L 1480 920 L -40 920 Z"
                fill="rgba(0,0,0,.35)"/>
          <path d="M-40 760 C 180 650, 320 910, 560 790 C 780 680, 910 860, 1180 740 C 1300 680, 1440 730, 1480 760"
                fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/>
          <text x="70" y="140" font-family="Inter, system-ui" font-size="44" fill="rgba(255,255,255,.88)" letter-spacing=".5">${escapeXML(title)}</text>
          <text x="70" y="190" font-family="Inter, system-ui" font-size="18" fill="rgba(255,255,255,.68)" letter-spacing=".4">
            SVG inline (data URI) · Reemplaza por tus archivos
          </text>
          <rect width="1400" height="900" filter="url(#n)" opacity=".22"/>
        </svg>
      `.trim();
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

const audioGlyphSVG = () => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ff5c7a" stop-opacity=".95"/>
              <stop offset=".45" stop-color="#e9ff70" stop-opacity=".85"/>
              <stop offset="1" stop-color="#7cf7ff" stop-opacity=".85"/>
            </linearGradient>
            <filter id="as">
              <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#000" flood-opacity=".5"/>
            </filter>
          </defs>
          <circle cx="110" cy="110" r="92" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
          <path d="M95 85v54c0 10-9 18-20 18s-20-8-20-18 9-18 20-18c4 0 8 1 12 3V93c0-6 4-11 10-13l52-16c9-3 18 4 18 13v48c0 10-9 18-20 18s-20-8-20-18 9-18 20-18c4 0 8 1 12 3V77c0-3-3-5-6-4l-45 14c-2 1-3 3-3 5Z"
                fill="url(#ag)" filter="url(#as)"/>
          <path d="M30 110h22m-10-10v20" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-linecap="round"/>
          <path d="M168 48v22m-11-11h22" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `.trim();
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

function escapeXML(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}
function escapeHTML(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function escapeAttr(str) { return escapeHTML(str); }

const items = [
    { id: "m1", kind: "image", title: "Cielo ácido", desc: "Gradiente cálido con textura sutil.", src: svgData("Cielo ácido", "#ffd1a3", "#e9ff70", "#7cf7ff"), size: "is-hero" },
    { id: "m2", kind: "image", title: "Neón mineral", desc: "Contraste alto y formas suaves.", src: svgData("Neón mineral", "#a7ffcf", "#7cf7ff", "#b39bff"), size: "is-wide" },
    { id: "m3", kind: "video", title: "Demo video 01", desc: "Asigna src a un .mp4 local.", poster: svgData("Demo video 01", "#7cf7ff", "#e9ff70", "#ff5c7a"), src: "", size: "is-tall" },
    { id: "m4", kind: "image", title: "Océano nocturno", desc: "Luz fría y profundidad.", src: svgData("Océano nocturno", "#7cf7ff", "#1f2cff", "#ff5c7a"), size: "" },
    { id: "m5", kind: "audio", title: "Podcast corto", desc: "Asigna src a un .mp3 local.", src: "", size: "is-wide" },
    { id: "m6", kind: "video", title: "Demo video 02", desc: "Soporta navegación en lightbox.", poster: svgData("Demo video 02", "#e9ff70", "#7cf7ff", "#ff5c7a"), src: "", size: "" },
    { id: "m7", kind: "image", title: "Bruma cian", desc: "Suave y minimal.", src: svgData("Bruma cian", "#7cf7ff", "#b39bff", "#e9ff70"), size: "is-tall" },
    { id: "m8", kind: "audio", title: "Ambiente — Lluvia", desc: "Perfecto para fondos sonoros.", src: "", size: "" },
    { id: "m9", kind: "image", title: "Lima eléctrica", desc: "Enfoque brillante con sombra profunda.", src: svgData("Lima eléctrica", "#e9ff70", "#7cf7ff", "#1b1d2b"), size: "" },
];

// ===== Render gallery =====
const gallery = document.getElementById("gallery");
const countEl = document.getElementById("count");

function kindLabel(kind) {
    if (kind === "video") return "Video";
    if (kind === "audio") return "Audio";
    return "Imagen";
}

function tileTemplate(item, index) {
    const badgeLabel = kindLabel(item.kind);
    const dotClass = item.kind === "video" ? "video" : (item.kind === "audio" ? "audio" : "");
    const delay = Math.min(index, 10) * 70;

    let mediaHTML = "";
    if (item.kind === "image") {
        mediaHTML = `<img class="media" data-kind="image" alt="${escapeAttr(item.title)}" src="${item.src}">`;
    } else if (item.kind === "video") {
        mediaHTML = `<img class="media" data-kind="video" alt="Poster de ${escapeAttr(item.title)}" src="${item.poster || svgData(item.title)}">`;
    } else {
        mediaHTML = `
          <div class="audioPoster" aria-hidden="true">
            <img class="audioGlyph" alt="" src="${audioGlyphSVG()}">
          </div>
        `;
    }

    return `
        <button class="tile ${item.size || ""} reveal"
                style="animation-delay:${delay}ms"
                type="button"
                data-id="${item.id}"
                data-kind="${item.kind}"
                aria-label="${escapeAttr(item.title)} (${badgeLabel}). Abrir visor.">
          ${mediaHTML}
          <div class="cap">
            <div>
              <h3>${escapeHTML(item.title)}</h3>
              <p>${escapeHTML(item.desc)}</p>
            </div>
            <div class="badge" aria-label="Tipo de medio">
              <span class="dot ${dotClass}" aria-hidden="true"></span>
              <span>${badgeLabel}</span>
            </div>
          </div>
        </button>
      `;
}

// ===== Filtering/search =====
let activeFilter = "all";
let query = "";

const chips = [...document.querySelectorAll(".chip")];
const q = document.getElementById("q");
const clear = document.getElementById("clear");

function getVisibleItems() {
    const qNorm = query.trim().toLowerCase();
    return items.filter(it => {
        const matchType = activeFilter === "all" ? true : it.kind === activeFilter;
        const matchQuery = !qNorm ? true : (it.title + " " + it.desc).toLowerCase().includes(qNorm);
        return matchType && matchQuery;
    });
}

function render() {
    const visible = getVisibleItems();
    gallery.innerHTML = visible.map(tileTemplate).join("");
    countEl.textContent = `${visible.length} elemento${visible.length === 1 ? "" : "s"}`;
    wireTiles();
    observeReveals();
}

chips.forEach(btn => {
    btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        chips.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
        render();
    });
});

q.addEventListener("input", () => { query = q.value; render(); });

clear.addEventListener("click", () => {
    q.value = ""; query = ""; q.focus(); render();
});

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const lbPrev2 = document.getElementById("lbPrev2");
const lbNext2 = document.getElementById("lbNext2");

const lbMedia = document.getElementById("lbMedia");
const lbTitle = document.getElementById("lbTitle");
const lbMeta = document.getElementById("lbMeta");
const lbDot = document.getElementById("lbDot");

let visibleIds = [];
let currentIndex = -1;
let lastFocus = null;

function stopAnyPlayback() {
    const v = lbMedia.querySelector("video");
    if (v) { try { v.pause(); v.currentTime = 0; } catch (e) { } }
    const a = lbMedia.querySelector("audio");
    if (a) { try { a.pause(); a.currentTime = 0; } catch (e) { } }
}

function openLightboxById(id) {
    const visible = getVisibleItems();
    visibleIds = visible.map(v => v.id);
    currentIndex = Math.max(0, visibleIds.indexOf(id));
    lastFocus = document.activeElement;

    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setLightboxContent(visible[currentIndex]);
    lbClose.focus();
}

function closeLightbox() {
    stopAnyPlayback();
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbMedia.innerHTML = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

function setLightboxContent(item) {
    if (!item) return;

    stopAnyPlayback();
    lbTitle.textContent = item.title;
    lbMeta.textContent = kindLabel(item.kind);
    lbDot.className = "dot" + (item.kind === "video" ? " video" : (item.kind === "audio" ? " audio" : ""));

    lbMedia.innerHTML = "";

    if (item.kind === "image") {
        const img = document.createElement("img");
        img.alt = item.title;
        img.src = item.src;
        lbMedia.appendChild(img);

    } else if (item.kind === "video") {
        const video = document.createElement("video");
        video.setAttribute("controls", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("preload", "metadata");
        video.poster = item.poster || "";

        if (item.src) {
            const source = document.createElement("source");
            source.src = item.src;     // e.g. "./media/demo.mp4"
            source.type = "video/mp4";
            video.appendChild(source);
        } else {
            const msg = document.createElement("div");
            msg.style.position = "absolute";
            msg.style.inset = "14px";
            msg.style.display = "grid";
            msg.style.placeItems = "center";
            msg.style.pointerEvents = "none";
            msg.style.color = "rgba(255,255,255,.72)";
            msg.style.fontSize = "13px";
            msg.style.textAlign = "center";
            msg.innerHTML = `No hay archivo de video asignado.<br/>En el JS, pon <code>src: "./media/mi-video.mp4"</code>.`;
            lbMedia.appendChild(msg);
        }

        lbMedia.appendChild(video);

    } else if (item.kind === "audio") {
        const shell = document.createElement("div");
        shell.className = "lb-audio";

        const head = document.createElement("div");
        head.className = "lb-audioHead";
        head.innerHTML = `
          <div>
            <h2>${escapeHTML(item.title)}</h2>
            <p>${escapeHTML(item.desc || "Audio")}</p>
          </div>
          <img src="${audioGlyphSVG()}" alt="" style="width:76px;height:auto;opacity:.9;flex:0 0 auto;">
        `;

        const waves = document.createElement("div");
        waves.className = "waves";
        waves.setAttribute("aria-hidden", "true");

        const player = document.createElement("div");
        player.className = "lb-audioPlayer";

        const audio = document.createElement("audio");
        audio.setAttribute("controls", "");
        audio.setAttribute("preload", "metadata");

        if (item.src) {
            audio.src = item.src; // e.g. "./media/demo.mp3"
        } else {
            // show hint if empty
            const hint = document.createElement("div");
            hint.style.color = "rgba(255,255,255,.72)";
            hint.style.fontSize = "13px";
            hint.style.marginBottom = "10px";
            hint.innerHTML = `No hay archivo de audio asignado. En el JS, pon <code>src: "./media/mi-audio.mp3"</code>.`;
            player.appendChild(hint);
        }

        player.appendChild(audio);
        shell.appendChild(head);
        shell.appendChild(waves);
        shell.appendChild(player);
        lbMedia.appendChild(shell);
    }

    updateNavState();
}

function updateNavState() {
    const atStart = currentIndex <= 0;
    const atEnd = currentIndex >= visibleIds.length - 1;
    [lbPrev, lbPrev2].forEach(b => b.disabled = atStart);
    [lbNext, lbNext2].forEach(b => b.disabled = atEnd);
    [lbPrev, lbPrev2, lbNext, lbNext2].forEach(b => {
        b.style.opacity = b.disabled ? .55 : 1;
        b.style.cursor = b.disabled ? "not-allowed" : "pointer";
    });
}

function go(delta) {
    const visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = Math.max(0, Math.min(visible.length - 1, currentIndex + delta));
    setLightboxContent(visible[currentIndex]);
}

function wireTiles() {
    const tiles = [...document.querySelectorAll(".tile")];
    tiles.forEach(t => {
        t.addEventListener("click", () => openLightboxById(t.dataset.id));
        t.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightboxById(t.dataset.id);
            }
        });
    });
}

lbClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
    const close = e.target && e.target.getAttribute && e.target.getAttribute("data-close") === "1";
    if (close) closeLightbox();
});

[lbPrev, lbPrev2].forEach(b => b.addEventListener("click", () => go(-1)));
[lbNext, lbNext2].forEach(b => b.addEventListener("click", () => go(1)));

document.addEventListener("keydown", (e) => {
    const open = lightbox.getAttribute("aria-hidden") === "false";
    if (!open) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
});

// ===== Scroll reveal (IntersectionObserver) =====
let io;
function observeReveals() {
    if (io) io.disconnect();
    const nodes = [...document.querySelectorAll(".reveal")];

    io = new IntersectionObserver((entries) => {
        for (const en of entries) {
            if (en.isIntersecting) {
                en.target.style.willChange = "transform, opacity";
                io.unobserve(en.target);
            }
        }
    }, { threshold: 0.12 });

    nodes.forEach(n => io.observe(n));
}

// Initial render
render();