export default class SlideTransition {
    constructor(direction = 0) {
        this.direction = direction;
        this.max = 1280;
        this.ease = window.Back.easeInOut;
        this.onFadein = this.onFadein.bind(this);
    }

    begin(manager, current, next) {
        this.manager = manager;

        this.current = current;
        this.next = next;

        if (this.current) {
            if (this.current.onHide) {
                this.current.onHide();
            }
            window.TweenLite.to(this.current, 0.45, {
                ease: this.ease,
                x: this.max * (this.direction * -1)
            });
            this.onFadeout();
        } else {
            this.onFadeout();
        }
    }

    onFadeout() {

        if (this.next.onShow) {
            this.next.onShow();
        }
        if (this.next.resize) {
            this.next.resize(this.manager.w, this.manager.h);
        }

        this.next.position.x = this.max * this.direction;// * -1;

        window.TweenLite.to(this.next, 0.45, {
            x: 0,
            ease: this.ease,
            onComplete: this.onFadein
        });

        this.manager.container.addChild(this.next);
    }

    onFadein() {
        if (this.current) {
            if (this.current.onHidden) {
                this.current.onHidden();
            }
            this.manager.container.removeChild(this.current);
        }

        if (this.next.onShown) {
            this.next.onShown();
        }
        this.manager.transitionComplete();
    }

    resize(w, h) {
        this.w = w;
        this.h = h;
    }
}
