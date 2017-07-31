import Screen from '../screens/screen';
import Button from '../button';
import {Container, Graphics, Text} from 'pixi.js';
import sono from 'sono';

export default class GameComplete extends Screen {
    constructor(app) {
        super();

        this.app = app;
        this.container = new Container();

        this.titleText = new Text('YOU', {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 300,
            padding: 10
        });
        this.titleText.scale.set(0.5);
        this.container.addChild(this.titleText);

        this.titleText2 = new Text('WIN', {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 300,
            padding: 10
        });
        this.titleText2.scale.set(0.5);
        this.container.addChild(this.titleText2);

        const btnView = new Container();

        const bg = btnView.addChild(
            new Graphics()
                .beginFill(0xff0000)
                .drawRoundedRect(0, 0, 340, 80, 8)
                .endFill()
        );

        const txt = btnView.addChild(
            new Text('ANOTHER', {
                align: 'center',
                fill: 0xffffff,
                fontFamily: 'Space Mono',
                fontSize: 120,
                padding: 10
            })
        );
        txt.scale.set(0.5);
        txt.position.set((bg.width - txt.width) / 2, 2 + (bg.height - txt.height) / 2);

        this.btn = new Button(btnView);
        this.container.interactive = true;
        this.container.addChild(btnView);
        this.btn.onPress.add(() => {
            this.screens.goto('game');
            sono.play('ting');
        });
    }

    onShow() {
        sono.get('music').fade(0, 1);
        this.timeoutId = window.setTimeout(() => {
            sono.get('back').volume = 1;
            sono.play('back');
        }, 1000);
    }

    onShown() {}

    onHide() {}

    onHidden() {}

    resize(w, h) {
        super.resize(w, h);

        this.titleText.position.set((w - this.titleText.width) / 2, 15);
        this.titleText2.position.set((w - this.titleText2.width) / 2, this.titleText.y + this.titleText.height - 20);

        this.btn.view.position.set((this.app.width - this.btn.view.width) / 2, h - 120);
    }
}
