import MiniSignal from 'mini-signals';
import {Container, Graphics, Texture} from 'pixi.js';
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
import Power from '../power';
import sono from 'sono';

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
        this.damagedAt = 0;

        this.container.addChild(
            new Graphics()
                .beginFill(map.bgColor)
                .drawRect(0, 0, map.width, map.height)
                .endFill()
        );

        const level = tilemap(map);
        this.container.addChild(level);
        this.layer = map.layer.background;
        const enemyTextures = [0, 1].map(n => Texture.from(`beetle_${n}`));
        this.enemies = linkedList(map.layer.enemies.objects.map(e => new Enemy(e, enemyTextures)));

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
        const explosionTextures = colors.map(c => app.renderer.generateTexture(
            new Graphics()
                .beginFill(c)
                .drawCircle(0, 0, 2)
                .endFill()
        ));

        this.explosions = new PooledList(() => {
            const explosion = new Explosion(explosionTextures);
            this.container.addChild(explosion.container);
            return explosion;
        });

        this.powers = new PooledList(() => {
            const power = new Power(Object.keys(this.player.power));
            this.container.addChild(power.container);
            return power;
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

        this.end.update(dt);

        if (this.end.open && this.collision.intersects(this.player, this.end)) {
            sono.play('exit');
            this.levelComplete.dispatch();
            return;
        }

        this.player.update(dt);

        if (!this.player.alive) {
            sono.play('dead');
            this.gameOver.dispatch('dead');
            return;
        }

        if (!this.player.power.fuel) {
            sono.play('dead');
            this.gameOver.dispatch('fuel');
            return;
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

        this.updatePowers();
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

    updatePowers() {
        let power = this.powers.first;
        while (power) {
            const next = power.next;
            power.update();
            if (this.collision.intersects(this.player, power)) {
                this.player.heal(power.type);
                power.collect();
                sono.play('power');
            }
            if (!power.alive) {
                this.powers.remove(power);
            }
            power = next;
        }
    }

    damageEnemy(enemy) {
        this.explode({
            x: enemy.left,
            y: enemy.top
        });
        if (this.elapsed - this.damagedAt > 0.02) {
            sono.play('damage');
            this.damagedAt = this.elapsed;
        }
    }

    destroyEnemy(enemy, powerup = true) {
        enemy.destroy();
        sono.get('wheesh').play(0.2);
        this.enemies.remove(enemy);
        if (!this.enemies.length) {
            this.end.open = true;
        }
        if (powerup) {
            this.powers.create().start({
                x: enemy.left,
                y: enemy.top
            });
        }
    }

    updateEnemies() {
        let enemy = this.enemies.first;
        while (enemy) {
            enemy.update();
            if (this.collision.intersects(this.player, enemy)) {
                // console.log('ENEMY COLLISION');
                this.player.damage(2);
                enemy.health -= 0.5;
                this.screenShake.start();
                this.explode(this.player);
                this.damageEnemy(enemy);
            }
            if (enemy.health < 0) {
                this.destroyEnemy(enemy, false);
                return;
            }
            const next = enemy.next;
            let b = this.player.bullets.list.first;
            while (b) {
                if (this.collision.intersects(b, enemy)) {
                    enemy.health -= 1;
                    this.damageEnemy(enemy);
                    if (enemy.health < 0) {
                        this.destroyEnemy(enemy, true);
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
                this.player.damage(1);
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
        this.w = w;
        this.h = h;
        if (this.camera) {
            this.camera.resize(w, h);
        }
    }

    destroy() {

    }
}
