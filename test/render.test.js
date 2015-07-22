'use strict';

/* jshint node:true */

var TileSource = require('..');
var test = require('tape').test;
var loadMap = require('./lib/load');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var compare = require('./lib/compare')
var tiles = ['0-0-0', '1-0-1', '2-1-1', '3-2-3', '4-4-6'];
var style = require('./fixtures/style.json');

function filePath(name) {
    return ['expected', 'actual', 'diff'].reduce(function(prev, key) {
        var dir = path.join('test', key);
        mkdirp.sync(dir);
        prev[key] = path.join(dir, name);
        return prev;
    }, {});
}

function render(name, scale) {
    var split = name.split('-');

    var tile = {
        z: split[0],
        x: split[1],
        y: split[2]
    };

    var filename = filePath(name + (scale ? '@' + scale + 'x' : '') + '.png');

    return function(t) {
        loadMap({ style: style, scale: scale }, function(err, map) {
            t.error(err);

            var callback = function(err, image) {
                t.error(err);

                if (process.env.UPDATE) {
                    fs.writeFile(filename.expected, image, function(err) {
                        t.error(err);
                        t.end();
                    });
                } else {
                    fs.writeFile(filename.actual, image, function(err) {
                        compare(filename.actual, filename.expected, filename.diff, t, function(err, difference) {
                            t.error(err);
                            t.ok(difference <= 0.01, 'actual matches expected');
                            t.end();
                        });
                    });
                }
            };

            if (scale) callback.scale = scale;

            map.getTile(tile.z, tile.x, tile.y, callback);
        });
    }
}

test('Render', function(t) {
    tiles.forEach(function(tile) {
        t.test(tile, render(tile));
        t.test(tile + '@2x', render(tile, 2));
    });

    t.end();
});
