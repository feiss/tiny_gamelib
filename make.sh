

# make readme.md

echo "# Tiny Gamelib for Game Jams" > readme.md
echo "
A tiny javascript library for making 2D games, with these features:

* Extremely simple, basic functionality and API
* 320 x 200 Indexed palette mode
* Basic sprite animation from individual image files
* Preload 
* ...

">> readme.md

echo "# API" >> readme.md
echo "

## User entry functions

in \`game.js\`, implement the following functions and they will be called when needed. 
You don't need to hook anything. Only \`loop()\` is mandatory, the rest of functions are optional.

\`\`\`js

function preload();
function loading(progress);
function start();

function keydown(key_name);
function keyup(key_name);

function loop(time, dt);
\`\`\`

## Global constants and variables

\`\`\`js
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
\`\`\`

## Global functions

\`\`\`js
// \`pal\` is an array with '#rrggbb' colors
// \`color\` is an integer for the palette index" >> readme.md
cat src/engine.js | grep -e "^function\s[a-z]" |sed 's/^\(.*\)..$/\1;/' >> readme.md
echo "\`\`\`" >> readme.md
