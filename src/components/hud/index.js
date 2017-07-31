import {Container, Text} from 'pixi.js';
import Battery from './battery';

export default class Hud {
    constructor(world) {
        this.container = new Container();
        this.update = this.update.bind(this);

        this.text = new Text('BUG SQUASHER 9000', {
            align: 'left',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 24,
            padding: 10
        });
        this.text.scale.set(0.5);
        this.container.addChild(this.text);

        this.bugs = new Text('LEVEL 0.0.0\nBUGS DETECTED 0', {
            align: 'left',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 16,
            padding: 10
        });
        this.bugs.y = 15;
        this.bugs.scale.set(0.5);
        this.container.addChild(this.bugs);

        this.progress = new Text('BUGS LEFT 0', {
            align: 'left',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 16,
            padding: 10
        });
        this.progress.y = 33;
        this.progress.scale.set(0.5);
        this.container.addChild(this.progress);

        const {power} = world.player;
        this.batteries = Object.keys(power).map((key, i) => {
            const b = new Battery(key);
            this.container.addChild(b.container);
            b.container.x = 575 + 70 * i;
            return b;
        });

        this.container.position.set(10, 10);
    }

    init(world, name) {
        this.world = world;
        const numBugs = world.enemies.length;
        this.bugs.text = `LEVEL 0.${name}.0\nBUGS DETECTED ${numBugs.toFixed(1)}`;
    }

    update() {
        const {power} = this.world.player;
        for (let i = 0; i < this.batteries.length; i++) {
            const b = this.batteries[i];
            b.update(power[b.name]);
        }

        this.progress.text = `BUGS LEFT ${this.world.enemies.length.toFixed(1)}`;
    }
}
