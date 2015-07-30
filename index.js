var sm = new (require('sphericalmercator'))();
var mbgl = require('mapbox-gl-native');
var PNG = require('pngjs').PNG;
var stream = require('stream');
var concat = require('concat-stream');
var Pool = require('generic-pool').Pool;
var N_CPUS = require('os').cpus().length;

module.exports = GL;
module.exports.mbgl = mbgl;

function pool(options) {
    var mapOptions = {};
    mapOptions.request = options.request;
    if (options.cancel) mapOptions.cancel = options.cancel;

    return Pool({
        create: create,
        destroy: destroy,
        max: N_CPUS
    });

    function create(callback) {
        var map = new mbgl.Map(mapOptions);
        map.load(options.style);
        return callback(null, map);
    }

    function destroy(map) {
        map.release();
    }
}

function GL(options, callback) {
    if (!options || (typeof options !== 'object' && typeof options !== 'string')) return callback(new Error('options must be an object or a string'));

    if (!options.style) return callback(new Error("Options object must have a 'style' property"));

    if (typeof options.request !== 'function') return callback(new Error("Options object must have a 'request' method"));
    if (options.hasOwnProperty('cancel') && typeof options.cancel !== 'function') return callback(new Error("Options object 'cancel' property must be a function"));

    this._scale = options.scale || 1;
    this._pool = pool(options);

    return callback(null, this);
}

GL.registerProtocols = function(tilelive) {
    tilelive.protocols['gl:'] = GL;
};

GL.prototype.getTile = function(z, x, y, callback) {
    // Hack around tilelive API - allow params to be passed per request
    // as attributes of the callback function.
    var scale = callback.scale || this._scale;

    var bbox = sm.bbox(+x,+y,+z, false, '900913');
    var center = sm.inverse([bbox[0] + ((bbox[2] - bbox[0]) * 0.5), bbox[1] + ((bbox[3] - bbox[1]) * 0.5)]);

    var options = {
        // pass center in lat, lng order
        center: [center[1], center[0]],
        width: 512,
        height: 512,
        ratio: scale,
        zoom: z
    };

    this.getStatic(options, callback);
};

GL.prototype.getStatic = function(options, callback) {
    this._pool.acquire(function(err, map) {
        map.render(options, function(err, data) {

            if (err) return callback(err);

            var png = new PNG({
                width: data.width,
                height: data.height
            });

            png.data = data.pixels;

            var concatStream = concat(function(buffer) {
                return callback(null, buffer, { 'Content-Type': 'image/png' });
            });

            this._pool.release(map);
            png.pack().pipe(concatStream);
        }.bind(this));
    }.bind(this));
};
