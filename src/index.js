import fps from 'usfl/fps';
import App from './components/app';
import Screens from './components/screens';
import AlphaTransition from './components/screens/transitions/alpha';
import Titles from './components/titles';
import Game from './components/game';
import GameOver from './components/game-over';
import GameComplete from './components/game-complete';
import WebFont from 'webfontloader';
import sono from 'sono';
import 'sono/effects';

const width = 800;
const height = 400;

const app = new App(width, height);
const screens = new Screens({
    container: app.stage,
    transition: new AlphaTransition(),
    width: app.width,
    height: app.height
});

app.resize.add((w, h) => screens.resize(w, h));
app.loop.add(() => fps.update());

app.loader.add([{
    name: 'tiles0.json',
    url: 'textures/tiles0.json'
}, {
    name: 'circuit0.json',
    url: 'textures/circuit0.json'
}, {
    name: 'objects0.json',
    url: 'textures/objects0.json'
}, {
    name: 'level00',
    url: 'json/level00.json'
}, {
    name: 'level01',
    url: 'json/level01.json'
}, {
    name: 'level02',
    url: 'json/level02.json'
}]);

app.loader.on('complete', () => init());

function init() {
    console.debug('loader complete', app.loader);

    screens.add(new Titles(app), 'titles');
    screens.add(new Game(app), 'game');
    screens.add(new GameOver(app), 'game-over');
    screens.add(new GameComplete(app), 'game-complete');

    screens.goto('titles');
    // screens.goto('game');
    // screens.goto('game-over');
    // screens.goto('game-complete');
    app.update();
}

WebFont.load({
    google: {
        families: ['Space Mono']
    },
    active: () => {
        console.log('FONTS LOADED');
        app.loader.load();
    }
});

sono.load({
    url: [{
        id: 'music',
        url: ['audio/music.ogg', 'audio/music.mp3'],
        loop: true,
        singlePlay: true
    }, {
        id: 'back',
        url: ['audio/back.ogg', 'audio/back.mp3'],
        loop: true,
        singlePlay: true
    }, {
        id: 'suspense',
        url: ['audio/suspense.ogg', 'audio/suspense.mp3'],
        loop: true,
        singlePlay: true
    }, {
        id: 'power',
        url: ['audio/power.ogg', 'audio/power.mp3'],
        volume: 0.2,
        effects: [sono.reverb()]
    }, {
        id: 'shoot',
        url: ['audio/shoot3.ogg', 'audio/shoot3.mp3'],
        volume: 0.3,
        effects: [sono.echo({
            delay: 0.1
        })]
    }, {
        id: 'dead',
        url: ['audio/squelch.ogg', 'audio/squelch.mp3']
    }, {
        id: 'exit',
        url: ['audio/squelch2.ogg', 'audio/squelch2.mp3'],
        volume: 0.4
    }, {
        id: 'ting',
        url: ['audio/ting.ogg', 'audio/ting.mp3']
    }, {
        id: 'damage',
        url: ['audio/shoot2.ogg', 'audio/shoot2.mp3'],
        volume: 0.5,
        effects: [sono.echo({
            delay: 0.2
        })]
    }, {
        id: 'string',
        url: ['audio/string.ogg', 'audio/string.mp3'],
        volume: 0.3
    }, {
        id: 'wheesh',
        url: ['audio/wheesh.ogg', 'audio/wheesh.mp3'],
        volume: 0.2
    }, {
        id: 'engine',
        url: ['audio/engine.ogg', 'audio/engine.mp3'],
        volume: 0.03,
        loop: true,
        singlePlay: true
    }, {
        id: 'noise',
        url: ['audio/noise.ogg', 'audio/noise.mp3'],
        volume: 0.3,
        loop: true,
        singlePlay: true
    }],
    onComplete: sounds => console.log(sounds),
    onProgress: progress => console.log(progress)
});
