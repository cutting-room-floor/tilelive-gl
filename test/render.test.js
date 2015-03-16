'use strict';

/* jshint node:true */

var GL = require('../index.js');
var test = require('tape').test;
var fs = require('fs');
var path = require('path');
var http = require('http');
var st = require('st');
var mkdirp = require('mkdirp');

var dirPath = path.join(path.dirname(require.resolve('mapbox-gl-styles/package.json')), 'styles');
var server = http.createServer(st({ path: dirPath }));

function startFixtureServer(callback) {
    server.listen(0, function(err) {
        callback(err, err ? null : server.address().port);
    });
}

function renderTest(name, z, x, y, scale, stylePath) {
    return function(t) {
        var style = require(stylePath);
        new GL({ style: style }, function(err, source) {
            t.error(err);
            t.deepEqual(source._style, style, 'GL source._style');
            var cbTile = function(err, image) {
                t.error(err);
                var dir = __dirname + '/fixtures/' + name + '/';
                mkdirp(dir, function(err) {
                    t.error(err);
                    fs.writeFileSync(dir + (process.env.UPDATE ? 'expected-' : 'actual') + '-' + z + '-' + x + '-' + y + (scale ? '@2x' : '') + '.png', image);
                    t.end();
                });
            };
            if (scale) cbTile.scale = scale;
            source.getTile(z, x, y, cbTile);
        });
    }
}

startFixtureServer(function(err, port) {
    if (err) throw err;

    fs.readdirSync(dirPath).forEach(function(style) {
        var name = style.split('.json')[0];
        var tiles = ['0.0.0', '1.0.1', '2.1.1', '3.2.3', '4.4.6', '4.4.6.2'];
        tiles.forEach(function(tile) {
            var z = tile.split('.')[0] || 0;
            var x = tile.split('.')[1] || 0;
            var y = tile.split('.')[2] || 0;
            var scale = tile.split('.')[3] || null;
            test(name, renderTest(name, z, x, y, scale, path.join(dirPath, style)));
        });
    });

    test('cleanup', function(t) {
        server.close();
        t.end();
    });
});
