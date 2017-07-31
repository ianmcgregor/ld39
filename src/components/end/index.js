import Particle from 'usfl/particle';
import ParticleGroup from 'usfl/particle/ParticleGroup';
import {Sprite, Graphics} from 'pixi.js';
import random from 'usfl/math/random';

export default class End {
    constructor(ob) {
        this.ob = ob;
        this.counter = 0;

        Object.keys(ob).forEach(key => (this[key] = ob[key]));

        this.gfx.children[0].visible = false;

        this.vortex = this.gfx.addChild(Sprite.from('vortex'));
        this.vortex.anchor.set(0.5);
        this.vortex.scale.set(0.8);
        this.vortex.alpha = 0.3;

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
        this.open = false;
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
        this.counter += 0.01;

        if (!this.open) {
            this.vortex.rotation = Math.sin(this.counter) * 0.6;
            return;
        }

        this.counter += 0.15;
        this.vortex.rotation += 0.15;
        this.vortex.alpha = 1;
        this.vortex.scale.set(0.8 + Math.sin(this.counter) * 0.2);

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
