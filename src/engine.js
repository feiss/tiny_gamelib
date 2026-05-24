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

for (const event of ['start', 'loading', 'preload', 'keydown', 'keyup']) {
    if (!window[event]) window[event] = () => { };
}

let DEBUG = true;

let assets = {};
let canvas, palette;

const SCALE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--SCALE'));
const W = 320;
const H = 200;
const floor = Math.floor;
const log = msg => { if (DEBUG) console.log(msg) };
const warn = msg => { if (DEBUG) console.warn(msg) };
const error = cmsg => { if (DEBUG) console.error(msg) };
const sin = Math.sin;
const cos = Math.cos;
const abs = Math.abs;

const keys = {};
const mouse = {
    left: false,
    middle: false,
    right: false,
    just_left: false,
    just_middle: false,
    just_right: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    downx: 0,
    downy: 0,
    prevx: 0,
    prevy: 0,
};

function __create_offscreen_canvas_from_img(img) {
    const offscreen = new OffscreenCanvas(img.width, img.height);
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return offscreen;
}

function __load_data(data, handler) {
    assets = {};
    const num_assets = Object.keys(data.assets).length;
    let loaded_assets = 0;

    for (const r in data.assets) {
        if (!data.assets[r]) {
            warn("Empty asset", r);
            continue;
        }
        const img = new Image();
        img.src = data.assets[r];
        img.onload = ev => {
            loaded_assets++;
            if (handler) {
                loading(loaded_assets / num_assets);
            }
            assets[r] = __create_offscreen_canvas_from_img(ev.target);
            if (loaded_assets === num_assets && handler) {
                requestAnimationFrame(handler);
            }
        }
    }
}

function __init() {
    canvas = new Canvas(320, 200, SCALE);
    palette = new Palette();
    palette.set_from_hex_array([
        '#FF4136',
        '#FF851B',
        '#FFDC00',
        '#2ECC40',
        '#0074D9',
        '#B10DC9',
        '#7FDBFF',
        '#F012BE'
    ]);

    const data = localStorage.getItem('data.data');
    if (data !== null) {
        log('Loading data from localStorage');
        __load_data(JSON.parse(data), __end_preload);
    } else {
        log('Loading data from file');
        fetch('data.data').then(res => res.json()).then(data => {
            __load_data(data, __end_preload);
        });
    }
}

function __end_preload() {
    log("preload complete");
    start();
    canvas.render();
    window.requestAnimationFrame(__loop);
    __start_t = performance.now();
}

let __frame = 0;
let __start_t = 0;
let __prev_t;
let __paused = false;

function __loop(t) {
    if (!__prev_t) __prev_t = t;
    const dt = t - __prev_t;
    __prev_t = t;

    // game loop
    loop(t / 1000, dt / 1000);

    mouse.just_left = false;
    mouse.just_middle = false;
    mouse.just_right = false;
    mouse.prevx = mouse.x;
    mouse.prevy = mouse.y;

    canvas.render();

    if (DEBUG) {
        if ((performance.now() - __start_t) / __frame < 17) {
            canvas.canvas_ctx.fillStyle = "#0f0";
        } else {
            canvas.canvas_ctx.fillStyle = "#f00";
        }
        canvas.canvas_ctx.fillRect(W - 4, 2, 2, 2);
    }

    if (!__paused) window.requestAnimationFrame(__loop);
    __frame++;
}


function __pause() {
    __paused = !__paused;
    if (!__paused) window.requestAnimationFrame(__loop)
}

function __resize() {
}

function __keydown(ev) {
    keys[ev.key] = true;
    keydown(ev.key);
}

function __keyup(ev) {
    keys[ev.key] = false;
    keyup(ev.key);
}

function __mousedown(ev) {
    mouse.left = ev.button == 0;
    mouse.middle = ev.button == 1;
    mouse.right = ev.button == 2;
    mouse.just_left = mouse.left;
    mouse.just_middle = mouse.middle;
    mouse.just_right = mouse.right;
    mouse.downx = floor((ev.x - canvas.canvas.offsetLeft) / SCALE);
    mouse.downy = floor((ev.y - canvas.canvas.offsetTop) / SCALE);
}

function __mouseup(ev) {
    if (ev.button == 0) {
        mouse.left = false;
        mouse.just_left = false;
    } else if (ev.button == 1) {
        mouse.middle = false;
        mouse.just_middle = false;
    } else if (ev.button == 2) {
        mouse.right = false;
        mouse.just_right = false;
    }
}

function __mousemove(ev) {
    mouse.x = floor((ev.x - canvas.canvas.offsetLeft) / SCALE);
    mouse.y = floor((ev.y - canvas.canvas.offsetTop) / SCALE);
    mouse.vx = mouse.x - mouse.prevx;
    mouse.vy = mouse.y - mouse.prevy;
}
