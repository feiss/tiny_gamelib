DEBUG = true; // shows fps, logs, etc.


let dust = [];

const radius = 20;


class Hole {
    constructor() {
        this.radius = 30;
        this.reset();
    }
    reset() {
        this.x = radius + rand(W - radius);
        this.y = radius + rand(H - radius);
        this.timeout = 5;
        this.radius *= 0.9;
        if (this.radius < 4) {
            game_over();
        }
    }
};

let hole = new Hole();


function start() {
    palette.set_hex(0, '#111111');
    palette.set_hex(1, '#a00');
    palette.set_hex(2, '#e87000');

    while (dust.length < 1000) {
        const rx = rand(W);
        const ry = rand(H);
        if (distance(rx, ry, hole.x, hole.y) < hole.radius + 1) {
            continue;
        }
        dust.push({
            x: rx,
            y: ry,
            vx: 0,
            vy: 0,
        });
    }

    canvas.set_mouse_cursor('none');
}


let playing = true;

function game_over() {
    playing = false;
    canvas.print("GAME OVER", 140, 100, 3);
}


function loop(t, dt) {
    if (!playing) return;

    canvas.clear(0)


    hole.timeout -= dt;
    if (hole.timeout < 0) {
        hole.reset();
    }

    let any_doomed = false;

    for (let i = 0; i < dust.length; i++) {
        const d = dust[i];

        let doomed = false;
        const dist = distance(d.x, d.y, hole.x, hole.y);
        if (dist < 4) {
            dust.splice(i, 1);
            i--;
            continue;
        } else if (dist < hole.radius) {
            d.vx = (hole.x - d.x) * 0.1;
            d.vy = (hole.y - d.y) * 0.1;
            doomed = true;
        } else if (distance(d.x, d.y, mouse.x, mouse.y) < radius) {
            d.vx = clamp(mouse.vx, -10, 10);
            d.vy = clamp(mouse.vy, -10, 10);
        }
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.93;
        d.vy *= 0.93;

        if (d.x < 0) { d.x = 0; d.vx *= -2; }
        if (d.x >= W) { d.x = W - 1; d.vx *= -2; }
        if (d.y < 0) { d.y = 0; d.vy *= -2; }
        if (d.y >= H) { d.y = H - 1; d.vy *= -2; }

        canvas.pset(d.x, d.y, doomed ? 2 : 1);
        if (doomed) any_doomed = true;
    }

    canvas.fill_circle(mouse.x, mouse.y, radius, 1);
    canvas.draw_circle(hole.x, hole.y, hole.radius, any_doomed ? 2 : 1);

    canvas.print(dust.length, 150, 10, 3);
}
