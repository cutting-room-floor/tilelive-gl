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
var queue = require('queue-async');

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

    function renderTest(style, scale, t) {
        new GL({ style: style }, function(err, source) {
            t.error(err);

            tiles.forEach(function(tile) {
                var cb = function(err, image) {
                    if (err) {
                        t.error(err);
                        return callback(err);
                    }

                    var filename = filePath(tile.join('-') + (scale ? '@' + scale + 'x' : '') + '.png');
                    if (process.env.UPDATE) {
                        fs.writeFile(filename.expected, image, function(err) {
                            t.error(err);
                            return callback(err);
                        });
                    } else {
                        fs.writeFile(filename.actual, image, function(err) {
                            compare(filename.actual, filename.expected, filename.diff, t, function(error, difference) {
                                t.ok(difference <= 0.1, 'actual matches expected');
                                return callback();
                            });
                        });
                    }
                };

                if (scale) cb.scale = scale;

                var z = tile[0];
                var x = tile[1];
                var y = tile[2];

                source.getTile(z, x, y, cb);
            });
        });
    }

    renderTest(style, 2, t);

});
