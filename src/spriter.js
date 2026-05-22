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
    if (ev.key == 'F2') {
        export_data();
    }
});

class Spriter {
    constructor() {
        this.active = false;
        this.brush = 0;
        this.current_asset = null;

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

    toggle() {
        this.refresh_asset_list();
        this.active = !this.active;
        this.el.style.display = this.active ? 'block' : 'none';
        if (!this.active) {
            // save backup in localstorage
            try {
                localStorage.setItem('data.data', pack_data());
            } catch (err) {
                console.error(err);
            }
        }
    }

    loop(t, dt) {

        // this.canvas.fill_rect(0, 0, W, H, 0);
        // for (let i = 0; i < palette.length; i++) {
        //     this.canvas.fill_rect(0, i * 10, 10, 10, i);
        // }

        // if (this.current_asset) {
        //     this.canvas.draw_image(this.current_asset, 0, 0);
        //     this.canvas.draw_rect(0, 0, assets[this.current_asset].width, assets[this.current_asset].height, 7);
        // }

        // const mx = mouse.x + canvas.
        if (this.canvas) {
            const mx = floor(((mouse.x * SCALE + canvas.canvas.offsetLeft) - this.canvas.canvas.offsetLeft) / this.canvas.scale);
            const my = floor(((mouse.y * SCALE + canvas.canvas.offsetTop) - this.canvas.canvas.offsetTop) / this.canvas.scale);


            if (mouse.just_right) {
                this.brush = this.canvas.pget(mx, my);
            }
            if (mouse.just_left) {
                if (this.current_asset) {
                    // modify the image data of the current asset
                    const offcanvas = assets[this.current_asset];
                    const ctx = offcanvas.getContext('2d');
                    const imageData = ctx.getImageData(0, 0, offcanvas.width, offcanvas.height);
                    const x = mx;
                    const y = my;
                    const index = this.brush;
                    const color = palette[index];
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    const i = (y * offcanvas.width + x) * 4;
                    imageData.data[i] = r;
                    imageData.data[i + 1] = g;
                    imageData.data[i + 2] = b;
                    imageData.data[i + 3] = 255;
                    ctx.putImageData(imageData, 0, 0);

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

        if (this.canvas) this.canvas.destroy();
        this.canvas = new Canvas(asset.width, asset.height, 6, $('#spriter_canvas'));

    }

    #new_asset(ev) {
    }

    #remove_asset(ev) {
        if (this.current_asset) {
            const el = this.asset_list.querySelector('.active');
            if (!el) return;
            el.parentNode.removeChild(el);
            delete assets[this.current_asset];
            this.canvas.destroy();
        }
    }


    #force_reload_from_file() {
        fetch('data.data').then(res => res.json()).then(data => {
            __load_data(data);
            this.refresh_asset_list();
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

function export_data() {
    downloadFile('data.data', pack_data());
}

function pack_data() {
    const d = {};
    d['assets'] = {};
    for (const a in assets) {
        d['assets'][a] = assets[a].toDataURL();
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