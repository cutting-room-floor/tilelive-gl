'use strict';

/* jshint node:true */

var TileSource = require('..');
var test = require('tape').test;
var mbgl = require('mapbox-gl-native');
var style = require('./fixtures/style.json');

// These calls are all effectively synchronous though they use a callback.
test('TileSource', function(t) {
    t.test('fileSource', function(t) {
        t.test('must be a FileSource object', function(t) {
            t.throws(function() {
                TileSource({});
            }, /fileSource must be a FileSource object/);
            t.end();
        });

        t.test('must have a request method', function(t) {
            var fileSource = new mbgl.FileSource();

            t.throws(function() {
                TileSource(fileSource);
            }, /fileSource must have a 'request' method/);
            t.end();
        });

        t.test('must have a cancel method', function(t) {
            var fileSource = new mbgl.FileSource();
            fileSource.request = function() {};

            t.throws(function() {
                TileSource(fileSource);
            }, /fileSource must have a 'cancel' method/);
            t.end();
        });

        t.end();
    });
});

test('GL', function(t) {
    var fileSource = new mbgl.FileSource();
    fileSource.request = function() {};
    fileSource.cancel = function() {};

    var GL = TileSource(fileSource);

    t.test('options', function(t) {
        t.test('must be an object', function(t) {
            new GL(null, function(err) {
                t.equal(err.toString(), 'Error: options must be an object');
                t.end();
            });
        });

        // @TODO support filepath loading in the future?
        t.test('gl protocol style path', function(t) {
            new GL('gl:///test-style.json', function(err) {
                t.equal(err.toString(), 'Error: options must be an object');
                t.end();
            });
        });

        t.end();
    });

    t.test('style', function(t) {
        t.test('must be a GL style object', function(t) {
            new GL({}, function(err) {
                t.equal(err.toString(), 'Error: options.style must be a GL style object');
                t.end();
            });
        });

        t.end();
    });

    t.test('new GL', function(t) {
        new GL({ style: {} }, function(err, map) {
            t.error(err);
            t.equal(map instanceof GL, true, 'instanceof GL');
            t.end();
        });
    });

    t.test('access token', function(t) {
        t.test('must be a string', function(t) {
            new GL({ style: {} }, function(err, map) {
                map.getTile(0, 0, 0, function(err, image) {
                    t.equal(err.toString(), 'Error: callback.accessToken must be a string');
                    t.end();
                });
            });
        });

        t.end();
    });

    t.test('getTile', function(t) {

        new GL({ style: {} }, function(err, map) {
            t.error(err);
            t.equal(map instanceof GL, true, 'instanceof GL');

            var callback = function(err, image) {
                t.error(err);
                t.end();
            };

            callback.accessToken = 'pk.test';

            map.getTile(0, 0, 0, callback);
        });
    });

    t.end();
});
