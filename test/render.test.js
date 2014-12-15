'use strict';

/* jshint node:true */

var GL = require('../index.js');
var test = require('tape').test;
var fs = require('fs');
var path = require('path');
var http = require('http');
var st = require('st');

var dirPath = path.join(path.dirname(require.resolve('mapbox-gl-styles/package.json')), 'styles');
var server = http.createServer(st({ path: dirPath }));

function startFixtureServer(callback) {
    server.listen(0, function(err) {
        callback(err, err ? null : server.address().port);
    });
}

function renderTest(name, stylePath) {
    return function(t) {
        var style = require(stylePath);
        new GL({ style: style }, function(err, source) {
            t.ifError(err);
            t.deepEqual(source._style, style, 'GL source._style');
            source.getTile(0, 0, 0, function(err, image) {
                t.ifError(err);
                var dir = __dirname + '/fixtures/' + name + '/';
                fs.writeFileSync(dir + (process.env.UPDATE ? 'expected' : 'actual') + '.png', image);
                t.end();
            });
        });
    }
}

startFixtureServer(function(err, port) {
    if (err) throw err;

    fs.readdirSync(dirPath).forEach(function(style) {
        var name = style.split('.json')[0];
        test(name, renderTest(name, path.join(dirPath, style)));
    });

    test('cleanup', function(t) {
        server.close();
        t.end();
    });
});
