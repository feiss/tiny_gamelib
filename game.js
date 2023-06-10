
function preload() {
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

function loop(t, dt) {
    loop1(t, dt);
}


let enemies = [];
let aim = 0;
let player = new Point(W / 2, H / 2);
let player_speed = new Point(0, 0);
let bullets = [];
const PLAYER_ACCEL = 0.4;
let use_mouse = false;

function loop1(t, dt) {

    if (rnd() < 0.01) {
        enemies.push(new Point(rnd() * W / 2, rnd() * H / 2));
    }

    // fill_rect(0, 0, W, H, 0);
    for (let x = 0; x < 30000; x++) {
        pset(floor(rnd() * W), floor(rnd() * H), floor(rnd() * 2));
    }

    if (!use_mouse) {

        if (keys['ArrowLeft']) {
            player_speed.x += -PLAYER_ACCEL;
        }
        if (keys['ArrowRight']) {
            player_speed.x += PLAYER_ACCEL;
        }
        if (keys['ArrowUp']) {
            player_speed.y += -PLAYER_ACCEL;
        }
        if (keys['ArrowDown']) {
            player_speed.y += PLAYER_ACCEL;
        }

        player_speed.clamp(-7, 7);
        player.add(player_speed);

        if (player.x < 0 || player.x > W) {
            player_speed.x *= -2;
        }
        if (player.y < 0 || player.y > H) {
            player_speed.y *= -2;
        }

        player_speed.x *= 0.94;
        player_speed.y *= 0.94;
    } else {
        player.x = lerp(player.x, mouse.x, 0.1);
        player.y = lerp(player.y, mouse.y, 0.1);
    }

    if (mouse.just_left) {
        use_mouse = true;
    }



    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        if (enemy.distance(player) > 60) {
            // get closer to player
            const n = enemy.lerp(player, 0.01);
            enemy.set(n.x, n.y);
        }
        if (enemy.distance(player) < 55) {
            // escape from the player
            const n = enemy.lerp(player, -0.06);
            enemy.set(n.x, n.y);
        }

        // separate from the rest of enemies
        for (let j = 0; j < enemies.length; j++) {
            if (j == i) continue;
            const enemy2 = enemies[j];
            if (enemy.distance(enemy2) < 20) {
                const n = enemy.lerp(enemy2, -0.03);
                enemy.set(n.x, n.y);
            }
        }


        aim = lerp(aim, enemy.angle(player), 0.1);

        const arrow = Point.from_angle(aim, 10);
        draw_line(enemy.x, enemy.y, enemy.x + arrow.x, enemy.y + arrow.y, 4)


        if (rnd() < 0.1 && abs(aim, enemy.angle(player)) < 0.5) {
            const b = enemy.clone();
            b.dir = arrow.clone().normalize().mul(3);
            bullets.push(b);
        }

        fill_circle(enemy.x, enemy.y, 5, 5);
    }

    for (const b of bullets) {
        fill_rect(b.x - 1, b.y - 1, 3, 3, 7);
        if (b.distance(player) < 5) {
            fill_rect(0, 0, W, H, 7);
        }
        b.add(b.dir);
    }

    fill_circle(player.x, player.y, 4, 6);

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