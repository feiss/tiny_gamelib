
function preload() {
    set_palette([
        '#0d2b45',
        '#203c56',
        '#544e68',
        '#8d697a',
        '#d08159',
        '#ffaa5e',
        '#ffd4a3',
        '#ffecd6',
    ]);

    return [
        'sprites.png',
        'screen.png',
        'screen copy.png',
        'screen copy 2.png',
        'screen copy 3.png',
        'screen copy 4.png',
        '1.png',
        '2.png',
        '3.png',
        '4.png',
        'sonic0.png',
        'sonic1.png',
        'sonic2.png',
        'sonic3.png',
    ];
}

function loading(progress) {
    fill_rect(0, 0, W, H, 0);
    fill_rect(10, H / 2, Math.floor((W - 20) * progress), 2, 6);
}

function start() {
    new_sprite('sonic', {
        'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 60 },
    }, 0.5, 0.5);

    fill_rect(0, 0, W, H, 0);
    const w = W / palette.length;
    // for (let i = 0; i < palette.length; i++) {
    //     fill_rect(i * w, 0, w, 20, i);
    // }


}

let brush = 1;

function loop(t, dt) {
    if (mouse.just_right) {
        brush = pget(mouse.x, mouse.y);
    }


    // noise
    // for (let x = 0; x < 10000; x++) {
    //     pset(floor(rnd() * W), floor(rnd() * H), 0);
    // }

    // noise lines
    // draw_line(floor(rnd() * W), floor(rnd() * H), floor(rnd() * W), floor(rnd() * H), floor(rnd() * palette.length));
    // if (mouse.left) {
    //     // draw_text(mouse.x + ',' + mouse.y, 10, 20, 6);
    //     // draw_image('screen.png', mouse.x, mouse.y);
    //     update_sprite('sonic', dt);

    //     draw_sprite('sonic', mouse.x, mouse.y);
    // }

    if (mouse.left && mouse.prevx) {
        draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
        draw_line(mouse.prevx, mouse.prevy - 1, mouse.x, mouse.y - 1, 6);
        draw_line(mouse.prevx - 1, mouse.prevy, mouse.x - 1, mouse.y, 6);
    }

    if (mouse.right) {
        fill_circle(mouse.x, mouse.y, floor(rnd() * 30), floor(rnd() * 8));
    }
}