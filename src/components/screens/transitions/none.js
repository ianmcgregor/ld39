export default class NoTransition {

    begin(manager, current, next) {
        if (current) {
            if (current.onHide) {
                current.onHide();
            }
            if (current.onHidden) {
                current.onHidden();
            }
            manager.container.removeChild(current.container);
        }

        manager.container.addChild(next.container);

        if (next.onShow) {
            next.onShow();
        }
        if (next.onShown) {
            next.onShown();
        }

        manager.transitionComplete();
    }

    resize(width, height) {
        this.w = width;
        this.h = height;
    }
}
