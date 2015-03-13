'use strict';

/* jshint node:true */

var GL = require('../index.js');
var test = require('tape').test;

// These calls are all effectively synchronous though they use a callback.
test('api', function(t) {
    new GL(null, function(err) {
        t.equal(err.toString(), 'Error: options must be an object');
    });
    // @TODO support filepath loading in the future?
    new GL('gl:///test-style.json', function(err) {
        t.equal(err.toString(), 'Error: options must be an object');
    });
    new GL({}, function(err) {
        t.equal(err.toString(), 'Error: options.style must be a GL style object');
    });
    new GL({ style: {} }, function(err, source) {
        if (!process.env.MAPBOX_ACCESS_TOKEN) {
            t.equal(err.toString(), 'Error: options.accessToken string or MAPBOX_ACCESS_TOKEN environment variable required');
        }
    });
    new GL({ style: {}, accessToken: '' }, function(err, source) {
        t.ifError(err);
        t.equal(source instanceof GL, true, 'GL source');
    });
    t.end();
});
