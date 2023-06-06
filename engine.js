document.addEventListener("DOMContentLoaded", __init);
window.addEventListener("resize", __resize);

let canvas, canvas_ctx, offcanvas, ctx;
const W = 320;
const H = 200;

let sprites = {};

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
        sprites[file] = img;
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
    console.log("end preload");
}

function __loop() {

}


function __resize() {
    console.log('resize');
}