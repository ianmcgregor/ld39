import Hud from '../hud';
// this.hud = new Hud({app, container});
import {Container} from 'pixi.js';
import Screen from '../screens/screen';
import World from '../world';
import sono from 'sono';

export default class Game extends Screen {
    constructor(app) {
        super();
        this.app = app;
        this.container = new Container();
        this.update = this.update.bind(this);
        this.elapsed = 0;
        this.suspenseAt = 0;
    }

    initLevel(level) {
        this.level = level;
        this.app.level = level;
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
        if (this.app.level) {
            this.initLevel(this.app.level);
        } else {
            this.initLevel(this.app.levels.first);
        }
        this.resize(this.w, this.h);

        sono.get('back').fade(0, 1);
        window.setTimeout(() => {
            sono.get('music').volume = 1;
            sono.get('music').stop().play();
            sono.get('suspense').volume = 0;
            sono.get('suspense').stop().play();
        }, 1000);
    }

    update(dt) {
        this.world.update(dt);
        this.hud.update(dt);

        this.elapsed += dt;

        if (this.elapsed - this.suspenseAt > 18) {
            this.suspenseAt = this.elapsed;
            const suspense = sono.get('suspense');
            if (suspense.volume > 0.5) {
                suspense.fade(0, 4.5);
            } else {
                suspense.fade(1, 4.5);
            }
        }
    }

    destroyLevel() {
        this.levelCompleteListener.detach();
        this.gameOverListener.detach();
        this.world.destroy();
        this.container.removeChild(this.world.container);
        this.updateListener.detach();
        sono.stop('noise');
        sono.stop('engine');
    }

    onLevelComplete() {
        // console.log('LEVEL COMPLETE');
        this.destroyLevel();

        if (this.level.next) {
            this.initLevel(this.level.next);
            this.start();
        } else {
            this.screens.goto('game-complete');
        }
    }

    onGameOver(reason) {
        // console.log('onGameOver', reason);
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
