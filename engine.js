document.addEventListener("DOMContentLoaded", __init);
window.addEventListener("resize", __resize);
window.addEventListener("keydown", __keydown);
window.addEventListener("keyup", __keyup);
window.addEventListener("mousedown", __mousedown);
window.addEventListener("mouseup", __mouseup);
window.addEventListener("mousemove", __mousemove);


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

    ctx.fillStyle = '#300';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, H);
    ctx.stroke();

    canvas_ctx.drawImage(offcanvas, 0, 0);

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
            console.log("loaded " + loaded + '/' + total);
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
    mouse.left = !(ev.button == 0);
    mouse.middle = !(ev.button == 1);
    mouse.right = !(ev.button == 2);
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
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function draw_text(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}