import None from './transitions/none';

export default class Screens {
    constructor({container, width, height, transition}) {
        this.container = container;
        this.screens = {};
        this.current = null;

        this.w = width;
        this.h = height;

        this.history = [];

        this.noTransition = new None();
        this.currentTransition = this.transition = (transition || this.noTransition);
        this.active = false;
    }

    add(screen, id) {
        id = id || screen.id;
        if (!id) {
            throw new Error('Screens: No id');
        }
        this.screens[id] = screen;
        screen.id = id;
        screen.screens = this;

        return screen;
    }

    goto(id, instant = false) {
        const screen = typeof id === 'string' ? this.screens[id] : id;

        if (!screen) {
            throw new Error('Screens: Screen not found: ' + id);
        }

        if (this.current === screen) {
            return;
        }

        this.history.push(screen);
        this.next = screen;

        if (this.active) {
            return;
        }

        this.active = true;

        this.currentTransition = instant ? this.noTransition : (screen.transition || this.transition);

        if (this.currentTransition.resize) {
            this.currentTransition.resize(this.w, this.h);
        }

        const current = this.current;

        if (this.next.resize) {
            this.next.resize(this.w, this.h);
        }

        this.current = screen;
        this.currentTransition.begin(this, current, this.next);
    }

    back() {
        this.history.pop();

        const prev = this.history.pop();

        if (prev) {
            this.goto(prev);
        }
    }

    transitionComplete() {
        this.active = false;

        if (this.current !== this.next) {
            this.goto(this.next);
        }
    }

    resize(w, h) {
        this.w = w;
        this.h = h;

        if (this.currentTransition.resize) {
            this.currentTransition.resize(w, h);
        }

        if (this.current && this.current.resize) {
            this.current.resize(w, h);
        }
    }
}
