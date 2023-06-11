
//  From the game loop, call `chasers_game(t, dt);`

let enemies = [];
let aim = 0;
let player = new Point(W / 2, H / 2);
let player_speed = new Point(0, 0);
let bullets = [];
const PLAYER_ACCEL = 0.4;
let use_mouse = false;

function chasers_game(t, dt) {

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
