import lerp from 'usfl/math/lerp';
const {abs, min, max} = Math;

export default class Camera {
    constructor(target, container, w, h) {
        console.log('camera', w, h);
        this.target = target;
        this.container = container;
        this.w = w;
        this.h = h;
        this.tx = 0;
        this.ty = 0;
        this.ts = 1;
    }

    update() {
        const scale = this.container.scale.x;
        // console.log('camera.update', this.container.worldTransform.a, scale);

        this.tx = this.w / 2 - this.target.x * scale;
        this.ty = this.h / 2 - this.target.y * scale;
        this.ts = 1.2 - min(max(abs(this.target.vx) / 20, abs(this.target.vy) / 20), 0.2);

        this.container.x = lerp(this.container.x, this.tx, 0.2);
        this.container.y = lerp(this.container.y, this.ty, 0.2);
        this.container.scale.set(lerp(scale, this.ts, 0.05));
    }

    resize(w, h) {
        console.log('camera.resize', w, h);
        this.w = w;
        this.h = h;
    }
}
