
function preload() {
    return [
        'sprites.png',
        'screen.png',
    ];
}

function start() {
    console.log("end preload");
}

function loop(t) {
    fill_rect(0, 0, W, H, '#400');

    if (mouse.left) {
        draw_text(mouse.x + ',' + mouse.y, 10, 10, '#fff');
    }
}