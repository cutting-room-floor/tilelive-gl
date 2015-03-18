'use strict';

/* jshint node:true */

var GL = require('../index.js');
var test = require('tape').test;
var mbgl = require('mapbox-gl-native');
var style = require('./fixtures/style.json');

// These calls are all effectively synchronous though they use a callback.
test('GL', function(t) {
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


    t.test('source', function(t) {
        t.test('must be a FileSource object', function(t) {
            new GL({ source: {} }, function(err) {
                t.equal(err.toString(), 'Error: options.source must be a FileSource object');
                t.end();
            });
        });

        t.test('must have a request method', function(t) {
            var source = new mbgl.FileSource();

            new GL({ source: source }, function(err) {
                t.equal(err.toString(), "Error: options.source must have a 'request' method");
                t.end();
            });
        });

        t.test('must have a cancel method', function(t) {
            var source = new mbgl.FileSource();
            source.request = function() {};

            new GL({ source: source }, function(err) {
                t.equal(err.toString(), "Error: options.source must have a 'cancel' method");
                t.end();
            });
        });

        t.end();
    });

    t.test('style', function(t) {
        var source = new mbgl.FileSource();
        source.request = function() {};
        source.cancel = function() {};

        t.test('must be a GL style object', function(t) {
            new GL({ source: source }, function(err) {
                t.equal(err.toString(), 'Error: options.style must be a GL style object');
                t.end();
            });
        });

        t.test('instanceof GL', function(t) {
            new GL({ source: source, style: {} }, function(err, source) {
                t.ifError(err);
                t.equal(source instanceof GL, true);
                t.end();
            });
        });

        t.test('success', function(t) {
            new GL({ source: source, style: style }, function(err, source) {
                t.ifError(err);
                t.equal(source instanceof GL, true, 'GL source');
                t.deepEqual(source._style, style, 'source._style matches style');
                t.end();
            });
        });

        t.end();
    });

    t.test('access token', function(t) {
        var source = new mbgl.FileSource();
        source.request = function() {};
        source.cancel = function() {};

        t.test('success', function(t) {
            new GL({ source: source, style: {}, accessToken: 'pk.test' }, function(err, source) {
                t.ifError(err);
                t.equal(source instanceof GL, true, 'GL source with access token');
                t.equal(source._accessToken, 'pk.test');
                t.end();
            });
        });

        t.end();
    });

    t.end();
});
