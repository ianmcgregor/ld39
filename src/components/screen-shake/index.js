export default class ScreenShake {
    constructor(ticker, displayObject) {
        this.ticker = ticker;
        this.displayObject = displayObject;
        this.screenShakes = 0;
        this.elapsed = 0;
        this.amt = 0;
        this.signalBinding = null;
    }

    start(count = 40) {
        if (this.screenShakes > 0) {
            return;
        }
        this.screenShakes = count;
        this.originalY = this.displayObject.y;

        // if (window.navigator && window.navigator.vibrate) {
        //     window.navigator.vibrate(count * 10);
        // }

        this.signalBinding = this.ticker.add(this.update, this);
    }

    update() {
        if (this.screenShakes === 0) {
            this.displayObject.y = this.originalY;
            // this.ticker.remove(this.update, this);
            this.ticker.remove(this.signalBinding);
            return;
        }

        this.screenShakes--;

        if (this.screenShakes % 2) {
            this.amt = this.screenShakes * 0.5;
            this.displayObject.y += this.amt;
        } else {
            this.displayObject.y -= this.amt;
        }
    }
}
