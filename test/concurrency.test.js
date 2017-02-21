'use strict';

/* jshint node:true */

var GL = require('..');
var options = require('./lib/fs');
var test = require('tape').test;
var locking = require('locking');
var style = require('./fixtures/style.json');

GL.mbgl.on('message', function(msg) {
    console.log(msg);
});

var loadMap = locking(function(key, callback) {
    new GL({
        style: style,
        request: options.request,
        cancel: options.cancel
    }, function(err, map) {
        if (err) return callback(err);
        return callback(null, map);
    });
});

test.skip('Concurrency', function(t) {
    var tile = { z: 0, x: 0, y: 0 };

    for (var i = 0, j = 0; i < 10; i++) {
        loadMap('style', function(err, map) {
            t.error(err);

            map.getTile(tile.z, tile.x, tile.y, function(err, image) {
                t.error(err);
                if (++j == 10) {
                    map._pool.drain(function() {
                        map._pool.destroyAllNow();
                        t.end();
                    });
                }
            });
        });
    }
});
