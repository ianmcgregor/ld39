import Screen from '../screens/screen';
import Button from '../button';
import {Container, Graphics, Text} from 'pixi.js';
import sono from 'sono';

export default class GameOver extends Screen {
    constructor(app) {
        super();

        this.app = app;
        this.container = new Container();

        this.titleText = new Text('GAME', {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 300,
            padding: 10
        });
        this.titleText.scale.set(0.5);
        this.container.addChild(this.titleText);

        this.titleText2 = new Text('OVER', {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 300,
            padding: 10
        });
        this.titleText2.scale.set(0.5);
        this.container.addChild(this.titleText2);

        this.reasonText = new Text('REASON', {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: 60,
            padding: 10
        });
        this.reasonText.scale.set(0.5);
        this.container.addChild(this.reasonText);

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
            window.clearTimeout(this.timeoutId);
            this.screens.goto('game');
            sono.play('ting');
        });
    }

    onShow() {
        const msg = this.app.gameOverReason === 'dead' ? 'YOU WERE DESTROYED' : 'YOU RAN OUT OF FUEL';
        // console.log('this.app.gameOverReason', this.app.gameOverReason);
        this.reasonText.text = msg;
        this.reasonText.style = {
            align: 'center',
            fill: 0xffffff,
            fontFamily: 'Space Mono',
            fontSize: this.app.gameOverReason === 'dead' ? 62 : 60,
            padding: 10
        };
        this.reasonText.position.set((this.w - this.reasonText.width) / 2, this.h - 165);

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

        this.titleText.position.set((w - this.titleText.width) / 2, 5);
        this.titleText2.position.set((w - this.titleText2.width) / 2, this.titleText.y + this.titleText.height - 30);

        this.btn.view.position.set((w - this.btn.view.width) / 2, h - 110);
    }
}
