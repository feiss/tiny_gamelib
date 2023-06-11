
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
    // new_sprite('sonic', {
    //     'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 10 },
    // }, 0.5, 0.5);

    fill_rect(0, 0, W, H, 0);
}

function loop(t, dt) {
    // loop2(t, dt);
}



let brush = 1;

function loop2(t, dt) {
    if (mouse.just_right) {
        brush = pget(mouse.x, mouse.y);
    }


    // noise
    // for (let x = 0; x < 10000; x++) {
    //     pset(floor(rnd() * W), floor(rnd() * H), 0);
    // }

    // noise lines
    // draw_line(floor(rnd() * W), floor(rnd() * H), floor(rnd() * W), floor(rnd() * H), floor(rnd() * palette.length));

    // draw_text(mouse.x + ',' + mouse.y, 10, 20, 6);
    // draw_image('screen.png', mouse.x, mouse.y);
    fill_rect(W / 2 - 50, H / 2 - 50, 100, 100, 0);
    update_sprite('sonic', dt);
    draw_sprite('sonic', W / 2, H / 2);

    // if (mouse.left && mouse.prevx) {
    //     draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
    //     draw_line(mouse.prevx, mouse.prevy - 1, mouse.x, mouse.y - 1, 6);
    //     draw_line(mouse.prevx - 1, mouse.prevy, mouse.x - 1, mouse.y, 6);
    // }

    if (mouse.right) {
        fill_circle(mouse.x, mouse.y, floor(rnd() * 30), floor(rnd() * 8));
    }
}