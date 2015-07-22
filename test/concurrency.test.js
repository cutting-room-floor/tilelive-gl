'use strict';

/* jshint node:true */

var TileSource = require('..');
var test = require('tape').test;
var loadMap = require('./lib/load');
var tile = { z: 0, x: 0, y: 0 };
var style = require('./fixtures/style.json');

test('Concurrency', function(t) {
    for (var i = 0; i < 10; i++) {
        loadMap({ style: style }, function(err, map) {
            t.error(err);

            map.getTile(tile.z, tile.x, tile.y, function(err, image) {
                t.error(err);
            });
        });
    }

    t.end();
});
