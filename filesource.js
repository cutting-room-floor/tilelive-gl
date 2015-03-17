var mbgl = require('mapbox-gl-native');
var request = require('request');

var fileSource = new mbgl.FileSource();
fileSource.request = function(req) {
    request({
        url: req.url,
        encoding: null,
        gzip: true
    }, function (err, res, body) {
        if (req.canceled) {
            return;
        }
        if (err) {
            req.respond(err);
        } else if (res.statusCode == 200) {
            var response = {};

            if (res.headers.modified) { response.modified = new Date(res.headers.modified); }
            if (res.headers.expires) { response.expires = new Date(res.headers.expires); }
            if (res.headers.etag) { response.etag = res.headers.etag; }
            response.data = body;
            req.respond(null, response);
        } else {
            console.warn(new Date(res.headers.expires));
        }
    });
};

fileSource.cancel = function(req) {
    req.canceled = true;
};

module.exports = fileSource;
