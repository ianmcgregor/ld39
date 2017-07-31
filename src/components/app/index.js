import {autoDetectRenderer, Container, loaders} from 'pixi.js';
import eventBus from 'usfl/events/eventBus';
import resize from 'usfl/dom/resize';
import Ticker from 'usfl/ticker';
import MiniSignal from 'mini-signals';

const {round, min, max} = Math;

export default class App {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.update = this.update.bind(this);
        this.safeSize = {
            width,
            height
        };
        this.maxSize = {
            width: 1920,
            height: 1080
        };
        this.renderer = autoDetectRenderer(width, height, {
            backgroundColor: 0x201e1e,
            antialias: false,
            preserveDrawingBuffer: false,
            resolution: 1,
            roundPixels: false,
            transparent: false
        });
        this.view = this.renderer.view;
        document.body.appendChild(this.view);
        this.container = new Container();
        this.stage = this.container.addChild(new Container());
        this.view.style.position = 'absolute';
        this.view.addEventListener('mousedown', () => window.focus());

        this.loader = new loaders.Loader();

        this.loop = new Ticker();
        // this.loop = new Loop();
        this.loop.add(this.update, this);
        this.loop.start();

        this.resize = new MiniSignal();
        eventBus.on('resize', () => this._resize(window.innerWidth, window.innerHeight));
        this._resize(window.innerWidth, window.innerHeight);
        resize(50);
    }

    update() {
        this.renderer.render(this.container);
    }

    _resize(w, h) {
        // const density = min(2, window.devicePixelRatio || 1);
        const density = 1;

        const {width: safeW, height: safeH} = this.safeSize;
        const {width: maxW, height: maxH} = this.maxSize;

        const safeScale = min(w / safeW, h / safeH);
        const fitW = min(safeW * safeScale, w);
        const fitH = min(safeH * safeScale, h);

        const maxScale = min(w / maxW, h / maxH);
        const fullW = max(fitW, min(maxW * maxScale, w));
        const fullH = max(fitH, min(maxH * maxScale, h));

        this.renderer.resize((fullW * density) | 0, (fullH * density) | 0);

        this.view.style.width = `${fullW}px`;
        this.view.style.height = `${fullH}px`;
        this.view.style.left = `${(w - fullW) / 2}px`;
        this.view.style.top = `${(h - fullH) / 2}px`;

        // this.stage.x = (fullW - fitW) * density / 2;
        // this.stage.y = (fullH - fitH) * density / 2;
        this.stage.scale.set(safeScale * density);


        this.width = round(fullW / safeScale);
        this.height = round(fullH / safeScale);

        console.log('app w/h', this.width, this.height);

        this.resize.dispatch(this.width, this.height);
    }
}
