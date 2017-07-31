import Hud from '../hud';
// this.hud = new Hud({app, container});
import {Container} from 'pixi.js';
import Screen from '../screens/screen';
import World from '../world';
import linkedList from 'usfl/linked-list';
import TileMap from '../tiled/tile-map';

export default class Game extends Screen {
    constructor(app) {
        super();
        this.app = app;
        this.container = new Container();
        this.update = this.update.bind(this);

        this.levels = linkedList([
            {name: '1', map: new TileMap(this.app.loader.resources.level00.data)},
            {name: '2', map: new TileMap(this.app.loader.resources.level01.data)},
            {name: '3', map: new TileMap(this.app.loader.resources.level02.data)}
        ]);
    }

    initLevel(level) {
        this.level = level;
        this.world = new World(this.app, level.map);
        this.container.addChildAt(this.world.container, 0);
        this.levelCompleteListener = this.world.levelComplete.add(() => this.onLevelComplete());
        this.gameOverListener = this.world.gameOver.add(reason => this.onGameOver(reason));
        if (!this.hud) {
            this.hud = new Hud(this.world);
            this.container.addChild(this.hud.container);
        }
        this.hud.init(this.world, level.name);
    }

    onShow() {
        this.initLevel(this.levels.first);
        this.resize(this.w, this.h);
    }

    update(dt) {
        this.world.update(dt);
        this.hud.update(dt);
    }

    destroyLevel() {
        this.levelCompleteListener.detach();
        this.gameOverListener.detach();
        this.world.destroy();
        this.container.removeChild(this.world.container);
        this.updateListener.detach();
    }

    onLevelComplete() {
        console.log('LEVEL COMPLETE');
        this.destroyLevel();

        if (this.level.next) {
            this.initLevel(this.level.next);
            this.start();
        } else {
            this.screens.goto('game-complete');
        }
    }

    onGameOver(reason) {
        console.log('onGameOver', reason);
        this.app.gameOverReason = reason;
        this.destroyLevel();
        this.screens.goto('game-over');
    }

    start() {
        this.updateListener = this.app.loop.add(this.update);
    }

    onShown() {
        this.start();
    }

    onHide() {
    }

    onHidden() {
        this.updateListener.detach();
    }

    resize(w, h) {
        super.resize(w, h);
        if (this.world) {
            this.world.resize(w, h);
        }
    }
}
