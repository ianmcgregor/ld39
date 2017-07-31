import linkedList from 'usfl/linked-list';
import objectPool from 'usfl/object-pool';

export default class PooledList {
    constructor(factoryFn) {
        this.list = linkedList();
        this.pool = objectPool(factoryFn);
    }

    create(count = 1) {
        if (count > 1) {
            for (let i = 0; i < count; i++) {
                this.create();
            }
            return this.list.last;
        }
        const p = this.pool.get();
        this.list.add(p);
        return p;
    }

    add(p) {
        this.list.add(p);
    }

    remove(p) {
        this.list.remove(p);
        this.pool.dispose(p);
    }

    forEach(fn) {
        let p = this.list.first;
        while (p) {
            const n = p.next;
            fn(p);
            p = n;
        }
    }

    get first() {
        return this.list.first;
    }

    get last() {
        return this.list.last;
    }
}
