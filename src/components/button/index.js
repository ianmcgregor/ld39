import MiniSignal from 'mini-signals';

export default class Button {
    constructor(view) {
        this.view = view;

        this.onPress = new MiniSignal();

        this.view.on('pointerdown', event => this.onPress.dispatch(this, event));

        this.enable();
    }

    enable() {
        this.view.interactive = true;
        this.view.buttonMode = true;
    }

    disable() {
        this.view.interactive = false;
        this.view.buttonMode = false;
    }

    show() {
        this.view.visible = true;
        this.enable();
    }

    hide() {
        this.disable();
        this.view.visible = false;
    }
}
