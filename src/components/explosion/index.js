import Particle from 'usfl/particle';
import ParticleGroup from 'usfl/particle/ParticleGroup';
import {Container, Sprite} from 'pixi.js';
import randomChoice from 'usfl/array/randomChoice';
import random from 'usfl/math/random';

export default class Explosion {
    constructor(textures) {
        this.container = new Container();
        this.particles = new ParticleGroup(() => {
            const p = new Particle({
                radius: 2
            });
            p.gfx = this.container.addChild(Sprite.from(randomChoice(textures)));
            return p;
        });
        this.particles.pool.fill(40);
        this.container.visible = false;
        this.alive = false;
    }

    start(position) {
        for (let i = 0; i < 40; i++) {
            const frag = this.particles.create({
                x: position.x,
                y: position.y,
                angle: random(0, Math.PI * 2),
                speed: random(2, 8),
                lifeTime: 100
            });
            frag.gfx.alpha = 1;
            frag.gfx.visible = true;
        }
        this.container.visible = true;
        this.alive = true;
    }

    update() {
        this.alive = false;
        this.particles.update(frag => {
            frag.gfx.alpha = frag.lifeTime * 0.01;
            frag.gfx.position.set(frag.x, frag.y);
            frag.lifeKill();
            if (!frag.alive) {
                frag.gfx.visible = false;
            } else {
                this.alive = true;
            }
        });
    }
}
