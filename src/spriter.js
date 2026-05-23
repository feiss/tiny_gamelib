let spriter;

let $ = q => document.querySelector(q);
let $$ = q => document.querySelectorAll(q);
let $new = (tag, opts) => {
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

class Spriter {
    constructor() {
        this.active = false;
        this.brush = 0;
        this.current_asset = null;
        this.current_asset_ctx = null;

        this.canvas = null;

        this.el = $new('div');
        this.el.id = 'spriter';
        this.asset_list = $new('div');
        this.asset_list.className = 'asset_list';

        const toolbar = $new('div', { class: 'toolbar' });
        let button;

        button = $new('button', { text: 'EXPORT DATA.DATA (F2)' });
        button.addEventListener('click', export_data);
        toolbar.appendChild(button);

        button = $new('button', { text: 'FORCE RELOAD FROM FILE' });
        button.addEventListener('click', this.#force_reload_from_file.bind(this));
        toolbar.appendChild(button);


        button = $new('button', { text: 'NEW ASSET' });
        button.addEventListener('click', this.#new_asset.bind(this));
        toolbar.appendChild(button);

        button = $new('button', { text: 'REMOVE ASSET' });
        button.addEventListener('click', this.#remove_asset.bind(this));
        toolbar.appendChild(button);

        this.el.appendChild(toolbar);
        this.el.appendChild(this.asset_list);
        document.body.appendChild(this.el);
    }

    async toggle() {
        this.refresh_asset_list();
        this.active = !this.active;
        this.el.style.display = this.active ? 'block' : 'none';
        this.el.style.display = this.active ? 'block' : 'none';
        if (!this.active) {
            // save backup in localstorage
            if (this.canvas) this.canvas.destroy();
            this.canvas = null;
            try {
                const data = await pack_data();
                localStorage.setItem('data.data', data);
            } catch (err) {
                console.error(err);
            }
        }
    }

    loop(t, dt) {
        if (this.canvas) {
            const mx = floor(((mouse.x * SCALE + canvas.canvas.offsetLeft) - this.canvas.canvas.offsetLeft) / this.canvas.scale);
            const my = floor(((mouse.y * SCALE + canvas.canvas.offsetTop) - this.canvas.canvas.offsetTop) / this.canvas.scale);


            if (mouse.just_right) {
                this.brush = this.canvas.pget(mx, my);
            }
            if (mouse.left) {
                if (this.current_asset_ctx) {
                    const imageData = this.current_asset_ctx.getImageData(mx, my, 1, 1);
                    const color = palette.get_rgb(this.brush);
                    imageData.data[0] = color[0];
                    imageData.data[1] = color[1];
                    imageData.data[2] = color[2];
                    imageData.data[3] = 255;
                    this.current_asset_ctx.putImageData(imageData, mx, my);
                }
            }
            this.canvas.draw_image(this.current_asset, 0, 0);
            this.canvas.render();
        }
    }


    refresh_asset_list() {
        this.asset_list.innerHTML = '';
        for (const asset in assets) {
            const item = $new('a');
            item.textContent = asset;
            item.dataset.file = asset;
            item.addEventListener('click', this.#edit_asset.bind(this));
            this.asset_list.appendChild(item);
        }
    }

    #edit_asset(ev) {
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
        this.current_asset_ctx = asset.getContext('2d');


        if (this.canvas) this.canvas.destroy();
        this.canvas = new Canvas(asset.width, asset.height, 6, $('#spriter_canvas'));
    }

    #new_asset(ev) {
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

    #remove_asset(ev) {
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
