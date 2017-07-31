import getTextureId from './get-texture-id';

function getTilesetFrames(tileset) {
    const {name, firstgid, tilewidth, tileheight} = tileset;

    console.log('firstgid', firstgid);

    return Object.keys(tileset.tiles)
        .reduce((newOb, key) => {
            const {image, type} = tileset.tiles[key];
            const gid = firstgid + Number(key);
            newOb[gid] = {
                gid,
                id: getTextureId(image),
                x: 0,
                y: 0,
                width: tilewidth,
                height: tileheight,
                tilesetName: name,
                type
            };
            return newOb;
        }, {});
}

export default function getTilemapFrames(map) {
    return map.tilesets.reduce((ob, set) => {
        return Object.assign(ob, getTilesetFrames(set));
    }, {});
}
