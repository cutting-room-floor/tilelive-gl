var sm = new (require('sphericalmercator'))();
var fs = require('fs');
var mbgl = require('mapbox-gl-native');

module.exports = GL;

function GL(uri, callback) {
    if (typeof uri !== 'object' || !uri) return callback(new Error('uri must be an object'));
    if (typeof uri.style !== 'object') return callback(new Error('uri.style must be a GL style object'));
    this._styleJSON = JSON.stringify(uri.style);
    return callback(null, this);
}

GL.prototype.getTile = function(z, x, y, callback) {
    if (!process.env.MapboxAccessToken) return callback(new Error('MapboxAccessToken env var required'));

    var bbox = sm.bbox(+x,+y,+z, false, 'WGS84');
    var optsJSON = JSON.stringify({
        center: [bbox[0] + ((bbox[2] - bbox[0]) * 0.5), bbox[1] + ((bbox[3] - bbox[1]) * 0.5)],
        width: 512,
        height: 512,
        zoom: z,
        accessToken: process.env.MapboxAccessToken
    });
    console.log(optsJSON);
    mbgl.render(this._styleJSON, optsJSON, __dirname + '/', function(err, buffer) {
        if (err) return callback(err);
        return callback(null, buffer, { 'Content-Type': 'image/png' });
    });
};

