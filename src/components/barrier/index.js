import {extras, Texture} from 'pixi.js';
import array from 'usfl/array/array';
import roundToNearest from 'usfl/math/roundToNearest';
import sono from 'sono';

export default class Barrier {
    constructor(ob) {
        this.ob = ob;
        this.counter = 0;
        this.frameCount = 0;
        this.interval = 50;

        Object.keys(ob).forEach(key => (this[key] = ob[key]));

        this.textures = array(5).map(n => Texture.from(`current${n}`));

        this.gfx.children[0].visible = false;

        const horizontal = this.width > this.height;
        const len = horizontal ? this.width : this.height;

        this.view = this.gfx.addChild(
            new extras.TilingSprite(
                this.textures[0],
                16,
                roundToNearest(len, 6)
            )
        );

        if (horizontal) {
            this.view.rotation = 0 - Math.PI / 2;
            this.view.position.set(0, 10);
        } else {
            this.view.position.set(-3, 0);
        }

    }

    update() {
        this.counter++;

        if (this.counter % 3 === 0) {
            this.frameCount++;
            this.view.texture = this.textures[this.frameCount % this.textures.length];
        }

        if (this.counter === this.interval) {
            this.gfx.visible = false;
            sono.stop('noise');
        }

        if (this.counter === this.interval * 2) {
            this.gfx.visible = true;
            this.counter = 0;
            sono.play('noise');
        }
    }
}
