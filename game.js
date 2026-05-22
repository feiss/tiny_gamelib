function preload() {
    console.log("preload");

}

function loading(progress) {
    log(`loading ${floor(progress * 100)}%`);
}


function start() {
    set_palette([
        '#0d2b45',
        '#112f4a',
        // '#203c56',
        '#544e68',
        '#8d697a',
        '#d08159',
        '#ffaa5e',
        // '#ffd4a3',
        '#3cf',
        '#ffecd6',
    ]);
    new_sprite('sonic', {
        'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 2 },
    }, 0.5, 0.5);

    set_sprite_animation('sonic', 'count');

    canvas.fill_rect(0, 0, W, H, 0);
}

function loop(t, dt) {
    loop2(t, dt);
}

function loop2(t, dt) {
    // noise
    for (let x = 0; x < 1500; x++) {
        canvas.pset(floor(rnd() * W), floor(rnd() * H), 0);
    }

    // noise lines
    // canvas.draw_line(floor(rnd() * W), floor(rnd() * H), floor(rnd() * W), floor(rnd() * H), floor(rnd() * palette.length));

    canvas.draw_text("hola " + mouse.x + ',' + mouse.y, 10, 20, 6);

    // set_palette_color(0, `#${floor(rnd() * 0xffffff).toString(16).padStart(6, '0')}`);
    update_sprite('sonic', dt);
    canvas.draw_sprite('sonic', mouse.x, mouse.y);
    if (mouse.left && mouse.prevx) {
        canvas.draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
        canvas.draw_line(mouse.prevx, mouse.prevy - 1, mouse.x, mouse.y - 1, 6);
        canvas.draw_line(mouse.prevx - 1, mouse.prevy, mouse.x - 1, mouse.y, 6);
    }

    if (mouse.right) {
        canvas.fill_circle(mouse.x, mouse.y, floor(rnd() * 30), floor(rnd() * 8));
    }
}