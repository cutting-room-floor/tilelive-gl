'use strict';

/* jshint node:true */

var GL = require('..');
var test = require('tape').test;
var tilelive = require('tilelive');

test('GL', function(t) {
    t.test('options', function(t) {
        t.test('must be an object or a string', function(t) {
            new GL(null, function(err) {
                t.equal(err.toString(), 'Error: options must be an object or a string');

                t.end();
            });
        });

        t.test('options', function(t) {
            t.test("must have a 'style' property", function(t) {
                new GL({}, function(err) {
                    t.equal(err.toString(), "Error: Options object must have a 'style' property");
                    t.end();
                });
            });

            t.test("must have a 'request' method", function(t) {
                new GL({ style: {} }, function(err) {
                    t.equal(err.toString(), "Error: Options object must have a 'request' method");
                    t.end();
                });
            });

            t.test("must have a 'request' method", function(t) {
                new GL({ style: {}, request: 'test' }, function(err) {
                    t.equal(err.toString(), "Error: Options object must have a 'request' method");
                    t.end();
                });
            });

            t.test("'cancel' property must be a function", function(t) {
                new GL({ style: {}, request: function() {}, cancel: 'test' }, function(err) {
                    t.equal(err.toString(), "Error: Options object 'cancel' property must be a function");
                    t.end();
                });
            });

            t.end();
        });

        t.end();
    });

    t.test('new GL', function(t) {
        new GL({
            style: {},
            request: function() {}
        }, function(err, map) {
            t.error(err);
            t.equal(map instanceof GL, true, 'instanceof GL');

            map._pool.drain(function() {
                map._pool.destroyAllNow();
                t.end();
            });
        });
    });

    t.test('getTile', function(t) {
        new GL({
          style: {},
          request: function() {
              req.respond(null, { data: new Buffer(0) });
          }
        }, function(err, map) {
            t.error(err);
            t.equal(map instanceof GL, true, 'instanceof GL');

            var callback = function(err, image) {
                t.error(err);

                map._pool.drain(function() {
                    map._pool.destroyAllNow();
                    t.end();
                });
            };

            map.getTile(0, 0, 0, callback);
        });
    });

    t.end();
});
