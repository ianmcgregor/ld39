export default class Collision {
    constructor() {}

    collide(p, layer) {
        const lt = layer.tileAt(p.left, p.top);
        const rt = layer.tileAt(p.right, p.top);
        const rb = layer.tileAt(p.right, p.bottom);
        const lb = layer.tileAt(p.left, p.bottom);

        if (!(lt || rt || rb || lb)) {
            return false;
        }

        let anyCollided = false;

        if (lt && this.tileCollide(p, lt)) {
            anyCollided = true;
        }

        if (rt && this.tileCollide(p, rt)) {
            anyCollided = true;
        }

        if (rb && this.tileCollide(p, rb)) {
            anyCollided = true;
        }

        if (lb && this.tileCollide(p, lb)) {
            anyCollided = true;
        }

        // const tiles = layer.tilesAt(p.left, p.top, p.radius * 2, p.radius * 2);
        // if (!tiles.length) {
        //     return false;
        // }
        // let anyCollided = false;
        // for (let i = 0; i < tiles.length; i++) {
        //     const collided = this.tileCollide(p, this.tiles[i], layer);
        //     if (collided) {
        //         anyCollided = true;
        //     }
        // }

        return anyCollided;
    }

    // intersects(r1, r2) {
    //   return !(r2.left > r1.right ||
    //            r2.right < r1.left ||
    //            r2.top > r1.bottom ||
    //            r2.bottom < r1.top);
    // }
    intersects(r1, r2) {
        return !(r2.left >= r1.right ||
               r2.right <= r1.left ||
               r2.top >= r1.bottom ||
               r2.bottom <= r1.top);
    }

    // intersects(tile, p) {
    //     if (p.right <= tile.left) {
    //         return false;
    //     }
    //
    //     if (p.bottom <= tile.top) {
    //         return false;
    //     }
    //
    //     if (p.left >= tile.right) {
    //         return false;
    //     }
    //
    //     if (p.top >= tile.bottom) {
    //         return false;
    //     }
    //
    //     return true;
    // }

    tileCollide(p, tile) {
        if (!this.intersects(tile, p)) {
            return false;
        }

        let ox = this.getOverlapX(p, tile);
        let oy = this.getOverlapY(p, tile);

        // console.debug('ox', ox, 'oy', oy);

        if (Math.abs(ox) < Math.abs(oy)) {
            // console.log('colliding x');
            // console.debug('x first');
            this.moveX(p, ox);
            if (this.intersects(tile, p)) {
                oy = this.getOverlapY(p, tile);
                this.moveY(p, oy);
            }
        } else {
            // console.log('colliding y');
            // console.debug('y first');
            this.moveY(p, oy);
            if (this.intersects(tile, p)) {
                ox = this.getOverlapX(p, tile);
                this.moveX(p, ox);
            }
        }

        // return (ox !== 0 || oy !== 0);
        return (ox > 0.1 || oy > 0.1);
    }

    getOverlapX(p, tile) {
        // console.log('check x', tile);
        if (!tile) {
            // console.log('! no tile x');
            return 0;
        }
        let ox = 0;

        if (p.vx < 0) {
            if (p.left < tile.right) {
                ox = p.left - tile.right;
            }
        } else if (p.vx > 0) {
            if (p.right > tile.left) {
                ox = p.right - tile.left;
            }
        }

        ox = ox % tile.width;

        return ox;
    }

    getOverlapY(p, tile) {
        // console.log('check y');
        if (!tile) {
            // console.log('! no tile y');
            return 0;
        }

        let oy = 0;

        if (p.vy < 0) {
            if (p.top < tile.bottom) {
                oy = p.top - tile.bottom;
            }
        } else if (p.vy > 0) {
            if (p.bottom > tile.top) {
                oy = p.bottom - tile.top + 1;
            }
        }

        oy = oy % tile.height;

        return oy;
    }

    moveX(p, ox) {
        // console.log('ox', ox, p.vx);
        if (ox !== 0) {
            p.x -= ox;
            // p.vx *= -1;
            if (p.bounce && p.bounce.x) {
                p.vx *= p.bounce.x;
            }
        }
    }

    moveY(p, oy) {
        if (oy !== 0) {
            p.y -= oy;
            // p.vy *= -1;
            if (p.bounce && p.bounce.y) {
                p.vy *= p.bounce.y;
            }
        }
    }
}
