import MiniSignal from 'mini-signals';
import {Container, Graphics} from 'pixi.js';
import Player from '../player';
import Collision from '../tiled/collision';
import ScreenShake from '../screen-shake';
import QuadTree from 'usfl/quad-tree';
import Camera from '../camera';
import tilemap from '../map';
import Barrier from '../barrier';
import Enemy from '../enemy';
import linkedList from 'usfl/linked-list';
import PooledList from '../utils/pooled-list';
import Explosion from '../explosion';
import End from '../end';

const {floor, random} = Math;

export default class World {
    constructor(app, map) {
        this.app = app;
        this.container = new Container();
        this.update = this.update.bind(this);
        this.levelComplete = new MiniSignal();
        this.gameOver = new MiniSignal();

        this.elapsed = 0;
        this.explodedAt = 0;

        this.container.addChild(
            new Graphics()
                .beginFill(map.bgColor)
                .drawRect(0, 0, map.width, map.height)
                .endFill()
        );

        const level = tilemap(map);
        this.container.addChild(level);
        this.layer = map.layer.background;
        this.enemies = linkedList(map.layer.enemies.objects.map(e => new Enemy(e)));

        const collectables = map.layer.collectables;
        console.log('-->', collectables);
        // this.qt = new QuadTree({x: 0, y: 0, width: this.layer.width, height: this.layer.height}, 3);
        this.qt = new QuadTree({x: 0, y: 0, width: this.layer.width, height: this.layer.height}, 2);
        const hearts = collectables.objects;
        // .map(b => new Barrier(b));
        this.qt.insert(hearts);
        // console.debug('-->', map.layer.markers.map.start);
        const {start, end} = map.layer.markers.map;

        console.log('start', start);

        this.barriers = linkedList(map.layer.barriers.objects.map(b => new Barrier(b)));

        // this.qt.insert(barriers);

        const {width, height} = this.app;

        this.player = new Player({
            app: this.app,
            container: this.container,
            layer: this.layer,
            start
        });

        this.collision = new Collision();

        this.camera = new Camera(this.player, this.container, width, height);

        this.screenShake = new ScreenShake(this.app.loop, this.app.stage);

        const colors = [0xff0000, 0xff9c00, 0xffba00];
        const textures = colors.map(c => app.renderer.generateTexture(
            new Graphics()
                .beginFill(c)
                .drawCircle(0, 0, 2)
                .endFill()
        ));

        this.explosions = new PooledList(() => {
            const explosion = new Explosion(textures);
            this.container.addChild(explosion.container);
            return explosion;
        });

        this.end = new End(end);
        // const a = map.layer.tilelayerA;
        // app.stage.interactive = true;
        // app.stage.on('mousedown', (event) => {
        //     console.log('event.data', event.data.global);
        //     const tile = a.tileAt(event.data.global.x, event.data.global.y);
        //     console.log('tile', tile);
        // });

        this.resize(app.width, app.height);
    }

    update(dt) {
        this.elapsed += dt;

        this.end.update();

        if (this.end.open && this.collision.intersects(this.player, this.end)) {
            this.levelComplete.dispatch();
            return;
        }

        this.player.update();

        if (!this.player.alive) {
            this.gameOver.dispatch('dead');
            return;
        }

        if (!this.player.power.fuel) {
            this.gameOver.dispatch('fuel');
            return;
        }

        let enemy = this.enemies.first;
        while (enemy) {
            enemy.update();
            enemy = enemy.next;
        }

        const colliding = this.collision.collide(this.player, this.layer);
        if (colliding) {
            // console.log('colliding:', colliding);
            // this.player.speed = 0;
            this.player.damage(1 + floor(2 * random()));
            this.screenShake.start();
            // this.explode(this.player);
        }

        this.camera.update();

        this.updateEnemies();

        this.updateBarriers();

        this.updateItems();

        this.updateExplosions();
    }

    explode(ob) {
        if (this.elapsed - this.explodedAt < 0.1) {
            return;
        }
        this.explosions.create().start(ob);
        this.explodedAt = this.elapsed;
    }

    updateExplosions() {
        let explosion = this.explosions.first;
        while (explosion) {
            const next = explosion.next;
            explosion.update();
            if (!explosion.alive) {
                this.explosions.remove(explosion);
            }
            explosion = next;
        }
    }

    updateEnemies() {
        let enemy = this.enemies.first;
        while (enemy) {
            if (this.collision.intersects(this.player, enemy)) {
                // console.log('ENEMY COLLISION');
                this.player.damage(10);
                this.screenShake.start();
                this.explode(this.player);
            }
            const next = enemy.next;
            let b = this.player.bullets.list.first;
            while (b) {
                if (this.collision.intersects(b, enemy)) {
                    this.explosions.create().start({
                        x: enemy.left,
                        y: enemy.top
                    });
                    enemy.destroy();
                    this.enemies.remove(enemy);
                    if (!this.enemies.length) {
                        this.end.open = true;
                    }
                    b = null;
                } else {
                    b = b.next;
                }
            }
            enemy = next;
        }
    }

    updateBarriers() {
        let barrier = this.barriers.first;
        while (barrier) {
            const next = barrier.next;
            barrier.update();

            if (barrier.gfx.visible && this.collision.intersects(this.player, barrier)) {
                // this.player.speed = -this.player.speed;
                this.player.damage(10);
                this.screenShake.start();
                this.explode(this.player);
            }

            barrier = next;
        }
    }

    updateItems() {
        const items = this.qt.retrieve(this.player);
        // console.log('qt items.length:', items.length);
        let l = items.length;
        while (--l > -1) {
            const item = items[l];

            if (typeof item.update === 'function') {
                item.update();
            }

            if (item.gfx.visible && this.collision.intersects(this.player, item)) {
                console.debug('collide', item.type);
                switch (item.type) {
                    case 'heart':
                        this.player.collect(item);
                        item.gfx.visible = false;
                        break;
                    default:
                }
            }
        }
    }

    resize(w, h) {
        console.log('World resize', w, h);
        this.w = w;
        this.h = h;
        if (this.camera) {
            this.camera.resize(w, h);
        }
    }

    destroy() {

    }
}
