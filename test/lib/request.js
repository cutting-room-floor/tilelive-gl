'use strict';

/* jshint node:true */

var mbgl = require('mapbox-gl-native');
var request = require('request');
var util = require('./util');
var MapboxAccessToken = process.env.MapboxAccessToken;
var path = 'https://a.tiles.mapbox.com/v4/';

var cache = {};

var fileSource = new mbgl.FileSource();
fileSource.request = function(req) {
    var url;
    if(req.kind === 0) {
        url = req.url;
    } else if (req.kind === 1) {
        url = util.normalizeStyleURL(req.url, MapboxAccessToken);
    } else if (req.kind === 2) {
        url = util.normalizeSourceURL(req.url, MapboxAccessToken);
    } else if (req.kind === 3) {
        url = util.normalizeTileURL(req.url, MapboxAccessToken);
    } else if (req.kind === 4) {
        url = util.normalizeGlyphsURL(req.url, MapboxAccessToken);
    } else if (req.kind === 5) {
        url = req.url;
    } else if (req.kind === 6) {
        url = req.url;
    } else {
        url = req.url;
    }

    request({
        url: url,
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
            req.respond(new Error(JSON.parse(body).message));
        }
    });
};

fileSource.cancel = function(req) {
    req.canceled = true;
};

module.exports = fileSource;
