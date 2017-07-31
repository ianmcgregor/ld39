import fps from 'usfl/fps';
import App from './components/app';
import Screens from './components/screens';
import AlphaTransition from './components/screens/transitions/alpha';
import Titles from './components/titles';
import Game from './components/game';
import GameOver from './components/game-over';
import GameComplete from './components/game-complete';
import WebFont from 'webfontloader';

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
