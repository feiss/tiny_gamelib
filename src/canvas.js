
class Palette {

    constructor() {
        this.palette_hex = null;
        this.palette_rgb = null;
        this.palette_rgb_index = null;
    }


    set_from_hex_array(pal) {
        this.palette_hex = new Array(pal.length);
        this.palette_rgb = new Array(pal.length);
        this.palette_rgb_index = new Array(pal.length);
        for (let i = 0; i < pal.length; i++) {
            this.set_hex(i, pal[i]);
        }
    }

    length() {
        return this.palette_hex.length;
    }

    get_hex(index) {
        return this.palette_hex[index];
    }

    get_rgb(index) {
        return this.palette_rgb[index];
    }

    set_hex(index, color) {
        this.palette_hex[index] = color;
        const rgb = this.hex2rgb(color);
        this.palette_rgb[index] = rgb;
        this.palette_rgb_index[index] = rgb[0] + rgb[1] + rgb[2];
    }

    set_rgb(index, r, g, b) {
        this.palette_hex[index] = this.rgb2hex(r, g, b);
        this.palette_rgb[index] = [r, g, b];
        this.palette_rgb_index[index] = r + g + b;
    }

    hex2rgb(hex) {
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

    rgb2hex(r, g, b) {
        return (
            "#" +
            [r, g, b]
                .map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
        );
    }

    copy(src, dest) {
        this.set_hex(dest, this.get_hex(src));
    }

    swap(src, dest) {
        const aux = this.get_hex(src);
        this.set_hex(src, this.get_hex(dest));
        this.set_hex(dest, aux);
    }

    closest_index(r, g, b) {
        let closest_index = 0;
        let closest_distance = Infinity;
        for (let i = 0; i < this.palette_rgb.length; i++) {
            const pr = this.palette_rgb[i][0];
            const pg = this.palette_rgb[i][1];
            const pb = this.palette_rgb[i][2];
            const prr = pr - r;
            const pgg = pg - g;
            const pbb = pb - b;
            const distance = prr * prr + pgg * pgg + pbb * pbb;
            if (distance < closest_distance) {
                closest_distance = distance;
                closest_index = i;
            }
        }
        return closest_index;
    }

    lerp_color(c1, c2, t) {
        return [
            floor(c1[0] + (c2[0] - c1[0]) * t),
            floor(c1[1] + (c2[1] - c1[1]) * t),
            floor(c1[2] + (c2[2] - c1[2]) * t)
        ];
    }

    make_ramp(aa, bb) {
        const a = Math.min(aa, bb);
        const b = Math.max(aa, bb);
        if (a == b || a == b - 1) return;

        const start = this.palette_rgb[a];
        const end = this.palette_rgb[b];

        for (let i = a + 1; i < b; i++) {
            const t = (i - a) / (b - a);
            const col = this.lerp_color(start, end, t);
            this.set_rgb(i, col[0], col[1], col[2]);
        }
    }
}

class Canvas {
    constructor(w, h, scale, parent) {
        this.width = w;
        this.height = h;
        this.scale = scale;

        this.current_pal_index = -1;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = (this.width * this.scale) + 'px';
        this.canvas.style.height = (this.height * this.scale) + 'px';

        this.offcanvas = new OffscreenCanvas(this.width, this.height);

        this.canvas_ctx = this.canvas.getContext('2d', {
            antialias: false,
            alpha: false,
            preserveDrawingBuffer: true,
        });
        this.canvas_ctx.imageSmoothingEnabled = false;
        this.ctx = this.offcanvas.getContext('2d', {
            antialias: false,
            alpha: false,
            willReadFrequently: true,
            preserveDrawingBuffer: true,
        });
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.willReadFrequently = true;

        this.ctx.font = '8px pixelfont';
        if (parent) {
            parent.appendChild(this.canvas);
        } else {
            document.body.appendChild(this.canvas);
        }
    }


    set_mouse_cursor(cursor) {
        this.canvas.style.cursor = cursor;
    }

    destroy() {
        this.canvas.parentElement.removeChild(this.canvas);
    }

    render() {
        this.canvas_ctx.drawImage(this.offcanvas, 0, 0);
    }

    set_color(index) {
        if (this.current_pal_index !== index) {
            const color = palette.get_hex(index);
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = color;
            this.current_pal_index = index;
        }
    }

    clear(color) {
        this.set_color(color);
        __ctx_fill_rect(this.ctx, 0, 0, this.width, this.height);
    }

    fill_rect(x, y, w, h, color) {
        this.set_color(color);
        __ctx_fill_rect(this.ctx, x, y, w, h);
    }

    draw_rect(x, y, w, h, color) {
        this.set_color(color);
        __ctx_draw_rect(this.ctx, x, y, w, h);
    }

    print(text, x, y, color) {
        this.set_color(color);
        __ctx_print(this.ctx, text, x, y);
    }

    draw_circle(x, y, r, color) {
        this.set_color(color);
        __ctx_draw_circle(this.ctx, x, y, r, color);
    }

    fill_circle(cx, cy, r, color) {
        this.set_color(color);
        __ctx_fill_circle(this.ctx, cx, cy, r);
    }

    draw_image(img, x, y) {
        __ctx_draw_image(this.ctx, img, x, y);
    }

    draw_sprite(name, x, y) {
        __ctx_draw_sprite(this.ctx, name, x, y)
    }

    pset(x, y, color) {
        this.set_color(color);
        return __ctx_pset(this.ctx, x, y);
    }

    pget(x, y) {
        return __ctx_pget(this.ctx, x, y);
    }

    draw_line(x1, y1, x2, y2, color) {
        this.set_color(color);
        __ctx_draw_line(this.ctx, x1, y1, x2, y2);
    }
}


function __ctx_fill_rect(ctx, x, y, w, h) {
    ctx.fillRect(x, y, w, h);
}

function __ctx_draw_rect(ctx, x, y, w, h) {
    ctx.strokeRect(x + 0.5, y + 0.5, w, h);
}

function __ctx_print(ctx, text, x, y) {
    ctx.fillText(text, x, y);
}

function __ctx_draw_circle(ctx, x, y, r) {
    const incr = 1 / r;
    for (let a = incr; a < Math.PI * 2; a += incr) {
        ctx.fillRect(floor(x + Math.cos(a) * r), floor(y + Math.sin(a) * r), 1, 1);
    }
}

function __ctx_fill_circle(ctx, cx, cy, r) {
    let error = -r;
    let x = r;
    let y = 0;
    let self = this;

    function __scanline(cx, cy, x, y) {
        __ctx_fill_rect(ctx, cx - x, cy + y, x * 2, 1);
        if (y != 0) {
            __ctx_fill_rect(ctx, cx - x, cy - y, x * 2, 1);
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

function __ctx_draw_image(ctx, img, x, y) {
    if (!assets[img]) {
        warn('asset', img, "not found");
        return;
    }
    ctx.drawImage(assets[img], x, y);
}

function __ctx_draw_sprite(ctx, name, x, y) {
    const spr = sprites[name];
    if (spr === undefined) {
        console.warn(`Sprite ${name} not found`);
        return;
    }

    if (x === undefined) {
        x = spr.x;
        y = spr.y;
    }
    const frame = spr.animations[spr.animation].frames[spr.frame];
    __ctx_draw_image(ctx, frame, x - spr.anchor_x, y - spr.anchor_y);
}


function __ctx_pset(ctx, x, y) {
    ctx.fillRect(x, y, 1, 1);
}

function __ctx_pget(ctx, x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return palette.closest_index(pixel[0], pixel[1], pixel[2])
}

function __ctx_draw_line(ctx, x1, y1, x2, y2) {
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
        if (!(steep ? ctx.fillRect(y, sign * x, 1, 1) : ctx.fillRect(sign * x, y, 1, 1)));
        err = (err - dy);
        if (err < 0) {
            y += ystep;
            err += dx;
        }
    }
}

function __ctx_flip(ctx, horizontal = true) {
    ctx.save();
    if (horizontal) {
        ctx.scale(-1, 1);
        ctx.drawImage(ctx.canvas, 0, 0, -ctx.canvas.width, ctx.canvas.height);
    } else {
        ctx.scale(1, -1);
        ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, -ctx.canvas.height);
    }
    ctx.restore();
}

function __ctx_offset(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}

function __ctx_clone(source) {
    const source_canvas = source.constructor.name == "OffscreenCanvas" ? source : source.canvas;
    const source_ctx = source.constructor.name == "OffscreenCanvas" ? source.getContext('2d') : source;

    const duplicate = new OffscreenCanvas(source_canvas.width, source_canvas.height);
    duplicate.getContext("2d").drawImage(source_canvas.transferToImageBitmap(), 0, 0);
    return duplicate;
}

function __ctx_copy(source, dest, resize_dest) {
    log(dest.constructor.name)
    const dest_canvas = dest.constructor.name == "OffscreenCanvas" ? dest : dest.canvas;
    const dest_ctx = dest.constructor.name == "OffscreenCanvas" ? dest.getContext('2d') : dest;
    const source_canvas = source.constructor.name == "OffscreenCanvas" ? source : source.canvas;
    if (resize_dest) {
        dest_canvas.width = source_canvas.width;
        dest_canvas.height = source_canvas.height;
    }
    dest_ctx.drawImage(source_canvas, 0, 0);
}

/////////////////////
//  S P R I T E S  //
/////////////////////

let sprites = {};

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
