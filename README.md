# Ludum Dare 39

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
