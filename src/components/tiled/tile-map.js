import getTextureId from './get-texture-id';
import getTilemapFrames from './get-tilemap-frames';
// TODO: tile map spatial or tile layer spatial
// TODO: render regions (eg within camera) - set up demo to move camera - one or 2 tile overlap
// TODO: terrain?
// TODO: try with isometric orientation

export default function TileMap(map) {

    const tileWidth = map.tilewidth;
    const tileHeight = map.tileheight;
    const cols = map.width;
    const rows = map.height;
    const width = cols * tileWidth;
    const height = rows * tileHeight;

    const bgColor = (map.backgroundcolor && parseInt(map.backgroundcolor.slice(1), 16));

    const frames = getTilemapFrames(map);

    function getTileY(index, layerWidth) {
        return Math.floor(index / layerWidth);
    }

    function getTileX(index, layerWidth) {
        return index - getTileY(index, layerWidth) * layerWidth;
    }

    function flattenPath(path) {
        return path.reduce((arr, point) => {
            arr.push(point.x, point.y);
            return arr;
        }, []);
    }

    function getTileLayer(layer) {
        return layer.data.map((gid, index) => {
            if (gid < 1) {
                return gid;
            }

            const frame = frames[gid];
            // if (!frame) {
            // console.log('gid', gid);
            // console.log('frame', frame);
            // console.log('frames', Object.keys(frames));
            // console.log('frame', frames.find(f => Number(f.gid) === gid));
            // }
            // tiled reg point is bottom left:
            const yOffset = frame && frame.height > tileHeight ? tileHeight - frame.height : 0;

            const col = getTileX(index, layer.width);
            const row = getTileY(index, layer.width);
            const x = col * tileWidth;
            const y = row * tileHeight + yOffset;

            return {
                index,
                tile: gid,
                gid,
                x,
                y: y,
                col,
                row,
                width: tileWidth,
                height: tileHeight,
                frame,
                top: y,
                right: x + tileWidth,
                bottom: y + tileHeight,
                left: x
            };
        })
            .filter((item) => item);
    }

    function getObjectGroup(layer) {
        return layer.objects.map(object => {
            const frame = frames[object.gid];
            const yOffset = frame ? 0 - object.height : 0;

            if (object.polygon) {
                const path = flattenPath(object.polygon);
                object.polygon = path.concat(path.slice(0, 2));
            } else if (object.polyline) {
                object.polyline = flattenPath(object.polyline);
            } else if (object.ellipse) {
                object.halfW = object.width / 2;
                object.halfH = object.height / 2;
                object.x += object.halfW;
                object.y += object.halfH;
            }

            const y = object.y + yOffset;
            const type = object.type || (frame && frame.type) || '';

            return Object.assign({}, object, {
                frame,
                y,
                top: y,
                right: object.x + object.width,
                bottom: y + object.height,
                left: object.x,
                type
            });
        });
    }

    function getImagelayer(layer) {
        return [Object.assign({}, layer, {
            frame: getTextureId(layer.image)
        })];
    }

    function getLayerObjects(layer) {
        switch (layer.type) {
            case TileMap.TILE_LAYER:
                return getTileLayer(layer);
            case TileMap.OBJECT_LAYER:
                return getObjectGroup(layer);
            case TileMap.IMAGE_LAYER:
                return getImagelayer(layer);
            default:
                console.error('Unknown layer type:', layer && layer.type);
        }
        return [];
    }

    const layers = map.layers.map((layer, z) => {
        const {offsetx, offsety} = layer;
        const l = Object.assign({}, layer, {
            cols: layer.width,
            rows: layer.height,
            x: offsetx || 0,
            y: offsety || 0,
            z,
            objects: getLayerObjects(layer),
            width: layer.width * tileWidth,
            height: layer.height * tileHeight,
            tileWidth,
            tileHeight
        });

        switch (l.type) {
            case TileMap.TILE_LAYER:
                l.map = l.objects.reduce((ob, object) => {
                    ob['tile' + object.index] = object;
                    return ob;
                }, {});
                l.tileAt = function(x, y) {
                    x = Math.floor(x / tileWidth);
                    y = Math.floor(y / tileHeight);
                    const index = x + y * l.cols;
                    return l.map['tile' + index];
                };
                break;
            case TileMap.OBJECT_LAYER:
                l.map = l.objects.reduce((ob, object) => {
                    if (object.name) {
                        if (ob[object.name]) {
                            console.warn('Duplicate object name:', object.name);
                        }
                        ob[object.name] = object;
                    }
                    return ob;
                }, {});
                break;
            default:

        }
        return l;
    });

    // assumes unique names
    const layersByName = layers.reduce((obj, layer) => {
        obj[layer.name] = layer;
        return obj;
    }, {});

    return {
        bgColor,
        layers,
        layer: layersByName,
        map,
        width,
        height,
        tileWidth,
        tileHeight
    };
}

TileMap.OBJECT_LAYER = 'objectgroup';
TileMap.TILE_LAYER = 'tilelayer';
TileMap.IMAGE_LAYER = 'imagelayer';
