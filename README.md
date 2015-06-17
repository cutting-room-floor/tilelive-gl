# tilelive-gl

Renderer backend for [tilelive.js](http://github.com/mapbox/tilelive.js) that uses [node-mapbox-gl-native](http://github.com/mapbox/node-mapbox-gl-native) to render tiles from a [Mapbox GL style](https://www.mapbox.com/mapbox-gl-style-spec/).

[![NPM](https://nodei.co/npm/tilelive-gl.png)](https://npmjs.org/package/tilelive-gl)

[![Build Status](https://travis-ci.org/mapbox/tilelive-gl.svg?branch=master)](https://travis-ci.org/mapbox/tilelive-gl)

## new GL(options, callback)

- *style*: a Mapbox GL style string or object that will be used to render vector tiles.
- *scale*: Optional, scale factor. Defaults to `1`.

## Usage

```javascript
var GL = require('tilelive-gl');

new GL({ style: require('/path/to/file.json') }, function(err, map) {
    if (err) throw err;

    // Interface is in XYZ/Google coordinates.
    // Use `y = (1 << z) - 1 - y` to flip TMS coordinates.
    map.getTile(0, 0, 0, function(err, image) {
        // `err` is an error object when generation failed, otherwise null.
        // `image` contains the compressed image file as a Buffer
    });
});
```

## Tilelive API

Though `tilelive` is not a dependency of `tilelive-gl` you will want to install it to make use of `tilelive-gl` through the [tilelive API](https://github.com/mapbox/tilelive.js/blob/master/API.md).

```javascript
var tilelive = require('tilelive');
require('tilelive-gl').registerProtocols(tilelive);

tilelive.load('gl:///path/to/file.json', function(err, map) {
    map.getTile(0, 0, 0, function(err, image) {});
});
```
