'use strict';

/* jshint node:true */

var GL = require('../index.js');
var test = require('tape').test;

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
