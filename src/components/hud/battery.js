import {Container, Sprite, Text, Texture} from 'pixi.js';

export default class Battery {
    constructor(name) {
        this.name = name;
        this.container = new Container();
        this.update = this.update.bind(this);

        this.textures = [2, 1, 0].map(n => Texture.from(`battery_${n}`));

        this.bg = Sprite.from(this.textures[2]);
        this.bg.scale.set(0.5);
        this.container.addChild(this.bg);

        this.title = new Text(name.toUpperCase(), {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 16,
            padding: 10
        });
        this.title.scale.set(0.5);

        this.percent = new Text('100%', {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 28,
            padding: 10
        });
        this.percent.scale.set(0.5);

        this.container.addChild(this.title);
        this.container.addChild(this.percent);

        this.title.position.set(20, 4);
        this.percent.position.set(20, 14);
    }

    update(value) {
        this.percent.text = `${Math.round(value)}%`;

        const x = Math.min(Math.floor(value / 20), 2);
        const texture = this.textures[x];
        this.bg.texture = texture;
    }
}
