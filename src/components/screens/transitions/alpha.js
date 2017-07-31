import Tween from 'usfl/Tween';
import {easeOutQuad} from 'usfl/ease/quad';
import Ticker from 'usfl/ticker';

export default class AlphaTransition {

    constructor() {
        this.ticker = new Ticker();
    }

    begin(manager, current, next) {
        console.log('transition.begin');
        if (current) {
            if (current.onHide) {
                current.onHide();
            }
            const outTween = new Tween(current.container, {alpha: 0}, 1, {
                ease: easeOutQuad,
                onComplete: () => {
                    if (current.onHidden) {
                        current.onHidden();
                    }
                    manager.container.removeChild(current.container);
                    this.ticker.remove(this.outUpdate);
                }
            });
            this.outUpdate = this.ticker.add((dt) => outTween.update(dt));
            this.ticker.start();
        }

        manager.container.addChildAt(next.container, 0);

        if (next.onShow) {
            next.onShow();
        }
        next.container.alpha = 0;
        const inTween = new Tween(next.container, {alpha: 1}, 1, {
            ease: easeOutQuad,
            onComplete: () => {
                if (next.onShown) {
                    next.onShown();
                }
                this.ticker.remove(this.inUpdate);
                this.ticker.stop();
                manager.transitionComplete();
            }
        });
        this.inUpdate = this.ticker.add((dt) => inTween.update(dt));
        this.ticker.start();
    }

    resize(width, height) {
        this.w = width;
        this.h = height;
    }
}
