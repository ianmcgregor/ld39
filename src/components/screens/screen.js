export default class Screen {
    constructor() {
        this.id = null;
        this.transition = null;
        this.screens = null;
        this.container = null;
    }

    onShow() {}

    onShown() {}

    onHide() {}

    onHidden() {}

    resize(w, h) {
        this.w = w;
        this.h = h;
    }
}
