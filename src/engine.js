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


let assets = {};
let canvas;

const SCALE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--SCALE'));
const W = 320;
const H = 200;
const floor = Math.floor;
const rnd = Math.random;
const log = console.log;
const warn = console.warn;
const error = console.error;
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
    const offscreen = document.createElement('canvas');
    offscreen.width = img.width;
    offscreen.height = img.height;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return offscreen;
}

function __load_data(data, end_preload = false) {
    assets = {};
    const num_assets = Object.keys(data.assets).length;
    let loaded_assets = 0;

    for (const r in data.assets) {
        const img = new Image();
        img.src = data.assets[r];
        img.onload = ev => {
            loaded_assets++;
            if (end_preload) {
                loading(loaded_assets / num_assets);
            }
            assets[r] = __create_offscreen_canvas_from_img(ev.target);
            if (loaded_assets === num_assets && end_preload) {
                requestAnimationFrame(__end_preload);
            }
        }
    }
}

function __init() {
    canvas = new Canvas(320, 200, SCALE);
    set_palette([
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
        console.log('Loading data from localStorage');
        __load_data(JSON.parse(data), true);
    } else {
        console.log('Loading data from file');
        fetch('data.data').then(res => res.json()).then(data => {
            __load_data(data, true);
        });
    }
}


function __end_preload() {
    log("preload end");
    start();
    canvas.render();
    window.requestAnimationFrame(__loop);
    __start_t = performance.now();
}

let __frame = 0;
let __start_t = 0;
let __prev_t;

function __loop(t) {
    if (!__prev_t) __prev_t = t;
    const dt = t - __prev_t;
    __prev_t = t;

    if (window['spriter'] && spriter.active) {
        spriter.loop(t / 1000, dt / 1000);
    }
    // game loop
    loop(t / 1000, dt / 1000);

    mouse.just_left = false;
    mouse.just_middle = false;
    mouse.just_right = false;
    mouse.prevx = mouse.x;
    mouse.prevy = mouse.y;

    canvas.render();

    if ((performance.now() - __start_t) / __frame < 17) {
        canvas.canvas_ctx.fillStyle = "#0f0";
    } else {
        canvas.canvas_ctx.fillStyle = "#f00";
    }
    canvas.canvas_ctx.fillRect(W - 4, 2, 2, 2);

    window.requestAnimationFrame(__loop);
    __frame++;
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

function __hex2rgb(hex) {
    hex = hex.substr(1);
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const dec = parseInt(hex, 16);
    const red = (dec >> 16) & 255;
    const green = (dec >> 8) & 255;
    const blue = dec & 255;
    return [red, green, blue];
}
