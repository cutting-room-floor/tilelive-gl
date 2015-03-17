'use strict';

/* jshint node:true */

var GL = require('../index.js');
var test = require('tape').test;
var fs = require('fs');
var path = require('path');
var http = require('http');
var st = require('st');
var mkdirp = require('mkdirp');
var tilesPath = path.join(__dirname, 'fixtures', 'tiles');
var compare = require('./compare.js')
var style = require('./fixtures/style.json');

var server = http.createServer(st({ path: __dirname }));

function filePath(name) {
    return ['expected', 'actual', 'diff'].reduce(function(prev, key) {
        var dir = path.join('test', key);
        mkdirp.sync(dir);
        prev[key] = path.join(dir, name);
        return prev;
    }, {});
}

function startFixtureServer(callback) {
    server.listen(8000, function(err) {
        callback(err, err ? null : server.address().port);
    });
}

function renderTest(name, z, x, y, scale, style) {
    return function(t) {
        new GL({ style: style }, function(err, source) {
            t.error(err);
            t.deepEqual(source._style, style, 'GL source._style');
            var cbTile = function(err, image) {
                t.error(err);
                var filename = filePath(name + '@' + scale + 'x' + '.png');
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
            cbTile.scale = scale;
            source.getTile(z, x, y, cbTile);
        });
    }
}

startFixtureServer(function(err, port) {
    if (err) throw err;
    fs.readdirSync(tilesPath).forEach(function(tile, i) {
        var name = tile.split('.vector')[0];
        var z = tile.split('-')[0] || 0;
        var x = tile.split('-')[1] || 0;
        var y = tile.split('-')[2][0] || 0;
        // 1x
        test(name + '@1x', renderTest(name, z, x, y, 1, style));
        // 2x
        test.skip(name + '@2x', renderTest(name, z, x, y, 2, style));
    });
    test('cleanup', function(t) {
        server.close();
        t.end();
    });
});
