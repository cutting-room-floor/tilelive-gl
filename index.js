var sm = new (require('sphericalmercator'))();
var fs = require('fs');
var mbgl = require('mapbox-gl-native');
var fileSource = require('./filesource');

var Pool = require('generic-pool').Pool;
var N_CPUS = require('os').cpus().length;

module.exports = GL;

function GL(options, callback) {
    if (typeof options !== 'object' || !options) return callback(new Error('options must be an object'));

    if (typeof options.style !== 'object') return callback(new Error('options.style must be a GL style object'));
    this._style = options.style;

    if (typeof options.accessToken != 'string' && !process.env.MAPBOX_ACCESS_TOKEN) return callback(new Error('options.accessToken string or MAPBOX_ACCESS_TOKEN environment variable required'));
    this._accessToken = options.accessToken || process.env.MAPBOX_ACCESS_TOKEN;

    this._pool = pool(this._style, this._accessToken);

    return callback(null, this);
}

function pool(style, accessToken) {
    return Pool({
        create: create,
        destroy: destroy,
        max: N_CPUS
    });

    function create(callback) {
        var map = new mbgl.Map(fileSource);
        map.setAccessToken(accessToken)
        map.load(style);
        return callback(null, map);
    }

    function destroy(map) {
    }
}


GL.prototype.getTile = function(z, x, y, callback) {

    // Hack around tilelive API - allow params to be passed per request
    // as attributes of the callback function.
    var scale = callback.scale || 1;

    var bbox = sm.bbox(+x,+y,+z, false, 'WGS84');
    var options = {
        center: [bbox[1] + ((bbox[3] - bbox[1]) * 0.5), bbox[0] + ((bbox[2] - bbox[0]) * 0.5)],
        width: 512,
        height: 512,
        ratio: scale || 1,
        zoom: z
    };

    this._pool.acquire(function(err, map) {
        if (err) return callback(err);

        map.render(options, function(err, buffer) {
            if (err) return callback(err);
            mbgl.compressPNG(buffer, function(err, image) {
                if (err) return callback(err);
                this._pool.release(map);
                return callback(null, image, { 'Content-Type': 'image/png' });
            }.bind(this));
        }.bind(this));
    }.bind(this));
};
