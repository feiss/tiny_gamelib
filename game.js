
function preload() {
    return [
        'sprites.png',
        'screen.png',
    ];
}

function start() {
    console.log("end preload");
    palette = [
        '#222',
        '#444',
        '#cca',
        '#c51',
        '#FFDC00',
        '#2ECC40',
        '#0074D9',
        '#B10DC9',
    ];
}

function loop(t) {
    fill_rect(0, 0, W, H, 0);
    const w = W / palette.length;
    for (let i = 0; i < palette.length; i++) {
        fill_rect(i * w, 0, w, 2, i);

    }

    if (mouse.left) {
        draw_text(mouse.x + ',' + mouse.y, 10, 20, 2);
    }
}