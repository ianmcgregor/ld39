import TileMap from '../tiled/tile-map';

import {
    Sprite,
    Texture,
    utils,
    // RenderTexture,
    Container,
    Rectangle,
    Graphics
} from 'pixi.js';

function getGraphic(object, color = 0xff0000) {
    const container = new Container();
    const graphic = new Graphics();
    graphic.lineStyle(2, color);

    if (object.polygon) {
        graphic.drawPolygon(object.polygon);
    } else if (object.polyline) {
        graphic.drawPolygon(object.polyline);
    } else if (object.ellipse) {
        graphic.drawEllipse(0, 0, object.halfW, object.halfH);
    } else {
        graphic.drawRect(0, 0, object.width, object.height);
    }
    container.addChild(graphic);
    return container;
}

// function renderTileLayer2(layer, app) {
//     const renderTexture = RenderTexture.create(layer.width, layer.height);
//     const holder = new Container();
//     layer.objects.forEach((object) => {
//         const {frame, x, y} = object;
//         const sprite = Sprite.from(frame.id);
//         sprite.position.set(x, y);
//         holder.addChild(sprite);
//     });
//     app.renderer.render(holder, renderTexture);
//     const sprite = new Sprite(renderTexture);
//     sprite.position.set(layer.x, layer.y);
//     return sprite;
// }

function renderTileLayer(layer) {
    // console.log('layer', layer);
    const holder = new Container();
    layer.objects.forEach((object) => {
        const {frame, x, y} = object;
        const sprite = Sprite.from(frame.id);
        sprite.position.set(x, y);
        holder.addChild(sprite);
    });
    holder.position.set(layer.x, layer.y);
    holder.cacheAsBitmap = true;
    return holder;
}

function renderObjectLayer(layer) {
    const holder = new Container();
    holder.position.set(layer.x, layer.y);
    layer.objects.forEach((object) => {
        const {frame, x, y} = object;
        if (frame) {
            if (frame.image && !utils.TextureCache[frame.id]) {
                // console.log('renderObjectLayer frame.image =', frame.image);
                const tex = Texture.from(frame.image);
                const rect = new Rectangle(tex.frame.x + frame.x, tex.frame.y + frame.y, frame.width, frame.height);
                utils.TextureCache[frame.id] = new Texture(tex.baseTexture, rect);
            }
            const sprite = Sprite.from(frame.id);
            sprite.position.set(x, y);
            holder.addChild(sprite);
            // FIXME: temp
            object.gfx = sprite;
        } else {
            const g = getGraphic(object);
            g.position.set(x, y);
            holder.addChild(g);
            // FIXME: temp
            object.gfx = g;
        }
    });
    return holder;
}

function renderImageLayer(layer) {
    const object = layer.objects[0];
    const img = Sprite.from(object.frame);
    img.position.set(layer.x, layer.y);
    return img;
}

function renderLayer(layer) {
    switch (layer.type) {
        case TileMap.TILE_LAYER:
            return renderTileLayer(layer);
            break;
        case TileMap.OBJECT_LAYER:
            return renderObjectLayer(layer);
            break;
        case TileMap.IMAGE_LAYER:
            return renderImageLayer(layer);
            break;
        default:
    }
    return null;
}

export default function tilemap(map) {
    const container = new Container();
    map.layers.forEach((layer) => container.addChild(renderLayer(layer)));
    // app.stage.addChild(container);

    // map.layers.filter((layer) => layer.type === TileMap.TILE_LAYER).forEach((layer) => {});

    // const a = map.layer.tilelayerA;
    // app.stage.interactive = true;
    // app.stage.on('mousedown', (event) => {
    //     console.log('event.data', event.data.global);
    //     const tile = a.tileAt(event.data.global.x, event.data.global.y);
    //     console.log('tile', tile);
    // });
    return container;
}
