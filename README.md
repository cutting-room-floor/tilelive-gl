# tilelive-gl

Renderer backend for [tilelive.js](http://github.com/mapbox/tilelive.js) that uses [node-mapbox-gl-native](http://github.com/mapbox/node-mapbox-gl-native) to render tiles from a [Mapbox GL style](https://www.mapbox.com/mapbox-gl-style-spec/).

[![Build Status](https://secure.travis-ci.org/mapbox/tilelive-gl.png)](http://travis-ci.org/mapbox/tilelive-gl)


## Installation

First, [install](https://github.com/mapbox/mapbox-gl-native/tree/cli-render-disable-assert#build-instructions) the [`cli-render-disable-assert`](https://github.com/mapbox/mapbox-gl-native/tree/cli-render-disable-assert) branch of `mapbox-gl-native` and [set an access token](https://github.com/mapbox/mapbox-gl-native/tree/cli-render-disable-assert#mapbox-api-access-tokens).

Next, install the [`cli-render`](https://github.com/mapbox/node-mapbox-gl-native/tree/cli-render) branch of `node-mapbox-gl-native` and finally `npm install mapbox/tilelive-gl`.

## Usage

```javascript
var GL = require('tilelive-gl');

new GL({ style: require('/path/to/file.json') }, function(err, source) {
    if (err) throw err;

    // Interface is in XYZ/Google coordinates.
    // Use `y = (1 << z) - 1 - y` to flip TMS coordinates.
    source.getTile(0, 0, 0, function(err, tile) {
        // `err` is an error object when generation failed, otherwise null.
        // `tile` contains the compressed image file as a Buffer
    });
});
```

## Prospective future API?

Though `tilelive` is not a dependency of `tilelive-gl` you will want to install it to actually make use of `tilelive-gl` through a reasonable API.

```javascript
var tilelive = require('tilelive');
require('tilelive-gl').registerProtocols(tilelive);

tilelive.load('gl:///path/to/file.json', function(err, source) {
    source.getTile(0, 0, 0, function(err, tile, headers) {
    });
});
```
