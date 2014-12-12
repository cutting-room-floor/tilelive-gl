var sm = new (require('sphericalmercator'))();
var fs = require('fs');
var mbgl = require('mapbox-gl-native');

var Pool = require('generic-pool').Pool;
var N_CPUS = require('os').cpus().length;

module.exports = GL;

function GL(uri, callback) {
    if (typeof uri !== 'object' || !uri) return callback(new Error('uri must be an object'));
    if (typeof uri.style !== 'object') return callback(new Error('uri.style must be a GL style object'));
    this._style = uri.style;
    this._pool = pool(this._style);
    return callback(null, this);
}

function pool(style) {
    return Pool({
        create: create,
        destroy: destroy,
        max: N_CPUS
    });

    function create(callback) {
        var map = new mbgl.Map();
        map.load(style);
        return callback(null, map);
    }

    function destroy(map) {
        delete map;
    }
}

GL.prototype.getTile = function(z, x, y, callback) {
    if (!process.env.MAPBOX_ACCESS_TOKEN) return callback(new Error('MAPBOX_ACCESS_TOKEN env var required'));

    var bbox = sm.bbox(+x,+y,+z, false, 'WGS84');
    var options = {
        center: [bbox[0] + ((bbox[2] - bbox[0]) * 0.5), bbox[1] + ((bbox[3] - bbox[1]) * 0.5)],
        width: 512,
        height: 512,
        zoom: z,
        accessToken: process.env.MAPBOX_ACCESS_TOKEN
    };

    this._pool.acquire(function(err, map) {
        if (err) return callback(err);

        map.render(options, function(err, buffer) {
            if (err) return callback(err);
            this._pool.release(map);
            return callback(null, buffer, { 'Content-Type': 'image/png' });
        }.bind(this));
    }.bind(this));
};
