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
let sprites = {};
let canvas;

const SCALE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--SCALE'));
const W = 320;
const H = 200;
const floor = Math.floor;
const rnd = Math.random;
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


    function load_data(data) {
        for (const r in data.assets) {
            const img = new Image();
            img.src = data.assets[r];
            assets[r] = img;
        }

        window.requestAnimationFrame(__end_preload);
    }

    const data = localStorage.getItem('data.data');
    if (data !== null) {
        console.log('Loading data from localStorage');
        load_data(JSON.parse(data));
    } else {
        console.log('Loading data from file');
        fetch('data.data').then(res => res.json()).then(load_data);
    }
}


function __end_preload() {
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

    if (spriter && spriter.active) {
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


function new_sprite(name, animations, anchor_x, anchor_y) {
    let w, h, animation, fps;
    for (const anim in animations) {
        w = assets[animations[anim].frames[0]].width;
        h = assets[animations[anim].frames[0]].height;
        animation = anim;
        fps = animations[anim].fps;
        break;
    }
    anchor_x = anchor_x || 0;
    anchor_y = anchor_y || 0;
    fps = fps || 10;

    const spr = {
        animations: animations,
        animation: animation,
        frame: 0,
        frame_time: 1 / fps,
        x: 0,
        y: 0,
        w: w,
        h: h,
        time: 0,
        anchor_x: floor(anchor_x * w),
        anchor_y: floor(anchor_y * h),
    };
    sprites[name] = spr;
    return spr;
}

function update_sprite(name, dt) {
    const spr = sprites[name];
    const anim = spr.animations[spr.animation];
    spr.time += dt;
    if (spr.time > spr.frame_time) {
        spr.time = 0;
        spr.frame++;
        if (spr.frame == anim.frames.length) {
            spr.frame = 0;
        }
    }
}

function set_sprite_animation(sprite, animation) {
    const spr = sprites[sprite];
    const fps = spr.animations[animation].fps;
    spr.animation = animation;
    spr.frame_time = 1 / fps;
    spr.frame = 0;
    spr.time = 0;
}

function draw_sprite(name, x, y) {
    const spr = sprites[name];
    if (x === undefined) {
        x = spr.x;
        y = spr.y;
    }
    ctx.drawImage(assets[spr.animations[spr.animation].frames[spr.frame]], x - spr.anchor_x, y - spr.anchor_y);
}
