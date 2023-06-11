
let $ = q => document.querySelector(q);
let $$ = q => document.querySelectorAll(q);
let $new = (el, opts) => {
    const a = document.createElement(el);
    if (opts) {
        if (opts['class']) a.className = opts['class'];
        if (opts['id']) a.id = opts['id'];
    }
    return a;
};


window.addEventListener("keydown", ev => {
    if (ev.key == 'Escape') {
        spriter.toggle();
    }
    if (ev.key == 'F2') {
        export_data();
    }
});

class Spriter {
    constructor(assets) {
        this.active = false;
        this.brush = 0;
        this.current_asset = null;

        this.el = $new('div');
        this.el.id = 'spriter';
        this.asset_list = $new('div');
        this.asset_list.className = 'asset_list';

        const toolbar = $new('div', { class: 'toolbar' });
        const export_button = $new('button');
        export_button.textContent = 'EXPORT DATA.DATA (F2)';
        export_button.addEventListener('click', export_data);
        toolbar.appendChild(export_button);
        this.el.appendChild(toolbar);
        this.el.appendChild(this.asset_list);
        document.body.appendChild(this.el);
    }

    toggle() {
        this.refresh_asset_list();
        this.active = !this.active;
        this.el.style.display = this.active ? 'block' : 'none';
    }

    loop(t, dt) {
        fill_rect(0, 0, W, H, 0);
        for (let i = 0; i < palette.length; i++) {
            fill_rect(0, i * 10, 10, 10, i);
        }

        if (this.current_asset) {
            draw_image(this.current_asset, 11, 11);
        }

        if (mouse.just_right) {
            this.brush = pget(mouse.x, mouse, y);
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
    }

}

let spriter = new Spriter();



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
    const d = {};
    d['assets'] = {};
    for (const a in assets) {
        d['assets'][a] = assets[a].src;
    }
    downloadFile('data.data', JSON.stringify(d));
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