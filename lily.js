const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let W, H, D, U, lilies, leafLayer, stars;

const rand = (a, b) => a + Math.random() * (b - a);
const lerpColor = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const rgb = (c) => `rgb(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0})`;

// ---------- COLORS ----------
// b = base (center), t = tip, e = edge glow, s = veins and speckles
const PALETTES = [
    { b: [120, 10, 25], t: [255, 60, 60], e: [255, 130, 120], s: [50, 0, 8] },     // red
    { b: [150, 30, 120], t: [255, 120, 200], e: [255, 195, 232], s: [90, 10, 70] },   // pink
    { b: [200, 190, 140], t: [250, 245, 235], e: [255, 255, 255], s: [160, 115, 60] }, // cream
    { b: [190, 150, 10], t: [255, 230, 70], e: [255, 246, 160], s: [140, 90, 0] },   // yellow
    { b: [200, 110, 60], t: [255, 205, 155], e: [255, 228, 195], s: [150, 60, 30] },  // peach
    { b: [110, 30, 70], t: [200, 70, 140], e: [240, 140, 190], s: [70, 10, 40] },   // magenta
];

// ---------- LAYOUT ----------
// [x offset, y offset, size, tilt, rotation, palette number]
// x and y are measured from the bottom center of the bouquet
const LAYOUT = [
    [-0.03, -0.74, 0.075, 0.55, 0.2, 5],
    [0.10, -0.63, 0.09, 0.6, 0.5, 3],
    [-0.12, -0.59, 0.10, 0.6, 0.1, 2],
    [0.02, -0.54, 0.17, 0.55, 0.3, 0],
    [0.17, -0.40, 0.12, 0.65, 0.8, 5],
    [-0.17, -0.40, 0.13, 0.7, 0.2, 1],
    [0.00, -0.30, 0.20, 0.75, 0.5, 2],
    [-0.09, -0.17, 0.17, 0.7, 0.1, 4],
    [0.20, -0.20, 0.10, 0.6, 0.4, 0],
    [-0.21, -0.22, 0.09, 0.6, 0.6, 3],
];

// ---------- ONE LILY, drawn once onto its own hidden canvas ----------
function makeLily(size, pal, tilt, rot) {
    const N = Math.ceil(size * 2.5 * D);
    const off = document.createElement("canvas");
    off.width = off.height = N;
    const g = off.getContext("2d");
    const c = N / 2; // center of the hidden canvas

    // 6 petals: outer ones are slimmer, inner ones are wider
    const petals = [];
    for (let i = 0; i < 6; i++) {
        const outer = i % 2 === 0;
        petals.push({
            angle: rot + i * Math.PI / 3,
            length: size * (outer ? 1 : 0.93),
            width: size * (outer ? 0.26 : 0.31),
            bend: rand(-0.12, 0.12) * size,
        });
    }

    // turns (t, s) on a petal into an x,y position
    function point(pe, t, s) {
        const w = pe.width * Math.sin(Math.PI * Math.pow(t, 0.65)) * (1 - 0.2 * t);
        const x = t * pe.length;
        const y = s * w + pe.bend * t * t;
        const ca = Math.cos(pe.angle), sa = Math.sin(pe.angle);
        return [
            c + (x * ca - y * sa) * D,
            c + (x * sa + y * ca) * tilt * D, // tilt squashes it so it looks angled
        ];
    }

    for (const pe of petals) {
        // dark filled shape first, so petals hide whatever is behind them
        g.beginPath();
        for (let t = 0; t <= 1.001; t += 0.05) {
            const [x, y] = point(pe, t, -1);
            t === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        for (let t = 1; t >= -0.001; t -= 0.05) {
            const [x, y] = point(pe, t, 1);
            g.lineTo(x, y);
        }
        g.fillStyle = rgb(lerpColor(pal.b, [0, 0, 0], 0.55));
        g.fill();

        // now the dots
        const dots = size * size * 0.24;
        for (let k = 0; k < dots; k++) {
            const t = Math.pow(Math.random(), 0.85);
            const s = rand(-1, 1);
            let col = lerpColor(pal.b, pal.t, Math.pow(t, 0.9));          // base to tip
            col = lerpColor(col, pal.e, Math.pow(Math.abs(s), 3) * 0.8);  // bright edges
            if (Math.abs(s) < 0.07) col = lerpColor(col, pal.s, 0.7);     // center vein
            if (t < 0.5 && Math.abs(s) < 0.6 && Math.random() < 0.05) col = pal.s; // speckles
            const bright = rand(0.75, 1.15);
            g.fillStyle = rgb(col.map((v) => v * bright));
            const [x, y] = point(pe, t, s);
            g.fillRect(x, y, 2.2 * D, 1.2 * D);
        }
    }

    // stamens: 6 thin stalks with orange tips
    for (let j = 0; j < 6; j++) {
        const a = rot + j * Math.PI / 3 + rand(-0.25, 0.25);
        const L = size * rand(0.55, 0.8);
        for (let k = 0; k <= 1; k += 0.03) {
            g.fillStyle = "rgb(235, 235, 200)";
            g.fillRect(c + Math.cos(a) * L * k * D, c + Math.sin(a) * L * k * tilt * D, 1.6 * D, 1.6 * D);
        }
        const ex = c + Math.cos(a) * L * D;
        const ey = c + Math.sin(a) * L * tilt * D;
        for (let k = 0; k < 26; k++) {
            g.fillStyle = rgb(lerpColor([120, 50, 10], [230, 120, 20], Math.random()));
            g.fillRect(ex + rand(-5, 5) * D * size / 150, ey + rand(-2.5, 2.5) * D * size / 150, 2 * D, 1.2 * D);
        }
    }
    return off;
}

// ---------- LEAVES, drawn once ----------
function makeLeaves() {
    const off = document.createElement("canvas");
    off.width = W * D;
    off.height = H * D;
    const g = off.getContext("2d");
    const bx = (W / 2) * D, by = H * 0.9 * D;

    for (let i = 0; i < 16; i++) {
        const a = -Math.PI / 2 + rand(-0.9, 0.9);
        const L = U * rand(0.25, 0.55);
        const w = L * rand(0.07, 0.11);
        const bend = rand(-0.25, 0.25) * L;
        const dots = L * w * 0.5;
        for (let k = 0; k < dots; k++) {
            const t = Math.random(), s = rand(-1, 1);
            const ww = w * Math.sin(Math.PI * Math.pow(t, 0.7));
            const x = t * L, y = s * ww + bend * t * t;
            const ca = Math.cos(a), sa = Math.sin(a);
            let col = lerpColor([8, 60, 18], [170, 245, 90], Math.pow(t, 0.8) * 0.9 + Math.random() * 0.1);
            if (Math.abs(s) < 0.07) col = lerpColor(col, [220, 255, 150], 0.6);
            g.fillStyle = rgb(col);
            g.fillRect(bx + (x * ca - y * sa) * D, by + (x * sa + y * ca) * D, 2.2 * D, 1.2 * D);
        }
    }
    return off;
}

// ---------- BUILD EVERYTHING ----------
function build() {
    W = window.innerWidth;
    H = window.innerHeight;
    D = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * D;
    canvas.height = H * D;
    U = Math.min(H, W * 1.5); // one "unit" of size, works on wide and tall screens

    lilies = LAYOUT.map(([dx, dy, s, tilt, rot, palIndex]) => {
        const size = s * U;
        // sometimes swap the color for a random one so every bouquet is different
        const pal = PALETTES[Math.random() < 0.35 ? Math.floor(rand(0, 6)) : palIndex];
        return { dx, dy, img: makeLily(size, pal, tilt, rot + rand(-0.3, 0.3)), phase: rand(0, 6.28) };
    });

    leafLayer = makeLeaves();
    stars = Array.from({ length: 80 }, () => ({ x: rand(0, W), y: rand(0, H), p: rand(0, 6.28), s: rand(0.5, 1.4) }));
}

// ---------- ANIMATION ----------
function frame(ms) {
    const time = ms / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // twinkling stars
    for (const s of stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + 0.25 * Math.sin(time * 0.8 + s.p)})`;
        ctx.fillRect(s.x * D, s.y * D, s.s * D, s.s * D);
    }

    ctx.drawImage(leafLayer, 0, 0);

    const bx = W / 2, by = H * 0.9; // bottom center where all stems meet

    // where each lily is right now (with a gentle sway)
    const pos = lilies.map((l) => {
        const sway = -l.dy * U * 0.014;
        return [
            bx + l.dx * U + Math.sin(time * 0.6 + l.phase) * sway,
            by + l.dy * U + Math.cos(time * 0.5 + l.phase) * sway * 0.3,
        ];
    });

    // dashed stems (3 thin strands each, different greens)
    ctx.setLineDash([2 * D, 2 * D]);
    ctx.lineWidth = 1.3 * D;
    const greens = ["#2f8a2f", "#5cc04a", "#a6e06a"];
    lilies.forEach((l, i) => {
        const [x, y] = pos[i];
        for (let k = 0; k < 3; k++) {
            ctx.strokeStyle = greens[k];
            ctx.beginPath();
            ctx.moveTo((bx + (k - 1) * 3) * D, by * D);
            ctx.quadraticCurveTo((bx + (x - bx) * 0.15 + (k - 1) * 2) * D, (by + (y - by) * 0.6) * D, (x + (k - 1) * 2) * D, y * D);
            ctx.stroke();
        }
    });
    ctx.setLineDash([]);

    // flowers on top, each rocking slightly
    lilies.forEach((l, i) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(pos[i][0] * D, pos[i][1] * D);
        ctx.rotate(Math.sin(time * 0.55 + l.phase) * 0.035);
        ctx.drawImage(l.img, -l.img.width / 2, -l.img.height / 2);
    });

    requestAnimationFrame(frame);
}

build();
requestAnimationFrame(frame);
window.addEventListener("resize", build);
canvas.addEventListener("click", build); // click = new bouquet