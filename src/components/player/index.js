import Particle from 'usfl/particle';
import ParticleGroup from 'usfl/particle/ParticleGroup';
import rotatePoint from 'usfl/math/rotatePoint';
import keyInput from 'usfl/input/keyInput';
import radians from 'usfl/math/radians';
import {Container, Graphics, Sprite} from 'pixi.js';
import sono from 'sono';
const {random} = Math;

export default class Player extends Particle {
    constructor({app, container, start, layer}) {
        super({
            x: start.x,
            y: start.y,
            radius: 16,
            friction: 0.95,
            bounce: {x: -0.2, y: -0.2}
            // bounce: {x: 0, y: 0}
        });

        this.elapsed = 0;
        this.shotAt = 0;
        this.damagedAt = 0;

        this.maxPower = 100;
        this.counter = 0;

        this.layer = layer;
        this.speed = 0.01;
        this.angle = radians(start.rotation || 0);

        // console.log('start.rotation', start.rotation, radians(start.rotation));
        // console.log('this.angle', this.angle);
        this.power = {
            shields: this.maxPower,
            weapons: this.maxPower,
            fuel: this.maxPower
        };

        this.gfx = container.addChild(new Container());
        const truck = this.gfx.addChild(Sprite.from('truck'));
        truck.anchor.set(0.5);

        this.shield = this.gfx.addChild(Sprite.from('shield'));
        this.shield.anchor.set(0.5);

        const thrustTexture = app.renderer.generateTexture(
            new Graphics().beginFill(0xffff00).drawCircle(0, 0, 1).endFill()
        );
        this.thrust = new ParticleGroup(() => {
            const p = new Particle({
                radius: 1
            });
            p.gfx = container.addChild(Sprite.from(thrustTexture));
            return p;
        });

        const bulletTexture = app.renderer.generateTexture(
            new Graphics().beginFill(0x00ffff).drawCircle(0, 0, 2).endFill()
        );
        this.bullets = new ParticleGroup(() => {
            const p = new Particle({
                radius: 2
            });
            p.gfx = container.addChild(Sprite.from(bulletTexture));
            return p;
        });

        this.input = keyInput();
    }

    update(dt) {
        super.update();

        this.elapsed += dt;

        if (this.input.left()) {
            this.angle -= 0.05;
        }

        if (this.input.right()) {
            this.angle += 0.05;
        }

        const forward = this.power.fuel > 0 && this.input.up();
        const reverse = this.power.fuel > 0 && this.input.down();
        const moving = forward || reverse;
        const accel = moving ? 0.1 : 0;
        let carAngle = this.angle;
        if (this.inReverse) {
            carAngle = carAngle + Math.PI;
        }
        // const accel = forward ? 0.1 : 0;
        if (reverse && !this.inReverse) {
            this.inReverse = true;
            this.angle -= Math.PI;
        }
        if (forward && this.inReverse) {
            this.inReverse = false;
            this.angle += Math.PI;
            this.speed = 0.001;
        }
        if (accel === 0 && this.speed === 0) {
            this.speed = 0.001;
        }
        this.accellerate(accel, this.angle);
        // this.bounce.x = this.bounce.y = -1;

        if (forward) {
            const p = this.thrust.create({
                x: -18,
                y: 0,
                speed: -1 + -1 * random(),
                angle: -Math.PI / 16 + Math.PI / 8 * random()
            });
            rotatePoint({x: this.x - 18, y: this.y}, this.angle, this, p);
            p.angle = this.angle + (-Math.PI / 16 + Math.PI / 8 * random()) + Math.PI;
            p.lifeTime = 30;
            p.gfx.visible = true;
            this.power.fuel -= this.maxPower / 1000;
            if (this.power.fuel < 0) {
                this.power.fuel = 0;
            }
        }

        if (forward || reverse) {
            sono.play('engine');
            sono.get('engine').fade(1, 0.1);
        }

        if (!forward && !reverse) {
            sono.get('engine').fade(0, 0.2);
        }

        this.thrust.update((p) => {
            p.gfx.position.set(p.x, p.y);
            p.lifeKill();
            if (!p.alive) {
                p.gfx.visible = false;
            }
        });

        if (this.power.weapons > 0 && this.input.space()) {
            const bulletAngle = this.angle - Math.PI / 32 + Math.PI / 16 * random();
            const p = this.bullets.create({
                x: this.x + 10,
                y: this.y,
                speed: 8 + random() * 4,
                angle: bulletAngle,
                lifeTime: 20
            });
            rotatePoint({x: this.x + 10, y: this.y}, this.angle, this, p);
            p.gfx.visible = true;

            if (this.elapsed - this.shotAt > 0.05) {
                sono.play('shoot');
                this.shotAt = this.elapsed;
            }
            // this.accellerate(0.05, this.angle + Math.PI);
            this.power.weapons -= this.maxPower / 200;
            if (this.power.weapons < 0) {
                this.power.weapons = 0;
            }
        }

        this.bullets.update((p) => {
            p.gfx.position.set(p.x, p.y);
            // p.edgeRemove();
            p.lifeKill();
            // hit wall:
            if (this.layer.tileAt(p.x, p.y)) {
                p.alive = false;
            }
            if (!p.alive) {
                p.gfx.visible = false;
            }
        });

        // ship.edgeWrap();
        // ship.edgeStop();
        this.gfx.position.set(this.x, this.y);
        this.gfx.rotation = carAngle;

        this.counter += 0.05;
        this.shield.alpha = 0.6 + Math.sin(this.counter) * 0.2;
        this.shield.scale.set(1 + Math.cos(this.counter) * 0.05);
    }

    damage(x = 0.5) {
        if (this.elapsed - this.damagedAt > 0.05) {
            sono.play('damage');
            this.damagedAt = this.elapsed;
        }
        this.power.shields -= x;
        if (this.power.shields < 0) {
            this.power.shields = 0;
            this.alive = false;
        }
    }

    heal(type) {
        this.power[type] += 10;
        if (this.power[type] > this.maxPower) {
            this.power[type] = this.maxPower;
        }
    }

    collect(item) {
        console.log('COLLECT', item.type);
    }
}
