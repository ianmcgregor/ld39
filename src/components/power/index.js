import Particle from 'usfl/particle';
import ParticleGroup from 'usfl/particle/ParticleGroup';
import {Sprite, Graphics, Container, Text} from 'pixi.js';
import random from 'usfl/math/random';
import randomChoice from 'usfl/array/randomChoice';

export default class Power {
    constructor(types) {
        this.type = null;
        this.types = types;
        this.counter = 0;
        this.container = new Container();
        this.gfx = this.container.addChild(Sprite.from('power'));
        this.gfx.anchor.set(0.5);
        this.gfx.scale.set(0.9);

        this.label = new Text('T', {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 48,
            padding: 10
        });
        this.label.scale.set(0.5);
        this.label.anchor.set(0.5, 0.3);
        this.gfx.addChild(this.label);

        this.particles = new ParticleGroup(() => {
            const p = new Particle({
                radius: 2
            });
            p.gfx = this.gfx.addChild(
                new Graphics()
                    .beginFill(0xffffff)
                    .drawCircle(0, 0, p.radius)
                    .endFill()
            );
            return p;
        });
        this.container.visible = false;
        this.alive = false;
    }

    start(position) {
        this.type = randomChoice(this.types);
        this.container.position.copy(position);
        this.label.text = this.type.slice(0, 1).toUpperCase();
        this.container.visible = true;
        this.alive = true;
    }

    collect() {
        this.container.visible = false;
        this.alive = false;
    }

    get top() {
        return this.container.y + this.gfx.y;
    }

    get right() {
        return this.container.x + this.gfx.x + this.gfx.width;
    }

    get bottom() {
        return this.container.y + this.gfx.y + this.gfx.height;
    }

    get left() {
        return this.container.x + this.gfx.x;
    }

    createParticle() {
        const frag = this.particles.create({
            x: 0,
            y: 0,
            angle: random(0, Math.PI * 2),
            speed: random(1, 2),
            lifeTime: 30
        });
        frag.gfx.alpha = 1;
        frag.gfx.visible = true;
    }

    update() {
        if (!this.container.visible) {
            return;
        }

        this.counter += 0.15;
        this.gfx.scale.set(0.9 + Math.sin(this.counter) * 0.1);

        this.createParticle();

        this.particles.update(frag => {
            frag.gfx.alpha = frag.lifeTime * 0.01;
            frag.gfx.position.set(frag.x, frag.y);
            frag.lifeKill();
            if (!frag.alive) {
                frag.gfx.visible = false;
            }
        });
    }
}
