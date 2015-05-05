'use strict';

/* jshint node:true */

var mbgl = require('mapbox-gl-native');
var fs = require('fs');
var path = require('path');

var base = path.join(__dirname, '..');

var fileSource = new mbgl.FileSource();
fileSource.request = function(req) {
    fs.readFile(path.join(base, req.url), function(err, data) {
        req.respond(err, { data: data });
    });
};

fileSource.cancel = function(req) {
    req.canceled = true;
};

module.exports = fileSource;
