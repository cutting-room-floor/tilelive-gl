'use strict';

/* jshint node:true */

var mbgl = require('mapbox-gl-native');
var fs = require('fs');
var path = require('path');

var base = path.join(__dirname, '..');

module.exports = {
    request: function(req) {
        fs.readFile(path.join(base, req.url), function(err, data) {
            req.respond(err, { data: data });
        });
    },
    cancel: function(req) {
        req.canceled = true;
    }
};
