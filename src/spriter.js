let spriter;

let $ = q => document.querySelector(q);
let $$ = q => document.querySelectorAll(q);
let $create = (tag, opts) => {
    const el = document.createElement(tag);
    if (opts) {
        if (opts['class']) el.className = opts['class'];
        if (opts['id']) el.id = opts['id'];
        if (opts['text']) el.textContent = opts['text'];

    }
    return el;
};


window.addEventListener("keydown", ev => {
    if (ev.key == 'Escape') {
        if (spriter === undefined) {
            spriter = new Spriter();
        }
        spriter.toggle();
    }
    if (spriter === undefined || !spriter.active) return;

    if (ev.key == 'F2') {
        export_data();
    }
    if ('0123456789'.split('').indexOf(ev.key) !== -1) {
        spriter.brush = parseInt(ev.key);
    }
});

document.body.onload = ev => {
    spriter = new Spriter();
    spriter.toggle();
};



class Spriter {
    constructor() {
        this.BRUSH_SIZES = [1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 26];
        this.active = false;
        this.fg_color = 1;
        this.bg_color = 0;
        this.brush_size = 0;
        this.current_asset = null;
        this.current_asset_ctx = null;

        this.canvas = null;
        this.zoom = 10;

        this.copy_buffer = new OffscreenCanvas(1, 1);

        this.el = $create('div');
        this.el.id = 'spriter';

        const toolbar = $create('div', { class: 'toolbar' });
        let button;

        button = $create('button', { text: 'SAVE' });
        button.addEventListener('click', save_data);
        toolbar.appendChild(button);


        button = $create('button', { text: 'EXPORT DATA.DATA (F2)' });
        button.addEventListener('click', export_data);
        toolbar.appendChild(button);

        button = $create('button', { text: 'RELOAD FROM FILE' });
        button.addEventListener('click', this.#force_reload_from_file.bind(this));
        toolbar.appendChild(button);

        button = $create('button', { text: 'PAUSE' });
        button.addEventListener('click', __pause);
        toolbar.appendChild(button);


        this.asset_list = $create('div', { class: 'asset_list' });
        this.right_panel = create_right_panel(this);
        this.editor = create_canvas_editor(this);

        const body = $create('div', { id: 'spriter_body' });
        body.appendChild(this.asset_list);
        body.appendChild(this.editor);
        body.appendChild(this.right_panel);

        this.el.appendChild(toolbar);
        this.el.appendChild(body);
        document.body.appendChild(this.el);


        // color picker
        this.color_picker = $create("input");
        this.color_picker.type = "color";
        this.color_picker.style.position = "absolute";
        this.color_picker.style.left = "-9999px";
        this.color_picker.addEventListener("input", this.edit_color.bind(this));
        this.color_picker.click();

        document.body.appendChild(this.color_picker);
    }

    async toggle() {
        this.refresh_asset_list();
        this.active = !this.active;
        this.el.style.display = this.active ? 'block' : 'none';
        if (!this.active) {
            // save backup in localstorage
            if (this.canvas) this.canvas.destroy();
            this.canvas = null;
            save_data();
        } else {
            this.loop(0);
        }

    }

    loop(t) {
        if (this.canvas) {
            const mx = floor(((mouse.x * SCALE + canvas.canvas.offsetLeft) - this.canvas.canvas.offsetLeft) / this.canvas.scale);
            const my = floor(((mouse.y * SCALE + canvas.canvas.offsetTop) - this.canvas.canvas.offsetTop) / this.canvas.scale);


            // if (mouse.just_right) {
            //     this.set_fgcolor(__ctx_pget(this.current_asset_ctx, mx, my));
            // }
            if (mouse.left || mouse.right) {
                if (this.current_asset_ctx) {
                    this.current_asset_ctx.fillStyle = palette.get_hex(mouse.left ? this.fg_color : this.bg_color);
                    const brush_size = this.BRUSH_SIZES[this.brush_size];
                    if (brush_size == 1) {
                        __ctx_fill_rect(this.current_asset_ctx, mx, my, 1, 1);

                    } else {
                        __ctx_fill_rect(this.current_asset_ctx, mx - brush_size / 2, my - brush_size / 2, brush_size, brush_size);
                    }
                }
            }
            this.canvas.draw_image(this.current_asset, 0, 0);
            this.canvas.render();
        }
        if (this.active) requestAnimationFrame(this.loop.bind(this));
    }

    set_fgcolor(i) {
        $('#palette_index_' + this.fg_color).classList.remove('fgcolor');
        this.fg_color = i;
        $('#palette_index_' + this.fg_color).classList.add('fgcolor');
    }

    set_bgcolor(i) {
        $('#palette_index_' + this.bg_color).classList.remove('bgcolor');
        this.bg_color = i;
        $('#palette_index_' + this.bg_color).classList.add('bgcolor');
    }

    refresh_asset_list() {
        this.asset_list.innerHTML = '';
        const keys = Object.keys(assets).sort();
        for (let k of keys) {
            const item = $create('a');
            if (k == this.current_asset) {
                item.classList.add('active');
            }
            item.textContent = k;
            item.dataset.file = k;
            item.addEventListener('click', this.#edit_asset.bind(this));
            this.asset_list.appendChild(item);
        }
    }

    #edit_asset(ev) {
        this.editor.style.display = 'block';

        for (let i = 0; i < this.asset_list.children.length; i++) {
            const el = this.asset_list.children[i];
            el.classList.remove('active');
        }
        ev.target.classList.add('active');

        this.current_asset = ev.target.dataset.file;
        const asset = assets[this.current_asset];
        if (!asset) {
            error("Invalid asset", this.current_asset)
            return;
        }
        this.current_asset_ctx = asset.getContext('2d', {
            antialias: false,
            alpha: false,
            willReadFrequently: true,
            preserveDrawingBuffer: true,
        });

        if (this.canvas) this.canvas.destroy();
        this.canvas = new Canvas(asset.width, asset.height, this.zoom, this.editor);

        this.update_palette();
    }

    new_asset(ev) {
        let name = prompt("Name?");
        if (!name || !name.trim()) {
            return;
        }

        let size = prompt("Size (wxh)?");
        if (!size) {
            return;
        }
        size = size.trim().split('x');
        const w = parseInt(size[0]);
        const h = parseInt(size[1]);
        if (!w || !h) {
            warn(`invalid dimensions ${w}x${h}`);
        }
        assets[name] = new OffscreenCanvas(w, h);

        this.refresh_asset_list();
    }

    rename_asset(ev) {
        if (!this.current_asset) return;
        let name = prompt("Name:", this.current_asset);
        if (!name || !name.trim()) {
            return;
        }
        assets[name] = assets[this.current_asset];
        delete assets[this.current_asset];
        this.current_asset = name;
        this.refresh_asset_list();
    }

    remove_asset(ev) {
        if (this.current_asset) {
            const el = this.asset_list.querySelector('.active');
            if (!el) return;
            el.parentNode.removeChild(el);
            delete assets[this.current_asset];
            this.canvas.destroy();
            this.canvas = null;
        }
    }


    #force_reload_from_file() {
        fetch('data.data').then(res => res.json()).then(data => {
            __load_data(data, this.refresh_asset_list.bind(this));
            log("force reloaded from file data.data");
        });
    }

    duplicate_asset() {
        if (!this.current_asset) return;
        const new_asset = __ctx_clone(assets[this.current_asset]);
        assets[this.current_asset + "_copy"] = new_asset;
        this.refresh_asset_list();
    }

    edit_color() {
        const color = this.color_picker.value;
        palette.set_hex(this.fg_color, color);
        $('#palette_index_' + this.fg_color).style.backgroundColor = color;
    }

    update_palette() {
        const pal = $('.pal');
        pal.innerHTML = '';
        for (let i = 0; i < palette.length(); i++) {
            const button = $create('button');
            button.style.backgroundColor = palette.get_hex(i);
            button.addEventListener('click', this.set_fgcolor.bind(this, i));
            button.addEventListener('dblclick', () => { this.color_picker.value = palette.get_hex(this.fg_color); this.color_picker.click() });
            button.addEventListener('contextmenu', this.set_bgcolor.bind(this, i));
            button.id = "palette_index_" + i;
            pal.appendChild(button);
        }
        this.set_fgcolor(this.fg_color);
        this.set_bgcolor(this.bg_color);
    }

}




// drag & drop

let dropZone = document.body;
dropZone.addEventListener('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

dropZone.addEventListener('drop', function (e) {
    e.stopPropagation();
    e.preventDefault();
    let files = e.dataTransfer.files; // Array of all files
    if (files.length == 0) { return; }

    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onload = function (e2) {
            filename = files[i].name;
            const img = new Image();
            img.src = e2.target.result;
            assets[filename] = img;
            spriter.refresh_asset_list();
        }
        reader.readAsDataURL(files[i]);
    }
});



async function save_data() {
    try {
        const data = await pack_data();
        localStorage.setItem('data.data', data);
    } catch (err) {
        console.error(err);
    }

}

async function export_data() {
    const data = await pack_data();
    downloadFile('data.data', data);
}


async function pack_data() {
    const d = { assets: {} };
    for (const key in assets) {
        d.assets[key] = await __convertToBase64(assets[key]);
    }
    return JSON.stringify(d);
}


function downloadFile(filename, data) {
    const blob = new Blob([data], { type: 'application/octet-stream' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


function __convertToBase64(canvas) {
    return canvas.convertToBlob().then(blob => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    });
}


function create_canvas_editor(spriter) {
    const div = $create('div', { id: 'canvas_editor' });
    const tools = $create('div', { class: 'tools' });
    const pal = $create('div', { class: 'pal' });

    let button;

    const TOOLS = [
        { text: '-', func: () => { spriter.brush_size = Math.max(spriter.brush_size - 1, 0); $('#brush_size').textContent = spriter.BRUSH_SIZES[spriter.brush_size]; } },
        { text: '1', func: () => { } },
        { text: '+', func: () => { spriter.brush_size = Math.min(spriter.brush_size + 1, spriter.BRUSH_SIZES.length - 1); $('#brush_size').textContent = spriter.BRUSH_SIZES[spriter.brush_size]; } },
        { text: '----', func: null },
        { text: 'DRAW', func: null },
        { text: 'RECT', func: null },
        { text: 'LINE', func: null },
        { text: 'CIRCLE', func: null },
        { text: '----', func: null },
        { text: 'G COPY', func: () => { palette.copy(spriter.fg_color, spriter.bg_color); spriter.update_palette(); } },
        { text: 'G SWAP', func: () => { const fg = palette.swap(spriter.fg_color, spriter.bg_color); spriter.update_palette(); } },
        { text: 'G RAMP', func: () => { palette.make_ramp(spriter.fg_color, spriter.bg_color); spriter.update_palette(); } },
    ];

    for (const tool of TOOLS) {
        if (tool.text == '----') button = $create('span', { text: ' ' });
        else {
            button = $create('button', { text: tool.text });
            button.addEventListener('click', tool.func);
            if (tool.text == '1') button.id = 'brush_size';
        }
        tools.appendChild(button);
    }

    div.appendChild(tools);
    div.appendChild(pal);
    return div;
}


function create_right_panel(spriter) {
    const div = $create('div', { class: 'right_panel' });

    const BUTTONS = [
        { text: 'NEW', func: spriter.new_asset.bind(spriter) },
        { text: 'NAME', func: spriter.rename_asset.bind(spriter) },
        { text: 'X', func: spriter.remove_asset.bind(spriter) },
        { text: '----', func: null },
        { text: 'COPY', func: () => { __ctx_copy(spriter.current_asset_ctx, spriter.copy_buffer, true); } },
        { text: 'PASTE', func: () => { __ctx_copy(spriter.copy_buffer, spriter.current_asset_ctx, false); } },
        { text: '----', func: null },
        { text: 'DUP', func: spriter.duplicate_asset.bind(spriter) },
        { text: 'ERASE', func: () => { const ctx = spriter.current_asset_ctx; __ctx_fill_rect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height); } },
        { text: '----', func: null },
        { text: 'RESIZE', func: null },
        { text: '----', func: null },
        { text: 'OFFSET' },
        { text: '----', func: null },
        { text: '-X', func: (ev) => { __ctx_offset(spriter.current_asset_ctx, -1, 0); } },
        { text: 'X', func: (ev) => { __ctx_offset(spriter.current_asset_ctx, 1, 0); } },
        { text: '-Y', func: (ev) => { __ctx_offset(spriter.current_asset_ctx, 0, -1); } },
        { text: 'Y', func: (ev) => { __ctx_offset(spriter.current_asset_ctx, 0, 1); } },
        { text: '----', func: null },
        { text: 'FLIP' },
        { text: 'X', func: () => { __ctx_flip(spriter.current_asset_ctx, true); } },
        { text: 'Y', func: () => { __ctx_flip(spriter.current_asset_ctx, false); } },
        { text: '----', func: null },
        { text: 'UNDOS' },
        { text: 'A', func: null },
        { text: 'B', func: null },
        { text: '----', func: null },
        { text: 'C', func: null },
        { text: 'D', func: null },
        { text: '----', func: null },
        { text: '✅', func: null },
        { text: 'SHEET' },
        { text: '16', func: null, disabled: true },
        { text: '----', func: null },
        { text: '<<', func: null, disabled: true },
        { text: '<', func: null, disabled: true },
        { text: '>', func: null, disabled: true },
        { text: '>>', func: null, disabled: true },
        { text: '----', func: null },
        { text: '✅', func: null, disabled: true },
        { text: 'ONION' },
    ];

    let item;
    for (const but of BUTTONS) {
        if (but.text == '----') item = $create('br');
        else if (but.text == '✅') {
            item = $create('input');
            item.type = 'checkbox';
        }
        else if (but['func'] === undefined) {
            item = $create('span', { text: but.text });
        } else {
            item = $create('button', { text: but.text });
            item.addEventListener('click', but.func);
        }
        if (but['disabled'] === true) {
            item.disabled = true;
        }
        div.appendChild(item);
    }

    return div;
}
