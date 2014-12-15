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

// These calls are all effectively synchronous though they use a callback.
test('api', function(t) {
    new GL(null, function(err) {
        t.equal(err.toString(), 'Error: uri must be an object');
    });
    // @TODO support filepath loading in the future?
    new GL('gl:///test-style.json', function(err) {
        t.equal(err.toString(), 'Error: uri must be an object');
    });
    new GL({}, function(err) {
        t.equal(err.toString(), 'Error: uri.style must be a GL style object');
    });
    new GL({ style: {} }, function(err, source) {
        t.ifError(err);
        t.equal(source instanceof GL, true, 'GL source');
    });
    t.end();
});

function renderTest(name, stylePath) {
    return function(t) {
        var style = require(stylePath);
        new GL({ style: style }, function(err, source) {
            t.ifError(err);
            t.deepEqual(source._style, style, 'GL source._style');
            source.getTile(0, 0, 0, function(err, image) {
                t.ifError(err);
                var dir = __dirname + '/' + (process.env.UPDATE ? 'expected' : 'actual') + '/';
                mkdirp(dir);
                fs.writeFileSync(dir + name + '.png', image);
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
