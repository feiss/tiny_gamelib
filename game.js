
function preload() {
    palette = [
        '#0d2b45',
        '#203c56',
        '#544e68',
        '#8d697a',
        '#d08159',
        '#ffaa5e',
        '#ffd4a3',
        '#ffecd6',
    ];

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
        'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 25 },
    }, 0.5, 0.5);
}

function loop(t, dt) {
    fill_rect(0, 0, W, H, 0);
    const w = W / palette.length;
    for (let i = 0; i < palette.length; i++) {
        fill_rect(i * w, 0, w, 2, i);
    }

    if (mouse.left) {
        draw_text(mouse.x + ',' + mouse.y, 10, 20, 6);
        // draw_image('screen.png', mouse.x, mouse.y);
        update_sprite('sonic', dt);

        draw_sprite('sonic', mouse.x, mouse.y);
    }
}