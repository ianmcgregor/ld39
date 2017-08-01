# Ludum Dare 39

The mainframe has become infested with bugs. You must control the BUG SQUASHER 9000 to eradicate them!

Battle your way through several levels of computer circuitry. But be careful: the charge for each of the bug squasher's systems (shield, weapons, fuel) is quite limited.

I planned to enter the compo but needed some extra time. I made all the code, audio and graphics (badly!).

The code is all JavaScript running on PixiJS. I used PISKEL for the graphics in the end. The music and sfx were all made using Korg Volca and Roland JX3P synths and put together in Reaper.

## Usage

### Building

Npm is used to run the build tasks for the project. The tasks are all defined in `package.json`, with scripts for more complicated tasks are contained in the `scripts` directory.

Runs the build task, starts the watch tasks and dev server:

```shell
npm start
```

Processes assets and builds CSS and JS bundles to the `dist` folder:

```shell
npm run build
```

Deletes `dist` and recreates folder structure:

```shell
npm run clean
```

Starts a simple web server that reloads when changes are made:

```shell
npm run browsersync
```

Builds CSS bundle to `dist/css/styles.css`:

```shell
npm run css
```

Builds JS bundle to `dist/js/bundle.js`:

```shell
npm run js
```

Generates modernizr.js and outputs to `dist/js`:

```shell
npm run modernizr
```

Renders HTML templates and copies to `dist`:

```shell
npm run html
```

Copies files to `dist`:

```shell
npm run copy
```

Reformats and (optionally) resizes images and copies to `dist/img`:

```shell
npm run img:convert
```

Tinifies images and copies to `dist/img`:

```shell
npm run img:tinify
```

Converts audio files to ogg and mp3 and outputs to `dist/audio`:

```shell
npm run audio
```

Runs TexturePacker CLI pack images into spritesheets in `dist/textures`:

```shell
npm run texturepack
```
