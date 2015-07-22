'use strict';

/* jshint node:true */

var TileSource = require('../..');
var fileSource = require('./fs');
var GL = TileSource(fileSource);
var locking = require('locking');

TileSource.mbgl.on('message', function(msg) {
    console.log(msg);
});

module.exports = locking(function(params, callback) {
    new GL({ style: params.style, scale: params.scale }, function(err, map) {
        if (err) return callback(err);
        return callback(null, map);
    });
});

