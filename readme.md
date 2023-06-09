# Tiny Gamelib for Game Jams

A tiny javascript library for making 2D games, with these features:

* Extremely simple, basic functionality and API
* 320 x 200 Indexed palette mode
* Basic sprite animation from individual image files
* Preload 
* ...


# API


## User entry functions

in `game.js`, implement the following functions and they will be called when needed. 
You don't need to hook anything. Only `loop()` is mandatory, the rest of functions are optional.

```

function preload() 
function loading(progress) 
function start() 

function keydown(key_name) 
function keyup(key_name) 

function loop(time, dt)
```

## Global constants and variables

```
const SCALE; // set it in index.html
const W;
const H;
const floor = Math.floor;
const rnd = Math.random;

const keys = {};  // if (keys['a'] == true) ...
const mouse = {
    left: bool,
    middle: bool,
    right: bool,
    just_left: bool,
    just_middle: bool,
    just_right: bool,
    x: int,
    y: int,
    vx: int,
    vy: int,
    downx: int,
    downy: int,
    prevx: int,
    prevy: int,
};
```

```
function set_palette(pal) 
function fill_rect(x, y, w, h, color) 
function draw_rect(x, y, w, h, color) 
function draw_text(text, x, y, color) 
function draw_circle(x, y, r, color) 
function fill_circle(cx, cy, r, color) 
function draw_image(img, x, y) 
function new_sprite(name, animations, anchor_x, anchor_y) 
function update_sprite(name, dt) 
function set_sprite_animation(sprite, animation) 
function draw_sprite(name, x, y) 
function pset(x, y, color) 
function pget(x, y) 
function draw_line(x1, y1, x2, y2, color) 
```
