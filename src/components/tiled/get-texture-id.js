export default function getTextureId(url) {
    return url.slice(url.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, '');
}
