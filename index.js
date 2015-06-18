var sm = new (require('sphericalmercator'))();
var fs = require('fs');
var path = require('path');
var mbgl = require('mapbox-gl-native');
var PNG = require('pngjs').PNG;
var stream = require('stream');
var concat = require('concat-stream');

module.exports = function(fileSource) {
    if (!(fileSource instanceof mbgl.FileSource)) throw new Error('fileSource must be a FileSource object');
    if (typeof fileSource.request !== 'function') throw new Error("fileSource must have a 'request' method");
    if (typeof fileSource.cancel !== 'function') throw new Error("fileSource must have a 'cancel' method");

    GL.prototype._fileSource = fileSource;

    return GL;
};

module.exports.mbgl = mbgl;

function GL(options, callback) {
    if (!options || (typeof options !== 'object' && typeof options !== 'string')) return callback(new Error('options must be an object or a string'));

    if (typeof options === 'string' || (options.protocol && !options.style)) {
        options = typeof options === 'string' ? url.parse(options) : options;
        var filepath = path.resolve(options.pathname);
        fs.readFile(filepath, 'utf8', function(err, data) {
            if (err) return callback(err);
            new GL({ style: data }, callback);
        });
        return;
    }

    if (!options.style) return callback(new Error('Missing GL style JSON'));

    this._scale = options.scale || 1;

    this._map = new mbgl.Map(this._fileSource);
    this._map.load(options.style);

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
    this._map.render(options, function(err, data) {
        if (err) return callback(err);

        var png = new PNG({
            width: data.width,
            height: data.height
        });

        png.data = data.pixels;

        var concatStream = concat(function(buffer) {
            return callback(null, buffer, { 'Content-Type': 'image/png' });
        });

        png.pack().pipe(concatStream);
    });
};
