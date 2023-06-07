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

for (const event of ['start', 'preload', 'keydown', 'keyup']) {
    if (!window[event]) window[event] = () => { };
}

let canvas, canvas_ctx, offcanvas, ctx, ctx_pixel;
const SCALE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--SCALE'));
const W = 320;
const H = 200;
const floor = Math.floor;
const rnd = Math.random;

let assets = {};
let sprites = {};

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

let palette, palette_rgb, palette_rgb_index;

function __init() {
    canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    offcanvas = new OffscreenCanvas(W, H);

    canvas_ctx = canvas.getContext('2d');
    canvas_ctx.imageSmoothingEnabled = false;
    ctx = offcanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx_pixel = ctx.createImageData(1, 1);

    ctx.font = '8px pixelfont';
    document.body.appendChild(canvas);

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

let __prev_t;

function __loop(t) {
    if (!__prev_t) __prev_t = t;
    const dt = t - __prev_t;
    __prev_t = t;

    loop(t / 1000, dt / 1000);

    mouse.just_left = false;
    mouse.just_middle = false;
    mouse.just_right = false;

    canvas_ctx.drawImage(offcanvas, 0, 0);

    window.requestAnimationFrame(__loop);
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
    mouse.downx = floor((ev.x - canvas.offsetLeft) / SCALE);
    mouse.downy = floor((ev.y - canvas.offsetTop) / SCALE);
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
    mouse.prevx = mouse.x;
    mouse.prevy = mouse.y;
    mouse.x = floor((ev.x - canvas.offsetLeft) / SCALE);
    mouse.y = floor((ev.y - canvas.offsetTop) / SCALE);
    mouse.vx = mouse.x - mouse.prevx;
    mouse.vy = mouse.y - mouse.prevy;
}

function hex2rgb(hex) {
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

function set_palette(pal) {
    palette = pal;
    palette_rgb = [];
    palette_rgb_index = [];
    for (const col of pal) {
        const rgb = hex2rgb(col);
        palette_rgb.push(rgb);
        palette_rgb_index.push(rgb[0] + rgb[1] + rgb[2]});
}
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

function pset(x, y, color) {
    ctx.fillStyle = palette[color];
    ctx.fillRect(x, y, 1, 1);
}


function pget(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const index = pixel[0] + pixel[1] + pixel[2];
    palette_rgb_index.indexOf(index);
}
