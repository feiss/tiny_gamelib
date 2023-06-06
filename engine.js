document.addEventListener("DOMContentLoaded", __init);
window.addEventListener("resize", __resize);
window.addEventListener("keydown", __keydown);
window.addEventListener("keyup", __keyup);
window.addEventListener("mousedown", __mousedown);
window.addEventListener("mouseup", __mouseup);
window.addEventListener("mousemove", __mousemove);
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

let canvas, canvas_ctx, offcanvas, ctx;
const SCALE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--SCALE'));
const W = 320;
const H = 200;

let assets = {};
const keys = {};
const mouse = {
    left: false,
    middle: false,
    right: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    downx: 0,
    downy: 0,
    prevx: 0,
    prevy: 0,
};

let palette = [
    '#FF4136',
    '#FF851B',
    '#FFDC00',
    '#2ECC40',
    '#0074D9',
    '#B10DC9',
    '#7FDBFF',
    '#F012BE'
];

function __init() {
    console.log('GE init');
    canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    offcanvas = new OffscreenCanvas(W, H);

    canvas_ctx = canvas.getContext('2d');
    canvas_ctx.imageSmoothingEnabled = false;
    ctx = offcanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.font = '8px Silkscreen';
    document.body.appendChild(canvas);

    __preload();
}

function __preload() {
    const files = preload();
    let loaded = 0;
    let total = files.length;

    for (const file of files) {
        const img = new Image();
        assets[file] = img;
        img.onload = () => {
            loaded++;
            window.requestAnimationFrame(() => {
                loading(loaded / total)
                canvas_ctx.drawImage(offcanvas, 0, 0);
            });
            if (loaded == total) {
                __end_preload();
            }
        }
        img.src = 'assets/' + file;
    }

}

function __end_preload() {
    start();
    window.requestAnimationFrame(__loop);
}

function __loop(t) {
    window.requestAnimationFrame(__loop);
    loop(t);
    canvas_ctx.drawImage(offcanvas, 0, 0);

}


function __resize() {
    console.log('resize');
}

function __keydown(ev) {
    keys[ev.key] = true;
}

function __keyup(ev) {
    keys[ev.key] = false;
}

function __mousedown(ev) {
    mouse.left = ev.button == 0;
    mouse.middle = ev.button == 1;
    mouse.right = ev.button == 2;
    mouse.downx = Math.floor((ev.x - canvas.offsetLeft) / SCALE);
    mouse.downy = Math.floor((ev.y - canvas.offsetTop) / SCALE);
}

function __mouseup(ev) {
    if (ev.button == 0) {
        mouse.left = false;
    } else if (ev.button == 1) {
        mouse.middle = false;
    } else if (ev.button == 2) {
        mouse.right = false;
    }
}

function __mousemove(ev) {
    mouse.prevx = mouse.x;
    mouse.prevy = mouse.y;
    mouse.x = Math.floor((ev.x - canvas.offsetLeft) / SCALE);
    mouse.y = Math.floor((ev.y - canvas.offsetTop) / SCALE);
    mouse.vx = mouse.x - mouse.prevx;
    mouse.vy = mouse.y - mouse.prevy;
}

function fill_rect(x, y, w, h, color) {
    ctx.fillStyle = palette[color];
    ctx.fillRect(x, y, w, h);
}

function draw_text(text, x, y, color) {
    ctx.fillStyle = palette[color];
    ctx.fillText(text, x, y);
}

function draw_image(img, x, y) {
    ctx.drawImage(assets[img], x, y);
}