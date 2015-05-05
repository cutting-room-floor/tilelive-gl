'use strict';

/* jshint node:true */

var TileSource = require('..');
var test = require('tape').test;
var fs = require('fs');
var path = require('path');
var http = require('http');
var st = require('st');
var mkdirp = require('mkdirp');
var compare = require('./compare.js')
var tiles = ['0-0-0', '1-0-1', '2-1-1', '3-2-3', '4-4-6'];
var fileSource = require('./lib/fs');
var style = require('./fixtures/style.json');

test('Render', function(t) {
    var GL = TileSource(fileSource);
    var mbgl = TileSource.mbgl;

    mbgl.on('message', function(msg) {
        console.log(msg);
    });

    function filePath(name) {
        return ['expected', 'actual', 'diff'].reduce(function(prev, key) {
            var dir = path.join('test', key);
            mkdirp.sync(dir);
            prev[key] = path.join(dir, name);
            return prev;
        }, {});
    }

    function renderTest(tile, style, scale) {
        return function(t) {
            new GL({ style: style }, function(err, source) {
                t.error(err);

                var callback = function(err, image) {
                    if (err) {
                        t.error(err);
                        return t.end();
                    }

                    var filename = filePath(tile.join('-') + (scale ? '@' + scale + 'x' : '') + '.png');

                    if (process.env.UPDATE) {
                        fs.writeFile(filename.expected, image, function(err) {
                            t.error(err);
                            t.end();
                        });
                    } else {
                        fs.writeFile(filename.actual, image, function(err) {
                            compare(filename.actual, filename.expected, filename.diff, t, function(error, difference) {
                                t.ok(difference <= 0.01, 'actual matches expected');
                                t.end();
                            });
                        });
                    }
                };

                if (scale) callback.scale = scale;

                callback.accessToken = 'pk.test';

                var z = tile[0];
                var x = tile[1];
                var y = tile[2];

                source.getTile(z, x, y, callback);
            });
        }
    }


    tiles.forEach(function(tile) {
        t.test(tile, renderTest(tile.split('-'), style));
        t.test(tile + '@2x', renderTest(tile.split('-'), style, 2));
    });

    t.end();
});
