var sm = new (require('sphericalmercator'))();
var fs = require('fs');
var mbgl = require('mapbox-gl-native');

var Pool = require('generic-pool').Pool;
var N_CPUS = require('os').cpus().length;

module.exports = function(fileSource) {
    if (!(fileSource instanceof mbgl.FileSource)) throw new Error('fileSource must be a FileSource object');
    if (typeof fileSource.request !== 'function') throw new Error("fileSource must have a 'request' method");
    if (typeof fileSource.cancel !== 'function') throw new Error("fileSource must have a 'cancel' method");

    GL.prototype._pool = pool(fileSource);

    return GL;
};

module.exports.mbgl = mbgl;

function GL(options, callback) {
    if (typeof options !== 'object' || !options) return callback(new Error('options must be an object'));

    if (typeof options.style !== 'object') return callback(new Error('options.style must be a GL style object'));
    this._style = options.style;

    if (typeof options.accessToken !== 'string') return callback(new Error('options.accessToken must be a string'));
    this._accessToken = options.accessToken;

    return callback(null, this);
}

function pool(fileSource) {
    return Pool({
        create: create,
        destroy: destroy,
        max: N_CPUS
    });

    function create(callback) {
        var map = new mbgl.Map(fileSource);
        return callback(null, map);
    }

    function destroy(map) {
    }
}


GL.prototype.getTile = function(z, x, y, callback) {

    // Hack around tilelive API - allow params to be passed per request
    // as attributes of the callback function.
    var scale = callback.scale || 1;

    var bbox = sm.bbox(+x,+y,+z, false, '900913');
    var center = sm.inverse([bbox[0] + ((bbox[2] - bbox[0]) * 0.5), bbox[1] + ((bbox[3] - bbox[1]) * 0.5)]);

    var options = {
        // pass center in lat, lng order
        center: [center[1], center[0]],
        width: 512,
        height: 512,
        ratio: scale || 1,
        zoom: z
    };

    this._pool.acquire(function(err, map) {
        if (err) return callback(err);

        map.setAccessToken(this._accessToken)
        map.load(this._style);

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
