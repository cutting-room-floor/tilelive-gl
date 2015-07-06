'use strict';

/* jshint node:true */

var TileSource = require('..');
var test = require('tape').test;
var tilelive = require('tilelive');
var mbgl = TileSource.mbgl;

// These calls are all effectively synchronous though they use a callback.
test('TileSource', function(t) {
    t.test('fileSource', function(t) {
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
    fileSource.request = function(req) {
        req.respond(null, { data: new Buffer(0) });
    };
    fileSource.cancel = function() {};

    var GL = TileSource(fileSource);

    t.test('options', function(t) {
        t.test('must be an object or a string', function(t) {
            new GL(null, function(err) {
                t.equal(err.toString(), 'Error: options must be an object or a string');
                t.end();
            });
        });

        t.test('missing GL style JSON', function(t) {
            new GL({}, function(err) {
                t.equal(err.toString(), 'Error: Missing GL style JSON');
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

    t.test('getTile', function(t) {
        new GL({ style: {} }, function(err, map) {
            t.error(err);
            t.equal(map instanceof GL, true, 'instanceof GL');

            var callback = function(err, image) {
                t.error(err);
                t.end();
            };

            map.getTile(0, 0, 0, callback);
        });
    });

    t.end();
});
