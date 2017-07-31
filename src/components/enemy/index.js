import Boid from 'boid';
import {Sprite} from 'pixi.js';

export default class Enemy {
    constructor(ob, textures) {
        this.ob = ob;
        this.counter = 0;
        this.frameCount = 0;
        this.health = 10;

        Object.keys(ob)
            .filter(key => !['top', 'right', 'bottom', 'left'].includes(key))
            .forEach(key => (this[key] = ob[key]));

        this.gfx.children[0].visible = false;

        this.boid = new Boid({
            maxSpeed: 1 + Math.random(2)
        });
        this.boid.edgeBehavior = null;

        this.textures = textures;

        this.view = this.gfx.addChild(Sprite.from(this.textures[0]));
        this.view.anchor.set(0.5);

        this.path = [];
        for (let i = 0; i < ob.polyline.length; i += 2) {
            this.path.push(Boid.vec2(ob.polyline[i], ob.polyline[i + 1]));
        }
    }

    destroy() {
        this.view.visible = false;
    }

    get top() {
        return this.y + this.view.y;
    }

    get right() {
        return this.x + this.view.x + this.view.width;
    }

    get bottom() {
        return this.y + this.view.y + this.view.height;
    }

    get left() {
        return this.x + this.view.x;
    }

    update() {
        if (!this.view.visible) {
            return;
        }
        this.boid.followPath(this.path, true).update();
        this.view.position.copy(this.boid.position);
        this.view.rotation = this.boid.velocity.angle;
        this.counter++;

        if (this.counter % 5 === 0) {
            this.frameCount++;
            this.view.texture = this.textures[this.frameCount % this.textures.length];
        }
    }
}
