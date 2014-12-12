var GL = require('../index.js');
var fs = require('fs');
var tape = require('tape');
var testStyle = require('./style.json');

// These calls are all effectively synchronous though they use a callback.
tape('init', function(t) {
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
    new GL({ style: testStyle }, function(err, source) {
        t.ifError(err);
        t.equal(source instanceof GL, true, 'GL source');
        t.deepEqual(source._style, testStyle, 'GL source._style');
    });
    t.end();
});

tape('getTile', function(t) {
    new GL({ style: testStyle }, function(err, source) {
        t.ifError(err);
        source.getTile(0, 0, 0, function(err, image) {
            t.ifError(err);
            if (process.env.UPDATE) {
                fs.writeFileSync(__dirname + '/expected/output.png', image);
            }
            t.end();
        });
    });
});

