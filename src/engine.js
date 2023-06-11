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
let canvas, canvas_ctx, offcanvas, ctx, ctx_pixel;
// let storage;

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

let palette, palette_rgb, palette_rgb_index;

function __init() {
    // storage = new DB('tiny_gamelib', 1);

    canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    offcanvas = new OffscreenCanvas(W, H);

    canvas_ctx = canvas.getContext('2d', {
        antialias: false,
        alpha: false,
        preserveDrawingBuffer: true,
    });
    canvas_ctx.imageSmoothingEnabled = false;
    ctx = offcanvas.getContext('2d', {
        antialias: false,
        alpha: false,
        willReadFrequently: true,
        preserveDrawingBuffer: true,
    });
    ctx.imageSmoothingEnabled = false;
    ctx.willReadFrequently = true;
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

    fetch('data.data').then(res => res.json()).then(res => {
        for (const r in res.assets) {
            const img = new Image();
            img.src = res.assets[r];
            assets[r] = img;
        }

        window.requestAnimationFrame(__end_preload);
    });

    // __preload();
}

// function __preload() {
//     const files = preload();
//     let loaded = 0;
//     let total = files.length;

//     for (const file of files) {
//         const img = new Image();
//         assets[file] = img;
//         img.onload = () => {
//             loaded++;
//             window.requestAnimationFrame(() => {
//                 loading(loaded / total)
//                 canvas_ctx.drawImage(offcanvas, 0, 0);
//             });
//             if (loaded == total) {
//                 window.requestAnimationFrame(__end_preload);
//             }
//         }
//         img.src = 'assets/' + file;
//     }

// }

function __end_preload() {
    start();
    canvas_ctx.drawImage(offcanvas, 0, 0);
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

    if (spriter.active) {
        spriter.loop(t / 1000, dt / 1000);
    }
    // game loop
    loop(t / 1000, dt / 1000);

    mouse.just_left = false;
    mouse.just_middle = false;
    mouse.just_right = false;
    mouse.prevx = mouse.x;
    mouse.prevy = mouse.y;

    canvas_ctx.drawImage(offcanvas, 0, 0);

    if ((performance.now() - __start_t) / __frame < 17) {
        canvas_ctx.fillStyle = "#0f0";
    } else {
        canvas_ctx.fillStyle = "#f00";
    }
    canvas_ctx.fillRect(W - 4, 2, 2, 2);

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
    mouse.x = floor((ev.x - canvas.offsetLeft) / SCALE);
    mouse.y = floor((ev.y - canvas.offsetTop) / SCALE);
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

function set_palette(pal) {
    palette = pal;
    palette_rgb = [];
    palette_rgb_index = [];
    for (const col of pal) {
        const rgb = __hex2rgb(col);
        palette_rgb.push(rgb);
        palette_rgb_index.push(rgb[0] + rgb[1] + rgb[2]);
    }
}

function fill_rect(x, y, w, h, color) {
    ctx.fillStyle = palette[color];
    ctx.fillRect(x, y, w, h);
}
function draw_rect(x, y, w, h, color) {
    ctx.strokeStyle = palette[color];
    ctx.strokeRect(x + 0.5, y + 0.5, w, h);
}

function draw_text(text, x, y, color) {
    ctx.fillStyle = palette[color];
    ctx.fillText(text, x, y);
}

function draw_circle(x, y, r, color) {
    ctx.fillStyle = palette[color];
    const incr = 1 / r;
    for (let a = incr; a < Math.PI * 2; a += incr) {
        ctx.fillRect(floor(x + Math.cos(a) * r), floor(y + Math.sin(a) * r), 1, 1);
    }
}

function fill_circle(cx, cy, r, color) {
    ctx.fillStyle = palette[color];
    let error = -r;
    let x = r;
    let y = 0;

    function __scanline(cx, cy, x, y) {
        fill_rect(cx - x, cy + y, x * 2, 1);
        if (y != 0) {
            fill_rect(cx - x, cy - y, x * 2, 1);
        }
    }

    while (x >= y) {
        let lastY = y;
        error += y;
        ++y;
        error += y;
        __scanline(cx, cy, x, lastY);
        if (error >= 0) {
            if (x != lastY)
                __scanline(cx, cy, lastY, x);
            error -= x;
            --x;
            error -= x;
        }
    }
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
    const index_key = pixel[0] + pixel[1] + pixel[2];
    const index = palette_rgb_index.indexOf(index_key);
    if (index == -1) return 0; else return index;
}

function draw_line(x1, y1, x2, y2, color) {
    // ctx.strokeStyle = palette[color];
    // ctx.beginPath();
    // ctx.moveTo(x1, y1);
    // ctx.lineTo(x2, y2);
    // ctx.stroke();
    __bresenham(x1, y1, x2, y2, color);
}


function __bresenham(x1, y1, x2, y2, color) {
    let tmp;
    let steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    if (steep) {
        tmp = x1;
        x1 = y1;
        y1 = tmp;
        tmp = x2;
        x2 = y2;
        y2 = tmp;
    }

    let sign = 1;
    if (x1 > x2) {
        sign = -1;
        x1 *= -1;
        x2 *= -1;
    }

    let dx = x2 - x1;
    let dy = Math.abs(y2 - y1);
    let err = ((dx / 2));
    let ystep = y1 < y2 ? 1 : -1;
    let y = y1;

    for (let x = x1; x <= x2; x++) {
        if (!(steep ? pset(y, sign * x, color) : pset(sign * x, y, color)));
        err = (err - dy);
        if (err < 0) {
            y += ystep;
            err += dx;
        }
    }
}